const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const Database = require("better-sqlite3");
const express = require("express");

const app = express();
const port = process.env.PORT || 3000;
const dataDirectory = path.join(__dirname, "data");
const databasePath = path.join(dataDirectory, "tasks.sqlite");

const VALID_RECURRENCE_TYPES = new Set(["none", "daily", "weekly", "monthly"]);

fs.mkdirSync(dataDirectory, { recursive: true });

const database = new Database(databasePath);
database.pragma("journal_mode = WAL");

database.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    priority TEXT NOT NULL DEFAULT 'medium',
    due_date TEXT NOT NULL DEFAULT '',
    start_time TEXT NOT NULL DEFAULT '',
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    recurrence_type TEXT NOT NULL DEFAULT 'none',
    recurrence_interval INTEGER NOT NULL DEFAULT 1,
    recurrence_end_date TEXT NOT NULL DEFAULT '',
    next_occurrence_at TEXT NOT NULL DEFAULT '',
    parent_task_id TEXT NOT NULL DEFAULT ''
  )
`);

function ensureTaskSchema() {
  const tableInfo = database.prepare("PRAGMA table_info(tasks)").all();
  const existingColumns = new Set(tableInfo.map((column) => column.name));
  const columnDefinitions = [
    ["recurrence_type", "TEXT NOT NULL DEFAULT 'none'"],
    ["recurrence_interval", "INTEGER NOT NULL DEFAULT 1"],
    ["recurrence_end_date", "TEXT NOT NULL DEFAULT ''"],
    ["next_occurrence_at", "TEXT NOT NULL DEFAULT ''"],
    ["parent_task_id", "TEXT NOT NULL DEFAULT ''"],
  ];

  for (const [columnName, columnDefinition] of columnDefinitions) {
    if (!existingColumns.has(columnName)) {
      database.exec(
        `ALTER TABLE tasks ADD COLUMN ${columnName} ${columnDefinition}`,
      );
    }
  }
}

ensureTaskSchema();

const selectTasks = database.prepare(`
  SELECT
    id,
    title,
    description,
    priority,
    due_date AS dueDate,
    start_time AS startTime,
    completed,
    created_at AS createdAt,
    recurrence_type AS recurrenceType,
    recurrence_interval AS recurrenceInterval,
    recurrence_end_date AS recurrenceEndDate,
    next_occurrence_at AS nextOccurrenceAt,
    parent_task_id AS parentTaskId
  FROM tasks
  ORDER BY created_at DESC
`);

const selectTask = database.prepare(`
  SELECT
    id,
    title,
    description,
    priority,
    due_date AS dueDate,
    start_time AS startTime,
    completed,
    created_at AS createdAt,
    recurrence_type AS recurrenceType,
    recurrence_interval AS recurrenceInterval,
    recurrence_end_date AS recurrenceEndDate,
    next_occurrence_at AS nextOccurrenceAt,
    parent_task_id AS parentTaskId
  FROM tasks
  WHERE id = ?
`);

const insertTask = database.prepare(`
  INSERT INTO tasks (
    id,
    title,
    description,
    priority,
    due_date,
    start_time,
    completed,
    created_at,
    recurrence_type,
    recurrence_interval,
    recurrence_end_date,
    next_occurrence_at,
    parent_task_id
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const updateTask = database.prepare(`
  UPDATE tasks
  SET
    title = ?,
    description = ?,
    priority = ?,
    due_date = ?,
    start_time = ?,
    completed = ?,
    recurrence_type = ?,
    recurrence_interval = ?,
    recurrence_end_date = ?,
    next_occurrence_at = ?,
    parent_task_id = ?
  WHERE id = ?
`);

const deleteTask = database.prepare("DELETE FROM tasks WHERE id = ?");
const deleteCompletedTasks = database.prepare(
  "DELETE FROM tasks WHERE completed = 1",
);
const completeAllTasks = database.prepare("UPDATE tasks SET completed = 1");

function dateToISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function calculateNextOccurrenceDate(dateValue, recurrenceType, interval) {
  if (!dateValue || recurrenceType === "none") {
    return dateValue || "";
  }

  const safeInterval =
    Number.isFinite(Number(interval)) && Number(interval) > 0
      ? Math.max(1, Math.floor(Number(interval)))
      : 1;

  const currentDate = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(currentDate.getTime())) {
    return "";
  }

  switch (recurrenceType) {
    case "daily":
      currentDate.setDate(currentDate.getDate() + safeInterval);
      return dateToISO(currentDate);
    case "weekly":
      currentDate.setDate(currentDate.getDate() + safeInterval * 7);
      return dateToISO(currentDate);
    case "monthly": {
      const nextMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + safeInterval,
        1,
      );
      const lastDayOfMonth = new Date(
        nextMonth.getFullYear(),
        nextMonth.getMonth() + 1,
        0,
      ).getDate();
      const targetDay = Math.min(currentDate.getDate(), lastDayOfMonth);
      nextMonth.setDate(targetDay);
      return dateToISO(nextMonth);
    }
    default:
      return dateValue;
  }
}

function normalizeRecurrenceInput(input = {}, fallback = {}) {
  const requestedType = String(
    input.recurrenceType ?? fallback.recurrenceType ?? "none",
  )
    .trim()
    .toLowerCase();
  const recurrenceType = VALID_RECURRENCE_TYPES.has(requestedType)
    ? requestedType
    : "none";

  const requestedInterval = Number(
    input.recurrenceInterval ?? fallback.recurrenceInterval ?? 1,
  );
  const recurrenceInterval =
    recurrenceType === "none"
      ? 1
      : Number.isFinite(requestedInterval) && requestedInterval > 0
        ? Math.max(1, Math.floor(requestedInterval))
        : 1;

  return {
    recurrenceType,
    recurrenceInterval,
    recurrenceEndDate: String(
      input.recurrenceEndDate ?? fallback.recurrenceEndDate ?? "",
    ).trim(),
    nextOccurrenceAt: String(
      input.nextOccurrenceAt ?? fallback.nextOccurrenceAt ?? "",
    ).trim(),
    parentTaskId: String(
      input.parentTaskId ?? fallback.parentTaskId ?? "",
    ).trim(),
  };
}

function normalizeTask(row) {
  return {
    ...row,
    completed: Boolean(row.completed),
    recurrenceType: row.recurrenceType ?? "none",
    recurrenceInterval: Number(row.recurrenceInterval ?? 1),
    recurrenceEndDate: row.recurrenceEndDate ?? "",
    nextOccurrenceAt: row.nextOccurrenceAt ?? "",
    parentTaskId: row.parentTaskId ?? "",
  };
}

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

function normalizeTaskInput(input, fallback = {}) {
  const requestedPriority = String(
    input.priority ?? fallback.priority ?? "medium",
  );
  const recurrence = normalizeRecurrenceInput(input, fallback);

  return {
    title: String(input.title ?? fallback.title ?? "").trim(),
    description: String(input.description ?? fallback.description ?? "").trim(),
    priority: ALLOWED_PRIORITIES.has(requestedPriority)
      ? requestedPriority
      : "medium",
    dueDate: String(input.dueDate ?? fallback.dueDate ?? ""),
    startTime: String(input.startTime ?? fallback.startTime ?? ""),
    completed: Boolean(input.completed ?? fallback.completed ?? false),
    ...recurrence,
  };
}

function buildNextRecurringTask(task) {
  if (!task || task.recurrenceType === "none" || !task.dueDate) {
    return null;
  }

  const recurrenceEndDate = task.recurrenceEndDate ?? "";
  const nextDueDate = calculateNextOccurrenceDate(
    task.dueDate,
    task.recurrenceType,
    task.recurrenceInterval,
  );

  if (!nextDueDate) {
    return null;
  }

  if (recurrenceEndDate && nextDueDate > recurrenceEndDate) {
    return null;
  }

  return {
    title: task.title,
    description: task.description ?? "",
    priority: task.priority ?? "medium",
    dueDate: nextDueDate,
    startTime: task.startTime ?? "",
    completed: false,
    recurrenceType: task.recurrenceType,
    recurrenceInterval: task.recurrenceInterval,
    recurrenceEndDate,
    nextOccurrenceAt: nextDueDate,
    parentTaskId: task.parentTaskId || task.id,
  };
}

function getTaskOr404(response, id) {
  const task = selectTask.get(id);

  if (!task) {
    response.status(404).json({ error: "Task not found" });
    return null;
  }

  return normalizeTask(task);
}

function createNextRecurringOccurrence(task) {
  if (!task || !task.completed || task.recurrenceType === "none") {
    return null;
  }

  const nextTask = buildNextRecurringTask(task);

  if (!nextTask) {
    return null;
  }

  const nextTaskId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  insertTask.run(
    nextTaskId,
    nextTask.title,
    nextTask.description,
    nextTask.priority,
    nextTask.dueDate,
    nextTask.startTime,
    0,
    createdAt,
    nextTask.recurrenceType,
    nextTask.recurrenceInterval,
    nextTask.recurrenceEndDate,
    nextTask.nextOccurrenceAt,
    nextTask.parentTaskId,
  );

  return normalizeTask(selectTask.get(nextTaskId));
}

app.use(express.json());
// Serve only the known front-end assets instead of the whole repo root,
// to avoid exposing server.js, package.json, and data/tasks.sqlite over HTTP.
app.get("/", (request, response) => {
  response.sendFile(path.join(__dirname, "index.html"));
});
app.get("/styles.css", (request, response) => {
  response.sendFile(path.join(__dirname, "styles.css"));
});
app.use("/js", express.static(path.join(__dirname, "js")));

app.get("/api/tasks", (request, response) => {
  response.json(selectTasks.all().map(normalizeTask));
});

app.post("/api/tasks", (request, response) => {
  const task = normalizeTaskInput(request.body);

  if (!task.title) {
    response.status(400).json({ error: "Title is required" });
    return;
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  insertTask.run(
    id,
    task.title,
    task.description,
    task.priority,
    task.dueDate,
    task.startTime,
    task.completed ? 1 : 0,
    createdAt,
    task.recurrenceType,
    task.recurrenceInterval,
    task.recurrenceEndDate,
    task.nextOccurrenceAt || task.dueDate,
    task.parentTaskId,
  );

  response.status(201).json(normalizeTask(selectTask.get(id)));
});

app.put("/api/tasks/:id", (request, response) => {
  const existingTask = getTaskOr404(response, request.params.id);

  if (!existingTask) {
    return;
  }

  const task = normalizeTaskInput(request.body, existingTask);

  if (!task.title) {
    response.status(400).json({ error: "Title is required" });
    return;
  }

  updateTask.run(
    task.title,
    task.description,
    task.priority,
    task.dueDate,
    task.startTime,
    task.completed ? 1 : 0,
    task.recurrenceType,
    task.recurrenceInterval,
    task.recurrenceEndDate,
    task.nextOccurrenceAt || task.dueDate,
    task.parentTaskId,
    request.params.id,
  );

  const updatedTask = normalizeTask(selectTask.get(request.params.id));

  if (
    !existingTask.completed &&
    updatedTask.completed &&
    updatedTask.recurrenceType !== "none"
  ) {
    createNextRecurringOccurrence(updatedTask);
  }

  response.json(updatedTask);
});

app.delete("/api/tasks/completed", (request, response) => {
  deleteCompletedTasks.run();
  response.sendStatus(204);
});

app.post("/api/tasks/complete-all", (request, response) => {
  const tasks = selectTasks.all().map(normalizeTask);

  completeAllTasks.run();

  tasks.forEach((task) => {
    if (task.recurrenceType !== "none") {
      createNextRecurringOccurrence({ ...task, completed: true });
    }
  });

  response.json(selectTasks.all().map(normalizeTask));
});

app.delete("/api/tasks/:id", (request, response) => {
  deleteTask.run(request.params.id);
  response.sendStatus(204);
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Todo List Manager running at http://localhost:${port}`);
    console.log(`SQLite database: ${databasePath}`);
  });
}

module.exports = {
  calculateNextOccurrenceDate,
  normalizeRecurrenceInput,
};

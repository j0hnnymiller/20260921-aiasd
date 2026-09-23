const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const Database = require("better-sqlite3");
const express = require("express");

const app = express();
const port = process.env.PORT || 3000;
// Allow tests to point at an isolated, disposable database directory.
const dataDirectory = process.env.TASKS_DATA_DIR
  ? path.resolve(process.env.TASKS_DATA_DIR)
  : path.join(__dirname, "data");
const databasePath = path.join(dataDirectory, "tasks.sqlite");

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
    created_at TEXT NOT NULL
  )
`);

// Migrate databases created before assignment tracking existed.
const existingColumns = new Set(
  database
    .prepare("PRAGMA table_info(tasks)")
    .all()
    .map((column) => column.name),
);
if (!existingColumns.has("assigned_to")) {
  database.exec(
    "ALTER TABLE tasks ADD COLUMN assigned_to TEXT NOT NULL DEFAULT ''",
  );
}
if (!existingColumns.has("assigned_at")) {
  database.exec(
    "ALTER TABLE tasks ADD COLUMN assigned_at TEXT NOT NULL DEFAULT ''",
  );
}

const selectTasks = database.prepare(`
  SELECT
    id,
    title,
    description,
    priority,
    due_date AS dueDate,
    start_time AS startTime,
    completed,
    assigned_to AS assignedTo,
    assigned_at AS assignedAt,
    created_at AS createdAt
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
    assigned_to AS assignedTo,
    assigned_at AS assignedAt,
    created_at AS createdAt
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
    assigned_to,
    assigned_at,
    created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    assigned_to = ?,
    assigned_at = ?
  WHERE id = ?
`);

const deleteTask = database.prepare("DELETE FROM tasks WHERE id = ?");
const deleteCompletedTasks = database.prepare(
  "DELETE FROM tasks WHERE completed = 1",
);
const completeAllTasks = database.prepare("UPDATE tasks SET completed = 1");

function normalizeTask(row) {
  return {
    ...row,
    completed: Boolean(row.completed),
  };
}

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

function normalizeTaskInput(input, fallback = {}) {
  const requestedPriority = String(
    input.priority ?? fallback.priority ?? "medium",
  );

  return {
    title: String(input.title ?? fallback.title ?? "").trim(),
    description: String(input.description ?? fallback.description ?? "").trim(),
    priority: ALLOWED_PRIORITIES.has(requestedPriority)
      ? requestedPriority
      : "medium",
    dueDate: String(input.dueDate ?? fallback.dueDate ?? ""),
    startTime: String(input.startTime ?? fallback.startTime ?? ""),
    completed: Boolean(input.completed ?? fallback.completed ?? false),
    assignedTo: String(input.assignedTo ?? fallback.assignedTo ?? "").trim(),
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
  const assignedAt = task.assignedTo ? createdAt : "";

  insertTask.run(
    id,
    task.title,
    task.description,
    task.priority,
    task.dueDate,
    task.startTime,
    task.completed ? 1 : 0,
    task.assignedTo,
    assignedAt,
    createdAt,
  );

  response.status(201).json(normalizeTask(selectTask.get(id)));
});

app.put("/api/tasks/:id", (request, response) => {
  const existingTask = getTaskOr404(response, request.params.id);

  if (!existingTask) {
    return;
  }

  const requestedTask = normalizeTaskInput(request.body);

  if (!requestedTask.title) {
    response.status(400).json({ error: "Title is required" });
    return;
  }

  const task = normalizeTaskInput(request.body, existingTask);

  // Only refresh the assignment timestamp when the assignee actually changes.
  const assignedAt = !task.assignedTo
    ? ""
    : task.assignedTo === existingTask.assignedTo
      ? existingTask.assignedAt
      : new Date().toISOString();

  updateTask.run(
    task.title,
    task.description,
    task.priority,
    task.dueDate,
    task.startTime,
    task.completed ? 1 : 0,
    task.assignedTo,
    assignedAt,
    request.params.id,
  );

  response.json(normalizeTask(selectTask.get(request.params.id)));
});

app.delete("/api/tasks/completed", (request, response) => {
  deleteCompletedTasks.run();
  response.sendStatus(204);
});

app.post("/api/tasks/complete-all", (request, response) => {
  completeAllTasks.run();
  response.json(selectTasks.all().map(normalizeTask));
});

app.delete("/api/tasks/:id", (request, response) => {
  deleteTask.run(request.params.id);
  response.sendStatus(204);
});

module.exports = { app, database };

// Only auto-start the server when run directly (node server.js / npm start),
// so requiring this module from tests doesn't bind the shared dev port.
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Todo List Manager running at http://localhost:${port}`);
    console.log(`SQLite database: ${databasePath}`);
  });
}

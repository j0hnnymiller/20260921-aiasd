const { test, before, after, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

let app;
let database;
let server;
let baseUrl;
let tempDataDir;

before(() => {
  tempDataDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "todo-list-manager-test-"),
  );
  process.env.TASKS_DATA_DIR = tempDataDir;
  delete require.cache[require.resolve("../server.js")];
  ({ app, database } = require("../server.js"));

  return new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

after(() => {
  return new Promise((resolve) => {
    server.close(() => {
      database.close();
      fs.rmSync(tempDataDir, { recursive: true, force: true });
      resolve();
    });
  });
});

beforeEach(async () => {
  await fetch(`${baseUrl}/api/tasks/complete-all`, { method: "POST" });
  await fetch(`${baseUrl}/api/tasks/completed`, { method: "DELETE" });
});

async function createTask(body) {
  const response = await fetch(`${baseUrl}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: response.status, body: await response.json() };
}

async function updateTask(id, body) {
  const response = await fetch(`${baseUrl}/api/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: response.status, body: await response.json() };
}

test("creating a task with an assignee records assignedTo and stamps assignedAt", async () => {
  const { body: task } = await createTask({
    title: "Ship release notes",
    assignedTo: "Priya",
  });

  assert.equal(task.assignedTo, "Priya");
  assert.ok(
    task.assignedAt,
    "assignedAt should be set when a task is assigned",
  );
  assert.ok(
    !Number.isNaN(Date.parse(task.assignedAt)),
    "assignedAt should be a valid ISO timestamp",
  );
});

test("creating a task without an assignee leaves assignedTo and assignedAt empty", async () => {
  const { body: task } = await createTask({ title: "Unassigned task" });

  assert.equal(task.assignedTo, "");
  assert.equal(task.assignedAt, "");
});

test("reassigning a task to a new person updates assignedAt", async () => {
  const { body: created } = await createTask({
    title: "Investigate bug",
    assignedTo: "Priya",
  });
  const firstAssignedAt = created.assignedAt;

  await new Promise((resolve) => setTimeout(resolve, 10));

  const { body: updated } = await updateTask(created.id, {
    title: created.title,
    assignedTo: "Sam",
  });

  assert.equal(updated.assignedTo, "Sam");
  assert.notEqual(updated.assignedAt, firstAssignedAt);
});

test("editing an unrelated field does not change assignedAt", async () => {
  const { body: created } = await createTask({
    title: "Write tests",
    assignedTo: "Priya",
  });
  const originalAssignedAt = created.assignedAt;

  const { body: updated } = await updateTask(created.id, {
    title: created.title,
    description: "Add coverage for assignment",
  });

  assert.equal(updated.assignedTo, "Priya");
  assert.equal(updated.assignedAt, originalAssignedAt);
});

test("clearing the assignee also clears assignedAt", async () => {
  const { body: created } = await createTask({
    title: "Follow up",
    assignedTo: "Priya",
  });

  const { body: updated } = await updateTask(created.id, {
    title: created.title,
    assignedTo: "",
  });

  assert.equal(updated.assignedTo, "");
  assert.equal(updated.assignedAt, "");
});

test("POST /api/tasks with a missing title returns 400", async () => {
  const { status, body } = await createTask({
    description: "No title provided",
  });

  assert.equal(status, 400);
  assert.equal(body.error, "Title is required");
});

test("POST /api/tasks with a blank title returns 400", async () => {
  const { status, body } = await createTask({ title: "   " });

  assert.equal(status, 400);
  assert.equal(body.error, "Title is required");
});

test("PUT /api/tasks/:id with a missing title returns 400", async () => {
  const { body: created } = await createTask({ title: "Original title" });

  const { status, body } = await updateTask(created.id, {
    description: "No title supplied",
  });

  assert.equal(status, 400);
  assert.equal(body.error, "Title is required");
});

test("PUT /api/tasks/:id with a non-existent id returns 404", async () => {
  const { status, body } = await updateTask("does-not-exist", {
    title: "Updated title",
  });

  assert.equal(status, 404);
  assert.equal(body.error, "Task not found");
});

test("GET /api/tasks includes assignedTo and assignedAt fields", async () => {
  await createTask({ title: "List check", assignedTo: "Priya" });

  const response = await fetch(`${baseUrl}/api/tasks`);
  const tasks = await response.json();

  assert.ok(
    tasks.every((task) => "assignedTo" in task && "assignedAt" in task),
    "every task should include assignedTo and assignedAt fields",
  );
});

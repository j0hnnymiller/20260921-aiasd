const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");
const { once } = require("node:events");
const { createServer } = require("node:net");
const { spawn } = require("node:child_process");

async function getAvailablePort() {
  const probeServer = createServer();

  await new Promise((resolve, reject) => {
    probeServer.once("error", reject);
    probeServer.listen(0, "127.0.0.1", resolve);
  });

  const { port } = probeServer.address();

  await new Promise((resolve, reject) => {
    probeServer.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

  return port;
}

async function stopServer(serverProcess) {
  if (serverProcess.killed || serverProcess.exitCode !== null) {
    return;
  }

  serverProcess.kill();
  await once(serverProcess, "exit");
}

async function startServer(t) {
  const port = await getAvailablePort();
  const dataDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "todo-api-test-"));
  const serverProcess = spawn("node", ["server.js"], {
    cwd: __dirname,
    env: {
      ...process.env,
      PORT: String(port),
      DATA_DIRECTORY: dataDirectory,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let output = "";

  const cleanup = async () => {
    await stopServer(serverProcess);
    await fs.rm(dataDirectory, { recursive: true, force: true });
  };

  t.after(async () => {
    await cleanup();
  });

  await new Promise((resolve, reject) => {
    const readinessMarker = `http://localhost:${port}`;
    const timeout = setTimeout(() => {
      reject(
        new Error(`Server startup timed out. Output:\n${output || "<none>"}`),
      );
    }, 10_000);

    function onData(chunk) {
      output += chunk.toString();

      if (output.includes(readinessMarker)) {
        clearTimeout(timeout);
        serverProcess.stdout.off("data", onData);
        serverProcess.stderr.off("data", onData);
        serverProcess.off("error", onError);
        serverProcess.off("exit", onExit);
        resolve();
      }
    }

    function onError(error) {
      clearTimeout(timeout);
      reject(error);
    }

    function onExit(code, signal) {
      clearTimeout(timeout);
      reject(
        new Error(
          `Server exited before startup (code: ${code}, signal: ${signal}). Output:\n${output || "<none>"}`,
        ),
      );
    }

    serverProcess.stdout.on("data", onData);
    serverProcess.stderr.on("data", onData);
    serverProcess.once("error", onError);
    serverProcess.once("exit", onExit);
  });

  return {
    request(pathname, options) {
      return fetch(`http://127.0.0.1:${port}${pathname}`, options);
    },
  };
}

async function createTask(request, overrides = {}) {
  const response = await request("/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "Write tests",
      description: "Cover the API",
      priority: "high",
      dueDate: "2026-09-30",
      startTime: "09:15",
      ...overrides,
    }),
  });

  assert.equal(response.status, 201);
  return response.json();
}

test("GET /api/tasks returns an empty list for a new database", async (t) => {
  const { request } = await startServer(t);
  const response = await request("/api/tasks");

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), []);
});

test("POST /api/tasks creates a normalized task that persists in GET /api/tasks", async (t) => {
  const { request } = await startServer(t);
  const response = await request("/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "  Write API tests  ",
      description: "  Validate live behavior  ",
      priority: "urgent",
      dueDate: "2026-09-30",
      startTime: "08:45",
      completed: 1,
    }),
  });

  assert.equal(response.status, 201);

  const task = await response.json();

  assert.equal(task.title, "Write API tests");
  assert.equal(task.description, "Validate live behavior");
  assert.equal(task.priority, "medium");
  assert.equal(task.dueDate, "2026-09-30");
  assert.equal(task.startTime, "08:45");
  assert.equal(task.completed, true);
  assert.match(task.id, /^[0-9a-f-]{36}$/i);
  assert.match(task.createdAt, /^\d{4}-\d{2}-\d{2}T/);

  const listResponse = await request("/api/tasks");

  assert.equal(listResponse.status, 200);
  assert.deepEqual(await listResponse.json(), [task]);
});

test("POST /api/tasks rejects missing and malformed payloads", async (t) => {
  const { request } = await startServer(t);
  const missingTitleResponse = await request("/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title: "   " }),
  });

  assert.equal(missingTitleResponse.status, 400);
  assert.deepEqual(await missingTitleResponse.json(), {
    error: "Title is required",
  });

  const malformedJsonResponse = await request("/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: '{"title":',
  });

  assert.equal(malformedJsonResponse.status, 400);

  const listResponse = await request("/api/tasks");
  assert.deepEqual(await listResponse.json(), []);
});

test("PUT /api/tasks/:id updates tasks and returns 404 for unknown IDs", async (t) => {
  const { request } = await startServer(t);
  const createdTask = await createTask(request);
  const updateResponse = await request(`/api/tasks/${createdTask.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "Updated task",
      description: "Updated description",
      priority: "low",
      dueDate: "2026-10-01",
      startTime: "10:30",
      completed: true,
    }),
  });

  assert.equal(updateResponse.status, 200);
  assert.deepEqual(await updateResponse.json(), {
    ...createdTask,
    title: "Updated task",
    description: "Updated description",
    priority: "low",
    dueDate: "2026-10-01",
    startTime: "10:30",
    completed: true,
  });

  const missingTaskResponse = await request(
    "/api/tasks/00000000-0000-0000-0000-000000000000",
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: "Nope" }),
    },
  );

  assert.equal(missingTaskResponse.status, 404);
  assert.deepEqual(await missingTaskResponse.json(), {
    error: "Task not found",
  });
});

test("bulk completion, completed deletion, and item deletion update persisted state", async (t) => {
  const { request } = await startServer(t);
  const firstTask = await createTask(request, {
    title: "First task",
    completed: false,
  });
  const secondTask = await createTask(request, {
    title: "Second task",
    completed: false,
  });

  const completeAllResponse = await request("/api/tasks/complete-all", {
    method: "POST",
  });
  assert.equal(completeAllResponse.status, 200);

  const completedTasks = await completeAllResponse.json();
  assert.equal(completedTasks.length, 2);
  assert.ok(completedTasks.every((task) => task.completed));

  const clearCompletedResponse = await request("/api/tasks/completed", {
    method: "DELETE",
  });
  assert.equal(clearCompletedResponse.status, 204);

  const listAfterClear = await request("/api/tasks");
  assert.deepEqual(await listAfterClear.json(), []);

  const recreatedTask = await createTask(request, {
    title: "Delete me",
    completed: false,
  });
  const deleteResponse = await request(`/api/tasks/${recreatedTask.id}`, {
    method: "DELETE",
  });

  assert.equal(deleteResponse.status, 204);

  const listAfterDelete = await request("/api/tasks");
  assert.deepEqual(await listAfterDelete.json(), []);

  assert.notEqual(firstTask.id, secondTask.id);
});

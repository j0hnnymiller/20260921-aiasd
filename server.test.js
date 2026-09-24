const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");
const { once } = require("node:events");
const { spawn } = require("node:child_process");

async function stopServer(serverProcess) {
  if (serverProcess.killed || serverProcess.exitCode !== null) {
    return;
  }

  serverProcess.kill();
  await once(serverProcess, "exit");
}

async function startServer(
  t,
  {
    dataDirectory = null,
    env = {},
    onSpawn = null,
    scriptPath = "server.js",
    startupTimeoutMs = 10_000,
  } = {},
) {
  const resolvedDataDirectory =
    dataDirectory ?? await fs.mkdtemp(path.join(os.tmpdir(), "todo-api-test-"));
  const serverProcess = spawn("node", [scriptPath], {
    cwd: __dirname,
    env: {
      ...process.env,
      PORT: "0",
      DATA_DIRECTORY: resolvedDataDirectory,
      ...env,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let cleanedUp = false;

  let output = "";
  let activePort;

  const cleanup = async () => {
    if (cleanedUp) {
      return;
    }

    cleanedUp = true;
    await stopServer(serverProcess);
    await fs.rm(resolvedDataDirectory, { recursive: true, force: true });
  };

  t.after(async () => {
    await cleanup();
  });

  if (onSpawn) {
    onSpawn(serverProcess);
  }

  await new Promise((resolve, reject) => {
    let settled = false;

    const timeout = setTimeout(() => {
      void finishFailure(
        new Error(`Server startup timed out. Output:\n${output || "<none>"}`),
      );
    }, startupTimeoutMs);

    function clearListeners() {
      clearTimeout(timeout);
      serverProcess.stdout.off("data", onData);
      serverProcess.stderr.off("data", onData);
      serverProcess.off("error", onError);
      serverProcess.off("exit", onExit);
    }

    async function finishFailure(error) {
      if (settled) {
        return;
      }

      settled = true;
      clearListeners();

      try {
        await cleanup();
      } catch (cleanupError) {
        reject(
          new Error(
            `${error.message}\nCleanup failed: ${cleanupError.message}`,
          ),
        );
        return;
      }

      reject(error);
    }

    function onData(chunk) {
      output += chunk.toString();
      const portMatch = output.match(/http:\/\/localhost:(\d+)/);

      if (portMatch) {
        activePort = Number(portMatch[1]);
      }

      if (activePort) {
        settled = true;
        clearListeners();
        resolve();
      }
    }

    function onError(error) {
      void finishFailure(error);
    }

    function onExit(code, signal) {
      void finishFailure(
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
      return fetch(`http://127.0.0.1:${activePort}${pathname}`, options);
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

test("startServer surfaces startup timeout diagnostics and cleans temporary state", async (t) => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "todo-api-startup-failure-"));
  const dataDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "todo-api-failure-data-"));
  const scriptPath = path.join(tempRoot, "hang.js");
  let childPid;

  t.after(async () => {
    await fs.rm(tempRoot, { recursive: true, force: true });
    await fs.rm(dataDirectory, { recursive: true, force: true });
  });

  await fs.writeFile(scriptPath, "setInterval(() => {}, 1000);\n");

  await assert.rejects(
    startServer(t, {
      dataDirectory,
      onSpawn(serverProcess) {
        childPid = serverProcess.pid;
      },
      scriptPath,
      startupTimeoutMs: 50,
    }),
    /Server startup timed out/,
  );

  await assert.rejects(
    fs.stat(dataDirectory),
    (error) => error && error.code === "ENOENT",
  );
  let processCheckError;

  try {
    process.kill(childPid, 0);
  } catch (error) {
    processCheckError = error;
  }

  assert.equal(processCheckError?.code, "ESRCH");
});

test("POST /api/tasks/complete-all marks every task as completed", async (t) => {
  const { request } = await startServer(t);
  await createTask(request, {
    title: "First task",
    completed: false,
  });
  await createTask(request, {
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
});

test("DELETE /api/tasks/completed removes completed tasks only", async (t) => {
  const { request } = await startServer(t);
  const completedTask = await createTask(request, {
    title: "Completed task",
    completed: true,
  });
  const openTask = await createTask(request, {
    title: "Open task",
    completed: false,
  });

  const clearCompletedResponse = await request("/api/tasks/completed", {
    method: "DELETE",
  });
  assert.equal(clearCompletedResponse.status, 204);

  const listAfterClear = await request("/api/tasks");
  assert.deepEqual(await listAfterClear.json(), [openTask]);

  assert.notEqual(completedTask.id, openTask.id);
});

test("DELETE /api/tasks/:id removes the targeted task", async (t) => {
  const { request } = await startServer(t);
  const task = await createTask(request, {
    title: "Delete me",
    completed: false,
  });
  const deleteResponse = await request(`/api/tasks/${task.id}`, {
    method: "DELETE",
  });

  assert.equal(deleteResponse.status, 204);

  const listAfterDelete = await request("/api/tasks");
  assert.deepEqual(await listAfterDelete.json(), []);
});

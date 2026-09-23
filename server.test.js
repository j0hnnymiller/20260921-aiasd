const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const net = require("node:net");
const { once } = require("node:events");
const { spawn } = require("node:child_process");

async function getAvailablePort() {
  const server = net.createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");

  const { port } = server.address();
  server.close();
  await once(server, "close");
  return port;
}

async function startServer() {
  const dataDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "todo-list-manager-"));
  const port = await getAvailablePort();
  const serverProcess = spawn(process.execPath, ["server.js"], {
    cwd: __dirname,
    env: {
      ...process.env,
      DATA_DIRECTORY: dataDirectory,
      PORT: String(port),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  const stdout = [];
  const stderr = [];

  serverProcess.stdout.on("data", (chunk) => {
    stdout.push(chunk.toString());
  });
  serverProcess.stderr.on("data", (chunk) => {
    stderr.push(chunk.toString());
  });

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(
        new Error(
          `Server did not start in time.\nstdout:\n${stdout.join("")}\nstderr:\n${stderr.join("")}`,
        ),
      );
    }, 10_000);

    serverProcess.stdout.on("data", (chunk) => {
      if (chunk.toString().includes(`http://localhost:${port}`)) {
        clearTimeout(timeout);
        resolve();
      }
    });

    serverProcess.once("exit", (code, signal) => {
      clearTimeout(timeout);
      reject(
        new Error(
          `Server exited before startup (code: ${code}, signal: ${signal}).\nstdout:\n${stdout.join("")}\nstderr:\n${stderr.join("")}`,
        ),
      );
    });
  });

  return {
    dataDirectory,
    port,
    serverProcess,
  };
}

async function stopServer(serverProcess, dataDirectory) {
  serverProcess.kill("SIGTERM");
  await once(serverProcess, "exit");
  fs.rmSync(dataDirectory, { recursive: true, force: true });
}

test("DELETE /api/tasks/:id removes an existing task", async () => {
  const { serverProcess, port, dataDirectory } = await startServer();

  try {
    const createResponse = await fetch(`http://127.0.0.1:${port}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Delete me" }),
    });

    assert.equal(createResponse.status, 201);
    const createdTask = await createResponse.json();

    const deleteResponse = await fetch(
      `http://127.0.0.1:${port}/api/tasks/${createdTask.id}`,
      { method: "DELETE" },
    );

    assert.equal(deleteResponse.status, 204);

    const listResponse = await fetch(`http://127.0.0.1:${port}/api/tasks`);
    assert.equal(listResponse.status, 200);

    const tasks = await listResponse.json();
    assert.deepEqual(tasks, []);
  } finally {
    await stopServer(serverProcess, dataDirectory);
  }
});

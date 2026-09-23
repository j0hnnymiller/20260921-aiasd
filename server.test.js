const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");
const test = require("node:test");

const repositoryRoot = __dirname;

function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.listen(0, () => {
      const address = server.address();

      server.close(() => {
        resolve(address.port);
      });
    });

    server.on("error", reject);
  });
}

async function stopProcess(serverProcess) {
  if (
    !serverProcess ||
    serverProcess.killed ||
    serverProcess.exitCode !== null ||
    serverProcess.signalCode !== null
  ) {
    return;
  }

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      serverProcess.kill("SIGKILL");
    }, 5_000);

    serverProcess.once("exit", () => {
      clearTimeout(timeout);
      resolve();
    });
    serverProcess.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    serverProcess.kill();
  });
}

async function startServer() {
  const tempDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "todo-list-manager-test-"),
  );
  const dataDirectory = path.join(tempDirectory, "data");
  const port = await getAvailablePort();
  const serverProcess = spawn(process.execPath, ["server.js"], {
    cwd: repositoryRoot,
    env: {
      ...process.env,
      DATA_DIRECTORY: dataDirectory,
      PORT: String(port),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let output = "";

  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Server startup timed out.\n${output}`));
      }, 10_000);

      const onData = (chunk) => {
        output += chunk.toString();

        if (
          output.includes(`Todo List Manager running at http://localhost:${port}`)
        ) {
          clearTimeout(timeout);
          serverProcess.stdout.off("data", onData);
          serverProcess.stderr.off("data", onData);
          serverProcess.off("exit", onExit);
          resolve();
        }
      };

      const onExit = (code, signal) => {
        clearTimeout(timeout);
        reject(
          new Error(
            `Server exited before becoming ready (code: ${code}, signal: ${signal}).\n${output}`,
          ),
        );
      };

      serverProcess.stdout.on("data", onData);
      serverProcess.stderr.on("data", onData);
      serverProcess.once("exit", onExit);
    });

    return { dataDirectory, port, serverProcess, tempDirectory };
  } catch (error) {
    await stopProcess(serverProcess);
    await fs.rm(tempDirectory, { recursive: true, force: true });
    throw error;
  }
}

test("DELETE /api/tasks/:id removes the requested task", async () => {
  let server;

  try {
    server = await startServer();

    const createResponse = await fetch(`http://localhost:${server.port}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Delete me",
        description: "Created for delete endpoint coverage",
      }),
    });

    assert.equal(createResponse.status, 201);

    const createdTask = await createResponse.json();
    const deleteResponse = await fetch(
      `http://localhost:${server.port}/api/tasks/${createdTask.id}`,
      { method: "DELETE" },
    );

    assert.equal(deleteResponse.status, 204);

    const listResponse = await fetch(`http://localhost:${server.port}/api/tasks`);
    assert.equal(listResponse.status, 200);

    const tasks = await listResponse.json();
    assert.deepEqual(tasks, []);
  } finally {
    await stopProcess(server?.serverProcess);

    if (server?.tempDirectory) {
      await fs.rm(server.tempDirectory, { recursive: true, force: true });
    }
  }
});

---
ai_generated: true
model: "anthropic/claude-3.5-sonnet@2024-10-22"
operator: "johnmillerATcodemag-com"
chat_id: "create-testing-instructions-20260923"
prompt: |
  Create a repo testing instruction file covering startup reliability, async readiness checks, cleanup on failure, and test isolation for generated tests.
started: "2026-09-23T17:30:00Z"
ended: "2026-09-23T17:35:00Z"
task_durations:
  - task: "review and planning"
    duration: "00:02:00"
  - task: "file creation"
    duration: "00:03:00"
total_duration: "00:05:00"
ai_log: "ai-logs/2026/09/23/create-testing-instructions-20260923/conversation.md"
source: "user request"
name: "testing"
description: "Rules for reliable, isolated, and failure-safe test setup and teardown."
applyTo: "**/*.{js,ts,ps1}"
version: "1.0.0"
author: "johnmillerATcodemag-com"
tags: ["testing", "quality", "automation", "cleanup"]
owner: "Development Team"
reviewedDate: "2026-09-23"
nextReview: "2026-12-23"
---

# Testing

## Scope

Use these rules for unit, integration, and automation tests in this repository.

This repository requires a minimum test coverage of 80% for all tracked application code and critical paths. Coverage must be measured with the project’s standard test command and should be treated as a release gate for changes to runtime behavior.

## Rules

- Prefer explicit assertions over indirect coverage. A test must directly exercise the behavior it claims to validate.
- Maintain a minimum test coverage threshold of 80% across tracked application code. New or modified behavior should not reduce coverage below this baseline.
- When waiting for server startup, accumulate stdout and stderr before checking for readiness markers. Do not assume a log line arrives in a single chunk.
- Treat startup timeout as a failure path that requires cleanup, not as a successful test outcome.
- Always tear down spawned child processes, temporary directories, ports, and other state in `finally` or equivalent cleanup blocks.
- Isolate tests using unique temporary data locations. Do not write to shared default data folders unless the test explicitly verifies production state.
- Fail fast with clear diagnostics when startup, setup, or teardown fails.
- Ensure tests are deterministic: avoid race conditions, time-sensitive assumptions, and shared mutable state.
- Clean up on every code path, including setup failure, timeout, and assertion failure.
- If a test starts a local server, verify the health check or readiness text against accumulated output instead of a single chunk.
- Do not treat teardown as optional; leaked processes or directories are test failures.

## Required patterns

### Readiness checks

Use accumulated output rather than a single chunk when searching for startup markers.

```js
let output = "";

await new Promise((resolve, reject) => {
  const timeout = setTimeout(() => {
    reject(new Error("Server startup timed out"));
  }, 10_000);

  serverProcess.stdout.on("data", (chunk) => {
    output += chunk.toString();

    if (output.includes(`http://localhost:${port}`)) {
      clearTimeout(timeout);
      resolve();
    }
  });
});
```

### Cleanup on failure

Ensure temporary state and child processes are always cleaned up.

```js
let serverProcess;
let dataDirectory;

try {
  ({ serverProcess, dataDirectory } = await startServer());
  // test logic here
} finally {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill();
  }

  if (dataDirectory) {
    await fs.promises.rm(dataDirectory, { recursive: true, force: true });
  }
}
```

## Validation

- [ ] The test directly exercises the behavior under test.
- [ ] Startup detection handles partial output chunks and log boundaries.
- [ ] Cleanup runs in all failure paths.
- [ ] Child processes are terminated when the test ends.
- [ ] Temporary data is isolated from shared repository state.
- [ ] Minimum coverage remains at or above 80% for tracked application code.
- [ ] The test fails with actionable diagnostics instead of hanging silently.
- [ ] No temporary data or process leaks remain after a failed run.

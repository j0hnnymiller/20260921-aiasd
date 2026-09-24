---
ai_generated: true
model: "github/copilot@current"
operator: "johnmillerATcodemag-com"
chat_id: "create-technology-instructions-20260924"
prompt: |
  Create instruction files for Node.js, Express, SQLite, JavaScript, Fetch, DOM, node --test, Markdown, and Mermaid.
started: "2026-09-24T00:00:00Z"
ended: "2026-09-24T00:00:00Z"
task_durations:
  - task: "planning"
    duration: "00:02:00"
  - task: "instruction authoring"
    duration: "00:08:00"
total_duration: "00:10:00"
ai_log: "ai-logs/2026/09/24/create-technology-instructions-20260924/conversation.md"
source: "user request"
name: "nodejs"
description: "Rules for writing reliable, maintainable Node.js code in this repository."
applyTo: "**/*.js"
version: "1.0.0"
author: "johnmillerATcodemag-com"
tags: ["nodejs", "runtime", "javascript"]
owner: "Development Team"
reviewedDate: "2026-09-24"
nextReview: "2026-12-24"
---

# Node.js

## Scope

Use these rules for any Node.js application code, scripts, and tooling in this repository.

## Rules

- Prefer the built-in Node.js runtime and standard library before adding external dependencies.
- Keep startup logic simple: validate environment variables, create required directories, and fail fast with clear errors.
- Handle async operations with `await` or explicit promise rejection handling instead of callback-heavy patterns.
- Use `node:fs`, `node:path`, and `node:crypto` for filesystem and system utilities when available.
- Log only actionable diagnostics; do not expose secrets or credentials in output.
- Validate external inputs before using them in file paths, SQL, or network calls.
- Prefer small, single-purpose functions over large monolithic modules.
- Do not swallow errors silently; surface them with a useful message and an exit path.
- Keep module boundaries clear: server entry points, app logic, and utilities should be separate responsibilities.

## Example

```js
const fs = require("node:fs");
const path = require("node:path");

function ensureDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
  return path.resolve(directoryPath);
}
```

## Validation

- [ ] Node.js code uses clear error handling and meaningful failure messages.
- [ ] Built-in modules are preferred when applicable.
- [ ] File and environment inputs are validated before use.
- [ ] The implementation remains small, readable, and testable.

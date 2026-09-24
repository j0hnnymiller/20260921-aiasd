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
name: "node-test"
description: "Rules for writing deterministic tests with Node.js built-in test runner."
applyTo: "**/*.test.{js,mjs,cjs}"
version: "1.0.0"
author: "johnmillerATcodemag-com"
tags: ["testing", "node", "node-test"]
owner: "Development Team"
reviewedDate: "2026-09-24"
nextReview: "2026-12-24"
---

# Node.js Test Runner

## Scope

Use these rules for tests run with `node --test`.

## Rules

- Prefer the built-in Node.js test runner over external frameworks for small repository tests.
- Keep tests focused on one behavior per case with clear names.
- Use `beforeEach`, `afterEach`, `before`, and `after` for setup and cleanup when required.
- Isolate temporary files and state so tests do not interfere with one another.
- Assert real outcomes, not implementation details or mocked internals.
- Clean up spawned processes, temporary directories, and file state in `finally` blocks.
- Fail with actionable diagnostics that show why the behavior was wrong.

## Example

```js
const test = require("node:test");
const assert = require("node:assert/strict");

test("adds two numbers", () => {
  assert.equal(1 + 2, 3);
});
```

## Validation

- [ ] Tests are deterministic and independent.
- [ ] Setup and cleanup are explicit.
- [ ] Assertions validate behavior rather than mock internals.
- [ ] Test names clearly express the scenario being validated.

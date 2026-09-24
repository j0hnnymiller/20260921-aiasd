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
name: "javascript"
description: "Rules for clear, maintainable JavaScript patterns in browser and server code."
applyTo: "**/*.{js,mjs,cjs}"
version: "1.0.0"
author: "johnmillerATcodemag-com"
tags: ["javascript", "language", "frontend", "backend"]
owner: "Development Team"
reviewedDate: "2026-09-24"
nextReview: "2026-12-24"
---

# JavaScript

## Scope

Use these rules for JavaScript used in the browser, Node.js server, and related scripts.

## Rules

- Prefer clear variable names and small functions over clever one-liners.
- Use `const` for values that do not change and `let` only when reassignment is necessary.
- Avoid global state unless the project explicitly requires it.
- Use strict equality checks (`===` and `!==`) and explicit conversions when needed.
- Keep functions predictable: input validation first, side effects second, return values clear.
- Prefer async/await for asynchronous logic rather than deeply nested promise chains.
- Use `try/catch` around operations that may fail, especially I/O and network calls.
- Keep browser and server code easy to read and maintain; do not mix unrelated responsibilities.

## Example

```js
async function loadTasks() {
  const response = await fetch("/api/tasks");

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}
```

## Validation

- [ ] Code is readable and consistent with the repository style.
- [ ] Async operations use clear error handling.
- [ ] Inputs are validated before use.
- [ ] The code avoids unnecessary complexity.

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
name: "fetch"
description: "Rules for using the Fetch API safely and predictably in browser code."
applyTo: "**/*.js"
version: "1.0.0"
author: "johnmillerATcodemag-com"
tags: ["fetch", "browser", "http", "api"]
owner: "Development Team"
reviewedDate: "2026-09-24"
nextReview: "2026-12-24"
---

# Fetch API

## Scope

Use these rules when making browser-based HTTP requests.

## Rules

- Always check `response.ok` before treating a fetch response as successful.
- Set request headers explicitly when JSON payloads are sent.
- Use `Content-Type: application/json` for JSON request bodies.
- Parse JSON only when the response actually contains JSON content.
- Centralize repeated fetch logic to keep the app consistent and easier to test.
- Handle network failures and non-2xx responses with clear user-facing or developer-facing errors.
- Keep request bodies serialized with `JSON.stringify` when needed.
- Do not assume the server will always return success; treat every API call as fallible.

## Example

```js
async function saveTask(task) {
  const response = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}
```

## Validation

- [ ] Fetch calls check for successful status codes.
- [ ] JSON payloads are correctly serialized and sent.
- [ ] Network or HTTP failures emit actionable diagnostics.
- [ ] The request logic is centralized or easy to follow.

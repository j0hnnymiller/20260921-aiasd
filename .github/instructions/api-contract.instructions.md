---
ai_generated: true
model: "github/copilot@current"
operator: "johnmillerATcodemag-com"
chat_id: "create-specialized-instructions-20260924"
prompt: |
  Create additional repository instruction files covering JSON API contracts, route consistency, and client-server contract validation.
started: "2026-09-24T00:00:00Z"
ended: "2026-09-24T00:00:00Z"
task_durations:
  - task: "planning"
    duration: "00:02:00"
  - task: "instruction authoring"
    duration: "00:08:00"
total_duration: "00:10:00"
ai_log: "ai-logs/2026/09/24/create-specialized-instructions-20260924/conversation.md"
source: "user request"
name: "api-contract"
description: "Rules for keeping JSON API contracts consistent between server responses and browser usage."
applyTo: "**/*.{js,md}"
version: "1.0.0"
author: "johnmillerATcodemag-com"
tags: ["api", "contracts", "json", "frontend", "backend"]
owner: "Development Team"
reviewedDate: "2026-09-24"
nextReview: "2026-12-24"
---

# API Contract

## Scope

Use these rules when defining or changing HTTP endpoint behavior and the corresponding browser client code.

## Rules

- Keep API routes explicit and consistent across methods, paths, and response shapes.
- Document the expected JSON payloads and status codes for each route.
- Ensure the frontend and server agree on field names, types, and null/empty handling.
- Use predictable success and error payloads such as `{ error: "..." }` for invalid requests.
- When adding fields, update both the server response and the client consumption logic together.
- Prefer stable, low-ambiguity naming; do not change payload keys without a coordinated update.
- Treat the API contract as part of the public behavior of the app, not just an internal implementation detail.

## Example

```js
// Server
res.json({ id, title, completed, createdAt });

// Client
const task = await response.json();
console.log(task.title, task.completed);
```

## Validation

- [ ] Route behavior matches the documented contract.
- [ ] Client code consumes the same field names the server emits.
- [ ] Error responses remain consistent and machine-usable.
- [ ] API changes are made in a coordinated way across server and client code.

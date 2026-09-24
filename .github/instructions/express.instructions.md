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
name: "express"
description: "Rules for building safe, predictable Express HTTP APIs and web endpoints."
applyTo: "**/*.js"
version: "1.0.0"
author: "johnmillerATcodemag-com"
tags: ["express", "http", "api", "nodejs"]
owner: "Development Team"
reviewedDate: "2026-09-24"
nextReview: "2026-12-24"
---

# Express

## Scope

Use these rules when writing API endpoints, middleware, or server setup with Express.

## Rules

- Use `express()` once at app startup and keep route setup modular.
- Parse JSON only when required by the endpoint using `express.json()`.
- Prefer explicit HTTP methods and route paths instead of ambiguous handlers.
- Validate request data before writing to storage or performing business logic.
- Return consistent JSON responses with clear status codes.
- Use `try/catch` around database and external calls that can fail.
- Keep middleware focused: parsing, validation, auth, and business logic should be separate concerns.
- Do not leak stack traces or raw database errors to clients in production.
- Use environment variables for configuration such as port and secret values.

## Example

```js
app.use(express.json());

app.get("/api/tasks", (req, res) => {
  try {
    const tasks = db
      .prepare("SELECT * FROM tasks ORDER BY created_at DESC")
      .all();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Unable to load tasks." });
  }
});
```

## Validation

- [ ] Route handlers validate input before use.
- [ ] Errors return appropriate HTTP status codes.
- [ ] Sensitive errors are not exposed to the client.
- [ ] API responses remain predictable and consistent.

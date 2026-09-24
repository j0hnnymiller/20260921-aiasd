---
ai_generated: true
model: "github/copilot@current"
operator: "johnmillerATcodemag-com"
chat_id: "create-specialized-instructions-20260924"
prompt: |
  Create additional repository instruction files covering application security and safe handling of inputs, secrets, and runtime data.
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
name: "security"
description: "Rules for secure coding patterns, validation, and secret handling in this repository."
applyTo: "**/*.{js,md,ps1}"
version: "1.0.0"
author: "johnmillerATcodemag-com"
tags: ["security", "validation", "secrets", "safety"]
owner: "Development Team"
reviewedDate: "2026-09-24"
nextReview: "2026-12-24"
---

# Security

## Scope

Use these rules when writing application code, scripts, and automation that handle user input, file paths, environment configuration, or data persistence.

## Rules

- Never hardcode secrets, API keys, tokens, or connection strings in source files or documentation.
- Validate all user-controlled input before using it in routes, SQL, file paths, or browser behavior.
- Sanitize and normalize outputs before displaying them in the DOM or in logs.
- Prefer least-privilege access patterns and explicit permissions instead of broad default access.
- Reject unexpected data types or malformed values before they reach the database or API layer.
- Log security-relevant events without exposing sensitive data.
- Keep error messages useful but non-disclosive; do not reveal stack traces or internal details to end users.
- Treat filesystem, environment, and network boundaries as untrusted inputs.

## Example

```js
function sanitizeText(value) {
  return String(value ?? "").trim();
}

app.post("/api/tasks", (req, res) => {
  const title = sanitizeText(req.body.title);

  if (!title) {
    return res.status(400).json({ error: "Title is required." });
  }
});
```

## Validation

- [ ] Secrets are not committed or documented.
- [ ] Input validation is performed before writes or route logic.
- [ ] User data is not rendered unsafely in the browser.
- [ ] Error handling remains informative without exposing internals.

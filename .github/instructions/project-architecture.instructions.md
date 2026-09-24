---
ai_generated: true
model: "github/copilot@current"
operator: "johnmillerATcodemag-com"
chat_id: "create-specialized-instructions-20260924"
prompt: |
  Create additional repository instruction files covering project structure, architecture boundaries, and maintainable code organization.
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
name: "project-architecture"
description: "Rules for preserving clear architecture boundaries and maintainable project structure."
applyTo: "**/*.{js,md}"
version: "1.0.0"
author: "johnmillerATcodemag-com"
tags: ["architecture", "structure", "maintainability"]
owner: "Development Team"
reviewedDate: "2026-09-24"
nextReview: "2026-12-24"
---

# Project Architecture

## Scope

Use these rules when adding features, refactoring components, or creating new files in the repository.

## Rules

- Keep the browser UI, API server, and data access layers clearly separated.
- Prefer a small number of well-scoped files over tightly coupled large modules.
- Put shared logic in clearly named modules rather than duplicating behavior across the codebase.
- Keep startup configuration, route setup, and database initialization in obvious, dedicated areas.
- Preserve the project’s existing runtime boundaries: browser code should not own the database directly, and server code should not contain UI-only logic.
- Validate malformed user input before persistence or recurrence calculation. Reject invalid dates rather than letting `NaN` values reach the API layer or database.
- Guard state transitions and idempotency for recurring or bulk completion flows. Only create a next occurrence when a task changes from incomplete to complete; do not create duplicates on repeated saves or complete-all calls.
- Keep database initialization injectable or test-scoped so tests do not touch the shared repository database during startup.
- Prefer readable orchestration over clever abstractions when the codebase is small and explicit.
- Before adding a new layer, confirm it reduces complexity rather than introducing it.

## Example

```text
server.js        HTTP server and database setup
js/app.js        Browser UI logic and API calls
data/            SQLite database files
docs/            Architecture and system docs
```

## Validation

- [ ] Each file has a clear responsibility.
- [ ] The architecture remains understandable by reading the project structure.
- [ ] UI, server, and data concerns are not mixed in a single component.
- [ ] The repo remains easy to navigate without hidden “magic” behavior.

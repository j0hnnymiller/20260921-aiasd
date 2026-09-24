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
name: "sqlite"
description: "Rules for safe, efficient SQLite usage and schema management."
applyTo: "**/*.js"
version: "1.0.0"
author: "johnmillerATcodemag-com"
tags: ["sqlite", "database", "persistence"]
owner: "Development Team"
reviewedDate: "2026-09-24"
nextReview: "2026-12-24"
---

# SQLite

## Scope

Use these rules for any SQLite schema setup, queries, and migrations in this project.

## Rules

- Use prepared statements for all SQL queries when possible to reduce injection risk and keep logic predictable.
- Create schemas that are explicit about required columns, defaults, and not-null constraints.
- Keep database initialization idempotent with `CREATE TABLE IF NOT EXISTS` patterns.
- Add schema migration checks when new columns are required for backward compatibility.
- Prefer simple table structures and clear column names over over-normalized patterns for this project size.
- Validate values before insertion or updates so bad input does not corrupt the database.
- Use WAL mode or other safe local database defaults when appropriate for SQLite-backed workflows.
- Close or reuse database connections with a consistent lifecycle; avoid creating multiple unrelated database handles.

## Example

```js
const db = new Database(databasePath);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  )
`);
```

## Validation

- [ ] SQL queries use prepared statements or safe parameter binding.
- [ ] Schema setup is idempotent and compatible with repeated app starts.
- [ ] Data validation occurs before writes.
- [ ] Database lifecycle remains predictable and easy to reason about.

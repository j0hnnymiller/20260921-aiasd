---
ai_generated: true
model: "github/copilot@current"
operator: "johnmillerATcodemag-com"
chat_id: "9ecdf39f-00e6-4d93-91b8-662ab446deb7"
prompt: |
	update the project documentation to reflect the current state of the project
started: "2026-09-22T00:00:00Z"
ended: "2026-09-22T00:00:00Z"
task_durations:
	- task: "documentation review and update"
		duration: "00:10:00"
total_duration: "00:10:00"
ai_log: "ai-logs/2026/09/22/update-project-documentation-20260922/conversation.md"
source: "user"
---

# Todo List Manager

Todo List Manager is a browser-based task manager with a local Express server and SQLite persistence. The interface is responsive and supports task planning, search, filtering, completion tracking, and bulk actions.

## Features

- Create tasks with a title, description, priority, due date, and start time.
- Edit, complete, and delete individual tasks.
- Search task titles, descriptions, and start times as you type.
- Filter the list by all, open, or completed tasks.
- View total, open, and completed task counts.
- Complete all tasks or clear completed tasks in bulk.
- Reject past due dates in the browser.
- Show a notification when an incomplete task is starting within the next 15 minutes today.
- Store tasks locally in SQLite so data survives server restarts.

## Requirements

- Node.js with npm
- A modern browser

## Run locally

Install dependencies and start the server:

```powershell
npm install
npm start
```

Open <http://localhost:3000> in a browser. Set `PORT` to use a different port, for example:

```powershell
$env:PORT = 4000
npm start
```

The server creates the `data` directory and `data/tasks.sqlite` automatically. SQLite write-ahead logging also creates `data/tasks.sqlite-wal` and `data/tasks.sqlite-shm` while the server is running.

## Scripts

| Command         | Purpose                                                       |
| --------------- | ------------------------------------------------------------- |
| `npm start`     | Start the Express server on port 3000, or the port in `PORT`. |
| `npm run check` | Validate the syntax of the server and browser JavaScript.     |

## API

The browser uses these JSON endpoints:

| Method   | Endpoint                  | Purpose                             |
| -------- | ------------------------- | ----------------------------------- |
| `GET`    | `/api/tasks`              | List tasks, newest first.           |
| `POST`   | `/api/tasks`              | Create a task. `title` is required. |
| `PUT`    | `/api/tasks/:id`          | Update a task.                      |
| `DELETE` | `/api/tasks/:id`          | Delete one task.                    |
| `DELETE` | `/api/tasks/completed`    | Delete all completed tasks.         |
| `POST`   | `/api/tasks/complete-all` | Mark every task as completed.       |

Task responses include `id`, `title`, `description`, `priority`, `dueDate`, `startTime`, `completed`, and `createdAt`.

## Project structure

```text
index.html   Browser interface
styles.css   Responsive visual styling
js/app.js    UI state, API calls, filtering, and reminders
server.js    Express server and SQLite API
data/        Local SQLite database files
docs/        Architecture documentation and Mermaid diagrams
.github/     Workspace customization files and agents
```

## Custom agents

- [product-owner.agent.md](.github/agents/product-owner.agent.md) - Product framing, backlog prioritization, user-story drafting, and acceptance-criteria guidance for feature decisions.
- [senior-developer.agent.md](.github/agents/senior-developer.agent.md) - Code quality, architecture review, implementation planning, debugging, and delivery guidance.

## Custom skills

- [stage-and-commit-change](.github/skills/stage-and-commit-change/SKILL.md) - Stage and commit workspace changes in logical, reviewable groups while preserving unrelated work.

## Custom instruction files

- [nodejs](.github/instructions/nodejs.instructions.md) - Node.js runtime and application guidance.
- [express](.github/instructions/express.instructions.md) - Express API and server patterns.
- [sqlite](.github/instructions/sqlite.instructions.md) - SQLite schema and query safety.
- [javascript](.github/instructions/javascript.instructions.md) - JavaScript conventions and async handling.
- [fetch](.github/instructions/fetch.instructions.md) - Fetch API usage and error handling.
- [dom](.github/instructions/dom.instructions.md) - DOM manipulation and accessibility guidance.
- [node-test](.github/instructions/node-test.instructions.md) - Node.js built-in test runner patterns.
- [markdown](.github/instructions/markdown.instructions.md) - Documentation structure and Markdown quality.
- [mermaid](.github/instructions/mermaid.instructions.md) - Mermaid architecture and flow diagrams.
- [security](.github/instructions/security.instructions.md) - Secure input handling, secret hygiene, and safe defaults.
- [github-issues](.github/instructions/github-issues.instructions.md) - GitHub Issues search, triage, update, and closure guidance.
- [project-architecture](.github/instructions/project-architecture.instructions.md) - Clear project boundaries and maintainable architecture.
- [api-contract](.github/instructions/api-contract.instructions.md) - JSON API contract consistency between server and browser.

## Architecture

See [docs/architecture.md](docs/architecture.md) for Mermaid diagrams covering the runtime topology, request and persistence flow, application layers, and task data model.

## Validation

Run the JavaScript syntax check after making changes:

```powershell
npm run check
```

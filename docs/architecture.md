---
ai_generated: true
model: "github/copilot@current"
operator: "johnmillerATcodemag-com"
chat_id: "create-mermaid-architecture-20260922"
prompt: |
  create mermaid architecture diagrams for this project
started: "2026-09-22T00:00:00Z"
ended: "2026-09-22T00:00:00Z"
task_durations:
  - task: "runtime architecture analysis"
    duration: "00:05:00"
  - task: "diagram and documentation creation"
    duration: "00:10:00"
total_duration: "00:15:00"
ai_log: "ai-logs/2026/09/22/create-mermaid-architecture-20260922/conversation.md"
source: "user"
---

# Todo List Manager Architecture

This document describes the local runtime architecture of Todo List Manager. The application is a browser client served by Express, with a JSON API and a file-backed SQLite database in the same Node.js process. There is no separate frontend build, database server, authentication service, or external API dependency in the repository.

## Runtime topology

```mermaid
graph TD
    Browser["Web browser<br/>index.html + styles.css"]
    Client["Client application<br/>js/app.js<br/>state, rendering, filters, reminders"]
    Server["Node.js process<br/>server.js<br/>Express + static file server"]
    Api["JSON API<br/>/api/tasks"]
    Sqlite["SQLite database<br/>data/tasks.sqlite<br/>WAL mode"]
    Wal["SQLite WAL files<br/>tasks.sqlite-wal<br/>tasks.sqlite-shm"]

    Browser -->|loads HTML, CSS, and JS| Server
    Browser -->|user interaction| Client
    Client -->|fetch JSON over HTTP| Api
    Api -->|queries and mutations| Sqlite
    Sqlite -->|maintains write-ahead log| Wal
    style Browser fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e3a8a
    style Client fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d
    style Server fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f
    style Api fill:#fce7f3,stroke:#db2777,stroke-width:2px,color:#831843
    style Sqlite fill:#ede9fe,stroke:#7c3aed,stroke-width:2px,color:#4c1d95
    style Wal fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#7f1d1d
```

## Request and persistence flow

```mermaid
sequenceDiagram
    actor User
    participant Browser as Browser UI
    participant Client as js/app.js
    participant API as Express API
    participant DB as SQLite

    User->>Browser: Add, edit, complete, or delete task
    Browser->>Client: DOM event
    Client->>Client: Validate title and due date
    Client->>API: HTTP request with JSON task data
    API->>API: Normalize input and validate title
    API->>DB: INSERT, UPDATE, or DELETE
    DB-->>API: Persisted result
    API-->>Client: JSON task response or status
    Client->>API: GET /api/tasks
    API->>DB: SELECT tasks ordered by created_at
    DB-->>API: Task rows
    API-->>Client: Normalized task list
    Client->>Browser: Re-render list and statistics
```

## Application layers and responsibilities

```mermaid
graph TB
    subgraph Presentation["Presentation layer"]
        Markup["index.html<br/>semantic form, toolbar, task list"]
        Styles["styles.css<br/>responsive layout and visual styling"]
        UI["js/app.js<br/>rendering, search, filters, reminders"]
    end

    subgraph Transport["Application transport"]
        Static["Express static middleware<br/>serves repository root"]
        Routes["Express route handlers<br/>GET, POST, PUT, DELETE"]
        Normalize["Task normalization<br/>input defaults and boolean mapping"]
    end

    subgraph Persistence["Persistence layer"]
        Statements["Prepared SQLite statements<br/>select, insert, update, delete"]
        TasksTable["tasks table<br/>id, title, description, priority,<br/>due_date, start_time, completed, created_at"]
        Journal["WAL journal<br/>tasks.sqlite-wal + tasks.sqlite-shm"]
    end

    Markup --> UI
    Styles --> Markup
    UI -->|fetch| Routes
    Static -->|serves assets| Markup
    Routes --> Normalize
    Normalize --> Statements
    Statements --> TasksTable
    TasksTable --> Journal
```

## Task data model

```mermaid
erDiagram
    TASK {
        string id PK
        string title
        string description
        string priority
        string due_date
        string start_time
        boolean completed
        string created_at
    }
```

## Key relationships

- The browser loads the static application from the same Express process that owns the API.
- `js/app.js` keeps the current task list in memory for filtering, searching, rendering, statistics, and reminder checks.
- Mutating operations refresh the in-memory list with `GET /api/tasks` after the server responds.
- The server normalizes SQLite integer completion values into JSON booleans before returning task data.
- SQLite WAL mode provides the database journal files shown in the runtime topology; these files are operational database state, not additional application services.
- Upcoming-task reminders are entirely client-side. They run on a one-minute interval and do not create a server-side scheduled job.

## Operational boundary

Run `npm start` to start the Node.js process. The default listener is `http://localhost:3000`; setting `PORT` changes the listener port. The database directory is created automatically beside the application files, and the schema is created on startup when it does not already exist.

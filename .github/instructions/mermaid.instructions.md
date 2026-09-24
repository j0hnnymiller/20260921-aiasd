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
name: "mermaid"
description: "Rules for creating accurate Mermaid diagrams for architecture and flow documentation."
applyTo: "**/*.{md,mmd}"
version: "1.0.0"
author: "johnmillerATcodemag-com"
tags: ["mermaid", "architecture", "diagrams", "documentation"]
owner: "Development Team"
reviewedDate: "2026-09-24"
nextReview: "2026-12-24"
---

# Mermaid

## Scope

Use these rules when creating Mermaid diagrams for system views, flows, or architecture documentation.

## Rules

- Keep diagrams readable: avoid too many nodes, crossing lines, and redundant detail.
- Match the diagram type to the purpose: flowchart for logic, sequenceDiagram for request timing, and graph relationships for topology.
- Use labels that are short and meaningful; do not overload the diagram with implementation detail.
- Show the real runtime boundaries: browser, server, database, and external dependencies.
- Keep direction consistent and easy to follow.
- Prefer a small number of clearly named components over a crowded map of every implementation detail.
- Include only the components required to understand the flow or architecture.

## Example

```mermaid
flowchart LR
    Browser[Browser UI] -->|HTTP| Server[Express API]
    Server -->|SQL| DB[(SQLite)]
```

## Validation

- [ ] The diagram matches the actual architecture or flow.
- [ ] Labels are readable and not overloaded.
- [ ] The visual focus is on the essential system boundary or interaction.
- [ ] The diagram is maintainable and easy for developers to scan.

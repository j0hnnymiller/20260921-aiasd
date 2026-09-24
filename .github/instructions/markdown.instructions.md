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
name: "markdown"
description: "Rules for clear, scannable Markdown documentation in this repository."
applyTo: "**/*.md"
version: "1.0.0"
author: "johnmillerATcodemag-com"
tags: ["markdown", "documentation", "docs"]
owner: "Development Team"
reviewedDate: "2026-09-24"
nextReview: "2026-12-24"
---

# Markdown

## Scope

Use these rules for repository documentation, READMEs, and technical notes.

## Rules

- Use clear headings in a logical order: overview, setup, usage, architecture, and validation.
- Prefer short paragraphs and bullets over dense prose.
- Use fenced code blocks with language tags when showing commands or examples.
- Keep examples realistic and aligned with the repository’s actual commands and file structure.
- Use relative links for repository-local references when possible.
- Keep documentation current; stale instructions reduce trust and increase onboarding friction.
- Prefer concise but complete content that helps a developer act quickly.

## Example

````md
# Todo List Manager

## Run locally

```bash
npm install
npm start
```
````

```

## Validation

- [ ] Headings are clear and appropriately structured.
- [ ] Commands and examples are accurate and runnable.
- [ ] Local links are valid and documentation is current.
- [ ] The document is easy to scan for intent and steps.
```

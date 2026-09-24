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
name: "dom"
description: "Rules for safe, semantic DOM manipulation in browser scripts."
applyTo: "**/*.js"
version: "1.0.0"
author: "johnmillerATcodemag-com"
tags: ["dom", "browser", "ui", "javascript"]
owner: "Development Team"
reviewedDate: "2026-09-24"
nextReview: "2026-12-24"
---

# DOM

## Scope

Use these rules when manipulating the browser DOM in front-end JavaScript.

## Rules

- Query elements once at startup and cache references when they are reused.
- Prefer semantic selectors and data attributes over brittle CSS selectors tied to layout.
- Guard against null elements before interacting with them.
- Keep DOM updates small and explicit; update only the nodes that must change.
- Use `textContent` for text values and avoid injecting raw HTML without explicit intent.
- Maintain accessibility by updating ARIA attributes and status messages when relevant.
- Preserve event handlers and editing state carefully when rerendering lists.
- Use template markup or element creation patterns instead of string concatenation for large UI updates.

## Example

```js
const form = document.querySelector("#task-form");
const list = document.querySelector("#task-list");

if (!form || !list) {
  throw new Error("Required task UI elements were not found.");
}
```

## Validation

- [ ] DOM queries are safe and null-checked.
- [ ] UI updates are explicit and maintainable.
- [ ] Accessibility and semantics are preserved.
- [ ] Re-render logic does not accidentally lose user state.

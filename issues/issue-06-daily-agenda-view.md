---
ai_generated: true
model: "github/copilot@current"
operator: "johnmillerATcodemag-com"
chat_id: "create-issue-files-20260924"
prompt: |
  Create issue files for requested user stories covering categories and tags, plus a daily agenda view.
started: "2026-09-24T00:00:00Z"
ended: "2026-09-24T00:00:00Z"
task_durations:
  - task: "review backlog needs"
    duration: "00:02:00"
  - task: "draft feature issue files"
    duration: "00:04:00"
  - task: "validate output"
    duration: "00:01:00"
total_duration: "00:07:00"
ai_log: "ai-logs/2026/09/24/create-issue-files-20260924/conversation.md"
source: "user request"
---

## Summary

Users need a daily agenda view that highlights what matters most today instead of requiring them to scan the full task list.

## User story

As a user planning my day, I want a daily agenda view of tasks due today or starting soon so that I can focus on the highest-priority work without scanning the full list.

## Problem

The app currently provides only all/open/done filters and a flat list. Users can create tasks, but there is no quick view of what needs attention today or near-term.

## Evidence

- [index.html](../index.html) exposes filters and statistics but no agenda-oriented screen.
- [js/app.js](../js/app.js) renders the full task list without a prioritized daily summary.
- The task model in [server.js](../server.js) supports due dates and start times, which is enough to build a daily agenda view.

## Why this matters

A flat list is useful for storage, but it is not ideal for daily planning. Users need a quick, focused view that reduces decision fatigue and helps them act on the right tasks first.

## Acceptance criteria

- Add a daily agenda view for the current day and near-term tasks.
- Highlight tasks due today, starting soon, or overdue.
- Keep the agenda readable and compact, without requiring a full calendar or broad redesign.
- Allow users to switch between the standard list view and the daily agenda view.
- Order tasks by urgency, due date, or start time in a predictable and understandable way.
- Keep the feature local-first and compatible with the app’s existing simple architecture.

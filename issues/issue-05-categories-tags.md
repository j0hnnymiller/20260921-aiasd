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

The task manager needs categories or tags so users can organize work by context instead of managing one flat list.

## User story

As a user managing different kinds of work, I want to assign categories or tags to tasks so that I can filter and prioritize my responsibilities by context.

## Problem

The current app stores only title, description, priority, due date, start time, and completion state. There is no way to group tasks or filter them by life area, project, or workstream.

## Evidence

- [server.js](../server.js) exposes a simple task schema without category metadata.
- [index.html](../index.html) provides all/open/done filters but no tag or category filter.
- [js/app.js](../js/app.js) renders a single flat task list with no grouping logic.

## Why this matters

Without categories or tags, users must manually scan long task lists and cannot quickly focus on a specific context such as work, home, errands, or health. This reduces clarity and makes daily planning harder.

## Acceptance criteria

- Add a tag or category field to the task data model.
- Allow users to create and reuse tags without a heavy configuration flow.
- Show tags visibly on each task in the task list.
- Support filtering tasks by tag or category.
- Keep the feature simple and local-first for the existing single-user workflow.
- Ensure one-time tasks and recurring tasks both support tags without breaking the current API contract.

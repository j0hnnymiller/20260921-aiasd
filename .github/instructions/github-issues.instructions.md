---
ai_generated: true
model: "github/copilot@current"
operator: "johnmillerATcodemag-com"
chat_id: "create-github-issues-instructions-20260924"
prompt: |
  Follow instructions in #prompt:SKILL.md with these arguments: for github issues
started: "2026-09-24T00:00:00Z"
ended: "2026-09-24T00:00:00Z"
task_durations:
  - task: "review customization guidance"
    duration: "00:03:00"
  - task: "author GitHub Issues instruction"
    duration: "00:05:00"
  - task: "validate and document artifact"
    duration: "00:02:00"
total_duration: "00:10:00"
ai_log: "ai-logs/2026/09/24/create-github-issues-instructions-20260924/conversation.md"
source: "user request"
name: "github-issues"
description: "Rules for searching, creating, triaging, updating, and closing GitHub Issues safely and consistently."
applyTo: "**/*"
version: "1.0.0"
author: "johnmillerATcodemag-com"
tags: ["github", "issues", "triage", "workflow"]
owner: "Development Team"
reviewedDate: "2026-09-24"
nextReview: "2026-12-24"
---

# GitHub Issues

## Scope

Use these rules when searching, creating, triaging, updating, commenting on, assigning, labeling, or closing GitHub Issues.

## Rules

- Search existing issues before creating a new issue; link likely duplicates instead of opening parallel reports.
- For organization repositories, inspect available issue types before creating an issue and use the most specific supported type.
- Write issue titles that state the observable problem or requested outcome without implementation details.
- Include reproducible steps, expected behavior, actual behavior, environment details, and relevant logs when reporting a bug.
- Separate confirmed facts from hypotheses; label assumptions and ask for missing reproduction details.
- Apply only repository-supported labels, assignees, milestones, and issue types that match the issue's evidence.
- Redact secrets, tokens, credentials, personal data, and private infrastructure details from issue bodies, comments, and logs.
- Preserve existing issue context when editing; do not rewrite user reports or remove useful discussion without a clear reason.
- Use concise, actionable comments that identify the next decision, diagnostic, or owner.
- Before closing an issue, verify the acceptance condition or resolution and set an explicit closure reason when the platform supports one.
- Do not perform destructive issue changes, mass edits, or assignments without explicit user approval.

## Example

```md
## Summary

Tasks created with an invalid due date are accepted by the API.

## Steps to reproduce

1. Send `POST /api/tasks` with a due date before today.
2. Observe the response status and stored task.

## Expected behavior

The API rejects the request with a validation error.

## Actual behavior

The task is stored successfully.

## Environment

- Windows
- Node.js 22
- Commit: `<commit-sha>`

## Acceptance criteria

- Invalid due dates return a 4xx response.
- The invalid task is not persisted.
- A regression test covers the request.
```

## Validation

- [ ] Existing issues were searched before creating a new issue.
- [ ] The title identifies the problem or outcome clearly.
- [ ] Reproduction and acceptance details are complete or missing information is requested.
- [ ] Labels, issue type, assignee, and milestone are supported and evidence-based.
- [ ] Secrets and private data are absent.
- [ ] Closure includes verified resolution and an explicit reason when available.

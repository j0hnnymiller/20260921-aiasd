---
ai_generated: true
model: "github/copilot@current"
operator: "johnmillerATcodemag-com"
chat_id: "stage-and-commit-change-20260923"
prompt: |
  Follow instructions in #prompt:SKILL.md with these arguments: stage and commit change to my git workspace in logical groups
started: "2026-09-23T00:00:00Z"
ended: "2026-09-23T00:00:00Z"
task_durations:
  - task: "extract workflow from conversation"
    duration: "00:05:00"
  - task: "draft reusable Git workflow skill"
    duration: "00:05:00"
total_duration: "00:10:00"
ai_log: "ai-logs/2026/09/23/stage-and-commit-change-20260923/conversation.md"
source: "prompt:SKILL.md"
name: stage-and-commit-change
description: "Use when staging and committing workspace changes in logical, reviewable groups."
argument-hint: Describe the changes to stage and commit
---

# Stage and Commit Changes

Stage and commit the user's intended workspace changes in logical, reviewable groups while preserving unrelated work.

## Workflow

1. Inspect `git status --short`, the unstaged diff, and the staged diff.
2. Classify files by purpose and identify changes unrelated to the request.
3. Check candidate files for secrets, credentials, generated data, and local-only artifacts. Do not stage them.
4. Group related files by one coherent change. Keep unrelated changes in separate groups or leave them untouched.
5. Stage only the first intended group with explicit file paths.
6. Review `git diff --cached` and confirm that the staged content matches the group.
7. Run the narrowest relevant validation for the staged files.
8. Ask for confirmation immediately before creating each commit unless the user explicitly authorized committing in the current request.
9. Commit with a concise imperative message describing the group.
10. Verify the commit with `git show --stat --oneline HEAD` and report the remaining working-tree status.

## Decision Rules

- Never use broad staging such as `git add .` when unrelated changes are present.
- Never modify, reset, stash, or revert user changes to make grouping easier.
- Keep documentation, source changes, tests, and configuration in separate commits when they represent separate purposes.
- Include required provenance logs with the artifact they document, unless they are explicitly excluded by the user or repository policy.
- Stop before committing if the intended file set, validation command, or commit boundary is ambiguous.
- If staging or validation exposes a conflict, secret, generated database file, or unexpected change, report it and ask how to proceed.

## Completion Checklist

- [ ] Intended files are identified and unrelated changes are preserved.
- [ ] No secrets or local-only artifacts are staged.
- [ ] Each staged group has been reviewed with `git diff --cached`.
- [ ] Relevant validation passes or its failure is reported.
- [ ] Commit messages are focused and imperative.
- [ ] Each commit is verified and the remaining status is reported.

---
ai_generated: true
model: "anthropic/claude-3.5-sonnet@2024-10-22"
operator: "johnmillerATcodemag-com"
chat_id: "submit-create-instruction-files-20260211"
prompt: |
  Create comprehensive Markdown guide for creating new `.instructions.md` files in the repository.
  Include complete structure, YAML front matter requirements, content guidelines, creation process,
  quality standards, common patterns, AI-specific considerations, integration requirements,
  validation checklists, common mistakes, and working examples with full metadata.
started: "2026-02-11T18:30:00Z"
ended: "2026-02-11T18:45:00Z"
task_durations:
  - task: "front matter and overview"
    duration: "00:03:00"
  - task: "content structure and guidelines"
    duration: "00:05:00"
  - task: "examples and checklists"
    duration: "00:04:00"
  - task: "validation and refinement"
    duration: "00:03:00"
total_duration: "00:15:00"
ai_log: "ai-logs/2026/02/11/submit-create-instruction-files-20260211/conversation.md"
source: ".github/prompts/meta/create-instruction-files-instructions.prompt.md"
name: instruction-files
description: Compact rules for creating AI-agent instruction files
applyTo: "**/*.instructions.md"
version: "2.1.0"
author: "johnmillerATcodemag-com"
tags: ["instructions", "ai", "token-optimization"]
owner: "Development Team"
reviewedDate: "2026-09-22"
nextReview: "2026-12-22"
---

# Instruction Files

## Purpose

Create small, machine-readable `.instructions.md` files in `.github/instructions/`.

## Rules

- Use kebab-case filenames: `{domain}-{aspect}.instructions.md`
- Store files in `.github/instructions/`
- Keep scope narrow and enforceable
- Use imperative language: MUST, NEVER, ALWAYS
- Prefer bullets, schemas, and checklists over narrative prose
- Split files when they exceed about 250 lines
- Use `## Scope`, `## Rules`, `## Example`, and `## Validation`
- Do not create files for one-off notes, README content, or personal preferences

## Front matter

AI-generated files MUST include:

```yaml
---
ai_generated: true
model: "<provider>/<model>@<version>"
operator: "<github-user>"
chat_id: "<unique-id>"
prompt: |
  <exact prompt>
started: "<ISO8601>"
ended: "<ISO8601>"
task_durations:
  - task: "<task>"
    duration: "<HH:MM:SS>"
total_duration: "<HH:MM:SS>"
ai_log: "ai-logs/<yyyy>/<mm>/<dd>/<chat-id>/conversation.md"
source: "<prompt or creator>"
name: "<kebab-case-name>"
description: "<one-line purpose>"
appliesTo: "**/*.instructions.md"
version: "<semver>"
author: "<team or person>"
tags: ["<tag>"]
owner: "<team or person>"
reviewedDate: "<YYYY-MM-DD>"
nextReview: "<YYYY-MM-DD>"
---
```

## Template

````markdown
# Title

## Scope

## Rules

- Rule 1: ...
- Rule 2: ...

## Example

```yaml

...
```
````

## Validation

- [ ] ...

```

## Agent guidance

- Write for machine parsing, not storytelling
- Put the requirement in the rule itself
- Include examples only when they remove ambiguity
- If a rule conflicts or is unclear, ask before guessing
- Keep wording specific, testable, and compact

## Security

If code generation is involved:

- Never include secrets, API keys, passwords, or tokens
- Validate user input and file paths
- Log sensitive actions when applicable

## Post-creation

- Create `ai-logs/<yyyy>/<mm>/<dd>/<chat-id>/conversation.md`
- Create `ai-logs/<yyyy>/<mm>/<dd>/<chat-id>/summary.md`
- Add a brief README note only if the artifact is durable
- Verify metadata, naming, links, and scope before finishing

## Validation checklist

- [ ] File is in `.github/instructions/`
- [ ] Filename uses kebab-case
- [ ] Front matter includes all required fields
- [ ] Rules are imperative and testable
- [ ] No vague language or filler prose
- [ ] No secrets or credentials
- [ ] Example is concrete and minimal
- [ ] Links resolve and metadata is valid
```

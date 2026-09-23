---
ai_generated: true
model: "anthropic/claude-3.5-sonnet@2024-10-22"
operator: "johnmillerATcodemag-com"
chat_id: "create-powershell-instructions-20260922"
prompt: |
  Create a prompt file from the prompt: create an instruction file for PowerShell
started: "2026-09-22T18:00:00Z"
ended: "2026-09-22T18:05:00Z"
task_durations:
  - task: "prompt file creation"
    duration: "00:05:00"
total_duration: "00:05:00"
ai_log: "ai-logs/2026/09/22/create-powershell-instructions-20260922/conversation.md"
source: ".github/prompts/create-powershell-instructions.prompt.md"
name: create-powershell-instructions
description: Create a PowerShell instruction file for repository automation and script standards
tags: ["powershell", "instructions", "automation"]
---

# Create PowerShell Instructions

Generate a repository instruction file for PowerShell scripting and automation.

## Task

Create `.github/instructions/powershell.instructions.md` with a narrow, enforceable set of rules for PowerShell scripts used in this repository.

## Required content

- Use the repository's `.github/instructions/*.instructions.md` format
- Include full AI provenance metadata in YAML front matter
- Use a narrow `applyTo` pattern such as `**/*.ps1`
- Include `## Scope`, `## Rules`, `## Example`, and `## Validation` sections
- Emphasize safe PowerShell practices for repo automation and scripts
- Cover these areas:
  - PowerShell 7+ preference unless Windows PowerShell is required
  - strict mode and error handling with `try/catch/finally`
  - parameter validation and `CmdletBinding`
  - secure handling of secrets and environment variables
  - use of `Join-Path`, `Test-Path`, `Resolve-Path`, and structured output
  - avoid brittle string parsing and destructive commands without confirmation
  - clear function naming, small scopes, and readable output
  - logging and exit codes for automation scripts
  - testability and cross-platform compatibility

## Output requirements

- Write the file to `.github/instructions/powershell.instructions.md`
- Keep the rules concise, imperative, and machine-readable
- Include a concrete PowerShell example showing validation, strict mode, and error handling
- Add a brief README entry only if the artifact is durable and user-facing
- Ensure the file follows the same provenance pattern as the repo's other AI-generated instruction files

## Validation

- [ ] File is in `.github/instructions/`
- [ ] Filename uses the `*.instructions.md` convention
- [ ] YAML front matter includes all required AI metadata fields
- [ ] Rules are actionable and specific to PowerShell
- [ ] Example is minimal and realistic
- [ ] No secrets or credentials are included

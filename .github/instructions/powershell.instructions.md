---
ai_generated: true
model: "anthropic/claude-3.5-sonnet@2024-10-22"
operator: "johnmillerATcodemag-com"
chat_id: "create-powershell-instructions-20260922"
prompt: |
  Create an instruction file for PowerShell
started: "2026-09-22T18:00:00Z"
ended: "2026-09-22T18:05:00Z"
task_durations:
  - task: "instruction file creation"
    duration: "00:05:00"
total_duration: "00:05:00"
ai_log: "ai-logs/2026/09/22/create-powershell-instructions-20260922/conversation.md"
source: ".github/instructions/powershell.instructions.md"
name: powershell
description: PowerShell authoring and safety rules for scripts and automation
applyTo: "**/*.ps1"
version: "1.0.0"
author: "johnmillerATcodemag-com"
tags: ["powershell", "automation", "scripts"]
owner: "Development Team"
reviewedDate: "2026-09-22"
nextReview: "2026-12-22"
---

# PowerShell

## Scope

Use these rules for PowerShell scripts, functions, and automation tasks in this repository.

## Rules

- Prefer PowerShell 7+ unless a repo requirement mandates Windows PowerShell.
- Start scripts with `Set-StrictMode -Version Latest` and set `$ErrorActionPreference = 'Stop'` when the script must fail fast.
- Use `[CmdletBinding()]` and `param(...)` for reusable scripts and functions.
- Validate all mandatory parameters and use clear, explicit error messages.
- Use `try/catch/finally` around operations that can fail, and rethrow or wrap errors with enough context.
- Prefer `Join-Path`, `Resolve-Path`, and `Test-Path` over brittle string concatenation for file and directory work.
- Avoid destructive actions without a guard, confirmation, or explicit opt-in flag.
- Do not hardcode secrets, tokens, API keys, or credentials in scripts or logs.
- Use environment variables or secure vault references instead of embedded secrets.
- Write small, testable functions with a single responsibility and predictable output.
- Prefer structured objects over ad hoc text output when other tooling consumes the result.
- Use `Write-Verbose`, `Write-Warning`, and `Write-Error` sparingly and with useful context.
- Return explicit exit codes for automation and CI/CD scripts.
- Keep scripts cross-platform when possible and avoid OS-specific commands unless required.
- Add comments only when they clarify intent, not to restate obvious code.

## Example

```powershell
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$Path
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

try {
    $resolvedPath = Resolve-Path -Path $Path -ErrorAction Stop
    Write-Output $resolvedPath.Path
}
catch {
    throw "Unable to resolve path '$Path': $($_.Exception.Message)"
}
```

## Validation

- [ ] Script uses `Set-StrictMode` and a fail-fast error preference when needed.
- [ ] Mandatory inputs are validated and parameter blocks are explicit.
- [ ] File system paths use safe PowerShell path APIs.
- [ ] Secrets are not embedded in the script.
- [ ] Error handling is clear and actionable.
- [ ] Script output is deterministic and easy to consume.

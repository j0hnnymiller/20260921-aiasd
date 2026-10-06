---
name: tests-gap-analysis
description: "Analyzes a codebase's test setup, inventories existing tests, identifies risk-weighted coverage gaps, and proposes a phased test plan. Use when assessing test coverage, deciding which tests to add, or reviewing testing readiness; produces an evidence-backed Markdown report without network access or code changes."
metadata:
  ai_generated: "true"
  model: "unknown/unknown@unknown"
  operator: "johnmillerATcodemag-com"
  chat_id: "c17c39c2-632e-4950-b8c7-7e1e56db5120"
  prompt: "Start implementation"
  started: "2026-09-29T17:23:15Z"
  ended: "2026-09-29T17:24:56Z"
  task_durations: "pilot conversion and validation: 00:01:41"
  total_duration: "00:01:41"
  ai_log: "ai-logs/2026/09/29/c17c39c2-632e-4950-b8c7-7e1e56db5120/conversation.md"
  source: ".github/prompts/tests-gap-analysis.prompt.md"
---

# Test Gap Analysis

Analyze the current workspace and produce an evidence-backed assessment of testing coverage and risk. If the user names a package, service, or feature, focus there; otherwise assess the repository.

## Procedure

1. **Discover the test setup.** Identify frameworks, runners, test directories, naming patterns, coverage configuration and thresholds, and CI test steps.
2. **Inventory existing tests.** Classify tests by type (unit, integration, end-to-end, component, or contract). Count only what can be verified; note critical modules with tests and any evidence of flakiness.
3. **Map critical functionality.** Identify core domains, public APIs, services, critical UI flows, and error-handling paths from repository structure and entry points.
4. **Identify gaps and risks.** For each critical area, state whether tests exist and appear adequate. Flag untested error paths, boundaries, security checks, and integration seams. Support findings with file paths and line references where available.
5. **Recommend tests.** Prioritize scenarios and state the test type, target, scenario outline (Given/When/Then or Arrange/Act/Assert), rationale, and effort (S/M/L).
6. **Set coverage goals.** Report the verified baseline. Propose targets for overall and critical-area coverage only when the repository provides a meaningful baseline; otherwise label targets as recommendations. Give a 2-3 phase plan, starting with high-value, low-effort work.
7. **Produce the report.** Save the Markdown report to `reports/tests-gap-analysis.md`, the only workspace file this workflow may create or change. Create the directory if needed. If the report already exists, ask before overwriting it. Return the report in chat as well.

## Report Format

### Executive summary

Summarize test posture, largest gaps, and overall risk in 2-3 sentences.

### Detected testing setup

List frameworks, test directories, naming patterns, coverage configuration, and CI steps found.

### Test inventory

Give counts by type when verifiable and cite notable files or components and their tests.

### Gaps and risks

| Area/Target | Missing type | Scenario                          | Risk/Impact                | Effort |
| ----------- | ------------ | --------------------------------- | -------------------------- | ------ |
| auth/login  | end-to-end   | Invalid credentials show an error | Authentication regressions | M      |

### Recommended tests

Group actionable scenario outlines by High, Medium, and Low priority.

### Coverage goals and plan

State the baseline and any recommended targets, then describe phased milestones.

### Sources scanned

List the key files and directories consulted.

### Durations

Report per-step and total elapsed time only when measured. If unavailable, say "not measured" rather than inventing durations.

## Boundaries

- Make concrete, evidence-based claims; distinguish verified facts from recommendations and unknowns.
- Prefer small, high-signal tests early.
- Do not make network calls or modify application code.
- Do not run tests or commands that write to the workspace; use existing reports and configuration as evidence.
- If coverage or test quality cannot be established from available evidence, state that limitation explicitly.

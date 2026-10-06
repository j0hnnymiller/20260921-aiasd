---
ai_generated: true
model: "github/copilot@current"
operator: "johnmillerATcodemag-com"
chat_id: "tests-gap-analysis-20260929"
prompt: |
  Analyze the current workspace and produce an evidence-backed assessment of testing coverage and risk.
started: "2026-09-29T00:00:00Z"
ended: "2026-09-29T00:00:00Z"
task_durations:
  - task: "discover test setup"
    duration: "00:05:00"
  - task: "inventory existing tests"
    duration: "00:05:00"
  - task: "map gaps and recommendations"
    duration: "00:10:00"
total_duration: "00:20:00"
ai_log: "ai-logs/2026/09/29/tests-gap-analysis-20260929/conversation.md"
source: "user request"
---

# Test Gap Analysis

### Executive summary

The repository has a minimal Node.js test suite consisting of four recurrence helper tests, but it does not currently measure coverage or validate the application’s exposed API and UI behavior. The largest risk is that regressions in task creation, validation, completion, startup, and browser-side task flows would not be caught by the existing suite, even though the project documents an 80% coverage requirement. The result is a moderate-to-high testing risk for a project that is already described as a task manager with SQLite persistence and multiple user workflows.

### Detected testing setup

- Framework and runner: Node.js built-in test runner via `node:test`, defined in [package.json](../package.json) as `"test": "node --test"`.
- Test directory: [tests](../tests) contains the current suite, with a single file at [tests/recurring-tasks.test.js](../tests/recurring-tasks.test.js).
- Naming pattern: the project uses a direct file-based pattern (`*.test.js`) rather than a broader test harness such as Jest or Vitest.
- Coverage configuration: no coverage command, no `nyc`/`c8` config, and no threshold enforcement is visible in [package.json](../package.json). The issue notes in [issues/issue-03-no-coverage-gate.md](../issues/issue-03-no-coverage-gate.md) explicitly call out this gap.
- CI/test workflow: no workflow files were found under the repository’s GitHub metadata, and there is no automation step in the project package scripts that enforces coverage or run-time validation.
- Supporting policy: [.github/instructions/testing.instructions.md](../.github/instructions/testing.instructions.md) documents a required minimum coverage threshold of 80%, but the implementation evidence does not yet match that policy.

### Test inventory

Verified from current repository evidence:

- Unit tests: 4 tests in [tests/recurring-tasks.test.js](../tests/recurring-tasks.test.js)
  - `daily recurrence advances by one day`
  - `weekly recurrence advances by the configured interval`
  - `monthly recurrence advances by the configured interval`
  - `invalid recurrence metadata is normalized to safe defaults`
- Integration tests: 0 found
- End-to-end tests: 0 found
- Component/browser tests: 0 found
- Coverage baseline: not measurable; no coverage command is configured

Notable coverage pattern:

- The suite is entirely anchored on recurrence helper logic exported from [server.js](../server.js). It validates pure functions but does not exercise the task API routes, database behavior, validation failures, startup lifecycle, or client-side task interactions in [js/app.js](../js/app.js).

### Gaps and risks

| Area/Target | Missing type | Scenario | Risk/Impact | Effort |
| ----------- | ------------ | --------- | ----------- | ------ |
| Task create/update/delete API | integration | Creating a task with required fields succeeds; invalid payloads fail with proper errors | Core task workflows can regress without detection | M |
| Task completion and bulk actions | integration | Completing one task, completing all tasks, and clearing completed tasks behave correctly | Data integrity and user workflow failures can slip through | M |
| Startup readines and shutdown | integration | Server starts, logs readiness, and cleans up correctly on timeout/failure | Production startup reliability remains unverified | M |
| Coverage gate | enforcement | A drop below 80% is blocked in CI or standard test command | Quality regression escapes review | S |
| Browser search/filter/reminder flows | component/E2E | Search text filters results and reminder notifications trigger near start times | User-facing regressions are invisible | M |
| Recurrence end-date validation | integration / unit | End date cutoff stops recurring tasks correctly | Task scheduling logic may generate invalid future tasks | S |

### Recommended tests

High priority

1. API contract smoke tests for task lifecycle
   - Given a valid task payload, when POST /api/tasks is called, then the task is created and returned with persisted fields.
   - Given a request missing a title, when POST /api/tasks is called, then the server returns 400 and does not persist a row.
   - Given an existing task, when PUT /api/tasks/:id is called, then the task is updated and the stored values match the payload.
   - Rationale: these tests cover the core server behavior that defines the app’s public contract.

2. Startup and failure-path integration tests
   - Given the server is launched, when startup completes, then a readiness signal or listening message is emitted and the process stays alive.
   - Given a startup timeout or failed readiness condition, when the process is aborted, then temporary state and child-process resources are cleaned up.
   - Rationale: the repository’s testing guidance explicitly requires readiness checks and cleanup on failure.

3. Coverage gate enforcement
   - Given a standard test run, when coverage is computed, then the run fails below the configured threshold.
   - Rationale: this closes the gap documented in [issues/issue-03-no-coverage-gate.md](../issues/issue-03-no-coverage-gate.md).

Medium priority

1. Bulk task actions and recurrence behavior
   - Given multiple tasks, when complete-all is posted, then each task is marked complete and recurring tasks generate the next occurrence.
   - Given a recurring task with an end date, when the next occurrence exceeds that date, then the recurrence stops.
   - Rationale: a lot of task-manager logic lives in the recurrence and bulk-action paths in [server.js](../server.js).

2. Browser filtering and reminders
   - Given a list of tasks and a search query, when the user types into the search box, then the visible list is filtered correctly.
   - Given a task starting within the reminder window, when the page refreshes or the reminder timer runs, then a toast is shown once for that task.
   - Rationale: the front-end code in [js/app.js](../js/app.js) contains significant user-facing logic that is not currently covered.

Low priority

1. Edge-case validation around dates and time
   - Given a past due date, when the form is submitted, then the UI rejects it with a clear validation message.
   - Given an invalid time string, when the task is saved, then it is normalized or rejected consistently.
   - Rationale: these are smaller risks but still important for data quality.

### Coverage goals and plan

Verified baseline: no measured coverage baseline exists. The only explicit policy is a documented 80% requirement in [.github/instructions/testing.instructions.md](../.github/instructions/testing.instructions.md), but the working repo does not have a coverage command or threshold enforcement in [package.json](../package.json).

Recommended targets:

- Overall project coverage target: 80% minimum, with a staged path to 85% after the first API and startup tests are in place.
- Critical-area target: 90%+ for server-side task logic and recurrence code in [server.js](../server.js), because these are the most business-critical paths.
- UI coverage target: 60-75% for [js/app.js](../js/app.js) once browser integration tests are introduced, recognizing the repo’s current lack of front-end automation.

Phase plan:

1. Phase 1: API contract and failure validation (high value, low effort)
   - Add tests for create/update/delete, validation errors, and bulk actions.
   - Add an initial coverage command with a static threshold (start at the repo’s 80% policy, then tune after evidence).
2. Phase 2: startup, timeout, and cleanup checks (medium effort)
   - Cover readiness messaging, timeout handling, and child-process cleanup.
   - This aligns with the explicit startup testing rules in [.github/instructions/testing.instructions.md](../.github/instructions/testing.instructions.md).
3. Phase 3: browser behavior and reminder logic (medium effort)
   - Cover search/filter flows and due-date notification behavior in [js/app.js](../js/app.js).
   - Expand coverage only after API and startup tests are stable.

### Sources scanned

- [package.json](../package.json)
- [server.js](../server.js)
- [js/app.js](../js/app.js)
- [tests/recurring-tasks.test.js](../tests/recurring-tasks.test.js)
- [.github/instructions/testing.instructions.md](../.github/instructions/testing.instructions.md)
- [issues/issue-01-test-suite-too-narrow.md](../issues/issue-01-test-suite-too-narrow.md)
- [issues/issue-02-no-startup-failure-path-tests.md](../issues/issue-02-no-startup-failure-path-tests.md)
- [issues/issue-03-no-coverage-gate.md](../issues/issue-03-no-coverage-gate.md)
- [README.md](../README.md)

### Durations

Not measured for this review; the report is based on repository evidence rather than a test run or CI measurement.

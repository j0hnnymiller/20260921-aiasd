const test = require("node:test");
const assert = require("node:assert/strict");

const {
  calculateNextOccurrenceDate,
  normalizeRecurrenceInput,
  normalizeTags,
} = require("../server.js");

test("daily recurrence advances by one day", () => {
  assert.equal(
    calculateNextOccurrenceDate("2026-09-24", "daily", 1),
    "2026-09-25",
  );
});

test("weekly recurrence advances by the configured interval", () => {
  assert.equal(
    calculateNextOccurrenceDate("2026-09-24", "weekly", 2),
    "2026-10-08",
  );
});

test("monthly recurrence advances by the configured interval", () => {
  assert.equal(
    calculateNextOccurrenceDate("2026-01-31", "monthly", 1),
    "2026-02-28",
  );
});

test("invalid recurrence metadata is normalized to safe defaults", () => {
  const normalized = normalizeRecurrenceInput({
    recurrenceType: "yearly",
    recurrenceInterval: 0,
  });

  assert.equal(normalized.recurrenceType, "none");
  assert.equal(normalized.recurrenceInterval, 1);
  assert.equal(normalized.recurrenceEndDate, "");
});

test("invalid due dates do not generate recurring occurrences", () => {
  assert.equal(calculateNextOccurrenceDate("not-a-date", "daily", 1), "");
});

test("invalid calendar due dates do not generate recurring occurrences", () => {
  assert.equal(calculateNextOccurrenceDate("2026-02-31", "daily", 1), "");
});

test("tags are normalized, deduplicated, and limited", () => {
  assert.deepEqual(
    normalizeTags("Work, home, work, , Errands"),
    ["Work", "home", "Errands"],
  );
});

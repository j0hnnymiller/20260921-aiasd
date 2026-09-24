const test = require("node:test");
const assert = require("node:assert/strict");

const { normalizeTagList } = require("../server.js");

test("comma-separated tag strings are trimmed, lowercased, and deduplicated", () => {
  assert.deepEqual(normalizeTagList(" Work, Home ,work, errands"), [
    "work",
    "home",
    "errands",
  ]);
});

test("array input is normalized the same way as a string", () => {
  assert.deepEqual(normalizeTagList(["Urgent", " urgent ", "low-priority"]), [
    "urgent",
    "low-priority",
  ]);
});

test("empty and missing tag input normalizes to an empty list", () => {
  assert.deepEqual(normalizeTagList(""), []);
  assert.deepEqual(normalizeTagList(undefined), []);
  assert.deepEqual(normalizeTagList(", , ,"), []);
});

test("tag list is capped at ten unique tags per task", () => {
  const manyTags = Array.from({ length: 15 }, (_, index) => `tag${index}`);
  assert.equal(normalizeTagList(manyTags).length, 10);
});

test("individual tags are truncated to thirty characters", () => {
  const longTag = "a".repeat(50);
  assert.equal(normalizeTagList(longTag)[0].length, 30);
});

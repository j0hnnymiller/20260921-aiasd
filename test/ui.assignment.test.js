const { test, afterEach } = require("node:test");
const assert = require("node:assert/strict");

const {
  loadApp,
  closeApp,
  wait,
  submitForm,
} = require("../testlib/domHarness");

afterEach(() => {
  closeApp();
});

test("index.html defines an accessible Assign to field in the task form", () => {
  loadApp([]);

  const assigneeInput = document.querySelector("#task-assignee");

  assert.ok(assigneeInput, "expected an #task-assignee input to exist");
  assert.equal(assigneeInput.name, "assignedTo");

  const label = document.querySelector('label[for="task-assignee"]');
  assert.ok(label, "expected a <label> associated with the assignee field");
});

test("submitting the task form with an assignee sends assignedTo to the API", async () => {
  const { store } = loadApp([]);

  document.querySelector("#task-title").value = "Ship release notes";
  document.querySelector("#task-assignee").value = "Priya";
  submitForm(document.querySelector("#task-form"));

  await wait();
  await wait();

  assert.equal(store.tasks.length, 1);
  assert.equal(store.tasks[0].assignedTo, "Priya");
});

test("renders an Assigned to badge only for tasks that have an assignee", async () => {
  loadApp([
    {
      id: "t1",
      title: "Assigned task",
      priority: "medium",
      completed: false,
      assignedTo: "Priya",
      assignedAt: new Date().toISOString(),
    },
    {
      id: "t2",
      title: "Unassigned task",
      priority: "medium",
      completed: false,
      assignedTo: "",
      assignedAt: "",
    },
  ]);

  await wait();
  await wait();

  const assignedItem = document.querySelector('.task-item[data-id="t1"]');
  const unassignedItem = document.querySelector('.task-item[data-id="t2"]');

  assert.ok(assignedItem.textContent.includes("Priya"));
  assert.ok(!unassignedItem.textContent.includes("Assigned to"));
});

test("editing a task pre-fills the assignedTo field with the current assignee", async () => {
  loadApp([
    {
      id: "t1",
      title: "Investigate bug",
      priority: "medium",
      completed: false,
      assignedTo: "Priya",
      assignedAt: new Date().toISOString(),
    },
  ]);

  await wait();
  await wait();

  const editButton = document.querySelector(
    '.task-item[data-id="t1"] button[data-action="edit"]',
  );
  editButton.click();

  assert.equal(document.querySelector("#task-assignee").value, "Priya");
});

test("searching by assignee name filters the visible task list", async () => {
  loadApp([
    {
      id: "t1",
      title: "Alpha task",
      priority: "medium",
      completed: false,
      assignedTo: "Priya",
      assignedAt: new Date().toISOString(),
    },
    {
      id: "t2",
      title: "Beta task",
      priority: "medium",
      completed: false,
      assignedTo: "Sam",
      assignedAt: new Date().toISOString(),
    },
  ]);

  await wait();
  await wait();

  const searchInput = document.querySelector("#search-input");
  searchInput.value = "priya";
  searchInput.dispatchEvent(new window.Event("input", { bubbles: true }));

  const listText = document.querySelector("#task-list").textContent;
  assert.ok(listText.includes("Alpha task"));
  assert.ok(!listText.includes("Beta task"));
});

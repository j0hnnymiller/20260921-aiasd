const API_URL = "/api/tasks";

const form = document.querySelector("#task-form");
const list = document.querySelector("#task-list");
const emptyTemplate = document.querySelector("#empty-template");
const searchInput = document.querySelector("#search-input");
const filterButtons = document.querySelectorAll(".filter-button");
const clearCompletedButton = document.querySelector("#clear-completed");
const completeAllButton = document.querySelector("#complete-all");
const dueDateInput = document.querySelector("#task-due-date");
const dateError = document.querySelector("#date-error");
const submitButton = form.querySelector(".primary-action");
const toastContainer = document.querySelector("#toast-container");
const totalCount = document.querySelector("#total-count");
const openCount = document.querySelector("#open-count");
const doneCount = document.querySelector("#done-count");

const REMINDER_WINDOW_MINUTES = 15;
const REMINDER_CHECK_INTERVAL = 60_000;
const TOAST_VISIBLE_TIME = 6_000;

let tasks = [];
let activeFilter = "all";
let query = "";
let editingTaskId = null;
const shownReminderKeys = new Set();

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function loadTasks() {
  tasks = await requestJson(API_URL);
  renderTasks();
  checkUpcomingTaskReminders();
}

async function createTask(task) {
  await requestJson(API_URL, {
    method: "POST",
    body: JSON.stringify(task),
  });
  await loadTasks();
}

async function saveTask(taskId, updates) {
  await requestJson(`${API_URL}/${taskId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
  await loadTasks();
}

async function removeTask(taskId) {
  await requestJson(`${API_URL}/${taskId}`, { method: "DELETE" });
  await loadTasks();
}

async function clearCompletedTasks() {
  await requestJson(`${API_URL}/completed`, { method: "DELETE" });
  await loadTasks();
}

async function completeAllTasks() {
  await requestJson(`${API_URL}/complete-all`, { method: "POST" });
  await loadTasks();
}

function getTodayDateValue() {
  const today = new Date();
  const offsetToday = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000,
  );
  return offsetToday.toISOString().slice(0, 10);
}

function isPastDate(dateValue) {
  return Boolean(dateValue) && dateValue < getTodayDateValue();
}

function setDateError(message) {
  dateError.textContent = message;
  dueDateInput.setAttribute("aria-invalid", String(Boolean(message)));
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "No due date";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${dateValue}T00:00:00`));
}

function formatTime(timeValue) {
  if (!timeValue) {
    return "No start time";
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(`2000-01-01T${timeValue}`));
}

function isValidTimeValue(timeValue) {
  return !timeValue || /^\d{2}:\d{2}$/.test(timeValue);
}

function getTaskStartDateTime(task) {
  if (!task.dueDate || !task.startTime) {
    return null;
  }

  return new Date(`${task.dueDate}T${task.startTime}`);
}

function isStartingWithinReminderWindow(task, now = new Date()) {
  if (task.completed || task.dueDate !== getTodayDateValue()) {
    return false;
  }

  const taskStart = getTaskStartDateTime(task);

  if (!taskStart || Number.isNaN(taskStart.getTime())) {
    return false;
  }

  const minutesUntilStart = (taskStart.getTime() - now.getTime()) / 60000;
  return (
    minutesUntilStart >= -1 && minutesUntilStart <= REMINDER_WINDOW_MINUTES
  );
}

function showToast(title, message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");

  const toastTitle = document.createElement("strong");
  toastTitle.textContent = title;

  const toastMessage = document.createElement("p");
  toastMessage.textContent = message;

  toast.append(toastTitle, toastMessage);
  toastContainer.append(toast);

  window.setTimeout(() => {
    toast.remove();
  }, TOAST_VISIBLE_TIME);
}

function checkUpcomingTaskReminders() {
  const now = new Date();

  tasks.forEach((task) => {
    const reminderKey = `${task.id}-${task.dueDate}-${task.startTime}`;

    if (
      shownReminderKeys.has(reminderKey) ||
      !isStartingWithinReminderWindow(task, now)
    ) {
      return;
    }

    shownReminderKeys.add(reminderKey);
    showToast(
      "Task starting soon",
      `${task.title} starts at ${formatTime(task.startTime)} today.`,
    );
  });
}

function getVisibleTasks() {
  return tasks
    .filter((task) => {
      if (activeFilter === "open") {
        return !task.completed;
      }

      if (activeFilter === "done") {
        return task.completed;
      }

      return true;
    })
    .filter((task) => {
      const searchableText = `${task.title} ${task.description ?? ""} ${task.startTime ?? ""}`;
      return searchableText.toLowerCase().includes(query);
    });
}

/**
 * Updates the summary counters shown at the top of the task list.
 * These values reflect the total number of tasks, how many are complete,
 * and how many are still open based on the current in-memory task collection.
 */
function renderStats() {
  // Count how many tasks are marked as completed in the current list.
  const completedTasks = tasks.filter((task) => task.completed).length;

  // Update the task summary widgets in the UI.
  totalCount.textContent = tasks.length;
  doneCount.textContent = completedTasks;
  openCount.textContent = tasks.length - completedTasks;
}

function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = `task-item priority-${task.priority}${task.completed ? " done" : ""}`;
  item.dataset.id = task.id;

  const checkbox = document.createElement("input");
  checkbox.className = "task-checkbox";
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  checkbox.setAttribute(
    "aria-label",
    `Mark ${task.title} as ${task.completed ? "open" : "done"}`,
  );

  const content = document.createElement("div");
  content.className = "task-content";

  const title = document.createElement("p");
  title.className = "task-title";
  title.textContent = task.title;

  const description = document.createElement("p");
  description.className = "task-description";
  description.textContent = task.description ?? "";

  const meta = document.createElement("div");
  meta.className = "task-meta";

  const prioritySpan = document.createElement("span");
  prioritySpan.textContent = task.priority;

  const dueDateSpan = document.createElement("span");
  dueDateSpan.textContent = formatDate(task.dueDate);

  const startTimeSpan = document.createElement("span");
  startTimeSpan.textContent = task.startTime
    ? `Starts ${formatTime(task.startTime)}`
    : "No start time";

  meta.append(prioritySpan, dueDateSpan, startTimeSpan);

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const editButton = document.createElement("button");
  editButton.className = "icon-button";
  editButton.type = "button";
  editButton.dataset.action = "edit";
  editButton.setAttribute("aria-label", `Edit ${task.title}`);
  editButton.title = "Edit";
  editButton.textContent = "✎";

  const deleteButton = document.createElement("button");
  deleteButton.className = "icon-button";
  deleteButton.type = "button";
  deleteButton.dataset.action = "delete";
  deleteButton.setAttribute("aria-label", `Delete ${task.title}`);
  deleteButton.title = "Delete";
  deleteButton.textContent = "×";

  content.append(title);

  if (description.textContent) {
    content.append(description);
  }

  content.append(meta);
  actions.append(editButton, deleteButton);
  item.append(checkbox, content, actions);

  return item;
}

function renderTasks() {
  const visibleTasks = getVisibleTasks();
  list.replaceChildren();

  if (visibleTasks.length === 0) {
    list.append(emptyTemplate.content.cloneNode(true));
  } else {
    list.append(...visibleTasks.map(createTaskElement));
  }

  renderStats();
}

async function saveTaskFromForm(formData) {
  const title = formData.get("title").trim();
  const description = formData.get("description").trim();
  const dueDate = formData.get("dueDate");
  const startTime = formData.get("startTime");
  const priority = formData.get("priority");

  if (isPastDate(dueDate)) {
    setDateError("Past dates are not allowed. Choose today or a future date.");
    dueDateInput.focus();
    return false;
  }

  if (!title) {
    return false;
  }

  setDateError("");

  if (editingTaskId) {
    await saveTask(editingTaskId, {
      title,
      description,
      priority,
      dueDate,
      startTime,
    });
    editingTaskId = null;
    submitButton.textContent = "Add Task";
    return true;
  }

  await createTask({
    title,
    description,
    priority,
    dueDate,
    startTime,
    completed: false,
  });
  return true;
}

function editTask(taskId) {
  const task = tasks.find((item) => item.id === taskId);

  if (!task) {
    return;
  }

  editingTaskId = taskId;
  form.elements.title.value = task.title;
  form.elements.description.value = task.description ?? "";
  form.elements.priority.value = task.priority;
  form.elements.dueDate.value = task.dueDate ?? "";
  form.elements.startTime.value = task.startTime ?? "";
  submitButton.textContent = "Save Task";
  setDateError("");
  form.elements.title.focus();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const wasSaved = await saveTaskFromForm(new FormData(form));

  if (!wasSaved) {
    return;
  }

  form.reset();
  editingTaskId = null;
  submitButton.textContent = "Add Task";
  form.elements.title.focus();
});

dueDateInput.min = getTodayDateValue();
dueDateInput.addEventListener("input", () => setDateError(""));

searchInput.addEventListener("input", (event) => {
  query = event.target.value.trim().toLowerCase();
  renderTasks();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("active", isActive);
      filterButton.setAttribute("aria-selected", String(isActive));
    });
    renderTasks();
  });
});

list.addEventListener("change", async (event) => {
  if (!event.target.matches(".task-checkbox")) {
    return;
  }

  await saveTask(event.target.closest(".task-item").dataset.id, {
    completed: event.target.checked,
  });
});

list.addEventListener("click", async (event) => {
  const actionButton = event.target.closest("button[data-action]");

  if (!actionButton) {
    return;
  }

  const taskId = actionButton.closest(".task-item").dataset.id;

  if (actionButton.dataset.action === "delete") {
    await removeTask(taskId);
  }

  if (actionButton.dataset.action === "edit") {
    editTask(taskId);
  }
});

clearCompletedButton.addEventListener("click", () => {
  clearCompletedTasks();
});

completeAllButton.addEventListener("click", () => {
  completeAllTasks();
});

loadTasks();
window.setInterval(checkUpcomingTaskReminders, REMINDER_CHECK_INTERVAL);

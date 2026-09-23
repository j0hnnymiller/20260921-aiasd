const { JSDOM } = require("jsdom");
const fs = require("node:fs");
const path = require("node:path");

function jsonResponse(status, body) {
  return {
    ok: status < 400,
    status,
    json: async () => body,
  };
}

function createMockFetch(store) {
  return async function mockFetch(url, options = {}) {
    const method = options.method || "GET";

    if (url === "/api/tasks" && method === "GET") {
      return jsonResponse(200, store.tasks);
    }

    if (url === "/api/tasks" && method === "POST") {
      const body = JSON.parse(options.body);
      const task = {
        id: `task-${store.nextId++}`,
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
        startTime: "",
        completed: false,
        assignedTo: "",
        assignedAt: "",
        ...body,
      };
      task.assignedAt = task.assignedTo ? new Date().toISOString() : "";
      store.tasks.unshift(task);
      return jsonResponse(201, task);
    }

    const putMatch = url.match(/^\/api\/tasks\/([^/]+)$/);
    if (putMatch && method === "PUT") {
      const existing = store.tasks.find((task) => task.id === putMatch[1]);
      const body = JSON.parse(options.body);

      if ("assignedTo" in body) {
        existing.assignedAt =
          body.assignedTo && body.assignedTo !== existing.assignedTo
            ? new Date().toISOString()
            : body.assignedTo
              ? existing.assignedAt
              : "";
      }

      Object.assign(existing, body);
      return jsonResponse(200, existing);
    }

    if (url === "/api/tasks/complete-all" && method === "POST") {
      store.tasks.forEach((task) => {
        task.completed = true;
      });
      return jsonResponse(200, store.tasks);
    }

    if (url === "/api/tasks/completed" && method === "DELETE") {
      store.tasks = store.tasks.filter((task) => !task.completed);
      return { ok: true, status: 204, json: async () => null };
    }

    throw new Error(`Unhandled mock request: ${method} ${url}`);
  };
}

function wait() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

let activeDom = null;

function loadApp(initialTasks = []) {
  const html = fs.readFileSync(
    path.join(__dirname, "..", "index.html"),
    "utf8",
  );
  const dom = new JSDOM(html, {
    url: "http://localhost/",
    runScripts: "outside-only",
  });

  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
  global.HTMLElement = dom.window.HTMLElement;
  global.FormData = dom.window.FormData;

  const store = { tasks: initialTasks, nextId: 1 };
  global.fetch = createMockFetch(store);

  delete require.cache[require.resolve("../js/app.js")];
  require("../js/app.js");

  activeDom = dom;
  return { dom, store };
}

function closeApp() {
  if (activeDom) {
    activeDom.window.close();
    activeDom = null;
  }
}

function submitForm(form) {
  const event = new global.window.Event("submit", {
    bubbles: true,
    cancelable: true,
  });
  form.dispatchEvent(event);
}

module.exports = { loadApp, closeApp, wait, submitForm };

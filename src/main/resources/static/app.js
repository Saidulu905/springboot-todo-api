const API_BASE = window.TODO_API_BASE || "http://localhost:8080";

const state = {
  mode: "login",
  token: localStorage.getItem("todoToken"),
  page: 0,
  size: 10,
  totalPages: 1,
  editingId: null
};

const elements = {
  authPanel: document.querySelector("#authPanel"),
  workspace: document.querySelector("#workspace"),
  loginTab: document.querySelector("#loginTab"),
  registerTab: document.querySelector("#registerTab"),
  authForm: document.querySelector("#authForm"),
  nameField: document.querySelector("#nameField"),
  nameInput: document.querySelector("#nameInput"),
  emailInput: document.querySelector("#emailInput"),
  passwordInput: document.querySelector("#passwordInput"),
  authSubmit: document.querySelector("#authSubmit"),
  authMessage: document.querySelector("#authMessage"),
  logoutButton: document.querySelector("#logoutButton"),
  todoForm: document.querySelector("#todoForm"),
  todoTitle: document.querySelector("#todoTitle"),
  todoDescription: document.querySelector("#todoDescription"),
  todoSubmit: document.querySelector("#todoSubmit"),
  cancelEdit: document.querySelector("#cancelEdit"),
  todoMessage: document.querySelector("#todoMessage"),
  todoList: document.querySelector("#todoList"),
  prevPage: document.querySelector("#prevPage"),
  nextPage: document.querySelector("#nextPage"),
  pageInfo: document.querySelector("#pageInfo")
};

function setMode(mode) {
  state.mode = mode;
  const isRegister = mode === "register";

  elements.loginTab.classList.toggle("active", !isRegister);
  elements.registerTab.classList.toggle("active", isRegister);
  elements.nameField.classList.toggle("hidden", !isRegister);
  elements.nameInput.required = isRegister;
  elements.authSubmit.textContent = isRegister ? "Create account" : "Login";
  elements.authMessage.textContent = "";
  elements.authMessage.classList.remove("error");
}

function showMessage(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle("error", isError);
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers
    });
  } catch (error) {
    throw new Error(`Network error while calling ${API_BASE}${path}`);
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || data?.error || "Request failed");
  }

  return data;
}

function renderLayout() {
  const isLoggedIn = Boolean(state.token);
  elements.authPanel.classList.toggle("hidden", isLoggedIn);
  elements.workspace.classList.toggle("hidden", !isLoggedIn);

  if (isLoggedIn) {
    loadTodos();
  }
}

async function handleAuth(event) {
  event.preventDefault();
  showMessage(elements.authMessage, "Connecting...");

  const payload = {
    email: elements.emailInput.value.trim(),
    password: elements.passwordInput.value
  };

  if (state.mode === "register") {
    payload.name = elements.nameInput.value.trim();
  }

  try {
    const endpoint = state.mode === "register" ? "/register" : "/login";
    const data = await request(endpoint, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    state.token = data.token;
    localStorage.setItem("todoToken", data.token);
    elements.authForm.reset();
    showMessage(elements.authMessage, "");
    renderLayout();
  } catch (error) {
    showMessage(elements.authMessage, error.message, true);
  }
}

async function loadTodos() {
  showMessage(elements.todoMessage, "Loading...");

  try {
    const data = await request(`/todos?page=${state.page}&size=${state.size}`);
    state.totalPages = data.totalPages || 1;
    renderTodos(data.content || []);
    renderPager();
    showMessage(elements.todoMessage, "");
  } catch (error) {
    showMessage(elements.todoMessage, error.message, true);

    if (error.message.toLowerCase().includes("unauthorized")) {
      logout();
    }
  }
}

function renderTodos(todos) {
  if (!todos.length) {
    elements.todoList.innerHTML = '<div class="empty-state">No todos on this page.</div>';
    return;
  }

  elements.todoList.innerHTML = todos.map((todo) => `
    <article class="todo-item">
      <div>
        <p class="todo-title">${escapeHtml(todo.title)}</p>
        <p class="todo-description">${escapeHtml(todo.description || "")}</p>
      </div>
      <div class="todo-actions">
        <button class="text-action" type="button" data-edit="${todo.id}">Edit</button>
        <button class="text-action danger" type="button" data-delete="${todo.id}">Delete</button>
      </div>
    </article>
  `).join("");
}

function renderPager() {
  elements.pageInfo.textContent = `Page ${state.page + 1} of ${state.totalPages}`;
  elements.prevPage.disabled = state.page <= 0;
  elements.nextPage.disabled = state.page + 1 >= state.totalPages;
}

async function saveTodo(event) {
  event.preventDefault();

  const payload = {
    title: elements.todoTitle.value.trim(),
    description: elements.todoDescription.value.trim()
  };

  if (!payload.title) {
    showMessage(elements.todoMessage, "Title is required", true);
    return;
  }

  const isEditing = state.editingId !== null;
  const path = isEditing ? `/todos/${state.editingId}` : "/todos";
  const method = isEditing ? "PUT" : "POST";

  try {
    await request(path, {
      method,
      body: JSON.stringify(payload)
    });

    resetTodoForm();
    await loadTodos();
  } catch (error) {
    showMessage(elements.todoMessage, error.message, true);
  }
}

function beginEdit(todoId) {
  const item = document.querySelector(`[data-edit="${todoId}"]`).closest(".todo-item");
  state.editingId = todoId;
  elements.todoTitle.value = item.querySelector(".todo-title").textContent;
  elements.todoDescription.value = item.querySelector(".todo-description").textContent;
  elements.todoSubmit.textContent = "Save";
  elements.cancelEdit.classList.remove("hidden");
  elements.todoTitle.focus();
}

async function deleteTodo(todoId) {
  try {
    await request(`/todos/${todoId}`, { method: "DELETE" });
    await loadTodos();
  } catch (error) {
    showMessage(elements.todoMessage, error.message, true);
  }
}

function resetTodoForm() {
  state.editingId = null;
  elements.todoForm.reset();
  elements.todoSubmit.textContent = "Add";
  elements.cancelEdit.classList.add("hidden");
}

function logout() {
  state.token = null;
  localStorage.removeItem("todoToken");
  resetTodoForm();
  renderLayout();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

elements.loginTab.addEventListener("click", () => setMode("login"));
elements.registerTab.addEventListener("click", () => setMode("register"));
elements.authForm.addEventListener("submit", handleAuth);
elements.todoForm.addEventListener("submit", saveTodo);
elements.cancelEdit.addEventListener("click", resetTodoForm);
elements.logoutButton.addEventListener("click", logout);

elements.todoList.addEventListener("click", (event) => {
  const editId = event.target.dataset.edit;
  const deleteId = event.target.dataset.delete;

  if (editId) {
    beginEdit(Number(editId));
  }

  if (deleteId) {
    deleteTodo(Number(deleteId));
  }
});

elements.prevPage.addEventListener("click", () => {
  if (state.page > 0) {
    state.page -= 1;
    loadTodos();
  }
});

elements.nextPage.addEventListener("click", () => {
  if (state.page + 1 < state.totalPages) {
    state.page += 1;
    loadTodos();
  }
});

setMode("login");
renderLayout();

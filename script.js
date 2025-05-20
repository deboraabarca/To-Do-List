// Selección de elementos del DOM
const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task");
const tasksList = document.querySelector(".tasks-list");
const categoryBtns = document.querySelectorAll(".category-btn");
const modal = document.getElementById("task-modal");
const closeModal = document.querySelector(".close-modal");
const editTaskInput = document.getElementById("edit-task-input");
const taskDateInput = document.getElementById("task-date");
const saveTaskBtn = document.getElementById("save-task");

// Estado de la aplicación
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let deletedTasks = JSON.parse(localStorage.getItem("deletedTasks")) || [];
let currentFilter = "all";
let currentEditingTaskId = null;

// Inicializar la aplicación
function init() {
  renderTasks();
  setupEventListeners();

  // Establecer la fecha mínima como hoy para el selector de fecha
  const today = new Date().toISOString().split("T")[0];
  taskDateInput.setAttribute("min", today);
}

// Configurar event listeners
function setupEventListeners() {
  // Agregar tarea
  addTaskBtn.addEventListener("click", addTask);
  taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addTask();
    }
  });

  // Cambiar categoría
  categoryBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      categoryBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.category;
      renderTasks();
    });
  });

  // Delegación de eventos para las tareas
  tasksList.addEventListener("click", handleTaskActions);

  // Modal events
  closeModal.addEventListener("click", () => {
    modal.classList.remove("show");
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("show");
    }
  });

  saveTaskBtn.addEventListener("click", saveTaskChanges);
}

// Agregar una nueva tarea
function addTask() {
  const taskText = taskInput.value.trim();
  if (taskText) {
    const today = new Date().toISOString().split("T")[0];
    const newTask = {
      id: Date.now(),
      text: taskText,
      completed: false,
      starred: false,
      date: today, // Por defecto se programa para hoy
      deleted: false,
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
    taskInput.value = "";
  }
}

// Guardar tareas en localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Guardar tareas eliminadas en localStorage
function saveDeletedTasks() {
  localStorage.setItem("deletedTasks", JSON.stringify(deletedTasks));
}

// Filtrar tareas según la categoría seleccionada
function filterTasks() {
  const today = new Date().toISOString().split("T")[0];

  switch (currentFilter) {
    case "starred":
      return tasks.filter((task) => task.starred);
    case "today":
      return tasks.filter((task) => task.date === today);
    case "scheduled":
      return tasks.filter((task) => task.date > today);
    case "trash":
      return deletedTasks;
    default:
      return tasks;
  }
}

// Manejar acciones en las tareas (marcar, destacar, eliminar, editar)
function handleTaskActions(e) {
  const target = e.target;
  const taskItem = target.closest(".task-item");

  if (!taskItem) return;

  const taskId = parseInt(taskItem.dataset.id);

  // Para tareas normales
  if (currentFilter !== "trash") {
    const taskIndex = tasks.findIndex((task) => task.id === taskId);

    if (taskIndex === -1) return;

    // Marcar como completada
    if (
      target.classList.contains("task-checkbox") ||
      target.closest(".task-checkbox")
    ) {
      tasks[taskIndex].completed = !tasks[taskIndex].completed;
      saveTasks();
      renderTasks();
    }

    // Destacar tarea
    if (
      target.classList.contains("task-star") ||
      target.closest(".task-star")
    ) {
      tasks[taskIndex].starred = !tasks[taskIndex].starred;
      saveTasks();
      renderTasks();
    }

    // Editar tarea
    if (
      target.classList.contains("task-edit") ||
      target.closest(".task-edit")
    ) {
      openEditModal(taskId);
    }

    // Mover a papelera
    if (
      target.classList.contains("task-delete") ||
      target.closest(".task-delete")
    ) {
      const deletedTask = tasks.splice(taskIndex, 1)[0];
      deletedTasks.push(deletedTask);
      saveDeletedTasks();
      saveTasks();
      renderTasks();
    }
  }
  // Para tareas eliminadas
  else {
    const taskIndex = deletedTasks.findIndex((task) => task.id === taskId);

    if (taskIndex === -1) return;

    // Restaurar tarea
    if (target.classList.contains("restore-btn")) {
      const restoredTask = deletedTasks.splice(taskIndex, 1)[0];
      tasks.push(restoredTask);
      saveDeletedTasks();
      saveTasks();
      renderTasks();
    }

    // Eliminar permanentemente
    if (target.classList.contains("delete-forever-btn")) {
      deletedTasks.splice(taskIndex, 1);
      saveDeletedTasks();
      renderTasks();
    }
  }
}

// Renderizar las tareas en el DOM
function renderTasks() {
  const filteredTasks = filterTasks();

  tasksList.innerHTML = "";

  if (filteredTasks.length === 0) {
    tasksList.innerHTML = `
            <div class="empty-state">
                <p>No tasks available</p>
            </div>
        `;
    return;
  }

  filteredTasks.forEach((task) => {
    const taskElement = document.createElement("div");
    taskElement.classList.add("task-item");
    taskElement.dataset.id = task.id;

    // Si estamos en la vista de papelera
    if (currentFilter === "trash") {
      taskElement.classList.add("deleted");
      taskElement.innerHTML = `
                <div class="task-content">${task.text}</div>
                <div class="task-date">Scheduled: ${formatDate(task.date)}</div>
                <div class="trash-action">
                    <button class="restore-btn">Restore</button>
                    <button class="delete-forever-btn">Delete Forever</button>
                </div>
            `;
    } else {
      taskElement.innerHTML = `
                <div class="task-checkbox ${
                  task.completed ? "checked" : ""
                }"></div>
                <div class="task-content ${task.completed ? "checked" : ""}">${
        task.text
      }</div>
                <div class="task-date">${formatDate(task.date)}</div>
                <div class="task-actions">
                    <button class="task-star ${
                      task.starred ? "starred" : ""
                    }">★</button>
                    <button class="task-edit">✎</button>
                    <button class="task-delete">×</button>
                </div>
            `;
    }

    tasksList.appendChild(taskElement);
  });
}

// Formatear fecha para mostrar
function formatDate(dateString) {
  if (!dateString) return "";

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  if (dateString === today) return "Today";
  if (dateString === tomorrowStr) return "Tomorrow";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

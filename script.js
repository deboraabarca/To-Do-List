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

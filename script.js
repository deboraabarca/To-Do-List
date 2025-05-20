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

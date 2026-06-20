document.addEventListener("DOMContentLoaded", () => {

const taskList = document.getElementById("taskList");

const input = document.getElementById("taskInput");
const dateInput = document.getElementById("dateInput");
const repeatType = document.getElementById("repeatType");

const addBtn = document.getElementById("addBtn");
const sweepBtn = document.getElementById("sweepBtn");

const toast = document.getElementById("toast");

let tasks = [];

/* =========================
   UNDO SYSTEM
========================= */

let undoStack = null;
let undoTimer = null;

/* =========================
   TOAST
========================= */

function showToast(message, onUndo) {
  toast.classList.remove("hidden");

  toast.innerHTML = `
    <span>${message}</span>
    <button id="undoBtn">Undo</button>

    <div class="toast-bar">
      <div class="toast-bar-fill"></div>
    </div>
  `;

  const bar = toast.querySelector(".toast-bar-fill");

  let duration = 4000;
  let start = Date.now();

  /* 🔥 animación smooth con requestAnimationFrame */
  function animate() {
    let elapsed = Date.now() - start;
    let progress = Math.max(0, 1 - elapsed / duration);

    bar.style.width = (progress * 100) + "%";

    if (progress > 0) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);

  document.getElementById("undoBtn").onclick = () => {
    clearTimeout(undoTimer);
    toast.classList.add("hidden");

    if (undoStack && onUndo) {
      onUndo();
      undoStack = null;
    }
  };

  undoTimer = setTimeout(() => {
    toast.classList.add("hidden");
    undoStack = null;
  }, duration);
}
/* =========================
   ADD TASK
========================= */

function addTask() {
  const text = input.value.trim();
  const date = dateInput.value;

  if (!text || !date) return;

  tasks.push({
    text,
    date,
    repeat: repeatType.value,
    done: false
  });

  input.value = "";
  dateInput.value = "";
  repeatType.value = "none";

  render();
}

/* =========================
   RENDER
========================= */

function render() {
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    taskList.appendChild(createTask(task, index));
  });
}

/* =========================
   CREATE TASK CARD
========================= */

function createTask(task, index) {
  const card = document.createElement("div");
  card.className = "task";

  const left = document.createElement("div");
  left.className = "task-left";

  const text = document.createElement("strong");
  text.className = "task-text";
  text.textContent = task.text;

  const meta = document.createElement("span");
  meta.className = "meta";
  meta.textContent = `📅 ${task.date} ${task.repeat !== "none" ? "| 🔁 " + task.repeat : ""}`;

  left.appendChild(text);
  left.appendChild(meta);

  const actions = document.createElement("div");
  actions.className = "actions";

  const doneBtn = document.createElement("button");
  doneBtn.textContent = "✔";
  doneBtn.onclick = () => toggleTask(index);

  const delBtn = document.createElement("button");
  delBtn.textContent = "✕";
  delBtn.onclick = () => deleteTask(index);

  actions.appendChild(doneBtn);
  actions.appendChild(delBtn);

  card.appendChild(left);
  card.appendChild(actions);

  /* INLINE EDIT */
  text.addEventListener("click", () => enableEdit(text, task, index));

  return card;
}

/* =========================
   INLINE EDIT
========================= */

function enableEdit(textEl, task, index) {
  const input = document.createElement("input");
  input.className = "task-edit";
  input.value = task.text;

  textEl.replaceWith(input);
  input.focus();

  const save = () => {
    const value = input.value.trim();
    if (value) {
      tasks[index].text = value;
    }
    render();
  };

  input.addEventListener("blur", save);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") render();
  });
}

/* =========================
   TOGGLE TASK (DONE + UNDO)
========================= */

function toggleTask(index) {
  const task = tasks[index];

  if (!task.done) {
    undoStack = { task, index };

    tasks.splice(index, 1);
    render();

    showToast("Task completada", () => {
      tasks.splice(undoStack.index, 0, undoStack.task);
      render();
    });

  } else {
    task.done = false;
    render();
  }
}

/* =========================
   DELETE (UNDO)
========================= */

function deleteTask(index) {
  undoStack = {
    task: tasks[index],
    index
  };

  tasks.splice(index, 1);
  render();

  showToast("Task eliminada", () => {
    tasks.splice(undoStack.index, 0, undoStack.task);
    render();
  });
}

/* =========================
   SWEEP
========================= */

function sweepTasks() {
  const removed = tasks.filter(t => t.done);

  undoStack = {
    removed
  };

  tasks = tasks.filter(t => !t.done);
  render();

  showToast("Sweep realizado", () => {
    tasks = [...tasks, ...undoStack.removed];
    render();
  });
}

/* =========================
   EVENTS
========================= */

addBtn.addEventListener("click", addTask);
sweepBtn.addEventListener("click", sweepTasks);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

/* expose */
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;

/* INIT */
render();

});

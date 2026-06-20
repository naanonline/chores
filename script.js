document.addEventListener("DOMContentLoaded", () => {

const taskList = document.getElementById("taskList");
const toast = document.getElementById("toast");

const input = document.getElementById("taskInput");
const dateInput = document.getElementById("dateInput");
const repeatType = document.getElementById("repeatType");

const addBtn = document.getElementById("addBtn");
const sweepBtn = document.getElementById("sweepBtn");

let tasks = [];
let undoStack = null;
let undoTimer = null;

/* =========================
   SMART DATE ENGINE
========================= */

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/* 🔥 regla smart: evita lunes/viernes pesados */
function smartAdjust(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 dom - 6 sáb

  // mover viernes → sábado
  if (day === 5) d.setDate(d.getDate() + 1);

  // mover lunes → martes
  if (day === 1) d.setDate(d.getDate() + 1);

  return d;
}

/* =========================
   NEXT DATE LOGIC
========================= */

function getNextDate(task) {
  let base = new Date(task.date);
  let next;

  switch (task.repeat) {
    case "14days":
      next = addDays(base, 14);
      break;

    case "weekly":
      next = addDays(base, 7);
      break;

    case "monthly":
      next = new Date(base);
      next.setMonth(next.getMonth() + 1);
      break;

    default:
      return null;
  }

  return smartAdjust(next);
}

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

  function animate() {
    let progress = Math.max(0, 1 - (Date.now() - start) / duration);
    bar.style.width = (progress * 100) + "%";

    if (progress > 0) requestAnimationFrame(animate);
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
    const card = document.createElement("div");
    card.className = "task" + (task.done ? " done" : "");

    const left = document.createElement("div");

    const text = document.createElement("strong");
    text.className = "task-text";
    text.textContent = task.text;

    const meta = document.createElement("div");
    meta.style.fontSize = "12px";
    meta.style.color = "#6b7280";
    meta.textContent = `📅 ${task.date} | 🔁 ${task.repeat}`;

    left.appendChild(text);
    left.appendChild(meta);

    const actions = document.createElement("div");

    const done = document.createElement("button");
    done.textContent = "✔";
    done.onclick = () => toggleTask(index);

    const del = document.createElement("button");
    del.textContent = "✕";
    del.onclick = () => deleteTask(index);

    actions.appendChild(done);
    actions.appendChild(del);

    card.appendChild(left);
    card.appendChild(actions);

    text.addEventListener("click", () => editTask(text, index));

    taskList.appendChild(card);
  });
}

/* =========================
   INLINE EDIT
========================= */

function editTask(el, index) {
  const input = document.createElement("input");
  input.value = tasks[index].text;

  el.replaceWith(input);
  input.focus();

  const save = () => {
    tasks[index].text = input.value.trim() || tasks[index].text;
    render();
  };

  input.addEventListener("blur", save);
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") render();
  });
}

/* =========================
   TOGGLE (SMART RESCHEDULE)
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

    // 🔥 SMART RESCHEDULE
    if (task.repeat !== "none") {
      const next = getNextDate(task);

      if (next) {
        tasks.push({
          text: task.text,
          date: next.toISOString().split("T")[0],
          repeat: task.repeat,
          done: false
        });
      }
    }
  }
}

/* =========================
   DELETE
========================= */

function deleteTask(index) {
  undoStack = { task: tasks[index], index };

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

  undoStack = { removed };

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

addBtn.onclick = addTask;
sweepBtn.onclick = sweepTasks;

render();

});

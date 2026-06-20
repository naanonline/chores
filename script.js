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

/* =========================
   TOAST STATE (PRO FIX)
========================= */

let toastTimer = null;
let toastStart = null;
let toastRAF = null;
const toastDuration = 4000;

/* =========================
   UTIL
========================= */

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function smartAdjust(date) {
  const d = new Date(date);
  const day = d.getDay();

  if (day === 5) d.setDate(d.getDate() + 1);
  if (day === 1) d.setDate(d.getDate() + 1);

  return d;
}

/* =========================
   NEXT DATE
========================= */

function getNextDate(task) {
  let base = new Date(task.date);
  let next = null;

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
   TOAST PRO (1 SOLO SISTEMA)
========================= */

function showToast({ message, onUndo, actions = [] }) {

  clearTimeout(toastTimer);
  cancelAnimationFrame(toastRAF);

  toast.classList.remove("hidden");

  toast.innerHTML = `
    <span>${message}</span>

    <div class="toast-actions">
     ${onUndo ? `<button class="toast-link" id="undoBtn">Undo</button>` : ""}
     ${actions.map((a, i) =>
       `<button class="toast-pill" data-action="${i}">${a.label}</button>`
     ).join("")}
   </div>

    <div class="toast-bar">
      <div class="toast-bar-fill"></div>
    </div>
  `;

  const bar = toast.querySelector(".toast-bar-fill");
  toastStart = Date.now();

  function animate() {
    const elapsed = Date.now() - toastStart;
    const progress = Math.max(0, 1 - elapsed / toastDuration);

    bar.style.width = (progress * 100) + "%";

    if (progress > 0) {
      toastRAF = requestAnimationFrame(animate);
    }
  }

  toastRAF = requestAnimationFrame(animate);

  /* UNDO */
  if (onUndo) {
    document.getElementById("undoBtn").onclick = () => {
      clearTimeout(toastTimer);
      cancelAnimationFrame(toastRAF);
      toast.classList.add("hidden");

      onUndo();
      undoStack = null;
    };
  }

  /* ACTIONS */
  actions.forEach((a, i) => {
    const btn = toast.querySelector(`[data-action="${i}"]`);
    btn.onclick = () => {
      a.onClick();
      toast.classList.add("hidden");
      cancelAnimationFrame(toastRAF);
      clearTimeout(toastTimer);
    };
  });

  toastTimer = setTimeout(() => {
    toast.classList.add("hidden");
    cancelAnimationFrame(toastRAF);
    undoStack = null;
  }, toastDuration);
}

/* =========================
   ADD TASK
========================= */

function addTask() {
  const text = input.value.trim();
  const date = dateInput.value;

  if (!text || !date) return;

  tasks.push({
    id: crypto.randomUUID(),
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
    card.className = "task";

    const left = document.createElement("div");
    left.className = "task-left";

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
    actions.className = "actions";

    const done = document.createElement("button");
    done.className = "btn-done";
    done.textContent = "✔";
    done.onclick = () => toggleTask(index);

    const del = document.createElement("button");
    del.className = "btn-delete";
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
   COMPLETE + SMART ACTION TOAST
========================= */

function toggleTask(index) {
  const task = tasks[index];

  const original = { ...task };

  undoStack = {
    task: original,
    index
  };

  tasks.splice(index, 1);
  render();

  const hasRepeat =
  task.repeat === "14days" ||
  task.repeat === "weekly" ||
  task.repeat === "monthly";

const next = hasRepeat ? getNextDate(task) : null;

  showToast({
    message: "Task completada",
    onUndo: () => {
      tasks.splice(undoStack.index, 0, undoStack.task);
      render();
    },
    actions: next
     ? [
      {
        label: `Agregar ${next.toISOString().split("T")[0]}`,
        onClick: () => {
          tasks.push({
            id: crypto.randomUUID(),
            text: task.text,
            date: next.toISOString().split("T")[0],
            repeat: task.repeat,
            done: false
          });

          render();
        }
      },
      {
        label: "Ignorar",
        onClick: () => {}
      }
    ]
  : []
  });
}

/* =========================
   DELETE
========================= */

function deleteTask(index) {
  undoStack = {
    task: { ...tasks[index] },
    index
  };

  tasks.splice(index, 1);

  showToast({
    message: "Task eliminada",
    onUndo: () => {
      tasks.splice(undoStack.index, 0, undoStack.task);
      render();
    }
  });

  render();
}

/* =========================
   SWEEP
========================= */

function sweepTasks() {
  const removed = tasks.filter(t => t.done);

  undoStack = { removed };

  tasks = tasks.filter(t => !t.done);
  render();

  showToast({
    message: "Sweep realizado",
    onUndo: () => {
      tasks = [...tasks, ...undoStack.removed];
      render();
    }
  });
}

/* =========================
   EVENTS
========================= */

addBtn.onclick = addTask;
sweepBtn.onclick = sweepTasks;

render();

});

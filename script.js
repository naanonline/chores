const input = document.getElementById("taskInput");
const dateInput = document.getElementById("dateInput");
const repeatType = document.getElementById("repeatType");

const addBtn = document.getElementById("addBtn");
const sweepBtn = document.getElementById("sweepBtn");
const taskList = document.getElementById("taskList");

let tasks = [];

/* =========================
   HELPERS DE FECHAS
========================= */

function formatDate(d) {
  return d.toISOString().split("T")[0];
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/* 🔥 snap a fin de semana */
function snapWeekend(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 dom, 6 sáb

  if (day === 4) { // jueves -> viernes
    d.setDate(d.getDate() + 1);
  }
  if (day === 5) { // viernes -> sábado
    d.setDate(d.getDate() + 1);
  }

  return d;
}

/* =========================
   NEXT DATE LOGIC
========================= */

function getNextDate(task) {
  const base = new Date(task.date);

  let next;

  switch (task.repeat) {
    case "days14":
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

  return snapWeekend(next);
}

/* =========================
   RENDER
========================= */

function render() {
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    const card = document.createElement("div");
    card.className = "task" + (task.done ? " done" : "");

    card.innerHTML = `
      <div class="task-left">
        <strong>${task.text}</strong>
        <span class="meta">
          📅 ${task.date} 
          ${task.repeat !== "none" ? ` | 🔁 ${task.repeat}` : ""}
        </span>
      </div>

      <div class="actions">
        <button onclick="toggleTask(${index})">✔</button>
        <button onclick="deleteTask(${index})">✕</button>
      </div>
    `;

    taskList.appendChild(card);
  });
}

/* =========================
   ACTIONS
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

function toggleTask(index) {
  const task = tasks[index];
  task.done = !task.done;

  /* 🔥 si se completa y tiene repetición → reprograma */
  if (task.done && task.repeat !== "none") {
    const next = getNextDate(task);

    if (next) {
      tasks.push({
        text: task.text,
        date: formatDate(next),
        repeat: task.repeat,
        done: false
      });
    }
  }

  render();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  render();
}

/* 🧹 sweep */
function sweepTasks() {
  tasks = tasks.filter(t => !t.done);
  render();
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

/* init */
render();

document.addEventListener("DOMContentLoaded", () => {

const taskList = document.getElementById("taskList");

const input = document.getElementById("taskInput");
const dateInput = document.getElementById("dateInput");
const repeatType = document.getElementById("repeatType");

const addBtn = document.getElementById("addBtn");
const sweepBtn = document.getElementById("sweepBtn");

let tasks = [];

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
   RENDER (NO FULL DOM BREAKING)
========================= */

function render() {
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    taskList.appendChild(createTask(task, index));
  });
}

/* =========================
   CREATE TASK NODE
========================= */

function createTask(task, index) {
  const card = document.createElement("div");
  card.className = "task" + (task.done ? " done" : "");

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
   INLINE EDIT (NOTION STYLE)
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

    if (e.key === "Escape") {
      render();
    }
  });
}

/* =========================
   ACTIONS
========================= */

function toggleTask(index) {
  tasks[index].done = !tasks[index].done;
  render();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  render();
}

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

/* expose (por seguridad con botones futuros) */
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;

/* INIT */
render();

});

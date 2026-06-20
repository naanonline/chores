const input = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const sweepBtn = document.getElementById("sweepBtn");
const taskList = document.getElementById("taskList");

let tasks = [];

function render() {
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    const div = document.createElement("div");
    div.className = "task" + (task.done ? " done" : "");

    div.innerHTML = `
      <span>${task.text}</span>
      <div>
        <button onclick="toggleTask(${index})">✔</button>
        <button onclick="deleteTask(${index})">✕</button>
      </div>
    `;

    taskList.appendChild(div);
  });
}

function addTask() {
  const text = input.value.trim();
  if (!text) return;

  tasks.push({ text, done: false });
  input.value = "";
  render();
}

function toggleTask(index) {
  tasks[index].done = !tasks[index].done;
  render();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  render();
}

// 🧹 Sweep = borrar completadas
function sweepTasks() {
  tasks = tasks.filter(t => !t.done);
  render();
}

addBtn.addEventListener("click", addTask);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

sweepBtn.addEventListener("click", sweepTasks);

// Exponer funciones para botones inline
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;

render();

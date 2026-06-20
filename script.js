const input = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const sweepBtn = document.getElementById("sweepBtn");
const taskList = document.getElementById("taskList");

let tasks = [];

function render() {
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    const card = document.createElement("div");
    card.className = "task" + (task.done ? " done" : "");

    card.innerHTML = `
      <span>${task.text}</span>
      <div class="task-actions">
        <button onclick="toggleTask(${index})">✔</button>
        <button onclick="deleteTask(${index})">✕</button>
      </div>
    `;

    taskList.appendChild(card);
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

function sweepTasks() {
  tasks = tasks.filter(t => !t.done);
  render();
}

addBtn.addEventListener("click", addTask);
sweepBtn.addEventListener("click", sweepTasks);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

window.toggleTask = toggleTask;
window.deleteTask = deleteTask;

render();

let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
let filter = "all";

function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function calculateNext(task, from) {
  let date = new Date(from);

  if (task.type === "days") {
    date.setDate(date.getDate() + parseInt(task.value));
  }

  if (task.type === "month") {
    const d = parseInt(task.value);
    date.setMonth(date.getMonth() + 1);
    date.setDate(d);
  }

  return date;
}

function addTask() {
  const name = document.getElementById("name").value;
  const category = document.getElementById("category").value;
  const type = document.getElementById("type").value;
  const value = document.getElementById("value").value;

  if (!name || !value) return;

  const now = new Date();

  tasks.push({
    id: Date.now(),
    name,
    category,
    type,
    value,
    lastDone: now,
    next: calculateNext({ type, value }, now)
  });

  save();
  render();
}

function markDone(id) {
  tasks = tasks.map(t => {
    if (t.id === id) {
      const now = new Date();
      return {
        ...t,
        lastDone: now,
        next: calculateNext(t, now)
      };
    }
    return t;
  });

  save();
  render();
}

function setFilter(f) {
  filter = f;
  render();
}

function getStatus(task) {
  const now = new Date();
  const diff = new Date(task.next) - now;

  if (diff < 0) return "red";
  if (diff < 86400000) return "yellow";
  return "green";
}

/* DASHBOARD */
function renderDashboard() {
  const now = new Date();
  let o=0, t=0, u=0;

  tasks.forEach(task => {
    const diff = new Date(task.next) - now;
    if (diff < 0) o++;
    else if (diff < 86400000) t++;
    else u++;
  });

  document.getElementById("overdue").innerText = o + " Vencidas";
  document.getElementById("today").innerText = t + " Hoy";
  document.getElementById("upcoming").innerText = u + " Próximas";
}

/* LIST */
function renderList() {
  const list = document.getElementById("list");
  list.innerHTML = "";

  tasks
    .filter(t => filter === "all" || t.category === filter)
    .sort((a,b) => new Date(a.next) - new Date(b.next))
    .forEach(t => {
      const status = getStatus(t);

      const div = document.createElement("div");
      div.className = "task " + status;

      div.innerHTML = `
        <b>${t.name}</b><br>
        <small>${t.category}</small><br>
        <small>📅 ${new Date(t.next).toLocaleDateString()}</small><br>
        <button onclick="markDone(${t.id})">Hecho</button>
      `;

      list.appendChild(div);
    });
}

/* CALENDAR */
function renderCalendar() {
  const cal = document.getElementById("calendar");
  if (!cal) return;

  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  const first = new Date(y,m,1);
  const last = new Date(y,m+1,0);

  cal.innerHTML = "";

  for (let i=0;i<first.getDay();i++) {
    cal.innerHTML += `<div class="day"></div>`;
  }

  for (let d=1; d<=last.getDate(); d++) {
    const date = new Date(y,m,d).toDateString();

    const dayTasks = tasks.filter(t =>
      new Date(t.next).toDateString() === date
    );

    cal.innerHTML += `
      <div class="day">
        <b>${d}</b><br>
        ${dayTasks.map(t => "• " + t.name).join("<br>")}
      </div>
    `;
  }
}

function render() {
  renderDashboard();
  renderList();
  renderCalendar();
}

render();

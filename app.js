let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// 🔥 regla principal de cálculo
function calculateNext(task, fromDate) {
  let date = new Date(fromDate);

  if (task.type === "days") {
    date.setDate(date.getDate() + parseInt(task.value));
  }

  if (task.type === "monthDay") {
    const day = parseInt(task.value);
    date.setMonth(date.getMonth() + 1);
    date.setDate(day);
  }

  if (task.type === "weekday") {
    const targetDay = parseInt(task.value); // 0-6
    date.setDate(date.getDate() + 1);
    while (date.getDay() !== targetDay) {
      date.setDate(date.getDate() + 1);
    }
  }

  // 🧠 mover a fin de semana si está activo
  if (task.weekendFix) {
    const day = date.getDay();
    if (day >= 1 && day <= 5) {
      // mover a sábado
      date.setDate(date.getDate() + (6 - day));
    }
  }

  return date;
}

function addTask() {
  const name = document.getElementById("name").value;
  const type = document.getElementById("type").value;
  const value = document.getElementById("value").value;
  const weekendFix = document.getElementById("weekendFix").checked;

  if (!name || !value) return;

  const now = new Date();

  const task = {
    id: Date.now(),
    name,
    type,
    value,
    weekendFix,
    lastDone: now,
    next: calculateNext({ type, value, weekendFix }, now)
  };

  tasks.push(task);
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

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  save();
  render();
}

function render() {
  const list = document.getElementById("list");
  list.innerHTML = "";

  tasks.sort((a, b) => new Date(a.next) - new Date(b.next));

  tasks.forEach(t => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <b>${t.name}</b><br/>
      <div class="small">
        Próxima: ${new Date(t.next).toLocaleDateString()}
      </div>

      <div class="row">
        <button onclick="markDone(${t.id})">Hecho</button>
        <button class="delete" onclick="deleteTask(${t.id})">Borrar</button>
      </div>
    `;

    list.appendChild(div);
  });
}

render();

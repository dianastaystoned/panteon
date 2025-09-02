const socket = io();

// ✅ Conexión al servidor
socket.on("connect", () => {
  console.log("🔌 Conectado al servidor de sockets:", socket.id);
});

// 📩 Cuando llegue un nuevo registro
socket.on("nuevoRegistro", (difunto) => {
  console.log("🆕 Nuevo registro recibido:", difunto);

  // 👉 Actualizar contadores
  document.getElementById("totalCement").textContent = difunto.allCement;
  document.getElementById("oldCement").textContent = difunto.oldCement;
  document.getElementById("newCement").textContent = difunto.newCement;
  document.getElementById("availableCement").textContent = difunto.availableCement;

  // 👉 Agregar en tabla "Recientes"
  const tbody = document.querySelector(".scroll-table tbody");
  if (tbody) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><p>${difunto.name}</p></td>
      <td>${difunto.fecha || ""}</td>
      <td><span class="status ${difunto.panteon === "VIEJO" ? "viejo" : "nuevo"}">
        ${difunto.panteon}
      </span></td>
    `;
    tbody.prepend(row); // 👈 lo pone al inicio de la tabla
  }
});

// 📩 Cuando se actualice un registro
socket.on("registroActualizado", (difunto) => {
  console.log("✏ Registro actualizado:", difunto);

  // 👉 Agregar en la lista de "Modificados"
  const todoList = document.querySelector(".todo-list");
  if (todoList) {
    const li = document.createElement("li");
    li.classList.add("completed");
    li.innerHTML = `
      <p>${difunto.name}</p>
      <i class="uil uil-elipsis-double-v-alt view-btn" data-id="${difunto.id}"></i>
    `;
    todoList.prepend(li); // lo añade arriba
  }

  // 👉 Agregar en lista <ul class="recent-list">
  const recentList = document.querySelector(".recent-list");
  if (recentList) {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${difunto.name}</span>
      <button class="view-btn" data-id="${difunto.id}">
        <i class="uil uil-eye"></i>
      </button>
    `;
    recentList.prepend(li);
  }
});

// ❌ Desconexión
socket.on("disconnect", () => {
  console.log("❌ Desconectado del servidor de sockets");
});

const socket = io();

// Cuando el servidor emite un nuevo registro
socket.on("nuevoRegistro", (data) => {
  console.log("Nuevo registro recibido:", data);

  const tbody = document.querySelector("tbody");
  const row = document.createElement("tr");

  row.innerHTML = `
    <td><p>${data.name}</p></td>
    <td>${data.fecha}</td>
    <td><span class="status ${data.panteon === 'VIEJO' ? 'viejo' : 'nuevo'}">${data.panteon}</span></td>
    <td>${data.seccion}</td>
    <td>${data.act}</td>
    <td>${data.num}</td>
    <td>
      <button class="open-edit-btn input-fiel button full" data-id="${data.id}">Editar</button>
    </td>
  `;

  tbody.appendChild(row);

  // Opcional: actualizar contadores en tu dashboard si los tienes
  if (document.querySelector("#allCement")) {
    document.querySelector("#allCement").textContent = data.allCement;
    document.querySelector("#oldCement").textContent = data.oldCement;
    document.querySelector("#newCement").textContent = data.newCement;
    document.querySelector("#availableCement").textContent = data.availableCement;
  }
});

const socket = io()
socket.on("nuevoRegistro", (data) => {
  console.log("📩 Nuevo registro recibido:", data);

  const tbody = document.querySelector(".scroll-table tbody");
  if (!tbody) return console.error("❌ No encontré el tbody de la tabla");

  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><p>${data.name}</p></td>
    <td>${data.fecha || ""}</td>
    <td><span class="status ${data.panteon === "VIEJO" ? "viejo" : "nuevo"}">${data.panteon}</span></td>
    <td>${data.seccion || ""}</td>
    <td>${data.act || 0}</td>
    <td>${data.num || 0}</td>
    <td>
      <button class="open-edit-btn input-fiel button full" data-id="${data.id}">Editar</button>
    </td>
  `;

  tbody.appendChild(tr);

  // 🔥 Reasignar evento al botón recién agregado
  const btn = tr.querySelector(".open-edit-btn");
  if (btn) {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      if (!id) {
        alert("No hay ID asignado a este botón.");
        return;
      }

      try {
        const res = await fetch(`/api/difunto/${id}`);
        if (!res.ok) throw new Error("No se pudo obtener el registro");

        const difunto = await res.json();

        // Actualizar título modal
        document.getElementById("modalTitle").textContent = `Editar registro de ${difunto.name}`;

        // Llenar formulario
        const editForm = document.getElementById("editForm");
        editForm.action = `/update/${difunto.id}`;
        editForm.name.value = difunto.name || '';
        editForm.seccion.value = difunto.seccion || '';
        editForm.fecha.value = difunto.fecha || '';
        editForm.panteon.value = difunto.panteon || '';
        editForm.pisos.value = difunto.pisos ?? '';
        editForm.num.value = difunto.num ?? '';

        // Mostrar modal
        document.getElementById("modaledit").classList.add("show");
      } catch (error) {
        alert(error.message);
      }
    });
  }
});

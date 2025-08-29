(() => {
  console.log("[socket-client] init");

  const socket = io();
  socket.on("connect", () => console.log("✅ socket conectado:", socket.id));

  // ===== MODAL CREAR =====
  const openCreateBtn  = document.getElementById("openModal");
  const createModal    = document.getElementById("modal");
  const closeCreateBtn = document.getElementById("closeModal");

  function openCreateModal(e) {
    if (e) e.preventDefault();
    if (createModal) createModal.classList.add("show");
  }

  function closeCreateModal() {
    if (createModal) createModal.classList.remove("show");
  }

  if (openCreateBtn) openCreateBtn.addEventListener("click", openCreateModal);
  if (closeCreateBtn) closeCreateBtn.addEventListener("click", closeCreateModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCreateModal();
  });

  // ===== FORM CREAR =====
  const form = document.getElementById("registroForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      data.pisos = data.pisos || 0;
      data.num   = data.num   || 0;

      try {
        const res = await fetch("/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          console.log("📤 Difunto enviado al servidor");
          form.reset();
          closeCreateModal();
        } else {
          alert("Error al guardar el registro");
        }
      } catch (err) {
        console.error("Error en la petición:", err);
        alert("Error en la petición");
      }
    });
  }

  // ===== TABLA =====
  const tbody = document.querySelector("table.scroll-table.wide-table tbody");
  if (!tbody) {
    console.warn("⚠️ No se encontró <tbody> en la tabla");
  }

  // ===== SOCKET NUEVO REGISTRO =====
  socket.on("nuevoRegistro", (data) => {
    console.log("📩 nuevoRegistro recibido:", data);

    if (!tbody) return;

    const rowHTML = `
      <tr>
        <td><p>${data.name}</p></td>
        <td>${data.fecha || ""}</td>
        <td><span class="status ${data.panteon === "VIEJO" ? "viejo" : "nuevo"}">${data.panteon}</span></td>
        <td>${data.seccion}</td>
        <td>${data.act}</td>
        <td>${data.num}</td>
        <td>
          <button class="open-edit-btn input-fiel button full" data-id="${data.id}">
            Editar
          </button>
        </td>
      </tr>
    `;

    tbody.insertAdjacentHTML("afterbegin", rowHTML);

    console.log(`✅ Fila insertada en tabla (ID: ${data.id})`);
  });

})();

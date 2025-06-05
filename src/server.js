import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app.js";

const server = createServer(app);
const io = new Server(server);

// AQUI: guarda `io` en la app
app.set("io", io);

io.on("connection", (socket) => {
  console.log("Cliente conectado socket:", socket.id);
});

const PORT = app.get("port") || 3000;
server.listen(PORT, () => {
  console.log("Servidor corriendo en puerto", PORT);
});

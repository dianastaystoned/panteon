import { createServer } from "http";
import { Server } from "socket.io";
import app from "./index.js";

const server = createServer(app);
const io = new Server(server);

app.set("io", io);

io.on("connection", (socket) => {
  console.log("✅ Cliente conectado:", socket.id);
});

const PORT = app.get("port") || 4000;
server.listen(PORT, () => {
  console.log("Servidor corriendo en puerto", PORT);
});

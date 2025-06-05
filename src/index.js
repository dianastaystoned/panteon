// index.js
import express from "express";
import path from "path";
import morgan from "morgan";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";

import customerRoutes from "./routes/customer.routes.js"; // tus rutas
import { port } from "./config.js"; // si defines el puerto aquí

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);

// Guardamos `io` en la app para usarlo en los controladores
app.set("io", io);

// Configuración básica
app.set("port", port || 3000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rutas
app.use(customerRoutes);

// Archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Conexión con clientes por WebSocket
io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);
});

// Iniciar servidor
server.listen(app.get("port"), () => {
  console.log("Servidor corriendo en puerto", app.get("port"));
});


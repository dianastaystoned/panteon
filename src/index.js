import express from "express";
import path from "path";
import morgan from "morgan";
import { fileURLToPath } from "url";

import customerRoutes from "./routes/customer.routes.js";
import { port } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

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

export default app;

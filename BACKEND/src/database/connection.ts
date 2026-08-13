import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionTimeoutMillis: 5000,
  application_name: "aserradero-norfor-backend",
});

// Log de errores a nivel pool (evita unhandledError -> crash del proceso).
// No exponemos secretos: err.message de pg no incluye credenciales.
pool.on("error", (err: Error) => {
  console.error("[pool] Error inesperado en conexion idle:", err.message);
});

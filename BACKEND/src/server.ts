import dotenv from "dotenv";
import app from "./app";
import { pool } from "./database/connection";

dotenv.config();

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await pool.query("SELECT NOW()");

    console.log("✅ PostgreSQL conectado");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error al conectar PostgreSQL");
    console.error(error);
  }
}

startServer();

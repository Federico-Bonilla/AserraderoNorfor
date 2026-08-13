import app from "./app";
import { pool } from "./database/connection";

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await pool.query("SELECT NOW()");

    console.log("✅ PostgreSQL conectado");

    app.listen(Number(PORT), "127.0.0.1", () => {
      console.log(`🚀 Servidor escuchando en http://127.0.0.1:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error al conectar PostgreSQL");
    console.error(error);
    process.exit(1);
  }
}

startServer();

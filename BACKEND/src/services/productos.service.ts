import { pool } from "../database/connection";

export const obtenerProductos = async () => {
  const { rows } = await pool.query(`
    SELECT
      codigo,
      descripcion,
      unidad
    FROM productos
    WHERE activo = true
    ORDER BY codigo;
  `);

  return rows;
};

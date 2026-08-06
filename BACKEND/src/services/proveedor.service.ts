import { pool } from "../database/connection";

export const getProveedores = async () => {
  const result = await pool.query(`
    SELECT
      cuenta,
      razon_social,
      direccion,
      telefono,
      cuit,
      vendedor,
      localidad,
      provincia
    FROM proveedores
    ORDER BY razon_social
  `);

  return result.rows;
};

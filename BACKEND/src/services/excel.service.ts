import ExcelJS from "exceljs";
import { pool } from "../database/connection";
import path from "path";
import { exec } from "child_process";

export const exportarStockExcel = async () => {
  const resultado = await pool.query(`
    SELECT *
    FROM remitos
    ORDER BY id
  `);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Stock");

  worksheet.columns = [
    { header: "ID", key: "id", width: 10 },
    { header: "N° Remito", key: "numero_remito", width: 20 },
    { header: "Proveedor", key: "proveedor", width: 30 },
    { header: "Fecha Comprobante", key: "fecha_comprobante", width: 15 },
    { header: "Patente Chasis", key: "patente_chasis", width: 15 },
    { header: "Chofer", key: "chofer", width: 25 },
    { header: "Observaciones", key: "observaciones", width: 40 },
  ];

  worksheet.addRows(resultado.rows);

  const archivo = path.join(process.cwd(), "Stock.xlsx");

  await workbook.xlsx.writeFile(archivo);

  exec(`start "" "${archivo}"`);

  return archivo;
};

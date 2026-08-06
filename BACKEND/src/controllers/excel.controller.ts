import { Request, Response } from "express";
import { exportarStockExcel } from "../services/excel.service";

export const exportarExcel = async (req: Request, res: Response) => {
  const archivo = await exportarStockExcel();

  res.download(archivo);
};

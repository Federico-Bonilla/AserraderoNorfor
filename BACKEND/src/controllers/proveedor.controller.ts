import { Request, Response } from "express";
import { getProveedores } from "../services/proveedor.service";

export const listarProveedores = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const proveedores = await getProveedores();
    res.status(200).json(proveedores);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener los proveedores",
    });
  }
};

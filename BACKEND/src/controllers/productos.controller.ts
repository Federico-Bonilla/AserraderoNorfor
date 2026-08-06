import { Request, Response } from "express";
import { obtenerProductos } from "../services/productos.service";

export const getProductos = async (req: Request, res: Response) => {
  try {
    const productos = await obtenerProductos();
    res.json(productos);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error al obtener productos desde la base de datos" });
  }
};

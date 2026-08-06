import { Request, Response } from "express";
import { obtenerRemitos, guardarRemito } from "../services/remitos.service";

export const getRemitos = async (req: Request, res: Response) => {
  const remitos = await obtenerRemitos();
  res.json(remitos);
};

export const postRemito = async (req: Request, res: Response) => {
  const remito = await guardarRemito(req.body);
  res.status(201).json(remito);
};

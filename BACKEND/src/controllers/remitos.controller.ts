import { Request, Response } from "express";
import { obtenerRemitos, guardarRemito } from "../services/remitos.service";
import { validarRemito } from "../services/remito.validation";

export const getRemitos = async (req: Request, res: Response) => {
  const remitos = await obtenerRemitos();
  res.json(remitos);
};

export const postRemito = async (req: Request, res: Response) => {
  const resultado = validarRemito(req.body);

  if (!resultado.ok) {
    res.status(400).json({
      error: "Payload invalido",
      detalle: resultado.errors,
    });
    return;
  }

  const remito = await guardarRemito(resultado.value);
  res.status(201).json(remito);
};

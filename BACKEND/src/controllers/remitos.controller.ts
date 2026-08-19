import { Request, Response } from "express";
import {
  obtenerRemitos,
  obtenerRemitoPorId,
  guardarRemito,
  actualizarRemito,
  obtenerSiguienteLote,
  getOrigenes,
} from "../services/remitos.service";
import { validarRemito } from "../services/remito.validation";

export const getRemitos = async (req: Request, res: Response) => {
  const remitos = await obtenerRemitos();
  res.json(remitos);
};

export const listarOrigenes = async (req: Request, res: Response) => {
  const origenes = await getOrigenes();
  res.json(origenes);
};

export const getSiguienteLote = async (req: Request, res: Response) => {
  const lote = await obtenerSiguienteLote();
  res.json({ lote });
};

export const getRemitoPorId = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    res.status(404).json({
      error: "Remito no encontrado",
      detalle: `No existe un remito con id ${req.params.id}`,
    });
    return;
  }

  const remito = await obtenerRemitoPorId(id);

  if (!remito) {
    res.status(404).json({
      error: "Remito no encontrado",
      detalle: `No existe un remito con id ${id}`,
    });
    return;
  }

  res.json(remito);
};

export const putRemito = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    res.status(404).json({
      error: "Remito no encontrado",
      detalle: `No existe un remito con id ${req.params.id}`,
    });
    return;
  }

  const resultado = validarRemito(req.body);

  if (!resultado.ok) {
    res.status(400).json({
      error: "Payload invalido",
      detalle: resultado.errors,
    });
    return;
  }

  const remito = await actualizarRemito(id, resultado.value);

  if (!remito) {
    res.status(404).json({
      error: "Remito no encontrado",
      detalle: `No existe un remito con id ${id}`,
    });
    return;
  }

  res.status(200).json(remito);
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

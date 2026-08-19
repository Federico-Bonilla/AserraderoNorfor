import api from "./api";
import { Remito, RemitoConId, RemitoGuardado } from "../models/Remito";

export const guardarRemito = async (remito: Remito) => {
  return await api.post("/remitos", remito);
};

export const getRemitos = async (): Promise<RemitoGuardado[]> => {
  const { data } = await api.get<RemitoGuardado[]>("/remitos");
  return data;
};

export const getRemitoById = async (id: number): Promise<RemitoConId> => {
  const { data } = await api.get<RemitoConId>(`/remitos/${id}`);
  return data;
};

export const actualizarRemito = async (id: number, remito: Remito) => {
  return await api.put(`/remitos/${id}`, remito);
};

// Siguiente lote (5 dígitos, ej. "00123"). El cálculo es de backend/BD
// (máximo numérico + 1, protegido con advisory lock) para evitar duplicados.
export const obtenerSiguienteLote = async (): Promise<string> => {
  const { data } = await api.get<{ lote: string }>("/remitos/siguiente-lote");
  return data.lote;
};

export const exportarExcel = async () => {
  return await api.get("/exportar-stock");
};

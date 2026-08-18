import api from "./api";
import { Remito, RemitoGuardado } from "../models/Remito";

export const guardarRemito = async (remito: Remito) => {
  return await api.post("/remitos", remito);
};

export const getRemitos = async (): Promise<RemitoGuardado[]> => {
  const { data } = await api.get<RemitoGuardado[]>("/remitos");
  return data;
};

export const exportarExcel = async () => {
  return await api.get("/exportar-stock");
};

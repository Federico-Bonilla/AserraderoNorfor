import api from "./api";
import { Remito } from "../models/Remito";

export const guardarRemito = async (remito: Remito) => {
  return await api.post("/remitos", remito);
};

export const exportarExcel = async () => {
  return await api.get("/exportar-stock");
};

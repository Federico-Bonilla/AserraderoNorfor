import api from "./api";

export interface Origen {
  codigo: string;
  descripcion: string;
}

export const getOrigenes = async (): Promise<Origen[]> => {
  const response = await api.get("/remitos/origenes");
  return response.data;
};
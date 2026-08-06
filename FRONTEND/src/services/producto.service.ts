import api from "./api";

export interface Producto {
  codigo: string;
  descripcion: string;
  unidad: string;
}

export const getProductos = async (): Promise<Producto[]> => {
  const response = await api.get("/productos");
  return response.data;
};

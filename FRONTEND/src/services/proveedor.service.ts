import api from "./api";

export interface Proveedor {
  cuenta: string;
  razon_social: string;
  direccion: string;
  telefono: string;
  cuit: string;
  vendedor: string;
  localidad: string;
  provincia: string;
}

export const getProveedores = async (): Promise<Proveedor[]> => {
  const response = await api.get("/proveedores");
  return response.data;
};

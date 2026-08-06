import { useEffect, useState } from "react";
import { getProductos } from "../services/producto.service";

export interface Producto {
  codigo: string;
  descripcion: string;
  unidad: string;
}

export const useProductos = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarProductos = async () => {
      const data = await getProductos();
      setProductos(data);
      setLoading(false);
    };

    cargarProductos();
  }, []);

  return {
    productos,
    loading,
  };
};

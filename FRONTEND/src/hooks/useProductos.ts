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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const data = await getProductos();
        setProductos(data);
        setError(null);
      } catch (err) {
        console.error("Error al cargar productos:", err);
        setError("Error al cargar los productos");
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, []);

  return {
    productos,
    loading,
    error,
  };
};
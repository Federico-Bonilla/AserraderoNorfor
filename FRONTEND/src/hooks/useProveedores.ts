import { useEffect, useState } from "react";
import { getProveedores, Proveedor } from "../services/proveedor.service";

export const useProveedores = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarProveedores = async () => {
      try {
        const data = await getProveedores();
        setProveedores(data);
        setError(null);
      } catch (err) {
        console.error("Error al cargar proveedores:", err);
        setError("Error al cargar los proveedores");
      } finally {
        setLoading(false);
      }
    };

    cargarProveedores();
  }, []);

  return {
    proveedores,
    loading,
    error,
  };
};
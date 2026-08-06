import { useEffect, useState } from "react";
import { getProveedores, Proveedor } from "../services/proveedor.service";

export const useProveedores = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarProveedores = async () => {
      try {
        const data = await getProveedores();
        setProveedores(data);
      } catch (error) {
        console.error("Error al cargar proveedores:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarProveedores();
  }, []);

  return {
    proveedores,
    loading,
  };
};

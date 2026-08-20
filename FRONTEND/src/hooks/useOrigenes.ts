import { useEffect, useState } from "react";
import { getOrigenes, Origen } from "../services/origen.service";

export const useOrigenes = () => {
  const [origenes, setOrigenes] = useState<Origen[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarOrigenes = async () => {
      try {
        const data = await getOrigenes();
        setOrigenes(data);
      } catch (error) {
        console.error("Error al cargar origenes:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarOrigenes();
  }, []);

  return {
    origenes,
    loading,
  };
};
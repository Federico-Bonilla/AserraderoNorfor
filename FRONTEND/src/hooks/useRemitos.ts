import { useEffect, useState } from "react";
import { RemitoGuardado } from "../models/Remito";
import { getRemitos } from "../services/remito.service";

export function useRemitos() {
  const [remitos, setRemitos] = useState<RemitoGuardado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRemitos();
        setRemitos(data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar los remitos");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  return { remitos, loading, error };
}

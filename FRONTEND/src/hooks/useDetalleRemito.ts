import { useEffect, useState } from "react";
import { Remito } from "../models/Remito";
import {
  getRemitoById,
  actualizarRemito,
} from "../services/remito.service";
import { Producto } from "../services/producto.service";
import { validarRemitoFrontend } from "../utils/remitoValidation";

export function useDetalleRemito(id: number) {
  const [formulario, setFormulario] = useState<Remito | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modo, setModo] = useState<"ver" | "editar">("ver");
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRemitoById(id);
        setFormulario({ cabecera: data.cabecera, detalle: data.detalle });
        setModo("ver");
      } catch (err) {
        console.error(err);
        setError("Error al cargar el remito");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormulario((prev) =>
      prev
        ? {
            ...prev,
            cabecera: {
              ...prev.cabecera,
              [e.target.name]: e.target.value,
            },
          }
        : prev,
    );
  };

  const activarEdicion = () => {
    setErrores([]);
    setModo("editar");
  };

  const handleDetalleProducto = (index: number, producto: Producto | null) => {
    setFormulario((prev) =>
      prev
        ? {
            ...prev,
            detalle: prev.detalle.map((d, i) =>
              i === index
                ? {
                    ...d,
                    producto: producto?.codigo ?? "",
                    descripcion: producto?.descripcion ?? "",
                  }
                : d,
            ),
          }
        : prev,
    );
  };

  const handleDetalleCantidad = (index: number, valor: string) => {
    setFormulario((prev) =>
      prev
        ? {
            ...prev,
            detalle: prev.detalle.map((d, i) =>
              i === index
                ? { ...d, cantidad_rollos: Number(valor) }
                : d,
            ),
          }
        : prev,
    );
  };

  const guardar = async (): Promise<boolean> => {
    if (!formulario) return false;

    const erroresValidacion = validarRemitoFrontend(formulario);

    if (erroresValidacion.length > 0) {
      setErrores(erroresValidacion);
      return false;
    }

    setErrores([]);
    setGuardando(true);

    try {
      await actualizarRemito(id, formulario);
      return true;
    } catch (err) {
      console.error(err);
      setErrores(["Error al guardar el remito"]);
      return false;
    } finally {
      setGuardando(false);
    }
  };

  return {
    formulario,
    loading,
    error,
    modo,
    guardando,
    errores,
    setErrores,
    handleChange,
    activarEdicion,
    handleDetalleProducto,
    handleDetalleCantidad,
    guardar,
  };
}
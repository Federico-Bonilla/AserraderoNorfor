import { useCallback, useEffect, useState } from "react";
import { Remito, RemitoDetalle } from "../models/Remito";
import {
  getRemitoById,
  actualizarRemito,
} from "../services/remito.service";
import { Producto } from "../services/producto.service";
import { validarRemitoFrontend } from "../utils/remitoValidation";

// Campos numericos de medicion de remitos_detalle (T016).
// Campo vacio -> null (se persiste NULL, no 0 ni '').
const CAMPOS_NUMERICOS_DETALLE = new Set([
  "largo",
  "peso_bruto",
  "tara",
  "precio_unitario",
]);

function normDetalleNumero(v: string): number | null {
  const t = v.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function normDetalleTexto(v: string | null): string | null {
  if (v === null || v === undefined) return null;
  return String(v).trim() === "" ? null : String(v);
}

export function useDetalleRemito(id: number) {
  const [formulario, setFormulario] = useState<Remito | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modo, setModo] = useState<"ver" | "editar">("ver");
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);

  const cargar = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

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

  // Edicion de campos de medicion del detalle (T016).
  // Peso Neto = Peso Bruto - Tara: no es editable y se recalcula al tocar
  // peso_bruto o tara (el backend tambien lo recalcula al persistir).
  const handleDetalleMedicion = (
    index: number,
    campo: string,
    valor: string,
  ) => {
    setFormulario((prev) =>
      prev
        ? (() => {
            const actual = prev.detalle[index];
            if (!actual) return prev;

            const valorNormalizado: string | number | null =
              CAMPOS_NUMERICOS_DETALLE.has(campo)
                ? normDetalleNumero(valor)
                : normDetalleTexto(valor);

            const pesoBruto =
              campo === "peso_bruto"
                ? (valorNormalizado as number | null)
                : actual.peso_bruto;
            const tara =
              campo === "tara"
                ? (valorNormalizado as number | null)
                : actual.tara;
            const pesoNeto =
              pesoBruto === null || pesoBruto === undefined
                ? null
                : Math.round((pesoBruto - (tara ?? 0)) * 1000) / 1000;

            return {
              ...prev,
              detalle: prev.detalle.map((d, i) =>
                i === index
                  ? { ...d, [campo]: valorNormalizado, peso_neto: pesoNeto }
                  : d,
              ),
            };
          })()
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
      // Normaliza texto vacio -> null antes de persistir (nunca '').
      const detalleNormalizado: RemitoDetalle[] = formulario.detalle.map(
        (d) => ({
          ...d,
          especie: normDetalleTexto(d.especie),
          diametro: normDetalleTexto(d.diametro),
          deposito: normDetalleTexto(d.deposito),
          lote: normDetalleTexto(d.lote),
        }),
      );

      await actualizarRemito(id, {
        cabecera: formulario.cabecera,
        detalle: detalleNormalizado,
      });
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
    handleDetalleMedicion,
    guardar,
    recargar: cargar,
  };
}
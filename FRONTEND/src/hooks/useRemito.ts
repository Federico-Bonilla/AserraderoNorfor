import { useRef, useState } from "react";
import { Remito } from "../models/Remito";
import { guardarRemito, exportarExcel } from "../services/remito.service";
import { REMITO_INICIAL } from "../constants/remito";
import { Producto } from "../services/producto.service";
import { validarRemitoFrontend } from "../utils/remitoValidation";

// Hook para gestionar el formulario de remito

// Normalizacion de campos de medicion del detalle (T016):
// campo vacio -> null (se persiste NULL, no 0 ni '').
function normNumDetalle(v: string): number | null {
  const t = v.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function normTextoDetalle(v: string): string | null {
  return v.trim() === "" ? null : v;
}

export function useRemito() {
  const fechaHoy = new Date().toISOString().split("T")[0];

  // Estado del formulario
  const [formulario, setFormulario] = useState<Remito>({
    ...REMITO_INICIAL,
    cabecera: {
      ...REMITO_INICIAL.cabecera,
      fecha_comprobante: fechaHoy,
      fecha_recepcion: fechaHoy,
    },
  });

  const [productoSeleccionado, setProductoSeleccionado] =
    useState<Producto | null>(null);

  const [cantidadRollos, setCantidadRollos] = useState("");

  // Campos de medicion del nuevo detalle (T016). Se mantienen como string
  // mientras se editan y se normalizan a null al agregar (vacio = no medido).
  const [nuevoItem, setNuevoItem] = useState({
    especie: "",
    diametro: "",
    largo: "",
    peso_bruto: "",
    tara: "",
    deposito: "",
    precio_unitario: "",
    lote: "",
  });

  const [errores, setErrores] = useState<string[]>([]);

  const productoRef = useRef<HTMLInputElement>(null);

  const cantidadRollosRef = useRef<HTMLInputElement>(null);

  // Cambios en la cabecera
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormulario((prev) => ({
      ...prev,
      cabecera: {
        ...prev.cabecera,
        [e.target.name]: e.target.value,
      },
    }));
  };

  const handleNuevoItemChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setNuevoItem((prev) => ({ ...prev, [name]: value }));
  };

  const eliminarProducto = (index: number) => {
    setFormulario((anterior) => ({
      ...anterior,
      detalle: anterior.detalle.filter((_, i) => i !== index),
    }));
  };
  const agregarProducto = () => {
    if (!productoSeleccionado) return;

    if (cantidadRollos.trim() === "") return;

    const existe = formulario.detalle.some(
      (detalle) => detalle.producto === productoSeleccionado.codigo,
    );

    if (existe) {
      alert("El producto ya fue agregado al remito.");
      return;
    }

    // Peso Neto = Peso Bruto - Tara (solo preview: el backend recalcula).
    const pesoBruto = normNumDetalle(nuevoItem.peso_bruto);
    const tara = normNumDetalle(nuevoItem.tara);
    const pesoNeto =
      pesoBruto === null
        ? null
        : Math.round((pesoBruto - (tara ?? 0)) * 1000) / 1000;

    setFormulario((anterior) => ({
      ...anterior,
      detalle: [
        ...anterior.detalle,
        {
          item: anterior.detalle.length + 1,

          producto: productoSeleccionado.codigo,
          descripcion: productoSeleccionado.descripcion,

          especie: normTextoDetalle(nuevoItem.especie),
          diametro: normTextoDetalle(nuevoItem.diametro),
          largo: normNumDetalle(nuevoItem.largo),

          cantidad_rollos: Number(cantidadRollos),

          peso_bruto: pesoBruto,
          tara,
          peso_neto: pesoNeto,

          volumen: null,

          deposito: normTextoDetalle(nuevoItem.deposito),

          precio_unitario: normNumDetalle(nuevoItem.precio_unitario),

          lote: normTextoDetalle(nuevoItem.lote),
        },
      ],
    }));

    setProductoSeleccionado(null);
    setCantidadRollos("");
    setNuevoItem({
      especie: "",
      diametro: "",
      largo: "",
      peso_bruto: "",
      tara: "",
      deposito: "",
      precio_unitario: "",
      lote: "",
    });
    setTimeout(() => {
      productoRef.current?.focus();
    }, 0);
  };

  // Guardar remito
  const handleGuardarRemito = async () => {
    const erroresValidacion = validarRemitoFrontend(formulario);

    if (erroresValidacion.length > 0) {
      setErrores(erroresValidacion);
      return;
    }

    setErrores([]);

    try {
      await guardarRemito(formulario);

      alert("Remito guardado correctamente");

      setFormulario({
        ...REMITO_INICIAL,
        cabecera: {
          ...REMITO_INICIAL.cabecera,
          fecha_comprobante: fechaHoy,
          fecha_recepcion: fechaHoy,
        },
      });
    } catch (error) {
      console.error(error);
      alert("Error al guardar");
    }
  };

  // Exportar Excel
  const handleExportarExcel = async () => {
    try {
      await exportarExcel();
    } catch (error) {
      console.error(error);
      alert("Error al exportar");
    }
  };

  return {
    formulario,
    setFormulario,

    productoSeleccionado,
    setProductoSeleccionado,

    cantidadRollos,
    setCantidadRollos,

    nuevoItem,
    handleNuevoItemChange,

    productoRef,
    cantidadRollosRef,

    handleChange,

    eliminarProducto,
    agregarProducto,

    handleGuardarRemito,
    handleExportarExcel,

    errores,
  };
}

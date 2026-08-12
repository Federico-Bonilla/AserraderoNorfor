import { useRef, useState } from "react";
import { Remito } from "../models/Remito";
import { guardarRemito, exportarExcel } from "../services/remito.service";
import { REMITO_INICIAL } from "../constants/remito";
import { Producto } from "../services/producto.service";
import { validarRemitoFrontend } from "../utils/remitoValidation";

// Hook para gestionar el formulario de remito
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

    setFormulario((anterior) => ({
      ...anterior,
      detalle: [
        ...anterior.detalle,
        {
          item: anterior.detalle.length + 1,

          producto: productoSeleccionado.codigo,
          descripcion: productoSeleccionado.descripcion,

          especie: "",
          diametro: "",
          largo: 0,

          cantidad_rollos: Number(cantidadRollos),

          peso_bruto: 0,
          peso_neto: 0,

          volumen: 0,

          deposito: "",

          precio_unitario: 0,

          lote: "",
        },
      ],
    }));

    setProductoSeleccionado(null);
    setCantidadRollos("");
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

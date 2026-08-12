import { Remito } from "../models/Remito";

// ============================================================================
// Validacion del remito antes de enviar al backend (T008).
// Es la primera barrera: impide el POST si falta cualquier campo obligatorio.
// El backend (T004+T008) mantiene la misma validacion como segunda barrera.
//
// Reglas aprobadas en T007:
//   - comprobante, letra, numero_sucursal, numero_remito: obligatorios no vacios
//   - proveedor: obligatorio no vacio
//   - fecha_comprobante, fecha_recepcion: obligatorias
//   - fecha_recepcion >= fecha_comprobante
//   - certificado: obligatorio
//   - detalle: minimo 1 item
//   - detalle[].producto: obligatorio no vacio
//   - detalle[].cantidad_rollos: entero > 0
// ============================================================================

export function validarRemitoFrontend(r: Remito): string[] {
  const errores: string[] = [];
  const c = r.cabecera;

  if (!c.comprobante || c.comprobante.trim() === "")
    errores.push("Comprobante");
  if (!c.letra || c.letra.trim() === "")
    errores.push("Letra");
  if (!c.numero_sucursal || c.numero_sucursal.trim() === "")
    errores.push("Número de sucursal (P.V.)");
  if (!c.numero_remito || c.numero_remito.trim() === "")
    errores.push("Número de remito");
  if (!c.fecha_comprobante)
    errores.push("Fecha de comprobante");
  if (!c.fecha_recepcion)
    errores.push("Fecha de recepción");
  if (
    c.fecha_comprobante &&
    c.fecha_recepcion &&
    c.fecha_recepcion < c.fecha_comprobante
  )
    errores.push("La fecha de recepción no puede ser anterior a la de comprobante");
  if (!c.proveedor || c.proveedor.trim() === "")
    errores.push("Proveedor");
  if (!c.certificado || c.certificado.trim() === "")
    errores.push("Certificado");

  if (!r.detalle || r.detalle.length === 0) {
    errores.push("Al menos 1 detalle");
  } else {
    r.detalle.forEach((d, i) => {
      if (!d.producto || d.producto.trim() === "")
        errores.push(`Detalle ${i + 1}: producto`);
      if (
        d.cantidad_rollos === undefined ||
        d.cantidad_rollos === null ||
        !Number.isInteger(Number(d.cantidad_rollos)) ||
        Number(d.cantidad_rollos) <= 0
      )
        errores.push(`Detalle ${i + 1}: cantidad de rollos debe ser > 0`);
    });
  }

  return errores;
}

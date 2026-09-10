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
//
// Reglas numericas agregadas en T012 (primera barrera; el backend sigue
// siendo la segunda barrera y rechaza el INSERT si algo pasa):
//   - cabecera.precio_transporte: si definido, finito y >= 0 (numeric(15,2))
//   - detalle[].largo: si definido, finito, 0..999.99 (numeric(5,2))
//   - detalle[].peso_bruto / tara: si definido, finito y >= 0 (numeric(12,3))
//   - detalle[].precio_unitario: si definido, finito y >= 0 (numeric(15,2))
//   - detalle[].peso_neto: NO se valida (lo recalcula el backend).
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

      // Campos numericos nullable del detalle (T016).
      // null/undefined = "no medido" (valido). Valor: finito, >= 0.
      // Rangos segun DATABASE/schema.sql:
      //   largo numeric(5,2)            -> 0..999.99
      //   peso_bruto/tara/peso_neto numeric(12,3)
      //   precio_unitario numeric(15,2)
      const pushErr = (cond: boolean, msg: string) => {
        if (cond) errores.push(`Detalle ${i + 1}: ${msg}`);
      };

      pushErr(d.largo != null && (!Number.isFinite(d.largo) || d.largo < 0), "largo invalido");
      pushErr(d.largo != null && d.largo > 999.99, "largo fuera de rango (max 999.99)");
      pushErr(d.peso_bruto != null && (!Number.isFinite(d.peso_bruto) || d.peso_bruto < 0), "peso bruto invalido");
      pushErr(d.tara != null && (!Number.isFinite(d.tara) || d.tara < 0), "tara invalida");
      // peso_neto no es editable (lo recalcula el backend = peso_bruto - tara);
      // se omite en frontend.
      pushErr(d.precio_unitario != null && (!Number.isFinite(d.precio_unitario) || d.precio_unitario < 0), "precio unitario invalido");
    });
  }

  // Cabecera: precio_transporte es numeric(15,2) nullable (>= 0).
  if (
    c.precio_transporte != null &&
    (!Number.isFinite(c.precio_transporte) || c.precio_transporte < 0)
  )
    errores.push("Precio de transporte invalido");

  return errores;
}

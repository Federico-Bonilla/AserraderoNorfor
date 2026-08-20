import { Remito, RemitoCabecera, RemitoDetalle } from "../types/Remito";

// ============================================================================
// Validacion del payload de POST /remitos.
//
// Sin dependencias externas (no se agrega zod ni express-validator).
// Reglas basadas en DATABASE/schema.sql y en el contrato del frontend
// (FRONTEND/src/models/Remito.ts + FRONTEND/src/hooks/useRemito.ts).
//
// Reglas de negocio aprobadas en T007:
//   - detalle[] NO puede ser vacio (minimo 1 item).
//   - producto es obligatorio en cada detalle.
//   - fecha_recepcion debe ser >= fecha_comprobante.
//   - letra es obligatorio.
// Los campos numericos del detalle se permiten null (no se fuerza el 0
// hardcodeado del frontend; null = "no medido").
// estado: si viene vacio se aplica el default 'ACTIVO' (consistente con
// el service que hacia `estado ?? "ACTIVO"` — extendemos a cadena vacia).
// ============================================================================

export type ValidationResult =
  | { ok: true; value: Remito }
  | { ok: false; errors: string[] };

const CERTIFICADO_PERMITIDOS = ["NO FSC", "FSC 100%"] as const;
type Certificado = (typeof CERTIFICADO_PERMITIDOS)[number];

const FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/;

// longitudes maximas segun schema.sql (varchar N)
const MAX: Record<string, number> = {
  comprobante: 10,
  letra: 5,
  numero_sucursal: 10,
  numero_remito: 30,
  nota_recepcion: 30,
  proveedor: 150,
  direccion: 200,
  cuit: 20,
  origen: 100,
  certificado: 20,
  transporte: 100,
  centro_compra: 100,
  patente_chasis: 15,
  patente_acoplado: 15,
  chofer: 100,
  clausula_compra: 100,
  centro_auxiliar: 100,
  centro_credito: 100,
  obra: 100,
  lista_precio: 100,
  estado: 20,
  usuario: 100,
  producto: 30,
  descripcion: 250,
  especie: 30,
  diametro: 50,
  deposito: 100,
  lote: 30,
};

const errorsPila: string[] = [];
const push = (msg: string) => errorsPila.push(msg);

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function textoOpcional(campo: string, v: unknown, max: number) {
  if (typeof v !== "string") return;
  if (v.length > max) push(`${campo}: excede ${max} caracteres (${v.length}).`);
}

function textoObligatorio(campo: string, v: unknown, max: number) {
  if (typeof v !== "string" || v.trim() === "") {
    push(`${campo}: obligatorio.`);
    return;
  }
  if (v.length > max) push(`${campo}: excede ${max} caracteres (${v.length}).`);
}

function fechaObligatoria(campo: string, v: unknown) {
  if (typeof v !== "string" || v === "") {
    push(`${campo}: obligatoria.`);
    return;
  }
  if (!FECHA_ISO.test(v)) {
    push(`${campo}: formato invalido (esperado YYYY-MM-DD).`);
    return;
  }
  const d = new Date(v + "T00:00:00Z");
  if (isNaN(d.getTime())) push(`${campo}: fecha inexistente.`);
}

function numeroNoNegativo(campo: string, v: unknown) {
  if (v === undefined || v === null || v === "") return; // opcional
  const n = Number(v);
  if (!Number.isFinite(n)) {
    push(`${campo}: debe ser numerico.`);
    return;
  }
  if (n < 0) push(`${campo}: debe ser >= 0.`);
}

function enteroPositivo(campo: string, v: unknown) {
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    push(`${campo}: debe ser entero.`);
    return;
  }
  if (n <= 0) push(`${campo}: debe ser > 0.`);
}

function enteroNullopcero(campo: string, v: unknown) {
  if (v === undefined || v === null || v === "") return; // opcional
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    push(`${campo}: debe ser entero.`);
  }
}

function numeroNullONoNegativo(campo: string, v: unknown) {
  if (v === undefined || v === null || v === "") return; // null = no medido
  const n = Number(v);
  if (!Number.isFinite(n)) {
    push(`${campo}: debe ser numerico o null.`);
    return;
  }
  if (n < 0) push(`${campo}: debe ser >= 0 o null.`);
}

function validarCabecera(c: unknown): RemitoCabecera | null {
  if (!isObj(c)) {
    push("cabecera: debe ser un objeto.");
    return null;
  }
  textoObligatorio("cabecera.comprobante", c.comprobante, MAX.comprobante);
  textoObligatorio("cabecera.letra", c.letra, MAX.letra);
  textoObligatorio(
    "cabecera.numero_sucursal",
    c.numero_sucursal,
    MAX.numero_sucursal,
  );
  textoObligatorio(
    "cabecera.numero_remito",
    c.numero_remito,
    MAX.numero_remito,
  );
  fechaObligatoria("cabecera.fecha_comprobante", c.fecha_comprobante);
  fechaObligatoria("cabecera.fecha_recepcion", c.fecha_recepcion);
  // Coherencia de fechas: recepcion no puede ser anterior a comprobante (T007)
  if (
    typeof c.fecha_comprobante === "string" &&
    typeof c.fecha_recepcion === "string" &&
    FECHA_ISO.test(c.fecha_comprobante) &&
    FECHA_ISO.test(c.fecha_recepcion)
  ) {
    if (c.fecha_recepcion < c.fecha_comprobante) {
      push("cabecera.fecha_recepcion: no puede ser anterior a fecha_comprobante.");
    }
  }
  textoOpcional("cabecera.nota_recepcion", c.nota_recepcion, MAX.nota_recepcion);
  textoObligatorio("cabecera.proveedor", c.proveedor, MAX.proveedor);
  textoOpcional("cabecera.direccion", c.direccion, MAX.direccion);
  textoOpcional("cabecera.cuit", c.cuit, MAX.cuit);
  textoOpcional("cabecera.origen", c.origen, MAX.origen);

  // certificado: enum obligatorio
  if (typeof c.certificado !== "string" || c.certificado === "") {
    push("cabecera.certificado: obligatorio.");
  } else if (!(CERTIFICADO_PERMITIDOS as readonly string[]).includes(c.certificado)) {
    push(
      `cabecera.certificado: valor no permitido (esperado uno de: ${CERTIFICADO_PERMITIDOS.join(", ")}).`,
    );
  }

  textoOpcional("cabecera.transporte", c.transporte, MAX.transporte);
  numeroNoNegativo("cabecera.precio_transporte", c.precio_transporte);
  textoOpcional("cabecera.centro_compra", c.centro_compra, MAX.centro_compra);
  textoOpcional("cabecera.patente_chasis", c.patente_chasis, MAX.patente_chasis);
  textoOpcional(
    "cabecera.patente_acoplado",
    c.patente_acoplado,
    MAX.patente_acoplado,
  );
  textoOpcional("cabecera.chofer", c.chofer, MAX.chofer);
  textoOpcional(
    "cabecera.clausula_compra",
    c.clausula_compra,
    MAX.clausula_compra,
  );
  textoOpcional(
    "cabecera.centro_auxiliar",
    c.centro_auxiliar,
    MAX.centro_auxiliar,
  );
  textoOpcional(
    "cabecera.centro_credito",
    c.centro_credito,
    MAX.centro_credito,
  );
  textoOpcional("cabecera.obra", c.obra, MAX.obra);
  textoOpcional("cabecera.lista_precio", c.lista_precio, MAX.lista_precio);
  // observaciones es text (sin limite); solo verificamos que sea string si viene
  if (
    c.observaciones !== undefined &&
    c.observaciones !== null &&
    typeof c.observaciones !== "string"
  ) {
    push("cabecera.observaciones: debe ser texto.");
  }

  // estado: si vacio -> default ACTIVO (consistente con el servicio anterior)
  let estadoFinal: string;
  if (typeof c.estado !== "string" || c.estado === "") {
    estadoFinal = "ACTIVO";
  } else {
    estadoFinal = c.estado;
    if (estadoFinal.length > MAX.estado)
      push(`cabecera.estado: excede ${MAX.estado} caracteres.`);
  }

  textoOpcional("cabecera.usuario", c.usuario, MAX.usuario);

  if (errorsPila.length > 0) return null;

  return {
    comprobante: String(c.comprobante),
    letra: (c.letra as string) ?? "",
    numero_sucursal: String(c.numero_sucursal),
    numero_remito: String(c.numero_remito),
    fecha_comprobante: String(c.fecha_comprobante),
    fecha_recepcion: String(c.fecha_recepcion),
    nota_recepcion: (c.nota_recepcion as string) ?? "",
    proveedor: String(c.proveedor),
    direccion: (c.direccion as string) ?? "",
    cuit: (c.cuit as string) ?? "",
    origen: (c.origen as string) ?? "",
    certificado: String(c.certificado),
    transporte: (c.transporte as string) ?? "",
    precio_transporte: Number(c.precio_transporte ?? 0),
    centro_compra: (c.centro_compra as string) ?? "",
    patente_chasis: (c.patente_chasis as string) ?? "",
    patente_acoplado: (c.patente_acoplado as string) ?? "",
    chofer: (c.chofer as string) ?? "",
    clausula_compra: (c.clausula_compra as string) ?? "",
    centro_auxiliar: (c.centro_auxiliar as string) ?? "",
    centro_credito: (c.centro_credito as string) ?? "",
    obra: (c.obra as string) ?? "",
    lista_precio: (c.lista_precio as string) ?? "",
    observaciones: (c.observaciones as string) ?? "",
    estado: estadoFinal,
    usuario: (c.usuario as string) ?? "",
  };
}

function validarDetalleItem(idx: number, item: unknown): RemitoDetalle | null {
  if (!isObj(item)) {
    push(`detalle[${idx}]: debe ser un objeto.`);
    return null;
  }
  // item: entero >= 1 (opcional segun BD YES, pero el frontend lo calcula)
  if (item.item !== undefined && item.item !== null && item.item !== "") {
    const n = Number(item.item);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) {
      push(`detalle[${idx}].item: debe ser entero >= 1.`);
    }
  }

  textoObligatorio(`detalle[${idx}].producto`, item.producto, MAX.producto);
  textoOpcional(
    `detalle[${idx}].descripcion`,
    item.descripcion,
    MAX.descripcion,
  );
  textoOpcional(`detalle[${idx}].especie`, item.especie, MAX.especie);
  textoOpcional(`detalle[${idx}].diametro`, item.diametro, MAX.diametro);
  numeroNullONoNegativo(`detalle[${idx}].largo`, item.largo);
  enteroPositivo(`detalle[${idx}].cantidad_rollos`, item.cantidad_rollos);
  numeroNullONoNegativo(`detalle[${idx}].peso_bruto`, item.peso_bruto);
  numeroNullONoNegativo(`detalle[${idx}].tara`, item.tara);
  numeroNullONoNegativo(`detalle[${idx}].peso_neto`, item.peso_neto);
  textoOpcional(`detalle[${idx}].deposito`, item.deposito, MAX.deposito);
  numeroNullONoNegativo(
    `detalle[${idx}].precio_unitario`,
    item.precio_unitario,
  );
  textoOpcional(`detalle[${idx}].lote`, item.lote, MAX.lote);

  if (errorsPila.length > 0) return null;

  return {
    item:
      item.item !== undefined && item.item !== null && item.item !== ""
        ? Number(item.item)
        : idx + 1, // default: posicion 1-based si el cliente no la envia
    producto: (item.producto as string) ?? "",
    descripcion: (item.descripcion as string) ?? "",
    especie: normTexto(item.especie),
    diametro: normTexto(item.diametro),
    largo: normNum(item.largo),
    cantidad_rollos: Number(item.cantidad_rollos),
    peso_bruto: normNum(item.peso_bruto),
    tara: normNum(item.tara),
    peso_neto: normNum(item.peso_neto),
    deposito: normTexto(item.deposito),
    precio_unitario: normNum(item.precio_unitario),
    lote: normTexto(item.lote),
  };
}

function normNum(v: unknown): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// Campos de texto opcionales del detalle: vacio (NO cadena vacia) -> null,
// para persistir NULL y no '' en remitos_detalle (T016).
function normTexto(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  if (typeof v !== "string") return v as string;
  return v.trim() === "" ? null : v;
}

export function validarRemito(body: unknown): ValidationResult {
  errorsPila.length = 0;

  if (!isObj(body)) {
    return { ok: false, errors: ["body: debe ser un objeto JSON."] };
  }
  if (!isObj(body.cabecera)) {
    push("cabecera: obligatorio y debe ser un objeto.");
    return { ok: false, errors: [...errorsPila] };
  }
  if (!Array.isArray(body.detalle)) {
    push("detalle: obligatorio y debe ser un array.");
    return { ok: false, errors: [...errorsPila] };
  }

  const cabecera = validarCabecera(body.cabecera);

  const detalle: RemitoDetalle[] = [];
  for (let i = 0; i < body.detalle.length; i++) {
    const item = validarDetalleItem(i, body.detalle[i]);
    if (item) detalle.push(item);
  }

  // Minimo 1 detalle (T007)
  if (detalle.length === 0 && !errorsPila.some((e) => e.startsWith("detalle["))) {
    push("detalle: debe tener al menos 1 item.");
  }

  if (errorsPila.length > 0) {
    return { ok: false, errors: [...errorsPila] };
  }

  // cabecera no es null aqui porque errorsPila esta vacio
  return { ok: true, value: { cabecera: cabecera as RemitoCabecera, detalle } };
}

// Export auxiliar para tests
export const __TEST__ = {
  CERTIFICADO_PERMITIDOS,
  MAX,
  validarCabecera,
  validarDetalleItem,
  normNum,
  normTexto,
};

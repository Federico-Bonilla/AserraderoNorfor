// RemitoCabecera hace referencia a la tabla remitos que esta en la base de datos
//Postgresql, y RemitoDetalle hace referencia
// a la tabla remitos_detalle que esta en la base de datos Postgresql
export interface RemitoCabecera {
  comprobante: string;
  letra: string;

  numero_sucursal: string;
  numero_remito: string;

  fecha_comprobante: string;
  fecha_recepcion: string;

  nota_recepcion: string;

  proveedor: string;
  direccion: string;
  cuit: string;

  origen: string;

  certificado: string;

  transporte: string;
  precio_transporte: number;

  centro_compra: string;

  patente_chasis: string;
  patente_acoplado: string;

  chofer: string;

  clausula_compra: string;
  centro_auxiliar: string;
  centro_credito: string;
  obra: string;

  lista_precio: string;

  observaciones: string;

  estado: string;

  usuario: string;
}

export interface RemitoDetalle {
  item: number;

  producto: string;
  descripcion: string;

  // Campos de medicion opcionales. null = no medido (campo vacio).
  // Preciso real segun DATABASE/schema.sql: largo numeric(5,2),
  // peso_bruto/tara/peso_neto numeric(12,3), precio_unitario numeric(15,2).
  // peso_neto = peso_bruto - tara (calculado; no editable).
  especie: string | null;
  diametro: string | null;
  largo: number | null;

  cantidad_rollos: number;

  peso_bruto: number | null;
  tara: number | null;
  peso_neto: number | null;

  volumen: number | null;

  deposito: string | null;

  precio_unitario: number | null;

  lote: string | null;
}

export interface Remito {
  cabecera: RemitoCabecera;
  detalle: RemitoDetalle[];
}

export interface RemitoConId {
  id: number;
  cabecera: RemitoCabecera;
  detalle: RemitoDetalle[];
}

export interface RemitoGuardado {
  id: number;
  comprobante: string;
  letra: string;
  numero_sucursal: string;
  numero_remito: string;
  fecha_comprobante: string;
  fecha_recepcion: string;
  nota_recepcion: string;
  proveedor: string;
  direccion: string;
  cuit: string;
  origen: string;
  certificado: string;
  transporte: string;
  precio_transporte: number;
  centro_compra: string;
  patente_chasis: string;
  patente_acoplado: string;
  chofer: string;
  clausula_compra: string;
  centro_auxiliar: string;
  centro_credito: string;
  obra: string;
  lista_precio: string;
  observaciones: string;
  estado: string;
  usuario: string;
  created_at: string;
  updated_at: string;
}

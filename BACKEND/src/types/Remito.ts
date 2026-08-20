// Contrato del payload de POST /remitos.
// Espeja el esquema real de la BD (DATABASE/schema.sql) excluyendo los campos
// autogenerados por el servidor (id, created_at, updated_at), que no son parte
// del body recibido del cliente.
//
// Longitudes maximas y tipos segun DATABASE/schema.sql:
//   remitos:
//     comprobante varchar(10) NOT NULL
//     letra varchar(5)
//     numero_sucursal varchar(10) NOT NULL
//     numero_remito varchar(30) NOT NULL
//     fecha_comprobante date NOT NULL
//     fecha_recepcion date NOT NULL
//     nota_recepcion varchar(30)
//     proveedor varchar(150) NOT NULL
//     direccion varchar(200)
//     cuit varchar(20)
//     origen varchar(100)
//     certificado varchar(20) NOT NULL DEFAULT 'NO FSC'
//     transporte varchar(100)
//     precio_transporte numeric(15,2)
//     centro_compra varchar(100)
//     patente_chasis varchar(15)
//     patente_acoplado varchar(15)
//     chofer varchar(100)
//     clausula_compra varchar(100)
//     centro_auxiliar varchar(100)
//     centro_credito varchar(100)
//     obra varchar(100)
//     lista_precio varchar(100)
//     observaciones text
//     estado varchar(20) NOT NULL DEFAULT 'ACTIVO'
//     usuario varchar(100)
//   remitos_detalle:
//     item integer
//     producto varchar(30)
//     descripcion varchar(250)
//     especie varchar(30)
//     diametro varchar(50)
//     largo numeric(5,2)
//     cantidad_rollos integer NOT NULL
//     peso_bruto numeric(12,3)
//     peso_neto numeric(12,3)
//     volumen numeric(12,6)
//     deposito varchar(100)
//     precio_unitario numeric(15,2)
//     lote varchar(30)

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
  // Los numericos declaran la precision real de DATABASE/schema.sql:
  //   largo numeric(5,2), peso_bruto/peso_neto numeric(12,3),
  //   volumen numeric(12,6), precio_unitario numeric(15,2).
  especie: string | null;
  diametro: string | null;
  largo: number | null;
  cantidad_rollos: number;
  peso_bruto: number | null;
  tara: number | null;
  // peso_neto: calculado por el backend como peso_bruto - tara (T016).
  // El cliente puede enviarlo, pero el servicio lo recalcula siempre.
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

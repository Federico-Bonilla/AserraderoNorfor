import { Remito } from "../models/Remito";

// Valores iniciales del formulario
export const REMITO_INICIAL: Remito = {
  cabecera: {
    comprobante: "RMP",
    letra: "R",

    numero_sucursal: "",
    numero_remito: "",

    fecha_comprobante: "",
    fecha_recepcion: "",

    nota_recepcion: "",

    proveedor: "",
    direccion: "",
    cuit: "",

    origen: "",

    certificado: "NO FSC",

    transporte: "",
    precio_transporte: 0,

    centro_compra: "",

    patente_chasis: "",
    patente_acoplado: "",

    chofer: "",

    clausula_compra: "",
    centro_auxiliar: "",
    centro_credito: "",
    obra: "",

    lista_precio: "",

    observaciones: "",

    estado: "ACTIVO",

    usuario: "",
  },

  detalle: [],
};

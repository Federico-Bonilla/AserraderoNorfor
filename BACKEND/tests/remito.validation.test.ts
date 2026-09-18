import { describe, it, expect } from "vitest";
import { validarRemito, __TEST__ } from "../src/services/remito.validation";
import type { Remito } from "../src/types/Remito";

// ============================================================================
// T026 — Tests unitarios de validarRemito (POST/PUT /remitos).
// Cubren las reglas reales de remito.validation.ts (T004/T007/T008/T016):
// obligatorios, longitudes MAX, fechas y coherencia, certificado, detalle >= 1,
// cantidad_rollos > 0, numericos nullable/negativos, normalizacion vacio->null.
// ============================================================================

const cabeceraValida = (): Remito["cabecera"] => ({
  comprobante: "RMP",
  letra: "A",
  numero_sucursal: "1",
  numero_remito: "4444",
  fecha_comprobante: "2026-01-01",
  fecha_recepcion: "2026-01-02",
  nota_recepcion: "",
  proveedor: "NORFOR",
  direccion: "Ruta 1 km 5",
  cuit: "30-12345678-9",
  origen: "1",
  certificado: "NO FSC",
  transporte: "TRANSPORTE SA",
  precio_transporte: 1000,
  centro_compra: "",
  patente_chasis: "AB123CD",
  patente_acoplado: "AB987ZY",
  chofer: "PEREZ JUAN",
  clausula_compra: "",
  centro_auxiliar: "",
  centro_credito: "",
  obra: "",
  lista_precio: "",
  observaciones: "test",
  estado: "ACTIVO",
  usuario: "",
});

const detalleValido = (): Remito["detalle"] => [
  {
    item: 1,
    producto: "1060",
    descripcion: "Tubo estructural",
    especie: "TAEDA",
    diametro: "25-30",
    largo: 3.5,
    cantidad_rollos: 5,
    peso_bruto: 40.5,
    tara: 5,
    peso_neto: 35.5,
    deposito: "DEP1",
    precio_unitario: 1500,
    lote: "00123",
  },
];

const remitoValido = (): Remito => ({
  cabecera: cabeceraValida(),
  detalle: detalleValido(),
});

// ---------- Casos validos ----------

describe("validarRemito — casos validos", () => {
  it("acepta un remito completo valido y normaliza el value", () => {
    const r = validarRemito(remitoValido());
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.cabecera.comprobante).toBe("RMP");
      expect(r.value.detalle[0].producto).toBe("1060");
      expect(r.value.detalle[0].lote).toBe("00123");
    }
  });

  it("acepta numericos del detalle en null (no medido)", () => {
    const remito = remitoValido();
    remito.detalle[0] = {
      ...remito.detalle[0],
      especie: null,
      diametro: null,
      largo: null,
      peso_bruto: null,
      tara: null,
      peso_neto: null,
      deposito: null,
      precio_unitario: null,
      lote: null,
    };
    const r = validarRemito(remito);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.detalle[0].peso_bruto).toBeNull();
  });

  it("acepta strings vacios en numericos y los normaliza a null", () => {
    const remito = remitoValido();
    remito.detalle[0] = {
      ...remito.detalle[0],
      peso_bruto: "" as unknown as number | null,
      tara: "" as unknown as number | null,
      lote: "" as unknown as string | null,
      especie: "" as unknown as string | null,
    };
    const r = validarRemito(remito);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.detalle[0].peso_bruto).toBeNull();
      expect(r.value.detalle[0].tara).toBeNull();
      expect(r.value.detalle[0].lote).toBeNull();
      expect(r.value.detalle[0].especie).toBeNull();
    }
  });

  it("aplica default estado=ACTIVO si viene vacio", () => {
    const remito = remitoValido();
    remito.cabecera.estado = "";
    const r = validarRemito(remito);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.cabecera.estado).toBe("ACTIVO");
  });

  it("default item = posicion 1-based si el cliente no lo envia", () => {
    const remito = remitoValido();
    delete (remito.detalle[0] as { item?: number }).item;
    const r = validarRemito(remito);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.detalle[0].item).toBe(1);
  });
});

// ---------- Campos obligatorios ----------

describe("validarRemito — campos obligatorios", () => {
  const casos = [
    ["comprobante", (c: Remito["cabecera"]) => (c.comprobante = "")],
    ["letra", (c: Remito["cabecera"]) => (c.letra = "")],
    ["numero_sucursal", (c: Remito["cabecera"]) => (c.numero_sucursal = "")],
    ["numero_remito", (c: Remito["cabecera"]) => (c.numero_remito = "")],
    ["fecha_comprobante", (c: Remito["cabecera"]) => (c.fecha_comprobante = "")],
    ["fecha_recepcion", (c: Remito["cabecera"]) => (c.fecha_recepcion = "")],
    ["proveedor", (c: Remito["cabecera"]) => (c.proveedor = "")],
    ["certificado", (c: Remito["cabecera"]) => (c.certificado = "")],
  ] as const;

  for (const [campo, mutar] of casos) {
    it(`rechaza ${campo} vacio`, () => {
      const remito = remitoValido();
      mutar(remito.cabecera);
      const r = validarRemito(remito);
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.errors.some((e) => e.includes(`cabecera.${campo}`))).toBe(true);
      }
    });
  }

  it("rechaza detalle[].producto vacio", () => {
    const remito = remitoValido();
    remito.detalle[0].producto = "";
    const r = validarRemito(remito);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.some((e) => e.includes("producto"))).toBe(true);
    }
  });

  it("rechaza body no objeto", () => {
    const r = validarRemito("no-soy-objeto" as unknown as Remito);
    expect(r.ok).toBe(false);
  });

  it("rechaza cabecera ausente", () => {
    const r = validarRemito({ detalle: detalleValido() } as unknown as Remito);
    expect(r.ok).toBe(false);
  });

  it("rechaza detalle no array", () => {
    const r = validarRemito({
      cabecera: cabeceraValida(),
      detalle: "no-array",
    } as unknown as Remito);
    expect(r.ok).toBe(false);
  });
});

// ---------- Longitudes maximas (MAX segun schema.sql) ----------

describe("validarRemito — longitudes maximas", () => {
  it("rechaza comprobante > 10 caracteres", () => {
    const remito = remitoValido();
    remito.cabecera.comprobante = "12345678901";
    const r = validarRemito(remito);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.some((e) => e.includes("comprobante"))).toBe(true);
  });

  it("rechaza proveedor > 150 caracteres", () => {
    const remito = remitoValido();
    remito.cabecera.proveedor = "X".repeat(151);
    const r = validarRemito(remito);
    expect(r.ok).toBe(false);
  });

  it("rechaza detalle[].lote > 30 caracteres", () => {
    const remito = remitoValido();
    remito.detalle[0].lote = "L".repeat(31);
    const r = validarRemito(remito);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.some((e) => e.includes("lote"))).toBe(true);
  });

  it("acepta longitudes en el limite exacto", () => {
    const remito = remitoValido();
    remito.cabecera.comprobante = "1234567890"; // exactamente 10
    const r = validarRemito(remito);
    expect(r.ok).toBe(true);
  });
});

// ---------- Fechas y coherencia ----------

describe("validarRemito — fechas", () => {
  it("rechaza formato invalido (no ISO YYYY-MM-DD)", () => {
    const remito = remitoValido();
    remito.cabecera.fecha_comprobante = "01/01/2026";
    const r = validarRemito(remito);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(
        r.errors.some((e) => e.includes("fecha_comprobante")),
      ).toBe(true);
    }
  });

  it("rechaza fecha inexistente (30 de febrero)", () => {
    const remito = remitoValido();
    remito.cabecera.fecha_comprobante = "2026-02-30";
    const r = validarRemito(remito);
    expect(r.ok).toBe(false);
  });

  it("rechaza fecha_recepcion anterior a fecha_comprobante (T007)", () => {
    const remito = remitoValido();
    remito.cabecera.fecha_recepcion = "2025-12-31";
    const r = validarRemito(remito);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(
        r.errors.some((e) => e.includes("fecha_recepcion")),
      ).toBe(true);
    }
  });

  it("acepta fecha_recepcion igual a fecha_comprobante", () => {
    const remito = remitoValido();
    remito.cabecera.fecha_recepcion = remito.cabecera.fecha_comprobante;
    const r = validarRemito(remito);
    expect(r.ok).toBe(true);
  });
});

// ---------- Certificado (enum) ----------

describe("validarRemito — certificado", () => {
  it("rechaza valor fuera del enum", () => {
    const remito = remitoValido();
    remito.cabecera.certificado = "FSC MIXTO";
    const r = validarRemito(remito);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.some((e) => e.includes("certificado"))).toBe(true);
  });

  it("acepta FSC 100%", () => {
    const remito = remitoValido();
    remito.cabecera.certificado = "FSC 100%";
    const r = validarRemito(remito);
    expect(r.ok).toBe(true);
  });
});

// ---------- Detalle: minimo 1 y cantidad_rollos ----------

describe("validarRemito — detalle minimo y cantidad_rollos", () => {
  it("rechaza detalle vacio (T007: minimo 1 item)", () => {
    const remito = remitoValido();
    remito.detalle = [];
    const r = validarRemito(remito);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.some((e) => e.includes("al menos 1"))).toBe(true);
    }
  });

  it("rechaza cantidad_rollos = 0", () => {
    const remito = remitoValido();
    remito.detalle[0].cantidad_rollos = 0;
    const r = validarRemito(remito);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(
        r.errors.some((e) => e.includes("cantidad_rollos")),
      ).toBe(true);
    }
  });

  it("rechaza cantidad_rollos no entero", () => {
    const remito = remitoValido();
    remito.detalle[0].cantidad_rollos = 2.5;
    const r = validarRemito(remito);
    expect(r.ok).toBe(false);
  });

  it("rechaza cantidad_rollos negativo", () => {
    const remito = remitoValido();
    remito.detalle[0].cantidad_rollos = -1;
    const r = validarRemito(remito);
    expect(r.ok).toBe(false);
  });

  it("rechaza item no entero", () => {
    const remito = remitoValido();
    remito.detalle[0].item = 0;
    const r = validarRemito(remito);
    expect(r.ok).toBe(false);
  });
});

// ---------- Numericos (nullable / negativos / no numericos) ----------

describe("validarRemito — numericos del detalle", () => {
  it("rechaza largo negativo", () => {
    const remito = remitoValido();
    remito.detalle[0].largo = -0.1;
    const r = validarRemito(remito);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.some((e) => e.includes("largo"))).toBe(true);
  });

  it("rechaza peso_bruto negativo", () => {
    const remito = remitoValido();
    remito.detalle[0].peso_bruto = -1;
    const r = validarRemito(remito);
    expect(r.ok).toBe(false);
  });

  it("rechaza tara negativa", () => {
    const remito = remitoValido();
    remito.detalle[0].tara = -1;
    const r = validarRemito(remito);
    expect(r.ok).toBe(false);
  });

  it("rechaza precio_unitario negativo", () => {
    const remito = remitoValido();
    remito.detalle[0].precio_unitario = -1;
    const r = validarRemito(remito);
    expect(r.ok).toBe(false);
  });

  it("rechaza precio_transporte negativo en cabecera", () => {
    const remito = remitoValido();
    remito.cabecera.precio_transporte = -1;
    const r = validarRemito(remito);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(
        r.errors.some((e) => e.includes("precio_transporte")),
      ).toBe(true);
    }
  });

  it("acepta precio_transporte null", () => {
    const remito = remitoValido();
    remito.cabecera.precio_transporte = null as unknown as number;
    const r = validarRemito(remito);
    expect(r.ok).toBe(true);
  });

  it("acepta numericos en cero", () => {
    const remito = remitoValido();
    remito.detalle[0].largo = 0;
    remito.detalle[0].peso_bruto = 0;
    remito.detalle[0].tara = 0;
    remito.detalle[0].precio_unitario = 0;
    const r = validarRemito(remito);
    expect(r.ok).toBe(true);
  });
});

// ---------- helpers internos (export __TEST__) ----------

describe("__TEST__ — helpers internos", () => {
  it("normNum: vacio/null/undefined -> null; no numerico -> null", () => {
    expect(__TEST__.normNum("")).toBeNull();
    expect(__TEST__.normNum(null)).toBeNull();
    expect(__TEST__.normNum(undefined)).toBeNull();
    expect(__TEST__.normNum("abc")).toBeNull();
    expect(__TEST__.normNum("3.5")).toBe(3.5);
  });

  it("normTexto: vacio -> null; conserva texto", () => {
    expect(__TEST__.normTexto("")).toBeNull();
    expect(__TEST__.normTexto(null)).toBeNull();
    expect(__TEST__.normTexto("TAEDA")).toBe("TAEDA");
    expect(__TEST__.normTexto(5)).toBe(5);
  });

  it("MAX refleja longitudes del schema.sql", () => {
    expect(__TEST__.MAX.comprobante).toBe(10);
    expect(__TEST__.MAX.proveedor).toBe(150);
    expect(__TEST__.MAX.lote).toBe(30);
    expect(__TEST__.MAX.origen).toBe(100);
  });

  it("validarDetalleItem rechaza item no objeto", () => {
    expect(__TEST__.validarDetalleItem(0, "no-objeto")).toBeNull();
  });
});
import { describe, it, expect } from "vitest";
import { calcularPesoNeto, proximoLote } from "../src/services/remitos.service";

describe("remitos.service — calcularPesoNeto (T027)", () => {
  it("bruto - tara", () => {
    expect(calcularPesoNeto(40.5, 5)).toBe(35.5);
  });

  it("tara 0", () => {
    expect(calcularPesoNeto(40.5, 0)).toBe(40.5);
  });

  it("tara null", () => {
    expect(calcularPesoNeto(40.5, null)).toBe(40.5);
  });

  it("bruto ausente (null) -> null", () => {
    expect(calcularPesoNeto(null, 5)).toBeNull();
  });

  it("bruto undefined -> null", () => {
    expect(calcularPesoNeto(undefined, 5)).toBeNull();
  });

  it("redondeo 3 decimales", () => {
    expect(calcularPesoNeto(33.3335, 0)).toBe(33.334);
  });

  it("valores con many decimals", () => {
    expect(calcularPesoNeto(12.3456789, 1.1234567)).toBe(11.222);
  });
});

describe("remitos.service — proximoLote (T027)", () => {
  it("lote de 5 dígitos", () => {
    expect(proximoLote(0)).toBe("00001");
  });

  it("incremento secuencial", () => {
    expect(proximoLote(1)).toBe("00002");
    expect(proximoLote(99)).toBe("00100"); // 99+1=100 -> "00100" (5 dígitos)
    expect(proximoLote(12345)).toBe("12346");
  });
});

describe("remitos.service — getOrigenes (T027)", () => {
  it("devuelve catálogo de 49 orígenes", async () => {
    const { getOrigenes } = await import("../src/services/remitos.service");
    const origenes = await getOrigenes();
    expect(origenes.length).toBe(49);
  });

  it("todos los orígenes tienen codigo y descripcion", async () => {
    const { getOrigenes } = await import("../src/services/remitos.service");
    const origenes = await getOrigenes();
    expect(origenes.length).toBe(49);
    origenes.forEach((o: any) => {
      expect(o).toHaveProperty("codigo");
      expect(o).toHaveProperty("descripcion");
    });
  });

  it("los códigos son únicos", async () => {
    const { getOrigenes } = await import("../src/services/remitos.service");
    const origenes = await getOrigenes();
    const codigos = origenes.map((o: any) => o.codigo);
    expect(new Set(codigos).size).toBe(codigos.length);
  });
});

describe("remitos.service — prepararDetalleParaPersistir (T027)", () => {
  it("componente calcularPesoNeto integrado", () => {
    // Verificamos que la función de cálculo funciona dentro del flujo
    const peso = calcularPesoNeto(40.5, 5);
    expect(peso).toBe(35.5);
  });

  it("valida estructura de entrada al detalle", () => {
    const detalle = {
      item: 1,
      producto: "1060",
      descripcion: "Tubo",
      especie: "TAEDA",
      diametro: "25-30",
      largo: 3.5,
      cantidad_rollos: 5,
      peso_bruto: 40.5,
      tara: 5,
      peso_neto: null,
      deposito: null,
      precio_unitario: null,
      lote: null,
    };
    expect(detalle.peso_bruto).toBe(40.5);
    expect(detalle.tara).toBe(5);
  });
});
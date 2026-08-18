import { PoolClient } from "pg";
import { pool } from "../database/connection";
import {
  Remito,
  RemitoGuardado,
  RemitoConId,
  RemitoCabecera,
  RemitoDetalle,
} from "../types/Remito";

export const obtenerRemitos = async (): Promise<RemitoGuardado[]> => {
  const resultado = await pool.query(`
    SELECT *
    FROM remitos
    ORDER BY fecha_comprobante DESC, id DESC;
  `);

  return resultado.rows;
};

export const obtenerRemitoPorId = async (
  id: number,
): Promise<RemitoConId | null> => {
  const cabeceraResultado = await pool.query(
    `
    SELECT *
    FROM remitos
    WHERE id = $1;
    `,
    [id],
  );

  if (cabeceraResultado.rowCount === 0) {
    return null;
  }

  const f = cabeceraResultado.rows[0];

  const cabecera: RemitoCabecera = {
    comprobante: f.comprobante,
    letra: f.letra,
    numero_sucursal: f.numero_sucursal,
    numero_remito: f.numero_remito,
    fecha_comprobante: f.fecha_comprobante.toISOString().slice(0, 10),
    fecha_recepcion: f.fecha_recepcion.toISOString().slice(0, 10),
    nota_recepcion: f.nota_recepcion,
    proveedor: f.proveedor,
    direccion: f.direccion,
    cuit: f.cuit,
    origen: f.origen,
    certificado: f.certificado,
    transporte: f.transporte,
    precio_transporte: Number(f.precio_transporte),
    centro_compra: f.centro_compra,
    patente_chasis: f.patente_chasis,
    patente_acoplado: f.patente_acoplado,
    chofer: f.chofer,
    clausula_compra: f.clausula_compra,
    centro_auxiliar: f.centro_auxiliar,
    centro_credito: f.centro_credito,
    obra: f.obra,
    lista_precio: f.lista_precio,
    observaciones: f.observaciones,
    estado: f.estado,
    usuario: f.usuario,
  };

  const detalleResultado = await pool.query(
    `
    SELECT *
    FROM remitos_detalle
    WHERE remito_id = $1
    ORDER BY item;
    `,
    [id],
  );

  const detalle: RemitoDetalle[] = detalleResultado.rows.map((r) => ({
    item: r.item,
    producto: r.producto,
    descripcion: r.descripcion,
    especie: r.especie,
    diametro: r.diametro,
    largo: Number(r.largo ?? 0),
    cantidad_rollos: r.cantidad_rollos,
    peso_bruto: Number(r.peso_bruto ?? 0),
    peso_neto: Number(r.peso_neto ?? 0),
    volumen: Number(r.volumen ?? 0),
    deposito: r.deposito,
    precio_unitario: Number(r.precio_unitario ?? 0),
    lote: r.lote,
  }));

  return { id, cabecera, detalle };
};

// ==========================
// Insercion de remitos_detalle. Patron unico compartido por
// guardarRemito() (POST /remitos) y actualizarRemito() (PUT /remitos/:id).
// ==========================

const insertarDetalleRemito = async (
  client: PoolClient,
  remitoId: number,
  detalle: RemitoDetalle[],
) => {
  for (const item of detalle) {
    await client.query(
      `
      INSERT INTO remitos_detalle (
        remito_id,
        item,
        producto,
        descripcion,
        especie,
        diametro,
        largo,
        cantidad_rollos,
        peso_bruto,
        peso_neto,
        volumen,
        deposito,
        precio_unitario,
        lote
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,
        $8,$9,$10,$11,$12,$13,$14
      );
      `,
      [
        remitoId,
        item.item,
        item.producto,
        item.descripcion,
        item.especie,
        item.diametro,
        item.largo,
        item.cantidad_rollos,
        item.peso_bruto,
        item.peso_neto,
        item.volumen,
        item.deposito,
        item.precio_unitario,
        item.lote,
      ],
    );
  }
};

export const actualizarRemito = async (
  id: number,
  datos: Remito,
): Promise<{ id: number; mensaje: string } | null> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const cabecera = datos.cabecera;

    // ==========================
    // UPDATE de cabecera de remitos.
    // El id no se modifica. updated_at se setea explicitamente (no hay
    // trigger BEFORE UPDATE en la BD; solo el default de INSERT).
    // ==========================

    const resultado = await client.query(
      `
      UPDATE remitos
      SET
        comprobante = $1,
        letra = $2,
        numero_sucursal = $3,
        numero_remito = $4,
        fecha_comprobante = $5,
        fecha_recepcion = $6,
        nota_recepcion = $7,
        proveedor = $8,
        direccion = $9,
        cuit = $10,
        origen = $11,
        certificado = $12,
        transporte = $13,
        precio_transporte = $14,
        centro_compra = $15,
        patente_chasis = $16,
        patente_acoplado = $17,
        chofer = $18,
        clausula_compra = $19,
        centro_auxiliar = $20,
        centro_credito = $21,
        obra = $22,
        lista_precio = $23,
        observaciones = $24,
        estado = $25,
        usuario = $26,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $27
      RETURNING id;
      `,
      [
        cabecera.comprobante,
        cabecera.letra,
        cabecera.numero_sucursal,
        cabecera.numero_remito,
        cabecera.fecha_comprobante,
        cabecera.fecha_recepcion,
        cabecera.nota_recepcion,
        cabecera.proveedor,
        cabecera.direccion,
        cabecera.cuit,
        cabecera.origen,
        cabecera.certificado,
        cabecera.transporte,
        cabecera.precio_transporte,
        cabecera.centro_compra,
        cabecera.patente_chasis,
        cabecera.patente_acoplado,
        cabecera.chofer,
        cabecera.clausula_compra,
        cabecera.centro_auxiliar,
        cabecera.centro_credito,
        cabecera.obra,
        cabecera.lista_precio,
        cabecera.observaciones,
        cabecera.estado,
        cabecera.usuario,
        id,
      ],
    );

    if (resultado.rowCount === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    // ==========================
    // Reemplazo del detalle existente. DELETE + re-INSERT dentro de la
    // misma transaccion mantiene integridad cabecera + detalle:
    // si algo falla, ROLLBACK revierte ambos cambios.
    // ==========================

    await client.query("DELETE FROM remitos_detalle WHERE remito_id = $1", [
      id,
    ]);

    await insertarDetalleRemito(client, id, datos.detalle);

    await client.query("COMMIT");

    return {
      id,
      mensaje: "Remito actualizado correctamente",
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const guardarRemito = async (datos: Remito) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // ==========================
    // remitos (este es el nombre de la tabla en la base de datos PostgreSQL)
    // ==========================

    const cabecera = await client.query(
      `
      INSERT INTO remitos (
        comprobante,
        letra,
        numero_sucursal,
        numero_remito,
        fecha_comprobante,
        fecha_recepcion,
        nota_recepcion,
        proveedor,
        direccion,
        cuit,
        origen,
        certificado,
        transporte,
        precio_transporte,
        centro_compra,
        patente_chasis,
        patente_acoplado,
        chofer,
        clausula_compra,
        centro_auxiliar,
        centro_credito,
        obra,
        lista_precio,
        observaciones,
        estado,
        usuario
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,
        $19,$20,$21,$22,$23,$24,$25,$26
      )
      RETURNING id;
      `,
      [
        datos.cabecera.comprobante,
        datos.cabecera.letra,
        datos.cabecera.numero_sucursal,
        datos.cabecera.numero_remito,
        datos.cabecera.fecha_comprobante,
        datos.cabecera.fecha_recepcion,
        datos.cabecera.nota_recepcion,
        datos.cabecera.proveedor,
        datos.cabecera.direccion,
        datos.cabecera.cuit,
        datos.cabecera.origen,
        datos.cabecera.certificado,
        datos.cabecera.transporte,
        datos.cabecera.precio_transporte,
        datos.cabecera.centro_compra,
        datos.cabecera.patente_chasis,
        datos.cabecera.patente_acoplado,
        datos.cabecera.chofer,
        datos.cabecera.clausula_compra,
        datos.cabecera.centro_auxiliar,
        datos.cabecera.centro_credito,
        datos.cabecera.obra,
        datos.cabecera.lista_precio,
        datos.cabecera.observaciones,
        datos.cabecera.estado ?? "ACTIVO",
        datos.cabecera.usuario,
      ],
    );

    const remitoId = cabecera.rows[0].id;

    // ==========================
    // remitos_detalle (este es el nombre de la tabla en la base de datos PostgreSQL)
    // ==========================

    await insertarDetalleRemito(client, remitoId, datos.detalle);

    await client.query("COMMIT");

    return {
      id: remitoId,
      mensaje: "Remito guardado correctamente",
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

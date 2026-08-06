import { pool } from "../database/connection";

export const obtenerRemitos = async () => {
  const resultado = await pool.query(`
    SELECT *
    FROM remitos
    ORDER BY id;
  `);

  return resultado.rows;
};

export const guardarRemito = async (datos: any) => {
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

    for (const item of datos.detalle) {
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

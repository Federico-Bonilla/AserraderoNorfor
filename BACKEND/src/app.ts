import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import remitosRouter from "./routes/remitos.routes";
import excelRoutes from "./routes/excel.routes";
import proveedorRoutes from "./routes/proveedor.routes";
import productosRoutes from "./routes/productos.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use(remitosRouter);
app.use(excelRoutes);
app.use("/proveedores", proveedorRoutes);
app.use("/productos", productosRoutes);

// ============================================================
// Handler 404 (debe ir antes del middleware de errores).
// Cualquier ruta no matcheada arriba cae aqui.
// ============================================================
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    detalle: `${req.method} ${req.path}`,
  });
});

// ============================================================
// Middleware global de errores (4-arity: signature que Express
// reconoce como error handler).
//
// Respetos/convenciones:
//   - Formato consistente con T004: { error: string, detalle?: string }
//   - No expone stack traces al cliente.
//   - Respeta res.headersSent (delega a Express si ya respondio).
//   - No agrega dependencias (mapeos PG codigos hardcodeados).
//
// Categorias cubiertas:
//   1. JSON invalido (body-parser) → err.status 400 + type "entity.parse.failed"
//   2. Errores de PostgreSQL (pg.DatabaseError con err.code) → mapeo a 400/409/500
//   3. Errores genericos con err.status 4xx → lo respetamos
//   4. Resto → 500 generico, log interno sin exponer detalles
// ============================================================
interface ErrorConStatus extends Error {
  status?: number;
  statusCode?: number;
  type?: string;
  code?: string;
  detail?: string;
  constraint?: string;
}

// Codigos de error PostgreSQL relevantes para mapear
// (https://www.postgresql.org/docs/17/errcodes-appendix.html)
const PG_400 = new Set([
  "22001", // value too long for type (varchar overflow)
  "22002", // null value not allowed
  "23502", // not_null_violation (campo NOT NULL faltante)
  "23514", // check_violation
  "22P02", // invalid_text_representation (tipo invalido)
  "23505", // unique_violation (locked como 409 abajo si prefiere)
]);
const PG_409 = new Set([
  "23503", // foreign_key_violation
  "23505", // unique_violation
  "23P01", // exclusion_violation
  "40001", // serialization_failure
  "40P01", // deadlock_detected
]);

function mapearErrorPG(err: ErrorConStatus): { status: number; detalle: string } {
  const code = err.code ?? "";
  if (PG_400.has(code)) {
    return {
      status: 400,
      detalle: `PostgreSQL ${code}: ${err.message}`,
    };
  }
  if (PG_409.has(code)) {
    return {
      status: 409,
      detalle: `PostgreSQL ${code}: ${err.message}`,
    };
  }
  // cualquier otro codigo PG → 500
  return {
    status: 500,
    detalle: `PostgreSQL ${code}: ${err.message}`,
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((
  err: ErrorConStatus,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Si el handler ya envio headers, delegar al default de Express
  if (res.headersSent) {
    next(err);
    return;
  }

  // 1. JSON invalido (body-parser / express.json)
  // body-parser crea errores con status=400 y type="entity.parse.failed"
  if (
    err instanceof SyntaxError ||
    err.type === "entity.parse.failed" ||
    err.type === "entity.verify.failed"
  ) {
    const status = typeof err.status === "number" ? err.status : 400;
    console.error("[error-mw] JSON invalido:", err.message);
    res.status(status).json({
      error: "JSON invalido",
      detalle: err.message,
    });
    return;
  }

  // 2. Error de PostgreSQL (node-postgres los marca con .code)
  if (typeof err.code === "string" && /^[0-9A-Z]{5}$/.test(err.code)) {
    const { status, detalle } = mapearErrorPG(err);
    console.error(`[error-mw] PostgreSQL ${err.code}:`, err.message);
    if (err.constraint) console.error(`[error-mw] constraint: ${err.constraint}`);
    res.status(status).json({
      error: status === 500 ? "Error interno del servidor" : "Error de base de datos",
      detalle: status === 500 ? undefined : detalle,
    });
    return;
  }

  // 3. Error con status 4xx asignado explicitamente (ej. createError de body-parser)
  const statusExplicit =
    typeof err.status === "number"
      ? err.status
      : typeof err.statusCode === "number"
        ? err.statusCode
        : undefined;

  if (statusExplicit !== undefined && statusExplicit >= 400 && statusExplicit < 500) {
    console.error(`[error-mw] error ${statusExplicit}:`, err.message);
    res.status(statusExplicit).json({
      error: "Solicitud invalida",
      detalle: err.message,
    });
    return;
  }

  // 4. Resto: error interno del servidor (no exponer detalles al cliente)
  console.error("[error-mw] error no controlado:", err);
  res.status(500).json({
    error: "Error interno del servidor",
  });
});

export default app;

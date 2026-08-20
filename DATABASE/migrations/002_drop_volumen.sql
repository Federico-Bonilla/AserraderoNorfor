-- =========================================================================
-- Migracion 002: eliminar columna zombie `volumen` de remitos_detalle.
--
-- Contexto (T017):
--   - `volumen` (numeric(12,6)) estaba definida en schema.sql pero:
--       * nunca se expuso en la UI (T016 la removio de la tabla del detalle),
--       * el frontend siempre enviaba null al agregar/editar un item,
--       * la columna se persistia en BD por el INSERT del service.
--   - Mantener la columna sin uso es deuda tecnica + superficie de ataque
--     (un POST directo con `volumen: 999` lo guardaba).
--
-- Esta migracion es IDEMPOTENTE: usa `DROP COLUMN IF EXISTS`, asi puede
-- ejecutarse dos veces sin error.
--
-- No se renombra/eliminan otras columnas. No se modifican indices ni
-- constraints (la columna no tenia UNIQUE ni FK).
-- =========================================================================

ALTER TABLE remitos_detalle
  DROP COLUMN IF EXISTS volumen;

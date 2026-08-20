-- =============================================================================
-- Migración 001: agregar campo tara a remitos_detalle (T016).
--
-- Regla de negocio aprobada:
--   Peso Neto = Peso Bruto - Tara
--   tara: entrada manual, unidad TN. Misma precisión que peso_bruto/peso_neto
--   (numeric(12,3)) según DATABASE/schema.sql y BD real.
--
-- Idempotente: se puede ejecutar más de una vez sin error.
-- No elimina ni modifica columnas/datos existentes.
-- =============================================================================

ALTER TABLE remitos_detalle
  ADD COLUMN IF NOT EXISTS tara numeric(12, 3);

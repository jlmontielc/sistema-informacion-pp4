-- =============================================================
-- MIGRACIÓN 007: AÑADIR COLUMNA DECISION A PLANES_DIETA
-- Permite distinguir dietas pendientes/aprobadas/rechazadas
-- =============================================================

ALTER TABLE planes_dieta
  ADD COLUMN decision ENUM('pendiente','aprobada','rechazada','modificada') NOT NULL DEFAULT 'pendiente'
  AFTER activo;

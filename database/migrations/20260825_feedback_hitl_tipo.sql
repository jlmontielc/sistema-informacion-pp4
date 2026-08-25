-- =============================================================
-- MIGRACIÓN 006: AÑADIR COLUMNA TIPO A FEEDBACK_HITL
-- Diferencia entre feedback de rutinas y dietas generadas por IA
-- =============================================================

ALTER TABLE feedback_hitl
  ADD COLUMN tipo ENUM('rutina', 'dieta') NOT NULL DEFAULT 'rutina'
  AFTER observaciones;

CREATE INDEX idx_feedback_tipo ON feedback_hitl (tipo);

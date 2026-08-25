-- Migracion 005: agregar campo ofrecimiento a planes_pago
-- Indica si el plan incluye entrenamiento, dietas o ambos.
-- Esto permite al sistema disparar las predicciones de IA correctas al verificar un pago.

ALTER TABLE planes_pago
  ADD COLUMN ofrecimiento ENUM('entrenamiento','dietas','ambos') NOT NULL DEFAULT 'entrenamiento'
  AFTER descripcion;

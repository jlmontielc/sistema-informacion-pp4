-- =============================================================
-- MIGRACIÓN: Agregar campo dias_semana a plantillas y rutinas
-- Permite al entrenador configurar qué días de la semana usa
-- =============================================================

ALTER TABLE plantillas_entrenamiento
ADD COLUMN dias_semana JSON COMMENT 'Mapa de slots a días: {"1":{"dia_semana":1,"nombre":"Lunes"},"2":...}';

ALTER TABLE rutinas_asignadas
ADD COLUMN dias_semana JSON COMMENT 'Mapa de slots a días: {"1":{"dia_semana":1,"nombre":"Lunes"},"2":...}';

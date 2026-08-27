-- 008: Agregar columna 'eliminado' a rutinas_asignadas para borrado lógico
-- de recomendaciones IA y rutinas asignadas sin romper el historial
-- (registro_entrenamiento tiene ON DELETE CASCADE sobre rutina_asignada_id).

ALTER TABLE rutinas_asignadas ADD COLUMN eliminado BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX idx_rutinas_asignadas_eliminado ON rutinas_asignadas (entrenador_id, eliminado);

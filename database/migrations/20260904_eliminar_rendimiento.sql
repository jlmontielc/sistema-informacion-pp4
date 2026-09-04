-- =============================================================
-- Migración: eliminar tabla rendimiento obsoleta
-- Fecha: 2026-09-04
-- =============================================================

-- Eliminar vista que depende de la tabla rendimiento
DROP VIEW IF EXISTS vw_progreso_instruido;

-- Eliminar tabla rendimiento (reemplazada por series_ejecutadas)
DROP TABLE IF EXISTS rendimiento;

-- Recrear vista sin la tabla eliminada
CREATE OR REPLACE VIEW vw_progreso_instruido AS
SELECT
  i.id AS instruido_id,
  i.nombre AS instruido_nombre,
  e.nombre AS entrenador_nombre,
  re.fecha,
  NULL AS peso,
  NULL AS repeticiones_totales,
  NULL AS carga_total_kg,
  NULL AS imc,
  ra.nombre AS rutina_activa,
  ra.tipo AS tipo_rutina
FROM instruidos i
JOIN entrenadores e ON e.id = i.entrenador_id
LEFT JOIN registro_entrenamiento re ON re.cliente_id = i.id
LEFT JOIN rutinas_asignadas ra ON ra.cliente_id = i.id AND ra.activa = TRUE;

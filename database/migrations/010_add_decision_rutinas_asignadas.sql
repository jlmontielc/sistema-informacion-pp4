-- Migracion 010: Agregar columna decision a rutinas_asignadas
-- Paridad con planes_dieta para flujo HITL de rutinas

ALTER TABLE rutinas_asignadas
ADD COLUMN decision ENUM('pendiente', 'aprobada', 'rechazada', 'modificada')
  NOT NULL DEFAULT 'pendiente'
AFTER personalizada_por_entrenador;

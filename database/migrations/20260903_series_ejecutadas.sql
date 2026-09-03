-- =============================================================
-- MIGRACIÓN 009: MODELO NORMALIZADO DE SERIES EJECUTADAS
-- Reemplaza ejercicios_realizados JSON por tabla series_ejecutadas
-- y añade estado/fechas a registro_entrenamiento.
-- =============================================================

ALTER TABLE registro_entrenamiento
  ADD COLUMN estado ENUM('en_progreso', 'completado', 'cancelado') NOT NULL DEFAULT 'en_progreso' AFTER observaciones,
  ADD COLUMN fecha_inicio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER estado,
  ADD COLUMN fecha_fin DATETIME NULL AFTER fecha_inicio,
  MODIFY COLUMN ejercicios_realizados JSON NULL COMMENT 'JSON libre; reemplazado por tabla series_ejecutadas',
  ADD CONSTRAINT chk_registro_duracion_minutos CHECK (duracion_minutos BETWEEN 0 AND 600);

CREATE TABLE series_ejecutadas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  registro_entrenamiento_id INT NOT NULL,
  ejercicio_id INT NOT NULL,
  numero_serie TINYINT NOT NULL,
  repeticiones_realizadas INT NOT NULL,
  peso_kg DECIMAL(6,2) NOT NULL,
  descanso_segundos INT NOT NULL,
  rpe TINYINT NULL CHECK (rpe BETWEEN 1 AND 10),
  notas TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_serie_registro
    FOREIGN KEY (registro_entrenamiento_id) REFERENCES registro_entrenamiento(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_serie_ejercicio
    FOREIGN KEY (ejercicio_id) REFERENCES ejercicios(id)
    ON DELETE RESTRICT,
  INDEX idx_serie_registro (registro_entrenamiento_id),
  INDEX idx_serie_ejercicio (ejercicio_id),
  INDEX idx_serie_numero (registro_entrenamiento_id, ejercicio_id, numero_serie)
) ENGINE=InnoDB;

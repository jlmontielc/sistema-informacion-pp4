-- =============================================================
-- MIGRACIÓN 002: TABLA FEEDBACK HITL
-- Registra interacciones del entrenador con sugerencias de IA
-- =============================================================

CREATE TABLE IF NOT EXISTS feedback_hitl (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rutina_sugerida_id INT,
    entrenador_id INT NOT NULL,
    cliente_id INT NOT NULL,
    accion ENUM('aprobada', 'rechazada', 'modificada') NOT NULL,
    rutina_original JSON NOT NULL COMMENT 'Copia completa de lo que la IA sugirió',
    rutina_final JSON COMMENT 'Lo que el entrenador finalmente dejó',
    ejercicios_agregados JSON COMMENT 'Ejercicios que el entrenador añadió',
    ejercicios_eliminados JSON COMMENT 'Ejercicios que el entrenador quitó',
    modificacion_cargas JSON COMMENT 'Cambios en series/reps/carga del entrenador',
    confianza_ia DECIMAL(3,2) COMMENT 'Nivel de confianza de la sugerencia IA (0-1)',
    tiempo_revision_seg INT COMMENT 'Segundos que tardó el entrenador en revisar',
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_entrenador
        FOREIGN KEY (entrenador_id) REFERENCES entrenadores(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_feedback_cliente
        FOREIGN KEY (cliente_id) REFERENCES instruidos(id)
        ON DELETE CASCADE,
    INDEX idx_feedback_cliente (cliente_id),
    INDEX idx_feedback_entrenador (entrenador_id),
    INDEX idx_feedback_accion (accion),
    INDEX idx_feedback_fecha (created_at)
) ENGINE=InnoDB;

-- Vista de patrones de entrenador
CREATE OR REPLACE VIEW vw_feedback_patterns AS
SELECT
    e.nombre AS entrenador,
    e.id AS entrenador_id,
    fh.accion,
    COUNT(*) AS total_acciones,
    ROUND(AVG(fh.confianza_ia), 2) AS confianza_promedio,
    ROUND(AVG(fh.tiempo_revision_seg), 1) AS tiempo_promedio_seg,
    ROUND(AVG(JSON_LENGTH(fh.ejercicios_agregados)), 1) AS promedio_ejercicios_agregados,
    ROUND(AVG(JSON_LENGTH(fh.ejercicios_eliminados)), 1) AS promedio_ejercicios_eliminados
FROM feedback_hitl fh
JOIN entrenadores e ON e.id = fh.entrenador_id
GROUP BY fh.entrenador_id, fh.accion
ORDER BY total_acciones DESC;

-- Vista de eficiencia del sistema HITL
CREATE OR REPLACE VIEW vw_hitl_efficiency AS
SELECT
    DATE(fh.created_at) AS fecha,
    COUNT(*) AS total_sugerencias,
    SUM(CASE WHEN fh.accion = 'aprobada' THEN 1 ELSE 0 END) AS aprobadas,
    SUM(CASE WHEN fh.accion = 'modificada' THEN 1 ELSE 0 END) AS modificadas,
    SUM(CASE WHEN fh.accion = 'rechazada' THEN 1 ELSE 0 END) AS rechazadas,
    ROUND(
        SUM(CASE WHEN fh.accion = 'aprobada' THEN 1 ELSE 0 END) * 100.0 / COUNT(*),
        1
    ) AS tasa_aprobacion_pct,
    ROUND(AVG(fh.confianza_ia), 2) AS confianza_promedio
FROM feedback_hitl fh
GROUP BY DATE(fh.created_at)
ORDER BY fecha DESC;

-- Migration: 20260821_crear_feedback_hitl.sql
-- Create table feedback_hitl para persistencia del ciclo HITL
CREATE TABLE IF NOT EXISTS feedback_hitl (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rutina_sugerida_id INT,
    entrenador_id INT NOT NULL,
    cliente_id INT NOT NULL,
    accion ENUM('aprobada', 'rechazada', 'modificada') NOT NULL,
    rutina_original JSON,
    rutina_final JSON,
    ejercicios_agregados JSON,
    ejercicios_eliminados JSON,
    modificacion_cargas JSON,
    confianza_ia DECIMAL(3, 2),
    tiempo_revision_seg INT,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_feedback_cliente (cliente_id),
    INDEX idx_feedback_entrenador (entrenador_id),
    INDEX idx_feedback_accion (accion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
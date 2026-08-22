-- Migracion 003: tabla para persistencia de pesos del motor de scoring IA
-- Los pesos se recalibran desde feedback_hitl via POST /api/predict/recalibrar
-- El servicio Flask tambien crea esta tabla automaticamente (CREATE TABLE IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS pesos_modelo_ia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pesos JSON NOT NULL,
    total_feedback INT NOT NULL DEFAULT 0,
    tasas JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

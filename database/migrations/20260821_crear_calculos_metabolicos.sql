-- Migration: 20260821_crear_calculos_metabolicos.sql
-- Create table calculos_metabolicos para persistencia de cálculos TMB/GCT
CREATE TABLE IF NOT EXISTS calculos_metabolicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    tmb DECIMAL(7, 2) NOT NULL,
    gct DECIMAL(8, 2) NOT NULL,
    nivel_actividad_usado VARCHAR(20),
    peso_usado DECIMAL(5, 2),
    fecha_calculo DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_calculos_cliente (cliente_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
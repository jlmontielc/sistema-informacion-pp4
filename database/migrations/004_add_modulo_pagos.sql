-- Migracion 004: modulo de pagos (RF11)
-- Planes de mensualidad, metodos de pago, tasa de cambio $ -> Bs
-- y verificacion de pagos con activacion automatica al instruido.

CREATE TABLE IF NOT EXISTS planes_pago (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entrenador_id INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT NULL,
    monto_usd DECIMAL(10,2) NOT NULL,
    dias_vigencia INT NOT NULL DEFAULT 30,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_plan_entrenador
      FOREIGN KEY (entrenador_id) REFERENCES entrenadores(id)
      ON DELETE CASCADE,
    INDEX idx_planes_pago_entrenador (entrenador_id),
    INDEX idx_planes_pago_activo (entrenador_id, activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS metodos_pago (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entrenador_id INT NOT NULL,
    tipo ENUM('pago_movil','transferencia','zelle','binance','otro') NOT NULL,
    datos JSON NOT NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_metodo_entrenador
      FOREIGN KEY (entrenador_id) REFERENCES entrenadores(id)
      ON DELETE CASCADE,
    INDEX idx_metodos_pago_entrenador (entrenador_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS configuracion_pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entrenador_id INT NOT NULL,
    tasa_cambio DECIMAL(10,4) NOT NULL DEFAULT 40.0000 COMMENT 'Bolivares por 1 USD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_configuracion_entrenador UNIQUE (entrenador_id),
    CONSTRAINT fk_configuracion_entrenador
      FOREIGN KEY (entrenador_id) REFERENCES entrenadores(id)
      ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    entrenador_id INT NOT NULL,
    plan_id INT NOT NULL,
    metodo_pago_id INT NOT NULL,
    monto_usd DECIMAL(10,2) NOT NULL,
    monto_bs DECIMAL(14,2) NOT NULL,
    tasa_aplicada DECIMAL(10,4) NOT NULL,
    referencia VARCHAR(100) NOT NULL,
    fecha_pago DATE NOT NULL,
    comprobante LONGTEXT NOT NULL COMMENT 'Capture del pago en base64',
    comprobante_mime VARCHAR(100) NOT NULL DEFAULT 'image/jpeg',
    estado ENUM('pendiente','verificado','rechazado') NOT NULL DEFAULT 'pendiente',
    comentario_rechazo VARCHAR(255) NULL,
    verificado_por INT NULL,
    fecha_verificacion DATETIME NULL,
    fecha_inicio DATE NULL,
    fecha_fin DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pago_cliente
      FOREIGN KEY (cliente_id) REFERENCES instruidos(id)
      ON DELETE CASCADE,
    CONSTRAINT fk_pago_entrenador
      FOREIGN KEY (entrenador_id) REFERENCES entrenadores(id)
      ON DELETE CASCADE,
    CONSTRAINT fk_pago_plan
      FOREIGN KEY (plan_id) REFERENCES planes_pago(id),
    CONSTRAINT fk_pago_metodo
      FOREIGN KEY (metodo_pago_id) REFERENCES metodos_pago(id),
    INDEX idx_pagos_estado (entrenador_id, estado),
    INDEX idx_pagos_cliente (cliente_id),
    INDEX idx_pagos_vigencia (cliente_id, estado, fecha_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

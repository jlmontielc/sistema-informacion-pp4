-- =============================================================
-- SISTEMA DE ENTRENADOR PERSONAL - ESQUEMA COMPLETO MySQL 8.0
-- Motor: MySQL 8.0+
-- Destino: Aiven for MySQL
-- =============================================================

CREATE DATABASE IF NOT EXISTS sistema_entrenador
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sistema_entrenador;

-- =============================================================
-- 1. ENTRENADORES (autenticación y perfil)
-- =============================================================
CREATE TABLE entrenadores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  especialidad VARCHAR(100),
  rol ENUM('administrador', 'entrenador') NOT NULL DEFAULT 'entrenador',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =============================================================
-- 2. INSTRUIDOS (personas entrenadas por el entrenador)
-- =============================================================
CREATE TABLE instruidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entrenador_id INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255) COMMENT 'Para login del instruido',
  edad INT NOT NULL,
  peso DECIMAL(5,2) NOT NULL,
  altura DECIMAL(5,2) NOT NULL,
  sexo ENUM('masculino', 'femenino') NOT NULL,
  nivel_actividad ENUM('sedentario', 'ligero', 'moderado', 'activo', 'muy_activo') NOT NULL,
  nivel_experiencia ENUM('principiante', 'intermedio', 'avanzado') DEFAULT NULL COMMENT 'Experiencia en entrenamiento - usado por IA predictiva',
  proposito_entrenamiento TEXT,
  dias_disponibles INT,
  fecha_registro DATE DEFAULT (CURRENT_DATE),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_instruido_entrenador
    FOREIGN KEY (entrenador_id) REFERENCES entrenadores(id)
    ON DELETE CASCADE,
  INDEX idx_instruido_entrenador (entrenador_id)
) ENGINE=InnoDB;

-- =============================================================
-- 3. PERFIL_MEDICO (datos sensibles 1:1 - cifrado a nivel app)
-- =============================================================
CREATE TABLE perfil_medico (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL UNIQUE,
  alergias TEXT COMMENT 'JSON cifrado desde Node.js',
  intolerancias TEXT COMMENT 'JSON cifrado desde Node.js',
  lesiones TEXT COMMENT 'JSON cifrado desde Node.js',
  condiciones_preexistentes TEXT COMMENT 'JSON cifrado desde Node.js',
  medicacion_actual TEXT,
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_perfil_instruido
    FOREIGN KEY (cliente_id) REFERENCES instruidos(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================
-- 4. EJERCICIOS (catálogo base)
-- =============================================================
CREATE TABLE ejercicios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  instrucciones_es TEXT COMMENT 'Instrucciones paso a paso en espanol',
  grupo_muscular VARCHAR(50),
  target VARCHAR(100) COMMENT 'Musculo objetivo principal',
  equipo_necesario VARCHAR(100),
  dificultad ENUM('principiante', 'intermedio', 'avanzado') DEFAULT NULL,
  musculos_secundarios JSON COMMENT 'Array de musculos secundarios involucrados',
  contraindica_lesiones TEXT COMMENT 'Lesiones que contraindican este ejercicio',
  imagen_url VARCHAR(255) COMMENT 'URL relativa al thumbnail 180x180',
  gif_url VARCHAR(255) COMMENT 'URL relativa al GIF animado',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ejercicio_grupo (grupo_muscular),
  INDEX idx_ejercicio_target (target),
  INDEX idx_ejercicio_equipo (equipo_necesario)
) ENGINE=InnoDB;

-- =============================================================
-- 5. PLANTILLAS_ENTRENAMIENTO (templates del entrenador - origen)
-- =============================================================
CREATE TABLE plantillas_entrenamiento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entrenador_id INT NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  tipo ENUM('fuerza', 'hipertrofia', 'resistencia', 'cardio', 'funcional', 'flexibilidad') NOT NULL,
  ejercicios JSON NOT NULL COMMENT '[{"ejercicio_id":1,"series":3,"repeticiones":12,"dia":1,"orden":1,"carga_kg":null}]',
  frecuencia_semanal INT,
  duracion_semanas INT,
  objetivo ENUM('perdida_peso', 'ganancia_muscular', 'mantenimiento', 'rendimiento', 'rehabilitacion'),
  dias_semana JSON COMMENT 'Mapa de slots a días: {"1":{"dia_semana":1,"nombre":"Lunes"},"2":...}',
  nivel_dificultad ENUM('principiante', 'intermedio', 'avanzado'),
  activa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_plantilla_entrenador
    FOREIGN KEY (entrenador_id) REFERENCES entrenadores(id)
    ON DELETE CASCADE,
  INDEX idx_plantilla_tipo (tipo),
  INDEX idx_plantilla_objetivo (objetivo),
  INDEX idx_plantilla_entrenador (entrenador_id)
) ENGINE=InnoDB;

-- =============================================================
-- 6. RUTINAS_ASIGNADAS (clone de plantilla + personalización)
-- =============================================================
CREATE TABLE rutinas_asignadas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  plantilla_origen_id INT,
  entrenador_id INT NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  tipo ENUM('fuerza', 'hipertrofia', 'resistencia', 'cardio', 'funcional', 'flexibilidad') NOT NULL,
  ejercicios JSON NOT NULL COMMENT 'Copia de plantilla + modificaciones del entrenador',
  frecuencia_semanal INT,
  duracion_semanas INT,
  observaciones TEXT,
  dias_semana JSON COMMENT 'Mapa de slots a días: {"1":{"dia_semana":1,"nombre":"Lunes"},"2":...}',
  personalizada_por_entrenador BOOLEAN DEFAULT FALSE COMMENT 'TRUE=ajuste manual, FALSE=generada por IA',
  fecha_inicio DATE,
  fecha_fin DATE,
  activa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_rutina_cliente
    FOREIGN KEY (cliente_id) REFERENCES instruidos(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_rutina_plantilla_origen
    FOREIGN KEY (plantilla_origen_id) REFERENCES plantillas_entrenamiento(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_rutina_entrenador
    FOREIGN KEY (entrenador_id) REFERENCES entrenadores(id)
    ON DELETE CASCADE,
  INDEX idx_rutina_cliente (cliente_id),
  INDEX idx_rutina_activa (cliente_id, activa)
) ENGINE=InnoDB;

-- =============================================================
-- 7. REGISTRO_ENTRENAMIENTO (historial de sesiones ejecutadas)
-- =============================================================
CREATE TABLE registro_entrenamiento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rutina_asignada_id INT NOT NULL,
  cliente_id INT NOT NULL,
  fecha DATE NOT NULL,
  ejercicios_realizados JSON NOT NULL COMMENT '[{"ejercicio_id":1,"series_realizadas":3,"repeticiones":12,"carga_kg":20,"notas":"..."}]',
  duracion_minutos INT,
  percepcion_esfuerzo TINYINT COMMENT 'Escala 1-10',
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_registro_rutina
    FOREIGN KEY (rutina_asignada_id) REFERENCES rutinas_asignadas(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_registro_cliente
    FOREIGN KEY (cliente_id) REFERENCES instruidos(id)
    ON DELETE CASCADE,
  INDEX idx_registro_cliente_fecha (cliente_id, fecha),
  INDEX idx_registro_rutina_fecha (rutina_asignada_id, fecha)
) ENGINE=InnoDB;

-- =============================================================
-- 8. CALCULOS_METABOLICOS (histórico inviolable TMB / GCT)
-- =============================================================
CREATE TABLE calculos_metabolicos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  tmb DECIMAL(7,2) NOT NULL COMMENT 'Tasa Metabólica Basal (kcal)',
  gct DECIMAL(8,2) NOT NULL COMMENT 'Gasto Calórico Total (kcal)',
  nivel_actividad_usado VARCHAR(20),
  peso_usado DECIMAL(5,2),
  fecha_calculo DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_metabolico_cliente
    FOREIGN KEY (cliente_id) REFERENCES instruidos(id)
    ON DELETE CASCADE,
  INDEX idx_metabolico_cliente_fecha (cliente_id, fecha_calculo)
) ENGINE=InnoDB;

-- =============================================================
-- 9. FEEDBACK_HITL (registro del ciclo Human-in-the-Loop)
-- =============================================================
CREATE TABLE feedback_hitl (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rutina_sugerida_id INT,
  entrenador_id INT NOT NULL,
  cliente_id INT NOT NULL,
  accion ENUM('aprobada', 'rechazada', 'modificada') NOT NULL,
  rutina_original JSON COMMENT 'Copia completa de lo que la IA sugirió',
  rutina_final JSON COMMENT 'Lo que el entrenador finalmente dejó',
  ejercicios_agregados JSON COMMENT 'Ejercicios que el entrenador añadió',
  ejercicios_eliminados JSON COMMENT 'Ejercicios que el entrenador quitó',
  modificacion_cargas JSON COMMENT 'Cambios en series/reps/carga del entrenador',
  confianza_ia DECIMAL(3,2) COMMENT 'Nivel de confianza de la sugerencia IA (0-1)',
  tiempo_revision_seg INT COMMENT 'Segundos que tardó el entrenador en revisar',
  observaciones TEXT,
  tipo ENUM('rutina','dieta') NOT NULL DEFAULT 'rutina' COMMENT 'Tipo de sugerencia: rutina o dieta',
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

-- =============================================================
-- 10. PLANES_DIETA (dietas asignadas a clientes)
-- =============================================================
CREATE TABLE planes_dieta (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  entrenador_id INT NOT NULL,
  objetivo_calorico INT NOT NULL COMMENT 'kcal/día',
  proteinas_gramos DECIMAL(7,2) COMMENT 'g/día objetivo',
  carbohidratos_gramos DECIMAL(7,2) COMMENT 'g/día objetivo',
  grasas_gramos DECIMAL(7,2) COMMENT 'g/día objetivo',
  observaciones TEXT,
  fecha_inicio DATE,
  fecha_fin DATE,
  decision ENUM('pendiente','aprobada','rechazada','modificada') NOT NULL DEFAULT 'pendiente',
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_dieta_cliente
    FOREIGN KEY (cliente_id) REFERENCES instruidos(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_dieta_entrenador
    FOREIGN KEY (entrenador_id) REFERENCES entrenadores(id)
    ON DELETE CASCADE,
  INDEX idx_dieta_cliente (cliente_id),
  INDEX idx_dieta_activo (cliente_id, activo)
) ENGINE=InnoDB;

-- =============================================================
-- 11. RENDIMIENTO (métricas periódicas - modelo existente)
-- =============================================================
CREATE TABLE rendimiento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  fecha DATE NOT NULL,
  peso DECIMAL(5,2),
  repeticiones_totales INT,
  carga_total_kg DECIMAL(7,2),
  imc DECIMAL(5,2),
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rendimiento_cliente
    FOREIGN KEY (cliente_id) REFERENCES instruidos(id)
    ON DELETE CASCADE,
  INDEX idx_rendimiento_cliente_fecha (cliente_id, fecha)
) ENGINE=InnoDB;

-- =============================================================
-- 12. PLANES DE PAGO (mensualidades creadas por el entrenador)
-- =============================================================
CREATE TABLE planes_pago (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entrenador_id INT NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  monto_usd DECIMAL(10,2) NOT NULL,
  dias_vigencia INT NOT NULL DEFAULT 30,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  ofrecimiento ENUM('entrenamiento','dietas','ambos') NOT NULL DEFAULT 'entrenamiento',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_plan_entrenador
    FOREIGN KEY (entrenador_id) REFERENCES entrenadores(id)
    ON DELETE CASCADE,
  INDEX idx_planes_pago_entrenador (entrenador_id),
  INDEX idx_planes_pago_activo (entrenador_id, activo)
) ENGINE=InnoDB;

-- =============================================================
-- 13. MÉTODOS DE PAGO configurados por el entrenador
-- =============================================================
CREATE TABLE metodos_pago (
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
) ENGINE=InnoDB;

-- =============================================================
-- 14. CONFIGURACIÓN DE PAGOS por entrenador (tasa $ -> Bs)
-- =============================================================
CREATE TABLE configuracion_pagos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entrenador_id INT NOT NULL,
  tasa_cambio DECIMAL(10,4) NOT NULL DEFAULT 40.0000 COMMENT 'Bolivares por 1 USD',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_configuracion_entrenador UNIQUE (entrenador_id),
  CONSTRAINT fk_configuracion_entrenador
    FOREIGN KEY (entrenador_id) REFERENCES entrenadores(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================
-- 15. PAGOS de mensualidades con comprobante y verificación HITL
-- =============================================================
CREATE TABLE pagos (
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
  comentario_rechazo VARCHAR(255),
  verificado_por INT,
  fecha_verificacion DATETIME,
  fecha_inicio DATE COMMENT 'Inicio de vigencia al verificar el pago',
  fecha_fin DATE COMMENT 'Fin de vigencia (inicio + dias_vigencia del plan)',
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
) ENGINE=InnoDB;

-- =============================================================
-- VISTAS ÚTILES
-- =============================================================

-- Vista del progreso completo del instruido
CREATE VIEW vw_progreso_instruido AS
SELECT
  i.id AS instruido_id,
  i.nombre AS instruido_nombre,
  e.nombre AS entrenador_nombre,
  r.fecha,
  r.peso,
  r.repeticiones_totales,
  r.carga_total_kg,
  r.imc,
  ra.nombre AS rutina_activa,
  ra.tipo AS tipo_rutina
FROM instruidos i
JOIN entrenadores e ON e.id = i.entrenador_id
LEFT JOIN rendimiento r ON r.cliente_id = i.id
LEFT JOIN rutinas_asignadas ra ON ra.cliente_id = i.id AND ra.activa = TRUE;

-- =============================================================
-- DATOS INICIALES (seed obligatorio para el sistema)
-- =============================================================

-- Entrenador administrador por defecto
INSERT INTO entrenadores (nombre, email, password_hash, especialidad)
VALUES ('Administrador', 'admin@sistema.com', '$2b$10$cambiarestohash', 'General');

-- Ejercicios base del catálogo
INSERT INTO ejercicios (nombre, grupo_muscular, equipo_necesario, dificultad) VALUES
('Press de banca', 'Pecho', 'Barra, Mancuernas', 'intermedio'),
('Sentadilla', 'Piernas', 'Barra, Soporte', 'intermedio'),
('Peso muerto', 'Espalda baja', 'Barra, Disco', 'avanzado'),
('Dominadas', 'Espalda', 'Barra de dominadas', 'intermedio'),
('Press militar', 'Hombros', 'Barra, Mancuernas', 'intermedio'),
('Remo con barra', 'Espalda', 'Barra', 'intermedio'),
('Curl de bíceps', 'Brazos', 'Mancuernas, Barra', 'principiante'),
('Fondos en paralelas', 'Pecho, Tríceps', 'Paralelas', 'intermedio'),
('Plancha', 'Core', 'Colchoneta', 'principiante'),
('Zancadas', 'Piernas', 'Mancuernas', 'principiante'),
('Elevación lateral', 'Hombros', 'Mancuernas', 'principiante'),
('Press francés', 'Tríceps', 'Barra Z, Mancuernas', 'intermedio'),
('Crunches', 'Abdominales', 'Colchoneta', 'principiante'),
('Remo al cuello', 'Trapecios', 'Barra, Mancuernas', 'intermedio'),
('Prensa de piernas', 'Piernas', 'Máquina', 'intermedio'),
('Aperturas con mancuernas', 'Pecho', 'Mancuernas', 'principiante'),
('Curl femoral', 'Isquiotibiales', 'Máquina', 'intermedio'),
('Elevación de gemelos', 'Gemelos', 'Máquina, Mancuernas', 'principiante'),
('Face pull', 'Hombros, Trapecios', 'Cuerda, Polea', 'intermedio'),
('Hiperextensiones', 'Espalda baja', 'Banco romano', 'principiante');

-- =============================================================
-- NOTAS DE SEGURIDAD Y OPERACIÓN
-- =============================================================
-- 1. La tabla perfil_medico almacena datos cifrados desde Node.js
--    (a nivel aplicación, usando crypto o bcrypt según corresponda).
--
-- 2. Las restricciones duras (hard constraints) se implementan
--    en el middleware de Node.js:
--    - Lesiones: cruza ejercicios.contraindica_lesiones vs perfil_medico.lesiones
--
-- 3. Para Aiven: usar SSL/TLS obligatorio.
--    URI de conexión: mysql://<user>:<pass>@<host>:3306/sistema_entrenador

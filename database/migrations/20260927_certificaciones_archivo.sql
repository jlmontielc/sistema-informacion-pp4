-- Migración: archivo adjunto (base64) para certificaciones de entrenador
-- Acepta imagen JPG/PNG/WebP o PDF hasta 2 MB (límite base64: 2800000 chars),
-- en paridad con los comprobantes del módulo pagos.

ALTER TABLE certificaciones
  ADD COLUMN archivo LONGTEXT NULL;

ALTER TABLE certificaciones
  ADD COLUMN archivo_mime VARCHAR(100) NULL;

ALTER TABLE certificaciones
  ADD COLUMN tiene_archivo TINYINT(1) NOT NULL DEFAULT 0;

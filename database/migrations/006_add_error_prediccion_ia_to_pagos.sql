-- Migracion 006: Agregar campo para registrar errores de prediccion IA en pagos
-- Cuando la prediccion automatica falla (Flask caido, sin plantillas, etc),
-- el error se registra aqui para que el entrenador pueda verlo y reintentar.

ALTER TABLE pagos
ADD COLUMN error_prediccion_ia TEXT DEFAULT NULL
COMMENT 'Error de la prediccion IA automatica al verificar pago (rutina/dieta)'
AFTER comprobante_mime;

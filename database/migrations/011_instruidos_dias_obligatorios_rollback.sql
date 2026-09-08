-- Rollback 011: Revierte obligatoriedad de dias_disponibles y elimina dias_semana

ALTER TABLE instruidos DROP CONSTRAINT chk_instruidos_dias_coherencia;
ALTER TABLE instruidos DROP CONSTRAINT chk_instruidos_dias_semana_valores;
ALTER TABLE instruidos DROP CONSTRAINT chk_instruidos_dias_semana_rango;
ALTER TABLE instruidos DROP CONSTRAINT chk_instruidos_dias_semana_json;

ALTER TABLE instruidos MODIFY dias_disponibles INT NULL;

ALTER TABLE instruidos DROP COLUMN dias_semana;

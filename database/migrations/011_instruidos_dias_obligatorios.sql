-- Migracion 011: Hacer obligatorios dias_disponibles y dias_semana en instruidos
-- Agrega dias_semana como array JSON [1-7] y vuelve NOT NULL dias_disponibles

ALTER TABLE instruidos
ADD COLUMN dias_semana JSON NULL COMMENT 'Array de dias de la semana [1-7] (lunes=1, domingo=7)';

UPDATE instruidos
SET dias_disponibles = 5
WHERE dias_disponibles IS NULL OR dias_disponibles < 1 OR dias_disponibles > 7;

UPDATE instruidos
SET dias_semana = CASE dias_disponibles
    WHEN 1 THEN '[1]'
    WHEN 2 THEN '[1,2]'
    WHEN 3 THEN '[1,2,3]'
    WHEN 4 THEN '[1,2,3,4]'
    WHEN 5 THEN '[1,2,3,4,5]'
    WHEN 6 THEN '[1,2,3,4,5,6]'
    WHEN 7 THEN '[1,2,3,4,5,6,7]'
    ELSE '[1,2,3,4,5]'
END
WHERE dias_semana IS NULL;

ALTER TABLE instruidos
MODIFY dias_disponibles INT NOT NULL COMMENT 'Cantidad de dias disponibles (1-7)';

ALTER TABLE instruidos
MODIFY dias_semana JSON NOT NULL COMMENT 'Array de dias de la semana [1-7] (lunes=1, domingo=7)';

ALTER TABLE instruidos
ADD CONSTRAINT chk_instruidos_dias_semana_json CHECK (JSON_TYPE(dias_semana) = 'ARRAY');

ALTER TABLE instruidos
ADD CONSTRAINT chk_instruidos_dias_semana_rango CHECK (JSON_LENGTH(dias_semana) BETWEEN 1 AND 7);

ALTER TABLE instruidos
ADD CONSTRAINT chk_instruidos_dias_semana_valores CHECK (JSON_CONTAINS('[1,2,3,4,5,6,7]', dias_semana) = 1);

ALTER TABLE instruidos
ADD CONSTRAINT chk_instruidos_dias_coherencia CHECK (dias_disponibles = JSON_LENGTH(dias_semana));

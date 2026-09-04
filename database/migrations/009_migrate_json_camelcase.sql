-- Migracion 009: Normalizacion de claves JSON a camelCase
--
-- El contrato de API del backend Node y del motor Flask se estandarizo a camelCase.
-- Los campos JSON `ejercicios` y `dias_semana` de las tablas
-- `plantillas_entrenamiento` y `rutinas_asignadas` pueden contener claves antiguas
-- en snake_case que deben convertirse.
--
-- Debido a la complejidad de renombrar multiples claves dentro de arrays JSON en SQL,
-- esta migracion se ejecuta mediante el script Node:
--
--   cd backend-node
--   node src/scripts/migrate-json-camelcase.js
--
-- El script transforma:
--   ejercicios[].ejercicio_id      -> ejercicioId
--   ejercicios[].carga_kg          -> cargaKg
--   ejercicios[].descanso_segundos -> descansoSegundos
--   dias_semana[*].dia_semana      -> diaSemana

SELECT 'Ejecutar node src/scripts/migrate-json-camelcase.js para aplicar esta migracion' AS instruccion;

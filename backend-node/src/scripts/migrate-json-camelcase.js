/**
 * Migracion manual: convierte JSON almacenado en plantillas_entrenamiento y rutinas_asignadas
 * de snake_case a camelCase para alinearse con el contrato de API actual.
 *
 * Ejecucion:
 *   cd backend-node
 *   node src/scripts/migrate-json-camelcase.js
 */
require('dotenv').config();
const { sequelize } = require('../shared/database/connection');
const { PlantillaEntrenamiento, RutinaAsignada } = require('../modules/entrenamiento/entrenamiento.model');

const transformarEjercicios = (ejercicios) => {
  if (!Array.isArray(ejercicios)) return ejercicios;
  return ejercicios.map((ej) => {
    const nuevo = { ...ej };
    if ('ejercicio_id' in nuevo) {
      nuevo.ejercicioId = nuevo.ejercicio_id;
      delete nuevo.ejercicio_id;
    }
    if ('carga_kg' in nuevo) {
      nuevo.cargaKg = nuevo.carga_kg;
      delete nuevo.carga_kg;
    }
    if ('descanso_segundos' in nuevo) {
      nuevo.descansoSegundos = nuevo.descanso_segundos;
      delete nuevo.descanso_segundos;
    }
    return nuevo;
  });
};

const transformarDiasSemana = (diasSemana) => {
  if (!diasSemana || typeof diasSemana !== 'object') return diasSemana;
  const nuevo = {};
  for (const [dia, config] of Object.entries(diasSemana)) {
    nuevo[dia] = { ...config };
    if ('dia_semana' in nuevo[dia]) {
      nuevo[dia].diaSemana = nuevo[dia].dia_semana;
      delete nuevo[dia].dia_semana;
    }
  }
  return nuevo;
};

const procesarRegistros = async (Modelo, nombre) => {
  const registros = await Modelo.findAll();
  let actualizados = 0;

  for (const registro of registros) {
    const cambios = {};
    const ejercicios = registro.get('ejercicios');
    const diasSemana = registro.get('diasSemana');

    const ejerciciosTransformados = transformarEjercicios(ejercicios);
    const diasSemanaTransformados = transformarDiasSemana(diasSemana);

    if (JSON.stringify(ejerciciosTransformados) !== JSON.stringify(ejercicios)) {
      cambios.ejercicios = ejerciciosTransformados;
    }
    if (JSON.stringify(diasSemanaTransformados) !== JSON.stringify(diasSemana)) {
      cambios.diasSemana = diasSemanaTransformados;
    }

    if (Object.keys(cambios).length > 0) {
      await registro.update(cambios);
      actualizados += 1;
    }
  }

  console.log(`[${nombre}] ${actualizados} de ${registros.length} registros actualizados.`);
  return actualizados;
};

const main = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexion a MySQL establecida.');

    await procesarRegistros(PlantillaEntrenamiento, 'PlantillaEntrenamiento');
    await procesarRegistros(RutinaAsignada, 'RutinaAsignada');

    console.log('Migracion completada.');
  } catch (error) {
    console.error('Error durante la migracion:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

main();

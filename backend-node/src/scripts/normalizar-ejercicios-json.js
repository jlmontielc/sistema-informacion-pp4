require('dotenv').config();
const { sequelize } = require('../shared/database/connection');
const { PlantillaEntrenamiento, RutinaAsignada, Ejercicio } = require('../modules/entrenamiento/entrenamiento.model');
const {
  normalizarEjercicios,
  normalizarDiasSemana,
} = require('../modules/entrenamiento/ejercicios-normalizer');

async function normalizarTabla(Model, nombreTabla) {
  console.log(`Normalizando ${nombreTabla}...`);
  const registros = await Model.findAll();
  let actualizados = 0;

  for (const registro of registros) {
    const ejercicios = registro.ejercicios || [];
    const diasSemana = registro.diasSemana || {};

    const ejerciciosNormalizados = await normalizarEjercicios(ejercicios);
    const diasSemanaNormalizados = normalizarDiasSemana(diasSemana);

    const cambioEjercicios = JSON.stringify(ejercicios) !== JSON.stringify(ejerciciosNormalizados);
    const cambioDias = JSON.stringify(diasSemana) !== JSON.stringify(diasSemanaNormalizados);

    if (cambioEjercicios || cambioDias) {
      await registro.update({
        ejercicios: ejerciciosNormalizados,
        diasSemana: diasSemanaNormalizados,
      });
      actualizados += 1;
    }
  }

  console.log(`  ${actualizados} registros actualizados en ${nombreTabla}.`);
}

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a base de datos establecida.');

    await normalizarTabla(PlantillaEntrenamiento, 'plantillas_entrenamiento');
    await normalizarTabla(RutinaAsignada, 'rutinas_asignadas');

    console.log('Normalización completada.');
    process.exit(0);
  } catch (err) {
    console.error('Error durante la normalización:', err);
    process.exit(1);
  }
})();

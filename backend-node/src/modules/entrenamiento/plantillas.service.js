const { PlantillaEntrenamiento, Ejercicio } = require('./entrenamiento.model');
const { Op } = require('sequelize');
const { normalizarPayloadRutina, normalizarEjercicios, normalizarDiasSemana } = require('./ejercicios-normalizer');

const obtenerTodos = async (entrenadorId, filtros = {}) => {
  const where = {};
  if (!filtros.admin) {
    where.entrenadorId = entrenadorId;
  }
  if (filtros.tipo) where.tipo = filtros.tipo;
  if (filtros.objetivo) where.objetivo = filtros.objetivo;
  if (filtros.activa !== undefined) where.activa = filtros.activa === 'true';
  if (filtros.busqueda) {
    where.nombre = { [Op.like]: `%${filtros.busqueda}%` };
  }
  return PlantillaEntrenamiento.findAll({ where, order: [['createdAt', 'DESC']] });
};

const obtenerPorId = async (id, entrenadorId) =>
  PlantillaEntrenamiento.findOne({ where: { id, entrenadorId } });

const crear = async (datos, entrenadorId) => {
  const normalizados = await normalizarPayloadRutina(datos);
  return PlantillaEntrenamiento.create({ ...normalizados, entrenadorId });
};

const actualizar = async (id, datos, entrenadorId) => {
  const plantilla = await PlantillaEntrenamiento.findOne({ where: { id, entrenadorId } });
  if (!plantilla) return null;
  const normalizados = await normalizarPayloadRutina(datos);
  return plantilla.update(normalizados);
};

const eliminar = async (id, entrenadorId) => {
  const plantilla = await PlantillaEntrenamiento.findOne({ where: { id, entrenadorId } });
  if (!plantilla) return null;
  return plantilla.destroy();
};

const obtenerPorDia = async (id, dia, entrenadorId) => {
  const plantilla = await PlantillaEntrenamiento.findOne({ where: { id, entrenadorId } });
  if (!plantilla) return null;

  const ejerciciosNormalizados = await normalizarEjercicios(plantilla.ejercicios || []);
  const diasSemanaNormalizados = normalizarDiasSemana(plantilla.diasSemana || {});

  const ejerciciosDelDia = ejerciciosNormalizados
    .filter(e => e.dia === Number(dia))
    .sort((a, b) => a.orden - b.orden);

  return {
    plantillaId: plantilla.id,
    nombre: plantilla.nombre,
    dia: Number(dia),
    configuracionDia: diasSemanaNormalizados[String(dia)] || null,
    ejercicios: ejerciciosDelDia,
  };
};

const agregarEjercicioADia = async (id, dia, datos, entrenadorId) => {
  const plantilla = await PlantillaEntrenamiento.findOne({ where: { id, entrenadorId } });
  if (!plantilla) return null;

  if (!plantilla.diasSemana || !plantilla.diasSemana[String(dia)]) {
    const err = new Error(`El día ${dia} no está configurado en esta plantilla`);
    err.status = 400;
    throw err;
  }

  const ejercicio = await Ejercicio.findByPk(datos.ejercicioId);
  if (!ejercicio) {
    const err = new Error('Ejercicio no encontrado en el catálogo');
    err.status = 404;
    throw err;
  }

  const ejercicios = plantilla.ejercicios || [];
  const ejerciciosDelDia = ejercicios.filter(e => e.dia === Number(dia));

  const orden = datos.orden || (ejerciciosDelDia.length > 0
    ? Math.max(...ejerciciosDelDia.map(e => e.orden)) + 1
    : 1);

  const nuevoEjercicio = {
    ejercicioId: datos.ejercicioId,
    dia: Number(dia),
    orden,
    series: datos.series,
    repeticiones: datos.repeticiones,
    cargaKg: datos.cargaKg || null,
    descansoSegundos: datos.descansoSegundos || null,
    notas: datos.notas || '',
  };

  const [normalizado] = await normalizarEjercicios([nuevoEjercicio]);
  ejercicios.push(normalizado);
  await plantilla.update({ ejercicios });

  return normalizado;
};

const editarEjercicioEnDia = async (id, dia, idx, datos, entrenadorId) => {
  const plantilla = await PlantillaEntrenamiento.findOne({ where: { id, entrenadorId } });
  if (!plantilla) return null;

  const ejercicios = plantilla.ejercicios || [];
  const ejerciciosDelDia = ejercicios
    .map((e, i) => ({ ...e, _originalIdx: i }))
    .filter(e => e.dia === Number(dia))
    .sort((a, b) => a.orden - b.orden);

  if (idx < 0 || idx >= ejerciciosDelDia.length) {
    const err = new Error('Índice de ejercicio fuera de rango');
    err.status = 404;
    throw err;
  }

  if (datos.ejercicioId) {
    const ejercicio = await Ejercicio.findByPk(datos.ejercicioId);
    if (!ejercicio) {
      const err = new Error('Ejercicio no encontrado en el catálogo');
      err.status = 404;
      throw err;
    }
  }

  const ejercicioOriginal = ejerciciosDelDia[idx];
  const ejercicioActualizado = {
    ...ejercicioOriginal,
    ...datos,
    dia: Number(dia),
    orden: ejercicioOriginal.orden,
  };
  delete ejercicioActualizado._originalIdx;

  const [normalizado] = await normalizarEjercicios([ejercicioActualizado]);
  ejercicios[ejercicioOriginal._originalIdx] = normalizado;
  await plantilla.update({ ejercicios });

  return normalizado;
};

const eliminarEjercicioDeDia = async (id, dia, idx, entrenadorId) => {
  const plantilla = await PlantillaEntrenamiento.findOne({ where: { id, entrenadorId } });
  if (!plantilla) return null;

  const ejercicios = plantilla.ejercicios || [];
  const ejerciciosDelDia = ejercicios
    .map((e, i) => ({ ...e, _originalIdx: i }))
    .filter(e => e.dia === Number(dia))
    .sort((a, b) => a.orden - b.orden);

  if (idx < 0 || idx >= ejerciciosDelDia.length) {
    const err = new Error('Índice de ejercicio fuera de rango');
    err.status = 404;
    throw err;
  }

  const ejercicioAEliminar = ejerciciosDelDia[idx];
  ejercicios.splice(ejercicioAEliminar._originalIdx, 1);

  const ejerciciosRestantesDelDia = ejercicios
    .filter(e => e.dia === Number(dia))
    .sort((a, b) => a.orden - b.orden);

  ejerciciosRestantesDelDia.forEach((e, i) => {
    e.orden = i + 1;
  });

  const ejerciciosOtrosDias = ejercicios.filter(e => e.dia !== Number(dia));
  await plantilla.update({ ejercicios: [...ejerciciosOtrosDias, ...ejerciciosRestantesDelDia] });

  return { eliminado: true, ejercicio: ejercicioAEliminar };
};

const reordenarDia = async (id, dia, nuevoOrden, entrenadorId) => {
  const plantilla = await PlantillaEntrenamiento.findOne({ where: { id, entrenadorId } });
  if (!plantilla) return null;

  const ejercicios = plantilla.ejercicios || [];
  const ejerciciosDelDia = ejercicios
    .filter(e => e.dia === Number(dia))
    .sort((a, b) => a.orden - b.orden);

  if (nuevoOrden.length !== ejerciciosDelDia.length) {
    const err = new Error('El array de orden debe contener todos los ejercicios del día');
    err.status = 400;
    throw err;
  }

  const ejerciciosReordenados = nuevoOrden.map((orden, i) => ({
    ...ejerciciosDelDia[i],
    orden: orden || i + 1,
  }));

  const ejerciciosOtrosDias = ejercicios.filter(e => e.dia !== Number(dia));
  await plantilla.update({ ejercicios: [...ejerciciosOtrosDias, ...ejerciciosReordenados] });

  return ejerciciosReordenados.sort((a, b) => a.orden - b.orden);
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  obtenerPorDia,
  agregarEjercicioADia,
  editarEjercicioEnDia,
  eliminarEjercicioDeDia,
  reordenarDia,
};

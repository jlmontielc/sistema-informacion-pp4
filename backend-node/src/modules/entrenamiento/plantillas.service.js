const { PlantillaEntrenamiento, Ejercicio } = require('./entrenamiento.model');
const { Op } = require('sequelize');

const obtenerTodos = async (entrenadorId, filtros = {}) => {
  const where = { entrenadorId };
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

const crear = async (datos, entrenadorId) =>
  PlantillaEntrenamiento.create({ ...datos, entrenadorId });

const actualizar = async (id, datos, entrenadorId) => {
  const plantilla = await PlantillaEntrenamiento.findOne({ where: { id, entrenadorId } });
  if (!plantilla) return null;
  return plantilla.update(datos);
};

const eliminar = async (id, entrenadorId) => {
  const plantilla = await PlantillaEntrenamiento.findOne({ where: { id, entrenadorId } });
  if (!plantilla) return null;
  return plantilla.destroy();
};

const obtenerPorDia = async (id, dia, entrenadorId) => {
  const plantilla = await PlantillaEntrenamiento.findOne({ where: { id, entrenadorId } });
  if (!plantilla) return null;

  const ejerciciosDelDia = (plantilla.ejercicios || [])
    .filter(e => e.dia === Number(dia))
    .sort((a, b) => a.orden - b.orden);

  return {
    plantilla_id: plantilla.id,
    nombre: plantilla.nombre,
    dia: Number(dia),
    configuracion_dia: plantilla.diasSemana?.[String(dia)] || null,
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

  const ejercicio = await Ejercicio.findByPk(datos.ejercicio_id);
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
    ejercicio_id: datos.ejercicio_id,
    dia: Number(dia),
    orden,
    series: datos.series,
    repeticiones: datos.repeticiones,
    carga_kg: datos.carga_kg || null,
    descanso_segundos: datos.descanso_segundos || null,
    notas: datos.notas || '',
  };

  ejercicios.push(nuevoEjercicio);
  await plantilla.update({ ejercicios });

  return nuevoEjercicio;
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

  if (datos.ejercicio_id) {
    const ejercicio = await Ejercicio.findByPk(datos.ejercicio_id);
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

  ejercicios[ejercicioOriginal._originalIdx] = ejercicioActualizado;
  await plantilla.update({ ejercicios });

  return ejercicioActualizado;
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
    const err = new Error('El数组 de orden debe contener todos los ejercicios del día');
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

const { RutinaAsignada, PlantillaEntrenamiento, Ejercicio, Instruido } = require('./entrenamiento.model');
const { Op } = require('sequelize');

const obtenerTodos = async (entrenadorId, filtros = {}) => {
  const where = { entrenadorId };
  if (filtros.instruidoId) where.instruidoId = filtros.instruidoId;
  if (filtros.activa !== undefined) where.activa = filtros.activa === 'true';
  if (filtros.propias === 'true' && filtros.instruidoIdActual) {
    where.instruidoId = filtros.instruidoIdActual;
  }
  return RutinaAsignada.findAll({
    where,
    include: [{ model: Instruido, attributes: ['id', 'nombre'] }],
    order: [['createdAt', 'DESC']],
  });
};

const obtenerPorId = async (id, entrenadorId) =>
  RutinaAsignada.findOne({
    where: { id, entrenadorId },
    include: [{ model: Instruido, attributes: ['id', 'nombre'] }],
  });

const obtenerPorIdPropio = async (id, instruidoId) =>
  RutinaAsignada.findOne({
    where: { id, instruidoId },
  });

const crear = async (datos, entrenadorId) => {
  const instruido = await Instruido.findOne({ where: { id: datos.cliente_id || datos.instruidoId, entrenadorId } });
  if (!instruido) {
    const err = new Error('Instruido no encontrado o no pertenece al entrenador');
    err.status = 404;
    throw err;
  }
  const datosCrear = { ...datos, entrenadorId };
  if (datos.cliente_id) {
    datosCrear.instruidoId = datos.cliente_id;
    delete datosCrear.cliente_id;
  }
  return RutinaAsignada.create(datosCrear);
};

const actualizar = async (id, datos, entrenadorId) => {
  const rutina = await RutinaAsignada.findOne({ where: { id, entrenadorId } });
  if (!rutina) return null;
  if (datos.instruidoId || datos.cliente_id) {
    const clienteId = datos.cliente_id || datos.instruidoId;
    const instruido = await Instruido.findOne({ where: { id: clienteId, entrenadorId } });
    if (!instruido) {
      const err = new Error('Instruido no encontrado');
      err.status = 404;
      throw err;
    }
  }
  const datosActualizar = { ...datos };
  if (datos.cliente_id) {
    datosActualizar.instruidoId = datos.cliente_id;
    delete datosActualizar.cliente_id;
  }
  return rutina.update(datosActualizar);
};

const eliminar = async (id, entrenadorId) => {
  const rutina = await RutinaAsignada.findOne({ where: { id, entrenadorId } });
  if (!rutina) return null;
  return rutina.update({ activa: false });
};

const clonarDesdePlantilla = async (plantillaId, datos, entrenadorId) => {
  const plantilla = await PlantillaEntrenamiento.findOne({
    where: { id: plantillaId, entrenadorId },
  });
  if (!plantilla) {
    const err = new Error('Plantilla no encontrada');
    err.status = 404;
    throw err;
  }

  const instruido = await Instruido.findOne({
    where: { id: datos.instruido_id, entrenadorId },
  });
  if (!instruido) {
    const err = new Error('Instruido no encontrado o no pertenece al entrenador');
    err.status = 404;
    throw err;
  }

  const rutinaCreada = await RutinaAsignada.create({
    instruidoId: datos.instruido_id,
    plantillaOrigenId: plantillaId,
    entrenadorId,
    nombre: plantilla.nombre,
    tipo: plantilla.tipo,
    ejercicios: plantilla.ejercicios,
    diasSemana: plantilla.diasSemana,
    frecuenciaSemanal: plantilla.frecuenciaSemanal,
    duracionSemanas: plantilla.duracionSemanas,
    observaciones: datos.observaciones || '',
    fechaInicio: datos.fecha_inicio || null,
    personalizadaPorEntrenador: false,
  });

  return rutinaCreada;
};

const obtenerPorDia = async (id, dia, entrenadorId, instruidoId = null) => {
  let rutina;
  if (instruidoId) {
    rutina = await RutinaAsignada.findOne({ where: { id, instruidoId } });
  } else {
    rutina = await RutinaAsignada.findOne({ where: { id, entrenadorId } });
  }
  if (!rutina) return null;

  const ejerciciosDelDia = (rutina.ejercicios || [])
    .filter(e => e.dia === Number(dia))
    .sort((a, b) => a.orden - b.orden);

  return {
    rutina_id: rutina.id,
    nombre: rutina.nombre,
    dia: Number(dia),
    configuracion_dia: rutina.diasSemana?.[String(dia)] || null,
    ejercicios: ejerciciosDelDia,
  };
};

const obtenerResumenSemanal = async (id, entrenadorId, instruidoId = null) => {
  let rutina;
  if (instruidoId) {
    rutina = await RutinaAsignada.findOne({ where: { id, instruidoId } });
  } else {
    rutina = await RutinaAsignada.findOne({ where: { id, entrenadorId } });
  }
  if (!rutina) return null;

  const ejercicios = rutina.ejercicios || [];
  const diasSemana = rutina.diasSemana || {};

  const resumenDias = {};

  for (const [slot, config] of Object.entries(diasSemana)) {
    const ejerciciosDia = ejercicios
      .filter(e => e.dia === Number(slot))
      .sort((a, b) => a.orden - b.orden);

    resumenDias[slot] = {
      dia_semana: config.dia_semana,
      nombre: config.nombre,
      total_ejercicios: ejerciciosDia.length,
      ejercicios: ejerciciosDia,
    };
  }

  return {
    rutina_id: rutina.id,
    nombre: rutina.nombre,
    tipo: rutina.tipo,
    frecuencia_semanal: rutina.frecuenciaSemanal,
    total_ejercicios: ejercicios.length,
    configuracion_dias: diasSemana,
    dias: resumenDias,
  };
};

const agregarEjercicioADia = async (id, dia, datos, entrenadorId) => {
  const rutina = await RutinaAsignada.findOne({ where: { id, entrenadorId } });
  if (!rutina) return null;

  if (!rutina.diasSemana || !rutina.diasSemana[String(dia)]) {
    const err = new Error(`El día ${dia} no está configurado en esta rutina`);
    err.status = 400;
    throw err;
  }

  const ejercicio = await Ejercicio.findByPk(datos.ejercicio_id);
  if (!ejercicio) {
    const err = new Error('Ejercicio no encontrado en el catálogo');
    err.status = 404;
    throw err;
  }

  const ejercicios = rutina.ejercicios || [];
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
  await rutina.update({ ejercicios });

  return nuevoEjercicio;
};

const editarEjercicioEnDia = async (id, dia, idx, datos, entrenadorId) => {
  const rutina = await RutinaAsignada.findOne({ where: { id, entrenadorId } });
  if (!rutina) return null;

  const ejercicios = rutina.ejercicios || [];
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
  await rutina.update({ ejercicios });

  return ejercicioActualizado;
};

const eliminarEjercicioDeDia = async (id, dia, idx, entrenadorId) => {
  const rutina = await RutinaAsignada.findOne({ where: { id, entrenadorId } });
  if (!rutina) return null;

  const ejercicios = rutina.ejercicios || [];
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
  await rutina.update({ ejercicios: [...ejerciciosOtrosDias, ...ejerciciosRestantesDelDia] });

  return { eliminado: true, ejercicio: ejercicioAEliminar };
};

const reordenarDia = async (id, dia, nuevoOrden, entrenadorId) => {
  const rutina = await RutinaAsignada.findOne({ where: { id, entrenadorId } });
  if (!rutina) return null;

  const ejercicios = rutina.ejercicios || [];
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
  await rutina.update({ ejercicios: [...ejerciciosOtrosDias, ...ejerciciosReordenados] });

  return ejerciciosReordenados.sort((a, b) => a.orden - b.orden);
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  obtenerPorIdPropio,
  crear,
  actualizar,
  eliminar,
  clonarDesdePlantilla,
  obtenerPorDia,
  obtenerResumenSemanal,
  agregarEjercicioADia,
  editarEjercicioEnDia,
  eliminarEjercicioDeDia,
  reordenarDia,
};

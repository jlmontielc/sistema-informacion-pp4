const { RutinaAsignada, PlantillaEntrenamiento, Ejercicio } = require('./entrenamiento.model');
const { Instruido } = require('../instruidos/instruido.model');
const { Op } = require('sequelize');
const { normalizarPayloadRutina, normalizarEjercicios, normalizarDiasSemana } = require('./ejercicios-normalizer');

const esAdmin = (usuario) => usuario && usuario.rol === 'administrador';

const wherePorUsuario = (usuario) => (esAdmin(usuario) ? {} : { entrenadorId: usuario.id });

const obtenerTodos = async (entrenadorId, filtros = {}) => {
  const where = {};
  where.eliminado = false;
  const admin = filtros.admin === true;
  const propias = filtros.propias === true || filtros.propias === 'true';
  if (!admin && !propias) {
    where.entrenadorId = entrenadorId;
  }
  if (filtros.instruidoId) where.instruidoId = Number(filtros.instruidoId);
  if (filtros.activa !== undefined) where.activa = filtros.activa === 'true' || filtros.activa === true;
  if (filtros.ia === 'true' || filtros.ia === true) {
    where.activa = false;
    where.personalizadaPorEntrenador = false;
  }
  return RutinaAsignada.findAll({
    where,
    include: [{ model: Instruido, attributes: ['id', 'nombre'] }],
    order: [['createdAt', 'DESC']],
  });
};

const obtenerPorId = async (id, usuario) =>
  RutinaAsignada.findOne({
    where: { id, ...wherePorUsuario(usuario) },
    include: [{ model: Instruido, attributes: ['id', 'nombre'] }],
  });

const obtenerPorIdPropio = async (id, instruidoId) =>
  RutinaAsignada.findOne({
    where: { id, instruidoId },
  });

const crear = async (datos, entrenadorId) => {
  const instruido = await Instruido.findOne({ where: { id: datos.instruidoId, entrenadorId } });
  if (!instruido) {
    const err = new Error('Instruido no encontrado o no pertenece al entrenador');
    err.status = 404;
    throw err;
  }
  const normalizados = await normalizarPayloadRutina(datos);
  const datosFinales = {
    ejercicios: [],
    diasSemana: {},
    frecuenciaSemanal: 3,
    ...normalizados,
    entrenadorId,
  };
  return RutinaAsignada.create(datosFinales);
};

const actualizar = async (id, datos, usuario) => {
  const rutina = await RutinaAsignada.findOne({ where: { id, ...wherePorUsuario(usuario) } });
  if (!rutina) return null;
  if (datos.instruidoId) {
    const whereInstruido = { id: datos.instruidoId };
    if (!esAdmin(usuario)) whereInstruido.entrenadorId = usuario.id;
    const instruido = await Instruido.findOne({ where: whereInstruido });
    if (!instruido) {
      const err = new Error('Instruido no encontrado');
      err.status = 404;
      throw err;
    }
  }
  const normalizados = await normalizarPayloadRutina(datos);
  return rutina.update(normalizados);
};

const eliminar = async (id, usuario) => {
  const where = usuario.rol === 'administrador' ? { id } : { id, entrenadorId: usuario.id };
  const rutina = await RutinaAsignada.findOne({ where });
  if (!rutina) {
    const err = new Error('Rutina no encontrada');
    err.status = 404;
    throw err;
  }
  return rutina.update({ eliminado: true });
};

const clonarDesdePlantilla = async (plantillaId, datos, usuario) => {
  const plantilla = await PlantillaEntrenamiento.findOne({
    where: { id: plantillaId, ...wherePorUsuario(usuario) },
  });
  if (!plantilla) {
    const err = new Error('Plantilla no encontrada');
    err.status = 404;
    throw err;
  }

  const whereInstruido = { id: datos.instruidoId };
  if (!esAdmin(usuario)) whereInstruido.entrenadorId = usuario.id;
  const instruido = await Instruido.findOne({ where: whereInstruido });
  if (!instruido) {
    const err = new Error('Instruido no encontrado o no pertenece al entrenador');
    err.status = 404;
    throw err;
  }

  const ejerciciosNormalizados = await normalizarEjercicios(plantilla.ejercicios || []);
  const diasSemanaNormalizados = normalizarDiasSemana(plantilla.diasSemana || {});

  const rutinaCreada = await RutinaAsignada.create({
    instruidoId: datos.instruidoId,
    plantillaOrigenId: plantillaId,
    entrenadorId: usuario.id,
    nombre: plantilla.nombre,
    tipo: plantilla.tipo,
    ejercicios: ejerciciosNormalizados,
    diasSemana: diasSemanaNormalizados,
    frecuenciaSemanal: plantilla.frecuenciaSemanal || 3,
    duracionSemanas: plantilla.duracionSemanas,
    observaciones: datos.observaciones || '',
    fechaInicio: datos.fechaInicio || null,
    personalizadaPorEntrenador: false,
  });

  return rutinaCreada;
};

const obtenerPorDia = async (id, dia, usuario, instruidoId = null) => {
  let rutina;
  if (instruidoId) {
    rutina = await RutinaAsignada.findOne({ where: { id, instruidoId } });
  } else {
    rutina = await RutinaAsignada.findOne({ where: { id, ...wherePorUsuario(usuario) } });
  }
  if (!rutina) return null;

  const ejerciciosNormalizados = await normalizarEjercicios(rutina.ejercicios || []);
  const diasSemanaNormalizados = normalizarDiasSemana(rutina.diasSemana || {});

  const ejerciciosDelDia = ejerciciosNormalizados
    .filter(e => e.dia === Number(dia))
    .sort((a, b) => a.orden - b.orden);

  return {
    rutinaId: rutina.id,
    nombre: rutina.nombre,
    dia: Number(dia),
    configuracionDia: diasSemanaNormalizados[String(dia)] || null,
    ejercicios: ejerciciosDelDia,
  };
};

const obtenerResumenSemanal = async (id, usuario, instruidoId = null) => {
  let rutina;
  if (instruidoId) {
    rutina = await RutinaAsignada.findOne({ where: { id, instruidoId } });
  } else {
    rutina = await RutinaAsignada.findOne({ where: { id, ...wherePorUsuario(usuario) } });
  }
  if (!rutina) return null;

  const ejercicios = await normalizarEjercicios(rutina.ejercicios || []);
  const diasSemana = normalizarDiasSemana(rutina.diasSemana || {});

  const resumenDias = {};

  for (const [slot, config] of Object.entries(diasSemana)) {
    const ejerciciosDia = ejercicios
      .filter(e => e.dia === Number(slot))
      .sort((a, b) => a.orden - b.orden);

    resumenDias[slot] = {
      diaSemana: config.diaSemana,
      nombre: config.nombre,
      totalEjercicios: ejerciciosDia.length,
      ejercicios: ejerciciosDia,
    };
  }

  return {
    rutinaId: rutina.id,
    nombre: rutina.nombre,
    tipo: rutina.tipo,
    frecuenciaSemanal: rutina.frecuenciaSemanal,
    totalEjercicios: ejercicios.length,
    configuracionDias: diasSemana,
    dias: resumenDias,
  };
};

const agregarEjercicioADia = async (id, dia, datos, usuario) => {
  const rutina = await RutinaAsignada.findOne({ where: { id, ...wherePorUsuario(usuario) } });
  if (!rutina) return null;

  if (!rutina.diasSemana || !rutina.diasSemana[String(dia)]) {
    const err = new Error(`El día ${dia} no está configurado en esta rutina`);
    err.status = 400;
    throw err;
  }

  const ejercicio = await Ejercicio.findByPk(datos.ejercicioId);
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
  await rutina.update({ ejercicios });

  return normalizado;
};

const editarEjercicioEnDia = async (id, dia, idx, datos, usuario) => {
  const rutina = await RutinaAsignada.findOne({ where: { id, ...wherePorUsuario(usuario) } });
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
  await rutina.update({ ejercicios });

  return normalizado;
};

const eliminarEjercicioDeDia = async (id, dia, idx, usuario) => {
  const rutina = await RutinaAsignada.findOne({ where: { id, ...wherePorUsuario(usuario) } });
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

const reordenarDia = async (id, dia, nuevoOrden, usuario) => {
  const rutina = await RutinaAsignada.findOne({ where: { id, ...wherePorUsuario(usuario) } });
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

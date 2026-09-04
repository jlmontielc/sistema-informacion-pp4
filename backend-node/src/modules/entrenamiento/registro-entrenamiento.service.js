const { RegistroEntrenamiento, RutinaAsignada, Ejercicio } = require('./entrenamiento.model');
const { SerieEjecutada } = require('./series-ejecutadas.model');
const { Instruido } = require('../instruidos/instruido.model');
const { Op } = require('sequelize');
const { normalizarEjercicios } = require('./ejercicios-normalizer');

const ESTADOS = {
  EN_PROGRESO: 'en_progreso',
  COMPLETADO: 'completado',
  CANCELADO: 'cancelado',
};

const calcularDuracionMinutos = (fechaInicio, fechaFin) => {
  if (!fechaInicio || !fechaFin) return null;
  const diffMs = new Date(fechaFin).getTime() - new Date(fechaInicio).getTime();
  return Math.max(0, Math.round(diffMs / 60000));
};

const _verificarAcceso = async (registro, usuario) => {
  if (!registro) return false;
  if (usuario.rol === 'administrador') return true;
  if (usuario.rol === 'instruido') {
    return Number(registro.instruidoId) === Number(usuario.id);
  }
  if (usuario.rol === 'entrenador') {
    const rutina = await RutinaAsignada.findByPk(registro.rutinaAsignadaId, {
      attributes: ['entrenadorId'],
    });
    return rutina && Number(rutina.entrenadorId) === Number(usuario.id);
  }
  return false;
};

const _verificarAccesoRutina = async (rutina, usuario, instruidoId = null) => {
  if (!rutina) return false;
  if (usuario.rol === 'administrador') return true;
  if (usuario.rol === 'instruido') {
    return Number(rutina.instruidoId) === Number(usuario.id);
  }
  if (usuario.rol === 'entrenador') {
    if (instruidoId && Number(rutina.instruidoId) !== Number(instruidoId)) return false;
    const instruido = await Instruido.findByPk(rutina.instruidoId, {
      attributes: ['entrenadorId'],
    });
    return instruido && Number(instruido.entrenadorId) === Number(usuario.id);
  }
  return false;
};

const _ejercicioPerteneceARutina = (rutina, ejercicioId) => {
  if (!rutina || !Array.isArray(rutina.ejercicios)) return false;
  return rutina.ejercicios.some(
    (ej) => Number(ej.ejercicioId) === Number(ejercicioId),
  );
};

const _recalcularResumen = async (registro) => {
  const series = await SerieEjecutada.findAll({
    where: { registroEntrenamientoId: registro.id },
  });

  const porEjercicio = {};
  let volumenTotal = 0;

  series.forEach((s) => {
    const volumenSerie = Number(s.pesoKg) * Number(s.repeticionesRealizadas);
    volumenTotal += volumenSerie;
    const id = s.ejercicioId;
    if (!porEjercicio[id]) {
      porEjercicio[id] = { series: 0, repeticiones: 0, volumen: 0 };
    }
    porEjercicio[id].series += 1;
    porEjercicio[id].repeticiones += Number(s.repeticionesRealizadas);
    porEjercicio[id].volumen = Number((porEjercicio[id].volumen + volumenSerie).toFixed(2));
  });

  return { volumenTotal: Number(volumenTotal.toFixed(2)), porEjercicio };
};

const obtenerTodos = async (usuario, filtros = {}) => {
  if (usuario.rol === 'instruido') {
    return RegistroEntrenamiento.findAll({
      where: { instruidoId: usuario.id },
      order: [['fechaInicio', 'DESC']],
    });
  }

  const where = {};
  if (filtros.instruidoId) where.instruidoId = filtros.instruidoId;
  if (filtros.rutinaId) where.rutinaAsignadaId = filtros.rutinaId;
  if (filtros.estado) where.estado = filtros.estado;
  if (filtros.desde || filtros.hasta) {
    where.fechaInicio = {};
    if (filtros.desde) where.fechaInicio[Op.gte] = new Date(filtros.desde);
    if (filtros.hasta) where.fechaInicio[Op.lte] = new Date(filtros.hasta);
  }

  if (usuario.rol === 'entrenador') {
    const rutinas = await RutinaAsignada.findAll({
      where: { entrenadorId: usuario.id },
      attributes: ['id'],
    });
    const rutinaIds = rutinas.map((r) => r.id);
    if (!rutinaIds.length) return [];
    where.rutinaAsignadaId = { [Op.in]: rutinaIds };
  }

  return RegistroEntrenamiento.findAll({
    where,
    order: [['fechaInicio', 'DESC']],
  });
};

const obtenerPorId = async (id, usuario, opciones = {}) => {
  const include = [];
  if (opciones.incluirSeries) {
    include.push({ model: SerieEjecutada, as: 'series', include: [{ model: Ejercicio, as: 'ejercicio' }] });
  }

  const registro = await RegistroEntrenamiento.findByPk(id, { include });
  if (!registro) return null;

  const tieneAcceso = await _verificarAcceso(registro, usuario);
  if (!tieneAcceso) return null;

  return registro;
};

const crear = async (usuario, datos) => {
  const registroDatos = { ...datos };

  if (usuario.rol === 'instruido') {
    registroDatos.instruidoId = usuario.id;
  } else if (usuario.rol === 'entrenador') {
    if (!registroDatos.instruidoId) {
      const err = new Error('instruidoId es requerido para registrar el entrenamiento');
      err.status = 400;
      throw err;
    }
    const pertenece = await Instruido.findOne({
      where: { id: registroDatos.instruidoId, entrenadorId: usuario.id },
    });
    if (!pertenece) {
      const err = new Error('Instruido no encontrado o no pertenece al entrenador');
      err.status = 404;
      throw err;
    }
  }

  if (!registroDatos.fecha) {
    registroDatos.fecha = new Date();
  }
  if (!registroDatos.estado) {
    registroDatos.estado = ESTADOS.EN_PROGRESO;
  }
  if (!registroDatos.fechaInicio) {
    registroDatos.fechaInicio = new Date();
  }

  return RegistroEntrenamiento.create(registroDatos);
};

const iniciar = async (usuario, datos) => {
  const { rutinaAsignadaId, instruidoId, observaciones } = datos;

  let idInstruidoFinal = instruidoId;

  if (usuario.rol === 'instruido') {
    idInstruidoFinal = usuario.id;
  } else if (usuario.rol === 'entrenador') {
    if (!idInstruidoFinal) {
      const err = new Error('instruidoId es requerido para iniciar el entrenamiento');
      err.status = 400;
      throw err;
    }
    const pertenece = await Instruido.findOne({
      where: { id: idInstruidoFinal, entrenadorId: usuario.id },
    });
    if (!pertenece) {
      const err = new Error('Instruido no encontrado o no pertenece al entrenador');
      err.status = 404;
      throw err;
    }
  }

  const whereRutina = { id: rutinaAsignadaId };
  if (idInstruidoFinal) whereRutina.instruidoId = idInstruidoFinal;

  const rutina = await RutinaAsignada.findOne({ where: whereRutina });
  if (!rutina) {
    const err = new Error('Rutina asignada no encontrada');
    err.status = 404;
    throw err;
  }

  const tieneAcceso = await _verificarAccesoRutina(rutina, usuario, idInstruidoFinal);
  if (!tieneAcceso) {
    const err = new Error('No tienes permiso para iniciar esta rutina');
    err.status = 403;
    throw err;
  }

  const ahora = new Date();
  return RegistroEntrenamiento.create({
    rutinaAsignadaId,
    instruidoId: rutina.instruidoId,
    fecha: ahora,
    estado: ESTADOS.EN_PROGRESO,
    fechaInicio: ahora,
    observaciones: observaciones || null,
  });
};

const _obtenerRegistroEditable = async (registroId, usuario) => {
  const registro = await obtenerPorId(registroId, usuario);
  if (!registro) {
    const err = new Error('Registro no encontrado');
    err.status = 404;
    throw err;
  }
  if (registro.estado !== ESTADOS.EN_PROGRESO) {
    const err = new Error('No se pueden modificar series de una sesión que no está en progreso');
    err.status = 400;
    throw err;
  }
  return registro;
};

const crearSerie = async (registroId, usuario, datos) => {
  const registro = await _obtenerRegistroEditable(registroId, usuario);

  const rutina = await RutinaAsignada.findByPk(registro.rutinaAsignadaId, {
    attributes: ['id', 'ejercicios'],
  });

  const ejerciciosNormalizados = await normalizarEjercicios(rutina?.ejercicios || []);

  if (!_ejercicioPerteneceARutina({ ejercicios: ejerciciosNormalizados }, datos.ejercicioId)) {
    const err = new Error('El ejercicio no pertenece a la rutina asignada');
    err.status = 400;
    throw err;
  }

  return SerieEjecutada.create({
    registroEntrenamientoId: registro.id,
    ...datos,
  });
};

const listarSeries = async (registroId, usuario) => {
  const registro = await obtenerPorId(registroId, usuario);
  if (!registro) {
    const err = new Error('Registro no encontrado');
    err.status = 404;
    throw err;
  }

  return SerieEjecutada.findAll({
    where: { registroEntrenamientoId: registro.id },
    include: [{ model: Ejercicio, as: 'ejercicio', attributes: ['id', 'nombre', 'grupoMuscular'] }],
    order: [
      ['ejercicioId', 'ASC'],
      ['numeroSerie', 'ASC'],
    ],
  });
};

const editarSerie = async (registroId, serieId, usuario, datos) => {
  const registro = await _obtenerRegistroEditable(registroId, usuario);

  const serie = await SerieEjecutada.findOne({
    where: { id: serieId, registroEntrenamientoId: registro.id },
  });
  if (!serie) {
    const err = new Error('Serie no encontrada');
    err.status = 404;
    throw err;
  }

  if (datos.ejercicioId && Number(datos.ejercicioId) !== Number(serie.ejercicioId)) {
    const rutina = await RutinaAsignada.findByPk(registro.rutinaAsignadaId, {
      attributes: ['id', 'ejercicios'],
    });
    const ejerciciosNormalizados = await normalizarEjercicios(rutina?.ejercicios || []);
    if (!_ejercicioPerteneceARutina({ ejercicios: ejerciciosNormalizados }, datos.ejercicioId)) {
      const err = new Error('El ejercicio no pertenece a la rutina asignada');
      err.status = 400;
      throw err;
    }
  }

  const camposActualizar = {};
  if (datos.ejercicioId !== undefined) camposActualizar.ejercicioId = datos.ejercicioId;
  if (datos.numeroSerie !== undefined) camposActualizar.numeroSerie = datos.numeroSerie;
  if (datos.repeticionesRealizadas !== undefined) camposActualizar.repeticionesRealizadas = datos.repeticionesRealizadas;
  if (datos.pesoKg !== undefined) camposActualizar.pesoKg = datos.pesoKg;
  if (datos.descansoSegundos !== undefined) camposActualizar.descansoSegundos = datos.descansoSegundos;
  if (datos.rpe !== undefined) camposActualizar.rpe = datos.rpe;
  if (datos.notas !== undefined) camposActualizar.notas = datos.notas;

  await serie.update(camposActualizar);
  return serie;
};

const eliminarSerie = async (registroId, serieId, usuario) => {
  const registro = await _obtenerRegistroEditable(registroId, usuario);

  const serie = await SerieEjecutada.findOne({
    where: { id: serieId, registroEntrenamientoId: registro.id },
  });
  if (!serie) {
    const err = new Error('Serie no encontrada');
    err.status = 404;
    throw err;
  }

  await serie.destroy();
  return { message: 'Serie eliminada correctamente' };
};

const finalizar = async (registroId, usuario, datos = {}) => {
  const registro = await obtenerPorId(registroId, usuario);
  if (!registro) {
    const err = new Error('Registro no encontrado');
    err.status = 404;
    throw err;
  }
  if (registro.estado !== ESTADOS.EN_PROGRESO) {
    const err = new Error('La sesión ya fue finalizada o cancelada');
    err.status = 400;
    throw err;
  }

  const fechaFin = new Date();
  let duracionMinutos = datos.duracionMinutos;
  if (duracionMinutos === undefined || duracionMinutos === null) {
    duracionMinutos = calcularDuracionMinutos(registro.fechaInicio, fechaFin);
  }

  const { volumenTotal, porEjercicio } = await _recalcularResumen(registro);
  const resumen = { volumenTotal, porEjercicio };
  const observacionesBase = datos.observaciones !== undefined ? datos.observaciones : (registro.observaciones || '');
  const observaciones = observacionesBase
    ? `${observacionesBase}\nResumen: ${JSON.stringify(resumen)}`
    : `Resumen: ${JSON.stringify(resumen)}`;

  await registro.update({
    estado: ESTADOS.COMPLETADO,
    fechaFin,
    duracionMinutos,
    observaciones,
  });

  return registro;
};

const cancelar = async (registroId, usuario, datos = {}) => {
  const registro = await obtenerPorId(registroId, usuario);
  if (!registro) {
    const err = new Error('Registro no encontrado');
    err.status = 404;
    throw err;
  }
  if (registro.estado !== ESTADOS.EN_PROGRESO) {
    const err = new Error('Solo se pueden cancelar sesiones en progreso');
    err.status = 400;
    throw err;
  }

  const observaciones = datos.observaciones !== undefined
    ? datos.observaciones
    : registro.observaciones;

  await registro.update({
    estado: ESTADOS.CANCELADO,
    fechaFin: new Date(),
    observaciones,
  });

  return registro;
};

const eliminar = async (id, usuario) => {
  const registro = await obtenerPorId(id, usuario);
  if (!registro) return null;
  await registro.destroy();
  return registro;
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  crear,
  iniciar,
  crearSerie,
  listarSeries,
  editarSerie,
  eliminarSerie,
  finalizar,
  cancelar,
  eliminar,
};

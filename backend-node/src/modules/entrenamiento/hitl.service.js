const { Op } = require('sequelize');
const { Instruido } = require('../instruidos/instruido.model');
const { PerfilMedico } = require('../instruidos/perfil-medico.model');
const { RegistroEntrenamiento, RutinaAsignada, PlantillaEntrenamiento } = require('./entrenamiento.model');
const { HitlFeedback } = require('./hitl-feedback.model');
const { CalculoMetabolico } = require('../metabolismo/metabolismo.model');
const {
  httpRequest,
  descifrarSeguro,
  parsearCampoJson,
  CAMPOS_SENSIBLES,
} = require('../../shared/utils/flask-client');

const descifrarCampos = (registro) => {
  if (!registro) return registro;
  const datos = registro.toJSON ? registro.toJSON() : { ...registro };
  for (const campo of CAMPOS_SENSIBLES) {
    if (datos[campo]) {
      datos[campo] = descifrarSeguro(datos[campo]);
    }
  }
  return datos;
};

const persistRoutineFromPrediction = async (clienteId, entrenadorId, resultado) => {
  if (!resultado || !resultado.success) return null;
  const plantillaId = resultado.plantillaId;
  if (plantillaId == null) return null;

  const plantilla = await PlantillaEntrenamiento.findByPk(plantillaId);
  if (!plantilla) return null;

  await RutinaAsignada.update(
    { activa: false },
    { where: { instruidoId: clienteId, activa: true } },
  );

  const metadataRecomendacion = {
    plantillaId,
    confianza: resultado.confianza,
    explicacion: resultado.explicacion || null,
    advertencia: resultado.advertencia || null,
    hasLesiones: resultado.hasLesiones || false,
    lesionesDetalle: resultado.lesionesDetalle || [],
    metadata: resultado.metadata || {},
  };

  return RutinaAsignada.create({
    instruidoId: clienteId,
    entrenadorId,
    plantillaOrigenId: plantillaId,
    nombre: `IA - ${plantilla.nombre}`,
    tipo: plantilla.tipo,
    ejercicios: plantilla.ejercicios,
    diasSemana: plantilla.diasSemana,
    frecuenciaSemanal: plantilla.frecuenciaSemanal,
    duracionSemanas: plantilla.duracionSemanas,
    observaciones: JSON.stringify(metadataRecomendacion),
    personalizadaPorEntrenador: false,
    decision: 'pendiente',
    activa: false,
  });
};

const sugerirRutina = async (clienteId, entrenadorId, preferencias = {}, opts = { persistir: true }) => {
  const instruido = await Instruido.findOne({
    where: { id: clienteId, entrenadorId },
  });
  if (!instruido) {
    const err = new Error('Instruido no encontrado o no pertenece al entrenador');
    err.status = 404;
    throw err;
  }

  const perfilMedicoRaw = await PerfilMedico.findOne({
    where: { instruidoId: clienteId },
  });
  const perfilDescifrado = perfilMedicoRaw ? descifrarCampos(perfilMedicoRaw) : null;

  const historial = await RegistroEntrenamiento.findAll({
    where: { instruidoId: clienteId },
    order: [['fecha', 'DESC']],
    limit: 20,
  });

  const historialFormateado = historial.map(reg => ({
    fecha: reg.fecha,
    ejerciciosRealizados: reg.ejerciciosRealizados,
    percepcionEsfuerzo: reg.percepcionEsfuerzo,
    duracionMinutos: reg.duracionMinutos,
  }));

  const plantillas = await PlantillaEntrenamiento.findAll({
    where: { entrenadorId, activa: true },
    attributes: ['id', 'nombre', 'tipo', 'objetivo', 'nivelDificultad', 'frecuenciaSemanal', 'duracionSemanas', 'diasSemana'],
    order: [['nombre', 'ASC']],
  });

  const plantillasMetadata = plantillas.map(p => p.toJSON());

  const lesionesFiltradas = perfilDescifrado ? parsearCampoJson(perfilDescifrado.lesiones) : [];

  const payload = {
    clienteId,
    entrenadorId,
    edad: instruido.edad,
    peso: Number(instruido.peso),
    altura: Number(instruido.altura),
    sexo: instruido.sexo,
    nivelActividad: instruido.nivelActividad,
    nivelExperiencia: instruido.nivelExperiencia || null,
    proposito: instruido.propositoEntrenamiento || 'mantenimiento',
    diasDisponibles: instruido.diasDisponibles || 3,
    perfilMedico: {
      lesiones: lesionesFiltradas,
      condicionesPreexistentes: perfilDescifrado ? parsearCampoJson(perfilDescifrado.condicionesPreexistentes) : [],
      alergias: perfilDescifrado ? parsearCampoJson(perfilDescifrado.alergias) : [],
      medicacion: perfilDescifrado ? parsearCampoJson(perfilDescifrado.medicacionActual) : [],
    },
    historialReciente: {
      ultimas4Semanas: historialFormateado,
    },
    preferencias: {
      ejerciciosExcluir: preferencias.excluir || [],
      equipamientoDisponible: preferencias.equipamiento || [],
    },
    plantillasDisponibles: plantillasMetadata,
  };

  const response = await httpRequest('/api/predict/routine', 'POST', payload, 10000);

  if (response.status >= 400) {
    const err = new Error(`Flask API error: ${response.status}`);
    err.status = response.status;
    err.data = response.data;
    throw err;
  }

  if (opts.persistir) {
    const resultadoPersistir = {
      ...response.data,
      hasLesiones: lesionesFiltradas.length > 0,
      lesionesDetalle: lesionesFiltradas,
    };
    await persistRoutineFromPrediction(clienteId, entrenadorId, resultadoPersistir);
  }

  return {
    ...response.data,
    hasLesiones: lesionesFiltradas.length > 0,
    lesionesDetalle: lesionesFiltradas,
  };
};

const validarEjercicio = async (ejercicioId, clienteId, cargaKg = null) => {
  const payload = {
    ejercicioId,
    clienteId,
  };
  if (cargaKg !== null) {
    payload.cargaKg = cargaKg;
  }

  const response = await httpRequest('/api/predict/validate', 'POST', payload, 5000);

  if (response.status >= 400) {
    const err = new Error(`Flask API error: ${response.status}`);
    err.status = response.status;
    err.data = response.data;
    throw err;
  }

  return response.data;
};

const persistDietaFromPrediction = async (clienteId, entrenadorId, resultado) => {
  if (!resultado || !resultado.objetivoCalorico) return null;

  const { Dieta } = require('../dietas/dietas.model');

  await Dieta.update(
    { activo: false },
    { where: { instruidoId: clienteId, activo: true } },
  );

  const hoy = new Date();
  const fechaFin = new Date(hoy);
  fechaFin.setDate(fechaFin.getDate() + 30);

  return Dieta.create({
    instruidoId: clienteId,
    entrenadorId,
    objetivoCalorico: resultado.objetivoCalorico,
    proteinas: resultado.proteinasGramos,
    carbohidratos: resultado.carbohidratosGramos,
    grasas: resultado.grasasGramos,
    observaciones: resultado.justificacion || 'Generada por IA tras activacion de plan',
    activo: false,
    decision: 'pendiente',
    fechaInicio: hoy.toISOString().split('T')[0],
    fechaFin: fechaFin.toISOString().split('T')[0],
  });
};

const sugerirDieta = async (clienteId, entrenadorId, preferencias = {}, opts = {}) => {
  const instruido = await Instruido.findOne({
    where: { id: clienteId, entrenadorId },
  });
  if (!instruido) {
    const err = new Error('Instruido no encontrado o no pertenece al entrenador');
    err.status = 404;
    throw err;
  }

  const perfilMedicoRaw = await PerfilMedico.findOne({
    where: { instruidoId: clienteId },
  });
  const perfilDescifrado = perfilMedicoRaw ? descifrarCampos(perfilMedicoRaw) : null;

  const calculoMetabolico = await CalculoMetabolico.findOne({
    where: { clienteId },
    order: [['fechaCalculo', 'DESC']],
  });

  if (!calculoMetabolico) {
    const err = new Error('No existe cálculo metabólico para este cliente. Genere uno primero desde metabolismo.');
    err.status = 400;
    throw err;
  }

  const payload = {
    tmb: Number(calculoMetabolico.tmb),
    gct: Number(calculoMetabolico.gct),
    nivelActividad: instruido.nivelActividad,
    proposito: preferencias.proposito || 'mantener',
    peso: Number(instruido.peso),
    altura: Number(instruido.altura),
    edad: instruido.edad,
    sexo: instruido.sexo,
    datosMedicos: {
      alergias: perfilDescifrado ? parsearCampoJson(perfilDescifrado.alergias) : [],
      intolerancias: perfilDescifrado ? parsearCampoJson(perfilDescifrado.intolerancias) : [],
      condiciones: perfilDescifrado ? parsearCampoJson(perfilDescifrado.condicionesPreexistentes) : [],
    },
  };

  const response = await httpRequest('/api/predict/dieta', 'POST', payload, 10000);

  if (response.status >= 400) {
    const err = new Error(`Flask API error: ${response.status}`);
    err.status = response.status;
    err.data = response.data;
    throw err;
  }

  if (opts.persistir) {
    await persistDietaFromPrediction(clienteId, entrenadorId, response.data);
  }

  return response.data;
};

const CAMPOS_EDITABLES_RUTINA = [
  'nombre', 'tipo', 'ejercicios', 'diasSemana', 'frecuenciaSemanal',
  'duracionSemanas', 'observaciones', 'fechaInicio', 'fechaFin',
];

const decidirRutina = async (usuario, id, datos) => {
  if (usuario.rol !== 'entrenador' && usuario.rol !== 'administrador') {
    const err = new Error('Solo entrenadores y administradores pueden decidir sobre rutinas');
    err.status = 403;
    throw err;
  }

  const where = usuario.rol === 'administrador' ? { id } : { id, entrenadorId: usuario.id };
  const rutina = await RutinaAsignada.findOne({ where });
  if (!rutina) {
    const err = new Error('Rutina no encontrada');
    err.status = 404;
    throw err;
  }

  const { accion, comentario, ejerciciosAgregados, ejerciciosEliminados, modificacionCargas, ...resto } = datos;
  const rutinaOriginal = rutina.toJSON();

  let datosActualizar = {};

  if (accion === 'aceptada') {
    for (const campo of CAMPOS_EDITABLES_RUTINA) {
      if (resto[campo] !== undefined) datosActualizar[campo] = resto[campo];
    }
    datosActualizar.activa = true;
    datosActualizar.decision = 'aprobada';
    datosActualizar.personalizadaPorEntrenador = false;
  } else if (accion === 'modificada') {
    for (const campo of CAMPOS_EDITABLES_RUTINA) {
      if (resto[campo] !== undefined) datosActualizar[campo] = resto[campo];
    }
    datosActualizar.activa = true;
    datosActualizar.decision = 'modificada';
    datosActualizar.personalizadaPorEntrenador = true;
  } else if (accion === 'rechazada') {
    datosActualizar.activa = false;
    datosActualizar.decision = 'rechazada';
    datosActualizar.eliminado = true;
  }

  if (datosActualizar.activa) {
    await RutinaAsignada.update(
      { activa: false },
      { where: { instruidoId: rutina.instruidoId, activa: true, id: { [Op.ne]: id } } },
    );
  }

  await rutina.update(datosActualizar);
  const rutinaFinal = rutina.toJSON();
  Object.assign(rutinaFinal, datosActualizar);

  await HitlFeedback.create({
    entrenadorId: usuario.id,
    clienteId: rutina.instruidoId,
    rutinaSugeridaId: rutina.id,
    accion: datosActualizar.decision,
    rutinaOriginal: {
      nombre: rutinaOriginal.nombre,
      tipo: rutinaOriginal.tipo,
      ejercicios: rutinaOriginal.ejercicios,
      diasSemana: rutinaOriginal.diasSemana,
      frecuenciaSemanal: rutinaOriginal.frecuenciaSemanal,
      duracionSemanas: rutinaOriginal.duracionSemanas,
      observaciones: rutinaOriginal.observaciones,
    },
    rutinaFinal: {
      nombre: rutinaFinal.nombre,
      tipo: rutinaFinal.tipo,
      ejercicios: rutinaFinal.ejercicios,
      diasSemana: rutinaFinal.diasSemana,
      frecuenciaSemanal: rutinaFinal.frecuenciaSemanal,
      duracionSemanas: rutinaFinal.duracionSemanas,
      observaciones: rutinaFinal.observaciones,
    },
    ejerciciosAgregados: ejerciciosAgregados || null,
    ejerciciosEliminados: ejerciciosEliminados || null,
    modificacionCargas: modificacionCargas || null,
    confianzaIa: null,
    tiempoRevisionSeg: null,
    observaciones: comentario || null,
    tipo: 'rutina',
  });

  return rutinaFinal;
};

module.exports = {
  sugerirRutina,
  validarEjercicio,
  sugerirDieta,
  persistRoutineFromPrediction,
  persistDietaFromPrediction,
  decidirRutina,
};

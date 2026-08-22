const { HitlFeedback } = require('./hitl-feedback.model');
const { Instruido } = require('../instruidos/instruido.model');

const crearFeedback = async (entrenadorId, datos) => {
  const {
    clienteId,
    rutinaSugeridaId = null,
    accion,
    rutinaOriginal = null,
    rutinaFinal = null,
    ejerciciosAgregados = null,
    ejerciciosEliminados = null,
    modificacionCargas = null,
    confianzaIa = null,
    tiempoRevisionSeg = null,
    observaciones = null,
  } = datos;

  const instruido = await Instruido.findOne({
    where: { id: clienteId, entrenadorId },
  });
  if (!instruido) {
    const err = new Error('Instruido no encontrado o no pertenece al entrenador');
    err.status = 404;
    throw err;
  }

  return HitlFeedback.create({
    entrenadorId,
    clienteId,
    rutinaSugeridaId,
    accion,
    rutinaOriginal,
    rutinaFinal,
    ejerciciosAgregados,
    ejerciciosEliminados,
    modificacionCargas,
    confianzaIa,
    tiempoRevisionSeg,
    observaciones: observaciones === '' ? null : observaciones,
  });
};

const listarFeedbackPorEntrenador = async (entrenadorId, filtros = {}) => {
  const where = { entrenadorId };
  if (filtros.clienteId) where.clienteId = filtros.clienteId;
  if (filtros.accion) where.accion = filtros.accion;

  return HitlFeedback.findAll({
    where,
    order: [['created_at', 'DESC']],
    limit: filtros.limite || 50,
  });
};

module.exports = { crearFeedback, listarFeedbackPorEntrenador };

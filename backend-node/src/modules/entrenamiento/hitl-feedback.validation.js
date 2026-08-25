const Joi = require('joi');

const esquemaFeedbackHitl = Joi.object({
  clienteId: Joi.number().integer().positive().required(),
  rutinaSugeridaId: Joi.number().integer().positive().optional().allow(null),
  accion: Joi.string().valid('aprobada', 'rechazada', 'modificada').required(),
  rutinaOriginal: Joi.object().optional().allow(null),
  rutinaFinal: Joi.object().optional().allow(null),
  ejerciciosAgregados: Joi.array().items(Joi.object()).optional(),
  ejerciciosEliminados: Joi.array().items(Joi.object()).optional(),
  modificacionCargas: Joi.array().items(Joi.object()).optional(),
  confianzaIa: Joi.number().min(0).max(1).optional().allow(null),
  tiempoRevisionSeg: Joi.number().integer().min(0).optional().allow(null),
  observaciones: Joi.string().max(2000).optional().allow('', null),
  tipo: Joi.string().valid('rutina', 'dieta').optional().default('rutina'),
});

module.exports = { esquemaFeedbackHitl };

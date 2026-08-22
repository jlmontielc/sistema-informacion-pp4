const Joi = require('joi');

const esquemaCrearRegistro = Joi.object({
  rutinaAsignadaId: Joi.number().integer().positive().required(),
  instruidoId: Joi.number().integer().positive().optional(),
  fecha: Joi.date().iso().optional(),
  ejerciciosRealizados: Joi.array().items(Joi.object()).required(),
  percepcionEsfuerzo: Joi.number().integer().min(1).max(10).optional(),
  duracionMinutos: Joi.number().integer().min(0).max(600).optional(),
  observaciones: Joi.string().max(2000).optional().allow(''),
});

module.exports = { esquemaCrearRegistro };

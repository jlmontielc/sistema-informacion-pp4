const Joi = require('joi');

const esquemaCrearDieta = Joi.object({
  instruidoId: Joi.number().integer().positive().required(),
  objetivoCalorico: Joi.number().integer().min(800).max(8000).required(),
  proteinas: Joi.number().min(0).max(500).optional(),
  carbohidratos: Joi.number().min(0).max(800).optional(),
  grasas: Joi.number().min(0).max(300).optional(),
  observaciones: Joi.string().max(2000).optional().allow('', null),
  fechaInicio: Joi.date().iso().optional(),
  fechaFin: Joi.date().iso().optional(),
  activo: Joi.boolean().optional(),
});

module.exports = { esquemaCrearDieta };

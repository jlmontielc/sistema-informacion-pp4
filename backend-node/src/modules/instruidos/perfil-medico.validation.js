const Joi = require('joi');

const esquemaInstruidoIdParam = Joi.object({
  instruidoId: Joi.number().integer().positive().required(),
});

const esquemaPerfilMedico = Joi.object({
  alergias: Joi.string().allow('', null).optional(),
  intolerancias: Joi.string().allow('', null).optional(),
  lesiones: Joi.string().allow('', null).optional(),
  condicionesPreexistentes: Joi.string().allow('', null).optional(),
  medicacionActual: Joi.string().allow('', null).optional(),
  observaciones: Joi.string().allow('', null).optional(),
});

module.exports = { esquemaInstruidoIdParam, esquemaPerfilMedico };

const Joi = require('joi');

const esquemaPerfilMedico = Joi.object({
  alergias: Joi.string().allow('', null).optional(),
  intolerancias: Joi.string().allow('', null).optional(),
  lesiones: Joi.string().allow('', null).optional(),
  condicionesPreexistentes: Joi.string().allow('', null).optional(),
  medicacionActual: Joi.string().allow('', null).optional(),
  observaciones: Joi.string().allow('', null).optional(),
});

module.exports = { esquemaPerfilMedico };

const Joi = require('joi');

const esquemaClienteIdParam = Joi.object({
  clienteId: Joi.number().integer().positive().required(),
});

module.exports = { esquemaClienteIdParam };

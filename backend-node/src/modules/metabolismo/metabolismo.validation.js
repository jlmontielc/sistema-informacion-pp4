const Joi = require('joi');

const esquemaCalculoMetabolico = Joi.object({
  peso: Joi.number().positive().min(20).max(400).required(),
  altura: Joi.number().positive().min(0.5).max(2.6).required(),
  edad: Joi.number().integer().min(1).max(120).required(),
  sexo: Joi.string().valid('masculino', 'femenino').required(),
  nivelActividad: Joi.string().valid('sedentario', 'ligero', 'moderado', 'activo', 'muy_activo').required(),
  clienteId: Joi.number().integer().positive().optional(),
});

module.exports = { esquemaCalculoMetabolico };

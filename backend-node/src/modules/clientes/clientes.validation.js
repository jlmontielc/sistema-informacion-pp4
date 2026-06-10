const Joi = require('joi');

const createSchema = Joi.object({
  nombre: Joi.string().required(),
  edad: Joi.number().integer().min(1).max(120).required(),
  peso: Joi.number().positive().required(),
  altura: Joi.number().positive().required(),
  sexo: Joi.string().valid('masculino', 'femenino').required(),
  nivelActividad: Joi.string().valid('sedentario', 'ligero', 'moderado', 'activo', 'muy_activo').required(),
  propositoEntrenamiento: Joi.string().optional(),
  diasDisponibles: Joi.number().integer().min(1).max(7).optional(),
  historialMedico: Joi.string().optional(),
});

module.exports = { createSchema };

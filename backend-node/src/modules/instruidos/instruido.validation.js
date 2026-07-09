const Joi = require('joi');

const esquemaCrear = Joi.object({
  nombre: Joi.string().max(100).required(),
  email: Joi.string().email().max(100).optional(),
  contrasena: Joi.string().min(6).max(100).optional(),
  edad: Joi.number().integer().min(1).max(120).required(),
  peso: Joi.number().positive().required(),
  altura: Joi.number().positive().required(),
  sexo: Joi.string().valid('masculino', 'femenino').required(),
  nivelActividad: Joi.string().valid('sedentario', 'ligero', 'moderado', 'activo', 'muy_activo').required(),
  propositoEntrenamiento: Joi.string().optional().allow(''),
  diasDisponibles: Joi.number().integer().min(1).max(7).optional(),
});

const esquemaActualizar = Joi.object({
  nombre: Joi.string().max(100).optional(),
  email: Joi.string().email().max(100).optional(),
  contrasena: Joi.string().min(6).max(100).optional(),
  edad: Joi.number().integer().min(1).max(120).optional(),
  peso: Joi.number().positive().optional(),
  altura: Joi.number().positive().optional(),
  sexo: Joi.string().valid('masculino', 'femenino').optional(),
  nivelActividad: Joi.string().valid('sedentario', 'ligero', 'moderado', 'activo', 'muy_activo').optional(),
  propositoEntrenamiento: Joi.string().optional().allow(''),
  diasDisponibles: Joi.number().integer().min(1).max(7).optional(),
  activo: Joi.boolean().optional(),
});

module.exports = { esquemaCrear, esquemaActualizar };

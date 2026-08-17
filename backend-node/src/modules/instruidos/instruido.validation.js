const Joi = require('joi');

const esquemaCrear = Joi.object({
  nombre: Joi.string().max(100).required(),
  email: Joi.string().email().max(100).optional(),
  contrasena: Joi.string().min(8).max(100).optional(),
  edad: Joi.number().integer().min(1).max(120).required(),
  peso: Joi.number().positive().required(),
  altura: Joi.number().positive().required(),
  sexo: Joi.string().valid('masculino', 'femenino').required(),
  nivelActividad: Joi.string().valid('sedentario', 'ligero', 'moderado', 'activo', 'muy_activo').required(),
  nivelExperiencia: Joi.string().valid('principiante', 'intermedio', 'avanzado').optional().allow(null),
  propositoEntrenamiento: Joi.string().valid('perdida_peso', 'ganancia_muscular', 'mantenimiento', 'rendimiento', 'rehabilitacion').optional().allow(''),
  diasDisponibles: Joi.number().integer().min(1).max(7).optional(),
});

const esquemaActualizarPropio = Joi.object({
  nombre: Joi.string().max(100).optional(),
  email: Joi.string().email().max(100).optional(),
  contrasena: Joi.string().min(8).max(100).optional(),
  edad: Joi.number().integer().min(1).max(120).optional(),
  peso: Joi.number().positive().optional(),
  altura: Joi.number().positive().optional(),
  sexo: Joi.string().valid('masculino', 'femenino').optional(),
  nivelActividad: Joi.string().valid('sedentario', 'ligero', 'moderado', 'activo', 'muy_activo').optional(),
  nivelExperiencia: Joi.string().valid('principiante', 'intermedio', 'avanzado').optional().allow(null),
  propositoEntrenamiento: Joi.string().valid('perdida_peso', 'ganancia_muscular', 'mantenimiento', 'rendimiento', 'rehabilitacion').optional().allow(''),
  diasDisponibles: Joi.number().integer().min(1).max(7).optional(),
}).min(1);

const esquemaActualizar = Joi.object({
  nombre: Joi.string().max(100).optional(),
  email: Joi.string().email().max(100).optional(),
  contrasena: Joi.string().min(8).max(100).optional(),
  edad: Joi.number().integer().min(1).max(120).optional(),
  peso: Joi.number().positive().optional(),
  altura: Joi.number().positive().optional(),
  sexo: Joi.string().valid('masculino', 'femenino').optional(),
  nivelActividad: Joi.string().valid('sedentario', 'ligero', 'moderado', 'activo', 'muy_activo').optional(),
  nivelExperiencia: Joi.string().valid('principiante', 'intermedio', 'avanzado').optional().allow(null),
  propositoEntrenamiento: Joi.string().valid('perdida_peso', 'ganancia_muscular', 'mantenimiento', 'rendimiento', 'rehabilitacion').optional().allow(''),
  diasDisponibles: Joi.number().integer().min(1).max(7).optional(),
  activo: Joi.boolean().optional(),
});

module.exports = { esquemaCrear, esquemaActualizar, esquemaActualizarPropio };

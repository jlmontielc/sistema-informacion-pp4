const Joi = require('joi');

const esquemaRegistro = Joi.object({
  nombre: Joi.string().max(100).required(),
  email: Joi.string().email().max(100).required(),
  contrasena: Joi.string().min(8).max(100).required(),
  especialidad: Joi.string().max(100).optional(),
  rol: Joi.string().valid('administrador', 'entrenador', 'instruido').default('instruido'),
  edad: Joi.when('rol', { is: 'instruido', then: Joi.number().integer().min(1).max(120).required(), otherwise: Joi.optional() }),
  peso: Joi.when('rol', { is: 'instruido', then: Joi.number().positive().required(), otherwise: Joi.optional() }),
  altura: Joi.when('rol', { is: 'instruido', then: Joi.number().positive().required(), otherwise: Joi.optional() }),
  sexo: Joi.when('rol', { is: 'instruido', then: Joi.string().valid('masculino', 'femenino').required(), otherwise: Joi.optional() }),
  nivelActividad: Joi.when('rol', { is: 'instruido', then: Joi.string().valid('sedentario', 'ligero', 'moderado', 'activo', 'muy_activo').required(), otherwise: Joi.optional() }),
});

const esquemaInicioSesion = Joi.object({
  email: Joi.string().email().required(),
  contrasena: Joi.string().required(),
});

module.exports = { esquemaRegistro, esquemaInicioSesion };

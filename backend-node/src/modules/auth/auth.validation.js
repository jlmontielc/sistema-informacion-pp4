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
  entrenadorId: Joi.number().integer().positive().optional(),
});

const esquemaInicioSesion = Joi.object({
  email: Joi.string().email().required(),
  contrasena: Joi.string().required(),
});

const esquemaRefrescar = Joi.object({
  refreshToken: Joi.string().required(),
});

const esquemaActualizarPerfil = Joi.object({
  nombre: Joi.string().max(100).optional(),
  email: Joi.string().email().max(100).optional(),
  especialidad: Joi.string().max(100).optional(),
  contrasena: Joi.string().min(8).max(100).optional(),
  contrasenaActual: Joi.string().when('contrasena', {
    is: Joi.exist(),
    then: Joi.required().messages({ 'any.required': 'Se requiere la contraseña actual para cambiar la contraseña' }),
    otherwise: Joi.optional(),
  }),
}).min(1).messages({ 'object.min': 'Debe proporcionar al menos un campo para actualizar' });

const esquemaRegistroInstruido = Joi.object({
  nombre: Joi.string().max(100).required(),
  email: Joi.string().email().max(100).required(),
  contrasena: Joi.string().min(8).max(100).required(),
  edad: Joi.number().integer().min(1).max(120).required(),
  peso: Joi.number().positive().required(),
  altura: Joi.number().positive().required(),
  sexo: Joi.string().valid('masculino', 'femenino').required(),
  nivelActividad: Joi.string().valid('sedentario', 'ligero', 'moderado', 'activo', 'muy_activo').required(),
  propositoEntrenamiento: Joi.string().optional(),
  diasDisponibles: Joi.number().integer().min(1).max(7).optional(),
});

module.exports = { esquemaRegistro, esquemaRegistroInstruido, esquemaInicioSesion, esquemaRefrescar, esquemaActualizarPerfil };

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
  nombre: Joi.string().max(100).optional().allow(''),
  email: Joi.string().email().max(100).optional().allow(''),
  especialidad: Joi.string().max(100).optional().allow(''),
  contrasena: Joi.string().min(8).max(100).optional(),
  contrasenaActual: Joi.string().when('contrasena', {
    is: Joi.exist(),
    then: Joi.required().messages({ 'any.required': 'Se requiere la contraseña actual para cambiar la contraseña' }),
    otherwise: Joi.optional(),
  }),
  edad: Joi.number().integer().min(1).max(120).optional(),
  peso: Joi.number().positive().optional(),
  altura: Joi.number().positive().optional(),
  sexo: Joi.string().valid('masculino', 'femenino').optional().allow(''),
  nivelActividad: Joi.string().valid('sedentario', 'ligero', 'moderado', 'activo', 'muy_activo').optional().allow(''),
  propositoEntrenamiento: Joi.string().optional().allow(''),
  diasDisponibles: Joi.number().integer().min(1).max(7).optional(),
}).min(1).messages({ 'object.min': 'Debe proporcionar al menos un campo para actualizar' });

const esquemaCertificacion = Joi.object({
  nombre: Joi.string().max(150).required(),
  institucion: Joi.string().max(150).optional().allow(''),
  fechaObtencion: Joi.date().optional().allow(null, ''),
  fechaExpiracion: Joi.date().optional().allow(null, ''),
  descripcion: Joi.string().optional().allow(''),
  imagenUrl: Joi.string().uri().optional().allow(''),
});

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

module.exports = { esquemaRegistro, esquemaRegistroInstruido, esquemaInicioSesion, esquemaRefrescar, esquemaActualizarPerfil, esquemaCertificacion };

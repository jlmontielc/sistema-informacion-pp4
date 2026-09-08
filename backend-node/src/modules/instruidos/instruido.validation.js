const Joi = require('joi');

const validarDiasSemana = Joi.array()
  .items(Joi.number().integer().min(1).max(7).required())
  .min(1)
  .max(7)
  .unique()
  .messages({
    'array.base': 'diasSemana debe ser un array',
    'array.min': 'diasSemana debe contener al menos un dia',
    'array.max': 'diasSemana no puede contener mas de 7 dias',
    'array.unique': 'Los dias de la semana no pueden repetirse',
    'number.base': 'Cada dia de la semana debe ser un numero entero',
    'number.integer': 'Cada dia de la semana debe ser un numero entero',
    'number.min': 'Los dias de la semana deben estar entre 1 y 7',
    'number.max': 'Los dias de la semana deben estar entre 1 y 7',
  });

const validarCoherenciaDias = (value, helpers) => {
  const { diasDisponibles, diasSemana } = value;
  if (diasDisponibles !== undefined && diasSemana !== undefined && diasDisponibles !== diasSemana.length) {
    return helpers.error('dias.coherencia');
  }
  return value;
};

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
  diasDisponibles: Joi.number().integer().min(1).max(7).required(),
  diasSemana: validarDiasSemana.required(),
}).custom(validarCoherenciaDias).messages({
  'dias.coherencia': 'diasDisponibles debe coincidir con la cantidad de dias en diasSemana',
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
  diasSemana: validarDiasSemana.optional(),
}).min(1).custom(validarCoherenciaDias).messages({
  'dias.coherencia': 'diasDisponibles debe coincidir con la cantidad de dias en diasSemana',
});

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
  diasSemana: validarDiasSemana.optional(),
  activo: Joi.boolean().optional(),
}).custom(validarCoherenciaDias).messages({
  'dias.coherencia': 'diasDisponibles debe coincidir con la cantidad de dias en diasSemana',
});

module.exports = { esquemaCrear, esquemaActualizar, esquemaActualizarPropio, validarDiasSemana, validarCoherenciaDias };

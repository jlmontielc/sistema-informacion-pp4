const Joi = require('joi');

const ejercicioRutina = Joi.object({
  ejercicioId: Joi.number().integer().required(),
  dia: Joi.number().integer().min(1).max(7).required(),
  orden: Joi.number().integer().min(1).required(),
  series: Joi.number().integer().min(1).max(20).required(),
  repeticiones: Joi.number().integer().min(1).max(100).required(),
  cargaKg: Joi.number().min(0).optional().allow(null),
  descansoSegundos: Joi.number().integer().min(0).max(600).optional(),
  notas: Joi.string().max(500).optional().allow(''),
});

const diasSemanaMap = Joi.object().pattern(
  Joi.string().regex(/^[1-7]$/),
  Joi.object({
    diaSemana: Joi.number().integer().min(1).max(7).required(),
    nombre: Joi.string().max(20).required(),
  })
);

const esquemaCrear = Joi.object({
  nombre: Joi.string().max(150).required(),
  descripcion: Joi.string().optional().allow(''),
  tipo: Joi.string()
    .valid('fuerza', 'hipertrofia', 'resistencia', 'cardio', 'funcional', 'flexibilidad')
    .required(),
  ejercicios: Joi.array().items(ejercicioRutina).min(1).required(),
  diasSemana: diasSemanaMap.required(),
  frecuenciaSemanal: Joi.number().integer().min(1).max(7).required(),
  duracionSemanas: Joi.number().integer().min(1).max(52).optional(),
  objetivo: Joi.string()
    .valid('perdida_peso', 'ganancia_muscular', 'mantenimiento', 'rendimiento', 'rehabilitacion')
    .optional(),
  nivelDificultad: Joi.string().valid('principiante', 'intermedio', 'avanzado').optional(),
});

const esquemaActualizar = Joi.object({
  nombre: Joi.string().max(150).optional(),
  descripcion: Joi.string().optional().allow(''),
  tipo: Joi.string()
    .valid('fuerza', 'hipertrofia', 'resistencia', 'cardio', 'funcional', 'flexibilidad')
    .optional(),
  ejercicios: Joi.array().items(ejercicioRutina).min(1).optional(),
  diasSemana: diasSemanaMap.optional(),
  frecuenciaSemanal: Joi.number().integer().min(1).max(7).optional(),
  duracionSemanas: Joi.number().integer().min(1).max(52).optional(),
  objetivo: Joi.string()
    .valid('perdida_peso', 'ganancia_muscular', 'mantenimiento', 'rendimiento', 'rehabilitacion')
    .optional(),
  nivelDificultad: Joi.string().valid('principiante', 'intermedio', 'avanzado').optional(),
  activa: Joi.boolean().optional(),
});

const esquemaAgregarEjercicio = Joi.object({
  ejercicioId: Joi.number().integer().required(),
  orden: Joi.number().integer().min(1).optional(),
  series: Joi.number().integer().min(1).max(20).required(),
  repeticiones: Joi.number().integer().min(1).max(100).required(),
  cargaKg: Joi.number().min(0).optional().allow(null),
  descansoSegundos: Joi.number().integer().min(0).max(600).optional(),
  notas: Joi.string().max(500).optional().allow(''),
});

const esquemaEditarEjercicio = Joi.object({
  ejercicioId: Joi.number().integer().optional(),
  series: Joi.number().integer().min(1).max(20).optional(),
  repeticiones: Joi.number().integer().min(1).max(100).optional(),
  cargaKg: Joi.number().min(0).optional().allow(null),
  descansoSegundos: Joi.number().integer().min(0).max(600).optional(),
  notas: Joi.string().max(500).optional().allow(''),
});

const esquemaReordenar = Joi.object({
  orden: Joi.array().items(Joi.number().integer().min(0)).min(1).required(),
});

module.exports = {
  esquemaCrear,
  esquemaActualizar,
  esquemaAgregarEjercicio,
  esquemaEditarEjercicio,
  esquemaReordenar,
};

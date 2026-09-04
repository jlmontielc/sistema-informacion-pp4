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
  instruidoId: Joi.number().integer().required(),
  plantillaOrigenId: Joi.number().integer().optional().allow(null),
  nombre: Joi.string().max(150).required(),
  tipo: Joi.string()
    .valid('fuerza', 'hipertrofia', 'resistencia', 'cardio', 'funcional', 'flexibilidad')
    .required(),
  ejercicios: Joi.array().items(ejercicioRutina).min(0).optional().default([]),
  diasSemana: diasSemanaMap.optional().default({}),
  frecuenciaSemanal: Joi.number().integer().min(1).max(7).optional().default(3),
  duracionSemanas: Joi.number().integer().min(1).max(52).optional(),
  observaciones: Joi.string().optional().allow(''),
  fechaInicio: Joi.date().optional(),
  fechaFin: Joi.date().optional(),
});

const esquemaActualizar = Joi.object({
  nombre: Joi.string().max(150).optional(),
  tipo: Joi.string()
    .valid('fuerza', 'hipertrofia', 'resistencia', 'cardio', 'funcional', 'flexibilidad')
    .optional(),
  ejercicios: Joi.array().items(ejercicioRutina).min(1).optional(),
  diasSemana: diasSemanaMap.optional(),
  frecuenciaSemanal: Joi.number().integer().min(1).max(7).optional(),
  duracionSemanas: Joi.number().integer().min(1).max(52).optional(),
  observaciones: Joi.string().optional().allow(''),
  fechaInicio: Joi.date().optional(),
  fechaFin: Joi.date().optional(),
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

const esquemaClonar = Joi.object({
  instruidoId: Joi.number().integer().required(),
  fechaInicio: Joi.date().optional(),
  observaciones: Joi.string().optional().allow(''),
});

module.exports = {
  esquemaCrear,
  esquemaActualizar,
  esquemaAgregarEjercicio,
  esquemaEditarEjercicio,
  esquemaReordenar,
  esquemaClonar,
};

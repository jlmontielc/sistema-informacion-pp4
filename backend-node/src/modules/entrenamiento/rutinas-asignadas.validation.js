const Joi = require('joi');

const ejercicioRutina = Joi.object({
  ejercicio_id: Joi.number().integer().required(),
  dia: Joi.number().integer().min(1).max(7).required(),
  orden: Joi.number().integer().min(1).required(),
  series: Joi.number().integer().min(1).max(20).required(),
  repeticiones: Joi.number().integer().min(1).max(100).required(),
  carga_kg: Joi.number().min(0).optional().allow(null),
  descanso_segundos: Joi.number().integer().min(0).max(600).optional(),
  notas: Joi.string().max(500).optional().allow(''),
});

const diasSemanaMap = Joi.object().pattern(
  Joi.string().regex(/^[1-7]$/),
  Joi.object({
    dia_semana: Joi.number().integer().min(1).max(7).required(),
    nombre: Joi.string().max(20).required(),
  })
);

const esquemaCrear = Joi.object({
  cliente_id: Joi.number().integer().required(),
  plantilla_origen_id: Joi.number().integer().optional().allow(null),
  nombre: Joi.string().max(150).required(),
  tipo: Joi.string()
    .valid('fuerza', 'hipertrofia', 'resistencia', 'cardio', 'funcional', 'flexibilidad')
    .required(),
  ejercicios: Joi.array().items(ejercicioRutina).min(1).required(),
  dias_semana: diasSemanaMap.required(),
  frecuencia_semanal: Joi.number().integer().min(1).max(7).required(),
  duracion_semanas: Joi.number().integer().min(1).max(52).optional(),
  observaciones: Joi.string().optional().allow(''),
  fecha_inicio: Joi.date().optional(),
  fecha_fin: Joi.date().optional(),
});

const esquemaActualizar = Joi.object({
  nombre: Joi.string().max(150).optional(),
  tipo: Joi.string()
    .valid('fuerza', 'hipertrofia', 'resistencia', 'cardio', 'funcional', 'flexibilidad')
    .optional(),
  ejercicios: Joi.array().items(ejercicioRutina).min(1).optional(),
  dias_semana: diasSemanaMap.optional(),
  frecuencia_semanal: Joi.number().integer().min(1).max(7).optional(),
  duracion_semanas: Joi.number().integer().min(1).max(52).optional(),
  observaciones: Joi.string().optional().allow(''),
  fecha_inicio: Joi.date().optional(),
  fecha_fin: Joi.date().optional(),
  activa: Joi.boolean().optional(),
});

const esquemaAgregarEjercicio = Joi.object({
  ejercicio_id: Joi.number().integer().required(),
  orden: Joi.number().integer().min(1).optional(),
  series: Joi.number().integer().min(1).max(20).required(),
  repeticiones: Joi.number().integer().min(1).max(100).required(),
  carga_kg: Joi.number().min(0).optional().allow(null),
  descanso_segundos: Joi.number().integer().min(0).max(600).optional(),
  notas: Joi.string().max(500).optional().allow(''),
});

const esquemaEditarEjercicio = Joi.object({
  ejercicio_id: Joi.number().integer().optional(),
  series: Joi.number().integer().min(1).max(20).optional(),
  repeticiones: Joi.number().integer().min(1).max(100).optional(),
  carga_kg: Joi.number().min(0).optional().allow(null),
  descanso_segundos: Joi.number().integer().min(0).max(600).optional(),
  notas: Joi.string().max(500).optional().allow(''),
});

const esquemaReordenar = Joi.object({
  orden: Joi.array().items(Joi.number().integer().min(0)).min(1).required(),
});

const esquemaClonar = Joi.object({
  instruido_id: Joi.number().integer().required(),
  fecha_inicio: Joi.date().optional(),
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

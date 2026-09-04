const Joi = require('joi');

const esquemaClienteIdParam = Joi.object({
  clienteId: Joi.number().integer().positive().required(),
});

const esquemaIdParam = Joi.object({
  id: Joi.number().integer().positive().required(),
});

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

const esquemaDecisionRutina = Joi.object({
  accion: Joi.string().valid('aceptada', 'modificada', 'rechazada').required(),
  comentario: Joi.string().max(2000).optional().allow('', null),
  nombre: Joi.string().max(150).optional(),
  tipo: Joi.string()
    .valid('fuerza', 'hipertrofia', 'resistencia', 'cardio', 'funcional', 'flexibilidad')
    .optional(),
  ejercicios: Joi.array().items(ejercicioRutina).optional(),
  diasSemana: diasSemanaMap.optional(),
  frecuenciaSemanal: Joi.number().integer().min(1).max(7).optional(),
  duracionSemanas: Joi.number().integer().min(1).max(52).optional(),
  observaciones: Joi.string().max(2000).optional().allow('', null),
  fechaInicio: Joi.date().iso().optional(),
  fechaFin: Joi.date().iso().optional(),
  ejerciciosAgregados: Joi.array().items(Joi.object()).optional(),
  ejerciciosEliminados: Joi.array().items(Joi.object()).optional(),
  modificacionCargas: Joi.object().optional(),
});

module.exports = {
  esquemaClienteIdParam,
  esquemaIdParam,
  esquemaDecisionRutina,
};

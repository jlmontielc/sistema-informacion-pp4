const Joi = require('joi');

const int = Joi.number().integer();

const esquemaCrearRegistro = Joi.object({
  rutinaAsignadaId: int.positive().required(),
  instruidoId: int.positive().optional(),
  fecha: Joi.date().iso().optional(),
  ejerciciosRealizados: Joi.array().items(Joi.object()).optional(),
  percepcionEsfuerzo: int.min(1).max(10).optional(),
  duracionMinutos: int.min(0).max(600).optional(),
  observaciones: Joi.string().max(2000).optional().allow(''),
});

const esquemaIniciar = Joi.object({
  rutinaAsignadaId: int.positive().required(),
  instruidoId: int.positive().optional(),
  observaciones: Joi.string().max(2000).optional().allow(''),
});

const esquemaSerie = Joi.object({
  ejercicioId: int.positive().required(),
  numeroSerie: int.min(1).required(),
  repeticionesRealizadas: int.min(0).required(),
  pesoKg: Joi.number().min(0).required(),
  descansoSegundos: int.min(0).required(),
  rpe: int.min(1).max(10).optional(),
  notas: Joi.string().max(500).optional().allow(''),
});

const esquemaEditarSerie = Joi.object({
  ejercicioId: int.positive().optional(),
  numeroSerie: int.min(1).optional(),
  repeticionesRealizadas: int.min(0).optional(),
  pesoKg: Joi.number().min(0).optional(),
  descansoSegundos: int.min(0).optional(),
  rpe: int.min(1).max(10).optional(),
  notas: Joi.string().max(500).optional().allow(''),
}).min(1);

const esquemaFinalizar = Joi.object({
  duracionMinutos: int.min(0).max(600).optional(),
  observaciones: Joi.string().max(2000).optional().allow(''),
});

const esquemaCancelar = Joi.object({
  observaciones: Joi.string().max(2000).optional().allow(''),
});

const esquemaIdParams = Joi.object({
  id: int.positive().required(),
});

const esquemaSerieIdParams = Joi.object({
  id: int.positive().required(),
  serieId: int.positive().required(),
});

module.exports = {
  esquemaCrearRegistro,
  esquemaIniciar,
  esquemaSerie,
  esquemaEditarSerie,
  esquemaFinalizar,
  esquemaCancelar,
  esquemaIdParams,
  esquemaSerieIdParams,
};

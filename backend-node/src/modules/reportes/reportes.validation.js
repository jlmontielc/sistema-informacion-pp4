const Joi = require('joi');

const consultaPeriodo = Joi.object({
  periodo: Joi.string().valid('7d', '30d', '3m').default('30d'),
});

const paramsInstruido = Joi.object({
  instruidoId: Joi.number().integer().positive().required(),
});

const paramsEvolucion = Joi.object({
  instruidoId: Joi.number().integer().positive().required(),
  grupoMuscular: Joi.string().min(1).max(50).required(),
});

const paramsEvolucionInstruido = Joi.object({
  grupoMuscular: Joi.string().min(1).max(50).required(),
});

module.exports = {
  consultaPeriodo,
  paramsInstruido,
  paramsEvolucion,
  paramsEvolucionInstruido,
};

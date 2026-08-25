const Joi = require('joi');

const esquemaCrearPlan = Joi.object({
  nombre: Joi.string().min(2).max(150).required(),
  descripcion: Joi.string().max(2000).optional().allow('', null),
  ofrecimiento: Joi.string().valid('entrenamiento', 'dietas', 'ambos').required(),
  montoUsd: Joi.number().positive().precision(2).max(99999999).required(),
  diasVigencia: Joi.number().integer().min(1).max(365).optional(),
  activo: Joi.boolean().optional(),
});

const esquemaActualizarPlan = Joi.object({
  nombre: Joi.string().min(2).max(150).optional(),
  descripcion: Joi.string().max(2000).optional().allow('', null),
  ofrecimiento: Joi.string().valid('entrenamiento', 'dietas', 'ambos').optional(),
  montoUsd: Joi.number().positive().precision(2).max(99999999).optional(),
  diasVigencia: Joi.number().integer().min(1).max(365).optional(),
  activo: Joi.boolean().optional(),
}).min(1);

const esquemaCrearMetodo = Joi.object({
  tipo: Joi.string().valid('pago_movil', 'transferencia', 'zelle', 'binance', 'otro').required(),
  datos: Joi.object().min(1).required(),
  activo: Joi.boolean().optional(),
});

const esquemaActualizarMetodo = Joi.object({
  tipo: Joi.string().valid('pago_movil', 'transferencia', 'zelle', 'binance', 'otro').optional(),
  datos: Joi.object().min(1).optional(),
  activo: Joi.boolean().optional(),
}).min(1);

const esquemaActualizarTasa = Joi.object({
  tasaCambio: Joi.number().positive().precision(4).max(999999.9999).required(),
});

const esquemaCrearPago = Joi.object({
  planId: Joi.number().integer().positive().required(),
  metodoPagoId: Joi.number().integer().positive().required(),
  referencia: Joi.string().min(3).max(100).required(),
  fechaPago: Joi.date().iso().max('now').required(),
  comprobante: Joi.string().base64().max(2800000).required(),
  comprobanteMime: Joi.string().valid('image/jpeg', 'image/png', 'image/webp').required(),
});

const esquemaRechazarPago = Joi.object({
  comentario: Joi.string().max(255).optional().allow('', null),
});

module.exports = {
  esquemaCrearPlan,
  esquemaActualizarPlan,
  esquemaCrearMetodo,
  esquemaActualizarMetodo,
  esquemaActualizarTasa,
  esquemaCrearPago,
  esquemaRechazarPago,
};

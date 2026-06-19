const Joi = require('joi');

const registerSchema = Joi.object({
  nombre: Joi.string().max(100).required(),
  email: Joi.string().email().max(100).required(),
  password: Joi.string().min(6).max(100).required(),
  especialidad: Joi.string().max(100).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
  nombre: Joi.string().max(100).optional(),
  especialidad: Joi.string().max(100).optional(),
  password: Joi.string().min(6).max(100).optional(),
});

module.exports = { registerSchema, loginSchema, updateProfileSchema };

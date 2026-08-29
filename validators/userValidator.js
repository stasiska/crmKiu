const Joi = require('joi');

const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().max(100).optional(),
  role: Joi.string().valid('user', 'manager', 'director', 'admin').default('user'),
});

const updateUserSchema = Joi.object({
  name: Joi.string().max(100).optional(),
  role: Joi.string().valid('user', 'manager', 'director', 'admin').optional(),
  password: Joi.string().min(6).optional(),
});

module.exports = { createUserSchema, updateUserSchema };
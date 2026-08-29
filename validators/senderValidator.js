const Joi = require('joi');

const senderSchema = Joi.object({
  name: Joi.string().max(100).required(),
  email: Joi.string().email().required(),
  host: Joi.string().max(100).required(),
  port: Joi.number().integer().min(1).max(65535).required(),
  secure: Joi.number().valid(0, 1).default(1),
  password: Joi.string().min(1).required(),
});

const updateSenderSchema = senderSchema.fork(
  ['name', 'email', 'host', 'port', 'secure', 'password'],
  (schema) => schema.optional()
);

module.exports = { senderSchema, updateSenderSchema };
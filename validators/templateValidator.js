const Joi = require('joi');

const templateSchema = Joi.object({
  name: Joi.string().max(100).required(),
  subject: Joi.string().max(255).required(),
  body: Joi.string().required(),
});

const updateTemplateSchema = templateSchema.fork(
  ['name', 'subject', 'body'],
  (schema) => schema.optional()
);

module.exports = { templateSchema, updateTemplateSchema };
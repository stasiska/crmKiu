const Joi = require('joi');

const noteSchema = Joi.object({
  type: Joi.string().valid('note', 'plan').required().messages({
    'any.only': 'Тип должен быть "note" или "plan"',
    'any.required': 'Тип обязателен',
  }),
  date: Joi.date().iso().optional().allow('', null).default(null).messages({
    'date.format': 'Дата должна быть в формате ISO',
  }),
  note: Joi.string().required().messages({
    'any.required': 'Текст заметки/плана обязателен',
  }),
  executor_id: Joi.alternatives().try(
    Joi.number().integer(),
    Joi.string().valid('').allow(null)
  ).optional().default(null),
  file_link: Joi.string().uri().max(255).optional().allow('', null).default(null).messages({
    'string.uri': 'Ссылка на файл должна быть валидным URL',
    'string.max': 'Ссылка на файл не должна превышать 255 символов',
  }),
});

const updateNoteSchema = Joi.object({
  type: Joi.string().valid('note', 'plan').optional(),
  date: Joi.date().iso().optional().allow('', null).default(null),
  note: Joi.string().optional(),
  executor_id: Joi.alternatives().try(
    Joi.number().integer(),
    Joi.string().valid('').allow(null)
  ).optional().default(null),
  file_link: Joi.string().uri().max(255).optional().allow('', null).default(null),
});

module.exports = { noteSchema, updateNoteSchema };

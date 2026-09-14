const Joi = require('joi');

const listenerSchema = Joi.object({
  last_name: Joi.string().max(100).required().messages({
    'string.max': 'Фамилия не должна превышать 100 символов',
    'any.required': 'Фамилия обязательна',
  }),
  first_name: Joi.string().max(100).required().messages({
    'string.max': 'Имя не должно превышать 100 символов',
    'any.required': 'Имя обязательно',
  }),
  middle_name: Joi.string().max(100).optional().allow('', null).default(null),
  birth_date: Joi.alternatives().try(
    Joi.date().iso(),
    Joi.string().valid('').allow(null)
  ).optional().default(null).messages({
    'date.format': 'Дата рождения должна быть в формате ISO (YYYY-MM-DD)',
  }),
  gender: Joi.alternatives().try(
    Joi.string().valid('male', 'female'),
    Joi.string().valid('').allow(null)
  ).optional().default(null).messages({
    'any.only': 'Пол должен быть "male" или "female"',
  }),
  citizenship: Joi.string().max(100).optional().allow('', null).default(null),
  identity_document: Joi.string().max(100).optional().allow('', null).default(null),
  document_series: Joi.string().max(20).optional().allow('', null).default(null),
  document_number: Joi.string().max(20).optional().allow('', null).default(null),
  issued_by: Joi.string().max(255).optional().allow('', null).default(null),
  snils: Joi.alternatives().try(
    Joi.string().pattern(/^\d{3}-\d{3}-\d{3}-\d{2}$/),
    Joi.string().valid('').allow(null)
  ).optional().default(null).messages({
    'string.pattern.base': 'СНИЛС должен быть в формате XXX-XXX-XXX-XX',
  }),
  residence_address: Joi.string().optional().allow('', null).default(null),
  registration_address: Joi.string().optional().allow('', null).default(null),
  phone: Joi.string().max(50).optional().allow('', null).default(null),
  email: Joi.string().email().optional().allow('', null).default(null).messages({
    'string.email': 'Некорректный email',
  }),
  education_level: Joi.alternatives().try(
    Joi.string().valid('higher', 'secondary', 'basic'),
    Joi.string().valid('').allow(null)
  ).optional().default(null).messages({
    'any.only': 'Уровень образования должен быть "higher", "secondary" или "basic"',
  }),
  education_series: Joi.string().max(20).optional().allow('', null).default(null),
  education_number: Joi.string().max(20).optional().allow('', null).default(null),
  organization_id: Joi.alternatives().try(
    Joi.number().integer(),
    Joi.string().valid('').allow(null)
  ).optional().default(null),
  manager_id: Joi.alternatives().try(
    Joi.number().integer(),
    Joi.string().valid('').allow(null)
  ).optional().default(null),
  department: Joi.string().max(100).optional().allow('', null).default(null),
});

const updateListenerSchema = Joi.object({
  last_name: Joi.string().max(100).optional(),
  first_name: Joi.string().max(100).optional(),
  middle_name: Joi.string().max(100).optional().allow('', null).default(null),
  birth_date: Joi.alternatives().try(
    Joi.date().iso(),
    Joi.string().valid('').allow(null)
  ).optional().default(null),
  gender: Joi.alternatives().try(
    Joi.string().valid('male', 'female'),
    Joi.string().valid('').allow(null)
  ).optional().default(null),
  citizenship: Joi.string().max(100).optional().allow('', null).default(null),
  identity_document: Joi.string().max(100).optional().allow('', null).default(null),
  document_series: Joi.string().max(20).optional().allow('', null).default(null),
  document_number: Joi.string().max(20).optional().allow('', null).default(null),
  issued_by: Joi.string().max(255).optional().allow('', null).default(null),
  snils: Joi.alternatives().try(
    Joi.string().pattern(/^\d{3}-\d{3}-\d{3}-\d{2}$/),
    Joi.string().valid('').allow(null)
  ).optional().default(null),
  residence_address: Joi.string().optional().allow('', null).default(null),
  registration_address: Joi.string().optional().allow('', null).default(null),
  phone: Joi.string().max(50).optional().allow('', null).default(null),
  email: Joi.string().email().optional().allow('', null).default(null),
  education_level: Joi.alternatives().try(
    Joi.string().valid('higher', 'secondary', 'basic'),
    Joi.string().valid('').allow(null)
  ).optional().default(null),
  education_series: Joi.string().max(20).optional().allow('', null).default(null),
  education_number: Joi.string().max(20).optional().allow('', null).default(null),
  organization_id: Joi.alternatives().try(
    Joi.number().integer(),
    Joi.string().valid('').allow(null)
  ).optional().default(null),
  manager_id: Joi.alternatives().try(
    Joi.number().integer(),
    Joi.string().valid('').allow(null)
  ).optional().default(null),
  department: Joi.string().max(100).optional().allow('', null).default(null),
});

module.exports = { listenerSchema, updateListenerSchema };

const Joi = require('joi');

const organizationSchema = Joi.object({
  name: Joi.string().max(255).required().messages({
    'string.max': 'Название не должно превышать 255 символов',
    'any.required': 'Название обязательно',
  }),
  address: Joi.string().optional().allow('', null).default(null),
  email: Joi.string().email().optional().allow('', null).default(null).messages({
    'string.email': 'Некорректный email',
  }),
  phone: Joi.string().max(50).optional().allow('', null).default(null),
  contact_person: Joi.string().max(255).optional().allow('', null).default(null),
  manager_id: Joi.alternatives().try(
    Joi.number().integer(),
    Joi.string().valid('').allow(null)
  ).optional().default(null),
  department: Joi.string().max(100).optional().allow('', null).default(null),
  ogrn: Joi.string().max(15).optional().allow('', null).default(null).messages({
    'string.max': 'ОГРН не должен превышать 15 символов',
  }),
  okpo: Joi.string().max(10).optional().allow('', null).default(null).messages({
    'string.max': 'ОКПО не должен превышать 10 символов',
  }),
  okved: Joi.string().max(10).optional().allow('', null).default(null).messages({
    'string.max': 'ОКВЭД не должен превышать 10 символов',
  }),
  okfs: Joi.string().max(10).optional().allow('', null).default(null).messages({
    'string.max': 'ОКФС не должен превышать 10 символов',
  }),
  okopf: Joi.string().max(10).optional().allow('', null).default(null).messages({
    'string.max': 'ОКОПФ не должен превышать 10 символов',
  }),
  okato: Joi.string().max(20).optional().allow('', null).default(null).messages({
    'string.max': 'ОКАТО не должен превышать 20 символов',
  }),
  inn: Joi.string().max(12).optional().allow('', null).default(null).messages({
    'string.max': 'ИНН не должен превышать 12 символов',
  }),
  kpp: Joi.string().max(9).optional().allow('', null).default(null).messages({
    'string.max': 'КПП не должен превышать 9 символов',
  }),
});

const updateOrganizationSchema = Joi.object({
  name: Joi.string().max(255).optional(),
  address: Joi.string().optional().allow('', null).default(null),
  email: Joi.string().email().optional().allow('', null).default(null),
  phone: Joi.string().max(50).optional().allow('', null).default(null),
  contact_person: Joi.string().max(255).optional().allow('', null).default(null),
  manager_id: Joi.alternatives().try(
    Joi.number().integer(),
    Joi.string().valid('').allow(null)
  ).optional().default(null),
  department: Joi.string().max(100).optional().allow('', null).default(null),
  ogrn: Joi.string().max(15).optional().allow('', null).default(null),
  okpo: Joi.string().max(10).optional().allow('', null).default(null),
  okved: Joi.string().max(10).optional().allow('', null).default(null),
  okfs: Joi.string().max(10).optional().allow('', null).default(null),
  okopf: Joi.string().max(10).optional().allow('', null).default(null),
  okato: Joi.string().max(20).optional().allow('', null).default(null),
  inn: Joi.string().max(12).optional().allow('', null).default(null),
  kpp: Joi.string().max(9).optional().allow('', null).default(null),
});

module.exports = { organizationSchema, updateOrganizationSchema };

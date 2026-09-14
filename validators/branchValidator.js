const Joi = require('joi');

// Схема для создания филиала
const createBranchSchema = Joi.object({
  code: Joi.string().max(50).required().messages({
    'any.required': 'Необходимо указать код филиала',
    'string.max': 'Код филиала не может быть длиннее 50 символов'
  }),
  name: Joi.string().max(255).required().messages({
    'any.required': 'Необходимо указать название филиала',
    'string.max': 'Название филиала не может быть длиннее 255 символов'
  }),
  director_name: Joi.string().max(255).allow(null, '').messages({
    'string.max': 'Имя директора не может быть длиннее 255 символов'
  }),
  city: Joi.string().max(100).allow(null, '').messages({
    'string.max': 'Название города не может быть длиннее 100 символов'
  })
});

// Схема для обновления филиала
const updateBranchSchema = Joi.object({
  name: Joi.string().max(255).messages({
    'string.max': 'Название филиала не может быть длиннее 255 символов'
  }),
  director_name: Joi.string().max(255).allow(null, '').messages({
    'string.max': 'Имя директора не может быть длиннее 255 символов'
  }),
  city: Joi.string().max(100).allow(null, '').messages({
    'string.max': 'Название города не может быть длиннее 100 символов'
  })
}).min(1).messages({
  'object.min': 'Необходимо указать хотя бы одно поле для обновления'
});

module.exports = {
  createBranchSchema,
  updateBranchSchema
};

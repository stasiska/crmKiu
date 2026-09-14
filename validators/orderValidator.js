const Joi = require('joi');

// Схема для генерации приказа
const generateOrderSchema = Joi.object({
  templateCode: Joi.string().valid('enrollment_order', 'issuance_order', 'expulsion_order').required().messages({
    'any.required': 'Необходимо указать тип приказа',
    'any.only': 'Неподдерживаемый тип приказа'
  }),
  orderNumber: Joi.string().max(50).required().messages({
    'any.required': 'Необходимо указать номер приказа',
    'string.max': 'Номер приказа не может быть длиннее 50 символов'
  })
});

// Схема для прикрепления приказа
const attachOrderSchema = Joi.object({
  templateCode: Joi.string().valid('enrollment_order', 'issuance_order', 'expulsion_order').required().messages({
    'any.required': 'Необходимо указать тип приказа',
    'any.only': 'Неподдерживаемый тип приказа'
  }),
  orderNumber: Joi.string().max(50).required().messages({
    'any.required': 'Необходимо указать номер приказа',
    'string.max': 'Номер приказа не может быть длиннее 50 символов'
  })
});

// Схема для загрузки своего приказа (только body, файл проверяется в контроллере)
const uploadOrderSchema = Joi.object({
  templateCode: Joi.string().valid('enrollment_order', 'issuance_order', 'expulsion_order').required().messages({
    'any.required': 'Необходимо указать тип приказа',
    'any.only': 'Неподдерживаемый тип приказа'
  }),
  orderNumber: Joi.string().max(50).required().messages({
    'any.required': 'Необходимо указать номер приказа',
    'string.max': 'Номер приказа не может быть длиннее 50 символов'
  })
});

module.exports = {
  generateOrderSchema,
  attachOrderSchema,
  uploadOrderSchema
};

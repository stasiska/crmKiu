const Joi = require('joi');

// Схема для создания группы
const groupSchema = Joi.object({
  manager_id: Joi.number().integer().allow(null).messages({
    'number.base': 'ID менеджера должен быть числом'
  }),
  auditorium: Joi.string().max(100).allow(null, '').messages({
    'string.max': 'Аудитория не может быть длиннее 100 символов'
  }),
  branch: Joi.string().max(100).allow(null, '').messages({
    'string.max': 'Подразделение не может быть длиннее 100 символов'
  }),
  course_name: Joi.string().max(255).required().messages({
    'string.empty': 'Наименование обязательно',
    'string.max': 'Наименование не может быть длиннее 255 символов',
    'any.required': 'Наименование обязательно'
  }),
  status: Joi.string().valid('набор', 'открыта', 'завершена').default('набор').messages({
    'any.only': 'Статус должен быть одним из: набор, открыта, завершена'
  }),
  hours: Joi.number().integer().min(0).max(9999).allow(null).messages({
    'number.base': 'Количество часов должно быть числом',
    'number.min': 'Количество часов не может быть отрицательным',
    'number.max': 'Количество часов не может быть больше 9999'
  }),
  start_date: Joi.date().iso().allow(null).messages({
    'date.base': 'Дата начала должна быть корректной датой'
  }),
  end_date: Joi.date().iso().allow(null).messages({
    'date.base': 'Дата окончания должна быть корректной датой'
  }),
  format: Joi.string().valid('аудитория', 'дистант').default('аудитория').messages({
    'any.only': 'Формат должен быть: аудитория или дистант'
  }),
  manager_name: Joi.string().max(255).allow(null, '').messages({
    'string.max': 'ФИО менеджера не может быть длиннее 255 символов'
  })
});

// Схема для обновления группы (все поля опциональны)
const updateGroupSchema = Joi.object({
  manager_id: Joi.number().integer().allow(null).messages({
    'number.base': 'ID менеджера должен быть числом'
  }),
  auditorium: Joi.string().max(100).allow(null, '').messages({
    'string.max': 'Аудитория не может быть длиннее 100 символов'
  }),
  branch: Joi.string().max(100).allow(null, '').messages({
    'string.max': 'Подразделение не может быть длиннее 100 символов'
  }),
  course_name: Joi.string().max(255).messages({
    'string.empty': 'Наименование не может быть пустым',
    'string.max': 'Наименование не может быть длиннее 255 символов'
  }),
  status: Joi.string().valid('набор', 'открыта', 'завершена').messages({
    'any.only': 'Статус должен быть одним из: набор, открыта, завершена'
  }),
  hours: Joi.number().integer().min(0).max(9999).allow(null).messages({
    'number.base': 'Количество часов должно быть числом',
    'number.min': 'Количество часов не может быть отрицательным',
    'number.max': 'Количество часов не может быть больше 9999'
  }),
  start_date: Joi.date().iso().allow(null).messages({
    'date.base': 'Дата начала должна быть корректной датой'
  }),
  end_date: Joi.date().iso().allow(null).messages({
    'date.base': 'Дата окончания должна быть корректной датой'
  }),
  format: Joi.string().valid('аудитория', 'дистант').messages({
    'any.only': 'Формат должен быть: аудитория или дистант'
  }),
  manager_name: Joi.string().max(255).allow(null, '').messages({
    'string.max': 'ФИО менеджера не может быть длиннее 255 символов'
  })
});

// Схема для добавления слушателей в группу
const addListenersSchema = Joi.object({
  listenerIds: Joi.array().items(Joi.number().integer()).min(1).required().messages({
    'array.base': 'listenerIds должен быть массивом',
    'array.min': 'Необходимо указать хотя бы одного слушателя',
    'any.required': 'listenerIds обязателен'
  })
});

const updateGroupListenerSchema = Joi.object({
  contract_amount: Joi.number().min(0).allow(null).messages({
    'number.base': 'Сумма по договору должна быть числом',
    'number.min': 'Сумма по договору не может быть отрицательной'
  }),
  paid_amount: Joi.number().min(0).allow(null).messages({
    'number.base': 'Оплаченная сумма должна быть числом',
    'number.min': 'Оплаченная сумма не может быть отрицательной'
  }),
  payment_type: Joi.string().max(50).allow(null, ''),
  comment: Joi.string().allow(null, '')
}).min(1);

module.exports = {
  groupSchema,
  updateGroupSchema,
  addListenersSchema,
  updateGroupListenerSchema
};

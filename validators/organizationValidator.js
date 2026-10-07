const Joi = require('joi');

const requiredText = (label, max = 255) => Joi.string().trim().max(max).required().messages({
  'string.empty': `${label} обязательно`,
  'any.required': `${label} обязательно`,
  'string.max': `${label} не должно превышать ${max} символов`,
});

const optionalText = (label, max = 255) => Joi.string().trim().max(max).optional().allow('', null).default(null).messages({
  'string.max': `${label} не должно превышать ${max} символов`,
});

const organizationFields = {
  name: requiredText('Краткое наименование'),
  full_name: optionalText('Полное наименование', 500),
  address: optionalText('Адрес', 1000),
  email: Joi.string().email().optional().allow('', null).default(null).messages({
    'string.email': 'Некорректный e-mail',
  }),
  phone: optionalText('Телефон', 50),
  contact_person: optionalText('Контактное лицо'),
  inn: requiredText('ИНН организации', 12),
  kpp: requiredText('КПП организации', 9),
  settlement_account: requiredText('Расчётный счёт', 20),
  bank_name: requiredText('Наименование банка'),
  correspondent_account: requiredText('Корреспондентский счёт', 20),
  bik: requiredText('БИК', 9),
  ogrn: optionalText('ОГРН', 15),
  bank_inn: optionalText('ИНН банка', 12),
  bank_kpp: optionalText('КПП банка', 9),
};

const organizationSchema = Joi.object(organizationFields);
const updateOrganizationSchema = Joi.object(organizationFields);

module.exports = { organizationSchema, updateOrganizationSchema };

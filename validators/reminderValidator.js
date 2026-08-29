const Joi = require('joi');

const reminderSchema = Joi.object({
  recipientId: Joi.number().integer().required(),
  recipientEmail: Joi.string().email().optional(),
  reminderDate: Joi.date().iso().required(),
  message: Joi.string().max(500).optional(),
});

const updateReminderSchema = Joi.object({
  reminderDate: Joi.date().iso().optional(),
  message: Joi.string().max(500).optional(),
  isCompleted: Joi.boolean().optional(),
});

module.exports = { reminderSchema, updateReminderSchema };
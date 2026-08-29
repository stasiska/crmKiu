const Joi = require('joi');



function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map(detail => detail.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    next();
  };
}

const { loginSchema } = require('./authValidator');
const { senderSchema, updateSenderSchema } = require('./senderValidator');
const { commentSchema } = require('./recipientValidator');
const { templateSchema, updateTemplateSchema } = require('./templateValidator');
const { createUserSchema, updateUserSchema } = require('./userValidator');
const { reminderSchema, updateReminderSchema } = require('./reminderValidator');
const { taskSchema, updateTaskSchema } = require('./taskValidator');

module.exports = {
  validate,
  loginSchema,
  senderSchema,
  updateSenderSchema,
  commentSchema,
  templateSchema,
  updateTemplateSchema,
  createUserSchema,
  updateUserSchema,
  reminderSchema,
  updateReminderSchema,
  taskSchema,
  updateTaskSchema,
};
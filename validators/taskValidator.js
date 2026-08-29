const Joi = require('joi');

const taskSchema = Joi.object({
  title: Joi.string().max(255).required(),
  description: Joi.string().optional(),
  status: Joi.string().valid('todo', 'inProgress', 'done').default('todo'),
  assignedTo: Joi.number().integer().allow(null).optional(),
  deadline: Joi.date().iso().allow(null).optional(),
});

const updateTaskSchema = taskSchema.fork(
  ['title', 'description', 'status', 'assignedTo', 'deadline'],
  (schema) => schema.optional()
);

module.exports = { taskSchema, updateTaskSchema };
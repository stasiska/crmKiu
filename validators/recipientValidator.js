const Joi = require('joi');

const commentSchema = Joi.object({
  comment: Joi.string().max(1000).required(),
});

module.exports = { commentSchema };
const Joi = require('joi');

const createCommentSchema = Joi.object({
  text: Joi.string().min(1).max(1000).required(),
});

module.exports = { createCommentSchema };
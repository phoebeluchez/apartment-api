const Joi = require('joi');

const createRequestSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).required(),
  category: Joi.string().valid('plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'pest', 'other').required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
});

const assignSchema = Joi.object({
  staffId: Joi.string().required(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('open', 'assigned', 'in_progress', 'resolved', 'closed').required(),
});

module.exports = { createRequestSchema, assignSchema, updateStatusSchema };
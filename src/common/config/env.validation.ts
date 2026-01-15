import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3001),
  DATABASE_URL: Joi.string().required(),
  // English: Mandatory secrets for security. No fallbacks allowed.
  AT_SECRET: Joi.string().required(),
  RT_SECRET: Joi.string().required(),
});

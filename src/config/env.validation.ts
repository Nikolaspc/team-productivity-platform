// src/config/env.validation.ts
import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3001),
  DATABASE_URL: Joi.string().required(),
  AT_SECRET: Joi.string().required(),
  RT_SECRET: Joi.string().required(),
  FRONTEND_URL: Joi.string().uri().required(),
});

import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),
  PORT: Joi.number().port().default(3001),
  FRONTEND_URL: Joi.string().uri().required(),

  // --- QUEUE STRATEGY (Critical for Mac Air/No Docker) ---
  QUEUE_DRIVER: Joi.string().valid('redis', 'memory').default('memory'),

  // --- DATABASE (PostgreSQL 14+) ---
  DATABASE_URL: Joi.string().required(),

  // --- AUTHENTICATION ---
  AT_SECRET: Joi.string().min(32).required(),
  RT_SECRET: Joi.string().min(32).required(),
  COOKIE_SECRET: Joi.string().min(32).required(),

  // --- REDIS (Condicional si el driver es redis) ---
  REDIS_HOST: Joi.string().when('QUEUE_DRIVER', {
    is: 'redis',
    then: Joi.required(),
  }),
  REDIS_PORT: Joi.number().port().default(6379),

  // --- OTROS (Mail, Storage) ---
  MAIL_HOST: Joi.string().required(),
  MAIL_PORT: Joi.number().port().required(),
  MAIL_USER: Joi.string().required(),
  MAIL_PASS: Joi.string().required(),
  STORAGE_ENDPOINT: Joi.string().uri().required(),
  STORAGE_ACCESS_KEY: Joi.string().required(),
  STORAGE_SECRET_KEY: Joi.string().required(),
  STORAGE_BUCKET: Joi.string().required(),
});

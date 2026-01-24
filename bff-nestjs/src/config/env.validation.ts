import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // --- ENVIRONMENT ---
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),
  PORT: Joi.number().port().default(3001),
  FRONTEND_URL: Joi.string().uri().required(),

  // --- DATABASE (PostgreSQL 14+) ---
  DATABASE_URL: Joi.string().required(),
  DATABASE_POOL_SIZE: Joi.number().min(1).max(100).default(10),

  // --- AUTHENTICATION & SECURITY ---
  AT_SECRET: Joi.string().min(32).required(),
  RT_SECRET: Joi.string().min(32).required(),
  COOKIE_SECRET: Joi.string().min(32).required(), // Crucial for signed cookies
  AT_EXPIRES_IN: Joi.string().default('15m'),
  RT_EXPIRES_IN: Joi.string().default('7d'),

  // --- REDIS (Queues/BullMQ) ---
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().port().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),

  // --- MAIL (SaaS Standard) ---
  MAIL_HOST: Joi.string().required(),
  MAIL_PORT: Joi.number().port().required(),
  MAIL_USER: Joi.string().required(),
  MAIL_PASS: Joi.string().required(),
  MAIL_FROM: Joi.string().default('"Team Platform" <no-reply@yourdomain.com>'),

  // --- STORAGE (Supabase S3 Compatible) ---
  STORAGE_ENDPOINT: Joi.string().uri().required(),
  STORAGE_REGION: Joi.string().required(),
  STORAGE_ACCESS_KEY: Joi.string().required(),
  STORAGE_SECRET_KEY: Joi.string().required(),
  STORAGE_BUCKET: Joi.string().required(),
  STORAGE_FORCE_PATH_STYLE: Joi.boolean().default(true), // Specific for Supabase/Minio

  // --- MONITORING ---
  LOG_LEVEL: Joi.string().valid('debug', 'info', 'warn', 'error').default('info'),
  THROTTLE_TTL: Joi.number().default(60000),
  THROTTLE_LIMIT: Joi.number().default(20),
});
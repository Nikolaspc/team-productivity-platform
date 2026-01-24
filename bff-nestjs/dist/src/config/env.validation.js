"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.envValidationSchema = void 0;
const Joi = __importStar(require("joi"));
exports.envValidationSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test', 'staging')
        .default('development'),
    PORT: Joi.number().port().default(3001),
    FRONTEND_URL: Joi.string().uri().required(),
    DATABASE_URL: Joi.string().required(),
    DATABASE_POOL_SIZE: Joi.number().min(1).max(100).default(10),
    AT_SECRET: Joi.string().min(32).required(),
    RT_SECRET: Joi.string().min(32).required(),
    COOKIE_SECRET: Joi.string().min(32).required(),
    AT_EXPIRES_IN: Joi.string().default('15m'),
    RT_EXPIRES_IN: Joi.string().default('7d'),
    REDIS_HOST: Joi.string().required(),
    REDIS_PORT: Joi.number().port().default(6379),
    REDIS_PASSWORD: Joi.string().allow('').optional(),
    MAIL_HOST: Joi.string().required(),
    MAIL_PORT: Joi.number().port().required(),
    MAIL_USER: Joi.string().required(),
    MAIL_PASS: Joi.string().required(),
    MAIL_FROM: Joi.string().default('"Team Platform" <no-reply@yourdomain.com>'),
    STORAGE_ENDPOINT: Joi.string().uri().required(),
    STORAGE_REGION: Joi.string().required(),
    STORAGE_ACCESS_KEY: Joi.string().required(),
    STORAGE_SECRET_KEY: Joi.string().required(),
    STORAGE_BUCKET: Joi.string().required(),
    STORAGE_FORCE_PATH_STYLE: Joi.boolean().default(true),
    LOG_LEVEL: Joi.string().valid('debug', 'info', 'warn', 'error').default('info'),
    THROTTLE_TTL: Joi.number().default(60000),
    THROTTLE_LIMIT: Joi.number().default(20),
});
//# sourceMappingURL=env.validation.js.map
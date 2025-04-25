import * as Joi from "joi";

export const validationSchema = Joi.object({
  // Database
  DATABASE_URL: Joi.string().required(),

  // JWT Configuration
  JWT_SECRET: Joi.string().required(),
  JWT_TEMP_SECRET: Joi.string().required(),
  JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.string().default("15m"),
  JWT_TEMP_TOKEN_EXPIRATION_TIME: Joi.string().default("10m"),
  JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
  JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().default("7d"),

  // CORS Configuration
  ALLOWED_ORIGINS: Joi.string().required(),

  // App Configuration
  APP_NAME: Joi.string().default("EZPG_Payment_System"),
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),
  PORT: Joi.number().default(8080),

  // TFA Configuration
  TFA_ENCRYPTION_KEY: Joi.string().length(32).required().messages({
    "string.length":
      "TFA_ENCRYPTION_KEY must be 32 characters long for AES-256",
  }),
});

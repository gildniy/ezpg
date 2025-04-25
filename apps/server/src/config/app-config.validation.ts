import * as Joi from "joi";

// Define validation schema for environment variables
export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),
  PORT: Joi.number().default(8080),
  DATABASE_URL: Joi.string().required(),

  // JWT Secrets & Expirations
  JWT_SECRET: Joi.string().required(),
  JWT_TEMP_SECRET: Joi.string().required(),
  JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.string().default("15m"), // Shorter access token life
  JWT_TEMP_TOKEN_EXPIRATION_TIME: Joi.string().default("3m"),
  JWT_FIRST_LOGIN_SECRET: Joi.string().optional(), // Optional, will fall back to temp secret
  JWT_FIRST_LOGIN_TOKEN_EXPIRATION_TIME: Joi.string().default("10m"),
  JWT_REFRESH_TOKEN_SECRET: Joi.string().required(), // Now required
  JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().default("7d"), // Refresh token life

  // CORS
  ALLOWED_ORIGINS: Joi.string().required(), // Comma-separated list

  // App Info
  APP_NAME: Joi.string().default("EZPG Payment Gateway"),

  // TFA Encryption Key (Validate length)
  TFA_ENCRYPTION_KEY: Joi.string().length(32).required().messages({
    "string.length":
      "TFA_ENCRYPTION_KEY must be 32 characters long for AES-256",
  }),
});

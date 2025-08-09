import { registerAs } from '@nestjs/config'
import * as Joi from 'joi'

/**
 * @constant envConfig
 * @description
 * 环境配置加载器，负责加载和验证环境变量。
 * 
 * 主要原理与机制：
 * 1. 使用registerAs注册配置命名空间，方便依赖注入时的配置隔离
 * 2. 根据NODE_ENV加载不同环境的配置文件
 * 3. 使用Joi进行配置验证，确保必要的环境变量存在且格式正确
 * 4. 提供默认值，在环境变量未设置时使用
 */
export const envConfig = registerAs('env', () => {
  const nodeEnv = process.env.NODE_ENV || 'development'

  return {
    // 应用配置
    app: {
      nodeEnv,
      name: process.env.APP_NAME || 'aiofix-ddd-saas-platform',
      port: parseInt(process.env.PORT || '3000', 10),
      apiPrefix: process.env.API_PREFIX || 'api',
      fallbackLanguage: process.env.FALLBACK_LANGUAGE || 'en',
    },

    // 跨域配置
    cors: {
      enabled: process.env.CORS_ENABLED === 'true',
      origin: process.env.CORS_ORIGIN?.split(',') || ['*'],
    },

    // 安全配置
    security: {
      bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
      jwtAccessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET || 'access-secret',
      jwtAccessTokenExpirationTime: parseInt(
        process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME || '3600',
        10,
      ),
      jwtRefreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh-secret',
      jwtRefreshTokenExpirationTime: parseInt(
        process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME || '86400',
        10,
      ),
    },
  }
})

/**
 * @constant envValidationSchema
 * @description
 * 环境变量验证模式，使用Joi进行验证。
 * 确保必要的环境变量存在且格式正确。
 */
export const envValidationSchema = Joi.object({
  // 应用配置验证
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  APP_NAME: Joi.string().default('aiofix-ddd-saas-platform'),
  PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default('api'),
  FALLBACK_LANGUAGE: Joi.string().default('en'),

  // 跨域配置验证
  CORS_ENABLED: Joi.boolean().default(false),
  CORS_ORIGIN: Joi.string().default('*'),

  // 安全配置验证
  BCRYPT_SALT_ROUNDS: Joi.number().default(10),
  JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
  JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.number().default(3600),
  JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
  JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.number().default(86400),
})

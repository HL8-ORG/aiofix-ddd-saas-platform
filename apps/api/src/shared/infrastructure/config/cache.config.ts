import { registerAs } from '@nestjs/config'
import { CacheModuleOptions } from '@nestjs/cache-manager'
import { redisStore } from 'cache-manager-redis-yet'
import * as Joi from 'joi'

/**
 * @constant cacheConfig
 * @description
 * 缓存配置工厂，负责生成缓存模块的配置选项。
 * 支持多级缓存策略（内存缓存和Redis缓存）。
 * 
 * 主要原理与机制：
 * 1. 使用registerAs注册配置命名空间
 * 2. 支持内存缓存和Redis缓存两种存储方式
 * 3. 根据环境配置不同的缓存策略
 * 4. 提供缓存键前缀、TTL等基础配置
 * 5. 支持多租户缓存隔离
 */
export const cacheConfig = registerAs('cache', (): CacheModuleOptions & Record<string, any> => {
  const nodeEnv = process.env.NODE_ENV || 'development'
  const isProduction = nodeEnv === 'production'

  // 基础缓存配置
  const baseConfig: CacheModuleOptions = {
    ttl: parseInt(process.env.CACHE_TTL || '300', 10), // 默认5分钟
    max: parseInt(process.env.CACHE_MAX_ITEMS || '1000', 10), // 最大缓存项数
    isGlobal: true,
  }

  // Redis缓存配置
  const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    keyPrefix: process.env.CACHE_KEY_PREFIX || 'aiofix:',
    // 连接配置
    connectTimeout: 10000,
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    // 集群配置
    enableAutoPipelining: true,
    maxLoadingRetryTime: 2000,
    // TLS配置（生产环境）
    tls: isProduction ? {} : undefined,
  }

  return {
    // 基础配置
    ...baseConfig,

    // 存储配置
    store: redisStore,

    // Redis配置
    redis: redisConfig,

    // 多租户配置
    tenant: {
      enabled: true,
      keyPrefix: process.env.TENANT_CACHE_PREFIX || 'tenant:',
    },

    // 性能配置
    performance: {
      // 压缩配置
      compression: {
        enabled: isProduction,
        threshold: 1024, // 大于1KB的值进行压缩
      },
      // 批量操作配置
      batch: {
        enabled: true,
        maxSize: 100,
        maxDelay: 50,
      },
    },

    // 监控配置
    monitoring: {
      enabled: true,
      // Prometheus指标
      metrics: {
        enabled: true,
        prefix: 'cache_',
      },
      // 健康检查
      health: {
        enabled: true,
        timeout: 5000,
      },
    },
  }
})

/**
 * @constant cacheValidationSchema
 * @description
 * 缓存配置验证模式，确保必要的缓存配置存在且格式正确。
 */
export const cacheValidationSchema = Joi.object({
  // 基础配置验证
  CACHE_TTL: Joi.number().default(300),
  CACHE_MAX_ITEMS: Joi.number().default(1000),
  CACHE_KEY_PREFIX: Joi.string().default('aiofix:'),

  // Redis配置验证
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  REDIS_DB: Joi.number().default(0),

  // 多租户配置验证
  TENANT_CACHE_PREFIX: Joi.string().default('tenant:'),
})

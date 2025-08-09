import { registerAs } from '@nestjs/config'

/**
 * @interface CacheConfig
 * @description 缓存配置接口，定义缓存系统的各种配置参数
 */
export interface CacheConfig {
  // 基础配置
  enabled: boolean
  defaultTtl: number

  // 多级缓存配置
  memory: {
    maxSize: number
    ttl: number
    strategy: 'lru' | 'lfu' | 'fifo'
  }

  redis: {
    host: string
    port: number
    ttl: number
    cluster: boolean
    password?: string
    db?: number
  }

  // 租户配置
  tenant: {
    isolation: boolean
    prefix: string
    defaultTtl: number
  }

  // 监控配置
  metrics: {
    enabled: boolean
    interval: number
  }

  // 缓存策略配置
  strategy: {
    memoryFirst: boolean
    redisFirst: boolean
    writeThrough: boolean
    writeBack: boolean
  }
}

/**
 * @constant cacheConfig
 * @description 缓存配置工厂函数，从环境变量读取配置
 */
export const cacheConfig = registerAs('cache', (): CacheConfig => ({
  // 基础配置
  enabled: process.env.CACHE_ENABLED === 'true',
  defaultTtl: parseInt(process.env.CACHE_DEFAULT_TTL || '3600'),

  // 内存缓存配置
  memory: {
    maxSize: parseInt(process.env.CACHE_MEMORY_MAX_SIZE || '1000'),
    ttl: parseInt(process.env.CACHE_MEMORY_TTL || '300'),
    strategy: (process.env.CACHE_MEMORY_STRATEGY as 'lru' | 'lfu' | 'fifo') || 'lru',
  },

  // Redis缓存配置
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    ttl: parseInt(process.env.CACHE_REDIS_TTL || '3600'),
    cluster: process.env.REDIS_CLUSTER === 'true',
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
  },

  // 租户配置
  tenant: {
    isolation: process.env.CACHE_TENANT_ISOLATION !== 'false',
    prefix: process.env.CACHE_TENANT_PREFIX || 'tenant',
    defaultTtl: parseInt(process.env.CACHE_TENANT_TTL || '1800'),
  },

  // 监控配置
  metrics: {
    enabled: process.env.CACHE_METRICS_ENABLED !== 'false',
    interval: parseInt(process.env.CACHE_METRICS_INTERVAL || '60000'),
  },

  // 缓存策略配置
  strategy: {
    memoryFirst: process.env.CACHE_STRATEGY_MEMORY_FIRST !== 'false',
    redisFirst: process.env.CACHE_STRATEGY_REDIS_FIRST === 'true',
    writeThrough: process.env.CACHE_STRATEGY_WRITE_THROUGH === 'true',
    writeBack: process.env.CACHE_STRATEGY_WRITE_BACK === 'true',
  },
}))

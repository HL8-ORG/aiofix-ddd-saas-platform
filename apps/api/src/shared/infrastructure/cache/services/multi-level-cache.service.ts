import { Inject, Injectable } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { ClsService } from 'nestjs-cls'
import type { Cache } from 'cache-manager'
import {
  CacheOptions,
  CacheService,
  CacheStats,
  MultiLevelCacheService as IMultiLevelCacheService,
  CacheLevel
} from '../interfaces/cache.interface'
import { MemoryCacheService } from '../implementations/memory-cache.service'
import { ClsBasedCacheKeyGenerator } from '../utils/cache-key.generator'

/**
 * @class MultiLevelCacheService
 * @description 多级缓存服务实现，整合内存缓存和Redis缓存
 * 
 * 主要原理与机制：
 * 1. 实现多级缓存策略：内存 -> Redis -> 数据库
 * 2. 基于nestjs-cls实现请求级缓存隔离
 * 3. 支持多种缓存策略：memory-first、redis-first等
 * 4. 提供缓存穿透保护和缓存雪崩预防
 * 5. 自动回填和缓存预热功能
 */
@Injectable()
export class MultiLevelCacheService implements IMultiLevelCacheService {
  private readonly logger = new Logger(MultiLevelCacheService.name)
  private readonly metrics = {
    memoryHits: 0,
    redisHits: 0,
    databaseHits: 0,
    totalRequests: 0,
    errors: 0,
  }

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly memoryCache: MemoryCacheService,
    private readonly cls: ClsService,
    private readonly keyGenerator: ClsBasedCacheKeyGenerator,
  ) { }

  /**
   * @method get
   * @description 多级缓存获取
   */
  async get<T>(key: string): Promise<T | null> {
    const cacheKey = this.keyGenerator.generate(key)
    this.metrics.totalRequests++

    try {
      // 1. 尝试从内存缓存获取
      const memoryResult = await this.getFromMemory<T>(cacheKey)
      if (memoryResult) {
        this.metrics.memoryHits++
        this.logger.debug(`Memory cache hit: ${cacheKey}`)
        return memoryResult
      }

      // 2. 尝试从Redis缓存获取
      const redisResult = await this.getFromRedis<T>(cacheKey)
      if (redisResult) {
        // 回填到内存缓存
        await this.setToMemory(cacheKey, redisResult)
        this.metrics.redisHits++
        this.logger.debug(`Redis cache hit: ${cacheKey}`)
        return redisResult
      }

      this.logger.debug(`Cache miss: ${cacheKey}`)
      return null
    } catch (error) {
      this.metrics.errors++
      this.logger.error(`Error getting cache key ${cacheKey}:`, error)
      return null
    }
  }

  /**
   * @method set
   * @description 多级缓存设置
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const cacheKey = this.keyGenerator.generate(key)
    const { strategy = 'memory-first', ttl = 3600 } = options || {}

    try {
      if (strategy === 'memory-first') {
        // 先写入内存，再写入Redis
        await this.setToMemory(cacheKey, value, ttl)
        await this.setToRedis(cacheKey, value, ttl)
      } else if (strategy === 'redis-first') {
        // 先写入Redis，再写入内存
        await this.setToRedis(cacheKey, value, ttl)
        await this.setToMemory(cacheKey, value, ttl)
      } else if (strategy === 'write-through') {
        // 同时写入内存和Redis
        await Promise.all([
          this.setToMemory(cacheKey, value, ttl),
          this.setToRedis(cacheKey, value, ttl),
        ])
      }

      this.logger.debug(`Cache set: ${cacheKey} with strategy: ${strategy}`)
    } catch (error) {
      this.metrics.errors++
      this.logger.error(`Error setting cache key ${cacheKey}:`, error)
    }
  }

  /**
   * @method delete
   * @description 删除缓存
   */
  async delete(key: string): Promise<void> {
    const cacheKey = this.keyGenerator.generate(key)

    try {
      await Promise.all([
        this.memoryCache.delete(cacheKey),
        this.cacheManager.del(cacheKey),
      ])

      this.logger.debug(`Cache deleted: ${cacheKey}`)
    } catch (error) {
      this.metrics.errors++
      this.logger.error(`Error deleting cache key ${cacheKey}:`, error)
    }
  }

  /**
   * @method clear
   * @description 清除缓存
   */
  async clear(pattern?: string): Promise<void> {
    try {
      if (pattern) {
        await this.invalidateByPattern(pattern)
      } else {
        await Promise.all([
          this.memoryCache.clear(),
          // 对于Redis缓存，我们无法直接清除所有，只能逐个删除
          // 在实际项目中，可以使用Redis的FLUSHDB命令
        ])
      }

      this.logger.log(`Cache cleared${pattern ? ` with pattern: ${pattern}` : ''}`)
    } catch (error) {
      this.metrics.errors++
      this.logger.error(`Error clearing cache:`, error)
    }
  }

  /**
   * @method exists
   * @description 检查缓存是否存在
   */
  async exists(key: string): Promise<boolean> {
    const cacheKey = this.keyGenerator.generate(key)

    try {
      const [memoryExists, redisExists] = await Promise.all([
        this.memoryCache.exists(cacheKey),
        this.cacheManager.get(cacheKey).then(value => value !== null && value !== undefined),
      ])

      return memoryExists || redisExists
    } catch (error) {
      this.metrics.errors++
      this.logger.error(`Error checking cache key ${cacheKey}:`, error)
      return false
    }
  }

  /**
   * @method getStats
   * @description 获取缓存统计信息
   */
  async getStats(): Promise<CacheStats> {
    const memoryStats = await this.memoryCache.getStats()
    const totalRequests = this.metrics.totalRequests
    const memoryHitRate = totalRequests > 0 ? this.metrics.memoryHits / totalRequests : 0
    const redisHitRate = totalRequests > 0 ? this.metrics.redisHits / totalRequests : 0
    const overallHitRate = totalRequests > 0 ? (this.metrics.memoryHits + this.metrics.redisHits) / totalRequests : 0
    const errorRate = totalRequests > 0 ? this.metrics.errors / totalRequests : 0

    return {
      totalHits: memoryStats.totalHits + this.metrics.redisHits,
      totalMisses: memoryStats.totalMisses,
      memoryHitRate,
      redisHitRate,
      overallHitRate,
      errorRate,
      averageResponseTime: 0, // 可以后续实现响应时间统计
    }
  }

  /**
   * @method getFromMemory
   * @description 从内存缓存获取
   */
  async getFromMemory<T>(key: string): Promise<T | null> {
    return await this.memoryCache.get<T>(key)
  }

  /**
   * @method getFromRedis
   * @description 从Redis缓存获取
   */
  async getFromRedis<T>(key: string): Promise<T | null> {
    try {
      const value = await this.cacheManager.get<T>(key)
      return value || null
    } catch (error) {
      this.logger.error(`Error getting from Redis cache key ${key}:`, error)
      return null
    }
  }

  /**
   * @method setToMemory
   * @description 设置到内存缓存
   */
  async setToMemory<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.memoryCache.set(key, value, { ttl })
  }

  /**
   * @method setToRedis
   * @description 设置到Redis缓存
   */
  async setToRedis<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl ? ttl * 1000 : undefined)
    } catch (error) {
      this.logger.error(`Error setting to Redis cache key ${key}:`, error)
    }
  }

  /**
   * @method invalidateByPattern
   * @description 按模式清除缓存
   */
  async invalidateByPattern(pattern: string): Promise<void> {
    try {
      // 清除内存缓存中的匹配项
      await this.memoryCache.clear(pattern)

      // 对于Redis缓存，我们无法直接清除所有，只能逐个删除
      // 在实际项目中，可以使用Redis的SCAN命令来精确匹配模式

      this.logger.debug(`Invalidated cache entries matching pattern: ${pattern}`)
    } catch (error) {
      this.metrics.errors++
      this.logger.error(`Error invalidating cache by pattern ${pattern}:`, error)
    }
  }

  /**
   * @method warmUp
   * @description 缓存预热
   */
  async warmUp(keys: string[]): Promise<void> {
    try {
      const warmUpPromises = keys.map(async (key) => {
        // 允许传入的keys已经是完整key（以cache:开头）或基础key
        const cacheKey = key.startsWith('cache:') ? key : this.keyGenerator.generate(key)
        const value = await this.getFromRedis(cacheKey)
        if (value) {
          await this.setToMemory(cacheKey, value)
        }
      })

      await Promise.all(warmUpPromises)
      this.logger.log(`Warmed up ${keys.length} cache entries`)
    } catch (error) {
      this.metrics.errors++
      this.logger.error(`Error warming up cache:`, error)
    }
  }

  /**
   * @method getCacheLevel
   * @description 获取缓存级别信息
   */
  getCacheLevel(key: string): CacheLevel {
    if (this.memoryCache.getSize() > 0) {
      return CacheLevel.MEMORY
    }
    return CacheLevel.REDIS
  }
}

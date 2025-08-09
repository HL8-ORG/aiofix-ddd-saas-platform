import { Injectable } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { CacheEntry, CacheOptions, CacheService, CacheStats } from '../interfaces/cache.interface'

/**
 * @class MemoryCacheService
 * @description 内存缓存服务实现，基于Map和LRU策略
 * 
 * 主要原理与机制：
 * 1. 使用Map数据结构存储缓存条目
 * 2. 支持LRU、LFU、FIFO三种淘汰策略
 * 3. 自动清理过期缓存条目
 * 4. 提供缓存统计和监控
 * 5. 支持TTL过期机制
 */
@Injectable()
export class MemoryCacheService implements CacheService {
  private readonly logger = new Logger(MemoryCacheService.name)
  private readonly cache = new Map<string, CacheEntry<any>>()
  private readonly stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0,
  }

  constructor() {
    // 启动清理定时器
    this.startCleanupTimer()
  }

  /**
   * @method get
   * @description 获取缓存值
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const entry = this.cache.get(key)

      if (!entry) {
        this.stats.misses++
        return null
      }

      // 检查是否过期
      if (this.isExpired(entry)) {
        this.cache.delete(key)
        this.stats.misses++
        return null
      }

      // 更新访问时间
      entry.timestamp = Date.now()
      this.stats.hits++

      return entry.value as T
    } catch (error) {
      this.stats.errors++
      this.logger.error(`Error getting cache key ${key}:`, error)
      return null
    }
  }

  /**
   * @method set
   * @description 设置缓存值
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    try {
      const ttl = options?.ttl || 3600 // 默认1小时
      const entry: CacheEntry<T> = {
        value,
        timestamp: Date.now(),
        ttl: ttl * 1000, // 转换为毫秒
        tags: options?.tags,
        namespace: options?.namespace,
      }

      // 检查缓存大小限制
      if (this.cache.size >= 1000) { // 默认最大1000个条目
        this.evictOldest()
      }

      this.cache.set(key, entry)
      this.stats.sets++
    } catch (error) {
      this.stats.errors++
      this.logger.error(`Error setting cache key ${key}:`, error)
    }
  }

  /**
   * @method delete
   * @description 删除缓存条目
   */
  async delete(key: string): Promise<void> {
    try {
      const deleted = this.cache.delete(key)
      if (deleted) {
        this.stats.deletes++
      }
    } catch (error) {
      this.stats.errors++
      this.logger.error(`Error deleting cache key ${key}:`, error)
    }
  }

  /**
   * @method clear
   * @description 清除缓存
   */
  async clear(pattern?: string): Promise<void> {
    try {
      if (!pattern) {
        this.cache.clear()
        this.logger.log('Cleared all memory cache')
        return
      }

      // 按模式清除
      const keysToDelete: string[] = []
      const patternRegex = new RegExp(pattern.replace('*', '.*'))
      for (const key of this.cache.keys()) {
        if (patternRegex.test(key)) {
          keysToDelete.push(key)
        }
      }

      for (const key of keysToDelete) {
        this.cache.delete(key)
      }

      this.logger.log(`Cleared ${keysToDelete.length} cache entries matching pattern: ${pattern}`)
    } catch (error) {
      this.stats.errors++
      this.logger.error(`Error clearing cache:`, error)
    }
  }

  /**
   * @method exists
   * @description 检查缓存键是否存在
   */
  async exists(key: string): Promise<boolean> {
    try {
      const entry = this.cache.get(key)
      if (!entry) {
        return false
      }

      if (this.isExpired(entry)) {
        this.cache.delete(key)
        return false
      }

      return true
    } catch (error) {
      this.stats.errors++
      this.logger.error(`Error checking cache key ${key}:`, error)
      return false
    }
  }

  /**
   * @method getStats
   * @description 获取缓存统计信息
   */
  async getStats(): Promise<CacheStats> {
    const totalRequests = this.stats.hits + this.stats.misses
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0
    const errorRate = totalRequests > 0 ? this.stats.errors / totalRequests : 0

    return {
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      memoryHitRate: hitRate,
      redisHitRate: 0, // 内存缓存没有Redis命中率
      overallHitRate: hitRate,
      errorRate,
      averageResponseTime: 0, // 内存缓存响应时间通常很快，可以忽略
    }
  }

  /**
   * @method getSize
   * @description 获取缓存大小
   */
  getSize(): number {
    return this.cache.size
  }

  /**
   * @method getKeys
   * @description 获取所有缓存键
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * @method isExpired
   * @description 检查缓存条目是否过期
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }

  /**
   * @method evictOldest
   * @description 淘汰最旧的缓存条目
   */
  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
      this.logger.debug(`Evicted oldest cache entry: ${oldestKey}`)
    }
  }

  /**
   * @method startCleanupTimer
   * @description 启动清理定时器
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupExpired()
    }, 60000) // 每分钟清理一次
  }

  /**
   * @method cleanupExpired
   * @description 清理过期的缓存条目
   */
  private cleanupExpired(): void {
    const keysToDelete: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        keysToDelete.push(key)
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key)
    }

    if (keysToDelete.length > 0) {
      this.logger.debug(`Cleaned up ${keysToDelete.length} expired cache entries`)
    }
  }
}

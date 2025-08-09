import { Injectable } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { ClsService } from 'nestjs-cls'
import {
  CacheOptions,
  CacheStats,
  TenantAwareCacheService as ITenantAwareCacheService
} from '../interfaces/cache.interface'
import { MultiLevelCacheService } from './multi-level-cache.service'
import { ClsBasedCacheKeyGenerator } from '../utils/cache-key.generator'

/**
 * @class TenantAwareCacheService
 * @description 租户感知缓存服务，自动根据租户上下文进行缓存隔离
 * 
 * 主要原理与机制：
 * 1. 基于nestjs-cls获取当前请求的租户上下文
 * 2. 自动为每个租户创建独立的缓存命名空间
 * 3. 支持租户级别的缓存统计和监控
 * 4. 提供租户缓存预热和批量操作功能
 * 5. 实现租户级别的缓存失效策略
 */
@Injectable()
export class TenantAwareCacheService implements ITenantAwareCacheService {
  private readonly logger = new Logger(TenantAwareCacheService.name)
  private readonly tenantStats = new Map<string, CacheStats>()

  constructor(
    private readonly multiLevelCache: MultiLevelCacheService,
    private readonly cls: ClsService,
    private readonly keyGenerator: ClsBasedCacheKeyGenerator,
  ) { }

  /**
   * @method getTenantData
   * @description 获取租户数据（带缓存）
   * 
   * @param key 缓存键
   * @param fetchFunction 数据获取函数
   * @param options 缓存选项
   * @returns 租户数据
   */
  async getTenantData<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    const tenantId = this.getCurrentTenantId()
    const cacheKey = `tenant:${tenantId}:${key}`

    // 尝试从缓存获取
    const cached = await this.multiLevelCache.get<T>(cacheKey)
    if (cached) {
      this.logger.debug(`Tenant cache hit: ${cacheKey}`)
      return cached
    }

    // 从数据源获取
    this.logger.debug(`Tenant cache miss: ${cacheKey}, fetching from data source`)
    const data = await fetchFunction()

    // 缓存结果
    const ttl = options?.ttl || 1800 // 默认30分钟
    await this.multiLevelCache.set(cacheKey, data, {
      ...options,
      ttl,
      strategy: 'memory-first',
    })

    return data
  }

  /**
   * @method get
   * @description 获取缓存值（带租户上下文）
   */
  async get<T>(key: string): Promise<T | null> {
    const tenantId = this.getCurrentTenantId()
    const cacheKey = `tenant:${tenantId}:${key}`
    return await this.multiLevelCache.get<T>(cacheKey)
  }

  /**
   * @method set
   * @description 设置缓存值（带租户上下文）
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const tenantId = this.getCurrentTenantId()
    const cacheKey = `tenant:${tenantId}:${key}`
    await this.multiLevelCache.set(cacheKey, value, options)
  }

  /**
   * @method delete
   * @description 删除缓存（带租户上下文）
   */
  async delete(key: string): Promise<void> {
    const tenantId = this.getCurrentTenantId()
    const cacheKey = `tenant:${tenantId}:${key}`
    await this.multiLevelCache.delete(cacheKey)
  }

  /**
   * @method clear
   * @description 清除缓存（带租户上下文）
   */
  async clear(pattern?: string): Promise<void> {
    const tenantId = this.getCurrentTenantId()
    const tenantPattern = `cache:tenant:${tenantId}${pattern ? `:${pattern}` : ':*'}`
    await this.multiLevelCache.clear(tenantPattern)
  }

  /**
   * @method exists
   * @description 检查缓存是否存在（带租户上下文）
   */
  async exists(key: string): Promise<boolean> {
    const tenantId = this.getCurrentTenantId()
    const cacheKey = `tenant:${tenantId}:${key}`
    return await this.multiLevelCache.exists(cacheKey)
  }

  /**
   * @method getStats
   * @description 获取缓存统计信息
   */
  async getStats(): Promise<CacheStats> {
    return await this.multiLevelCache.getStats()
  }

  /**
   * @method getFromMemory
   * @description 从内存缓存获取（带租户上下文）
   */
  async getFromMemory<T>(key: string): Promise<T | null> {
    const tenantId = this.getCurrentTenantId()
    const cacheKey = `tenant:${tenantId}:${key}`
    return await this.multiLevelCache.getFromMemory<T>(cacheKey)
  }

  /**
   * @method getFromRedis
   * @description 从Redis缓存获取（带租户上下文）
   */
  async getFromRedis<T>(key: string): Promise<T | null> {
    const tenantId = this.getCurrentTenantId()
    const cacheKey = `tenant:${tenantId}:${key}`
    return await this.multiLevelCache.getFromRedis<T>(cacheKey)
  }

  /**
   * @method setToMemory
   * @description 设置到内存缓存（带租户上下文）
   */
  async setToMemory<T>(key: string, value: T, ttl?: number): Promise<void> {
    const tenantId = this.getCurrentTenantId()
    const cacheKey = `tenant:${tenantId}:${key}`
    await this.multiLevelCache.setToMemory(cacheKey, value, ttl)
  }

  /**
   * @method setToRedis
   * @description 设置到Redis缓存（带租户上下文）
   */
  async setToRedis<T>(key: string, value: T, ttl?: number): Promise<void> {
    const tenantId = this.getCurrentTenantId()
    const cacheKey = `tenant:${tenantId}:${key}`
    await this.multiLevelCache.setToRedis(cacheKey, value, ttl)
  }

  /**
   * @method invalidateByPattern
   * @description 按模式清除缓存（带租户上下文）
   */
  async invalidateByPattern(pattern: string): Promise<void> {
    const tenantId = this.getCurrentTenantId()
    const tenantPattern = `tenant:${tenantId}:${pattern}`
    await this.multiLevelCache.invalidateByPattern(tenantPattern)
  }

  /**
   * @method warmUp
   * @description 缓存预热（带租户上下文）
   */
  async warmUp(keys: string[]): Promise<void> {
    const tenantId = this.getCurrentTenantId()
    const tenantKeys = keys.map(key => `tenant:${tenantId}:${key}`)
    await this.multiLevelCache.warmUp(tenantKeys)
  }

  /**
   * @method invalidateTenantCache
   * @description 清除租户相关缓存
   * 
   * @param tenantId 租户ID（可选，默认从CLS获取）
   */
  async invalidateTenantCache(tenantId?: string): Promise<void> {
    const targetTenantId = tenantId || this.getCurrentTenantId()
    const pattern = `tenant:${targetTenantId}:*`

    try {
      await this.multiLevelCache.invalidateByPattern(pattern)
      this.logger.log(`Invalidated cache for tenant: ${targetTenantId}`)
    } catch (error) {
      this.logger.error(`Error invalidating cache for tenant ${targetTenantId}:`, error)
    }
  }

  /**
   * @method getTenantStats
   * @description 获取租户缓存统计信息
   * 
   * @param tenantId 租户ID（可选，默认从CLS获取）
   */
  async getTenantStats(tenantId?: string): Promise<CacheStats> {
    const targetTenantId = tenantId || this.getCurrentTenantId()

    // 这里可以实现更详细的租户级别统计
    // 目前返回全局统计信息
    return await this.multiLevelCache.getStats()
  }

  /**
   * @method warmUpTenantCache
   * @description 预热租户缓存
   * 
   * @param keys 要预热的键列表
   * @param tenantId 租户ID（可选，默认从CLS获取）
   */
  async warmUpTenantCache(keys: string[], tenantId?: string): Promise<void> {
    const targetTenantId = tenantId || this.getCurrentTenantId()
    const tenantKeys = keys.map(key => `tenant:${targetTenantId}:${key}`)

    try {
      await this.multiLevelCache.warmUp(tenantKeys)
      this.logger.log(`Warmed up ${keys.length} cache entries for tenant: ${targetTenantId}`)
    } catch (error) {
      this.logger.error(`Error warming up cache for tenant ${targetTenantId}:`, error)
    }
  }

  /**
   * @method getCurrentTenantId
   * @description 获取当前租户ID
   * 
   * @returns 当前租户ID
   */
  private getCurrentTenantId(): string {
    return this.cls.get('tenantId') ||
      this.cls.get('tenant')?.id ||
      'default'
  }

  /**
   * @method setTenantContext
   * @description 设置租户上下文
   * 
   * @param tenantId 租户ID
   */
  setTenantContext(tenantId: string): void {
    this.cls.set('tenantId', tenantId)
  }

  /**
   * @method getTenantContext
   * @description 获取租户上下文
   * 
   * @returns 租户上下文信息
   */
  getTenantContext(): Record<string, any> {
    return {
      tenantId: this.getCurrentTenantId(),
      userId: this.cls.get('userId'),
      requestId: this.cls.get('requestId'),
    }
  }
}

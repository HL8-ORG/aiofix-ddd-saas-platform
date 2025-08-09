import { Injectable } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { TenantCache, Cache, InvalidateCache, SkipCache } from '../decorators/cache.decorator'
import { TenantAwareCacheService } from '../services/tenant-aware-cache.service'

/**
 * @class CacheUsageExample
 * @description 缓存使用示例，展示如何使用各种缓存功能
 * 
 * 主要示例包括：
 * 1. 基础缓存使用
 * 2. 租户感知缓存
 * 3. 缓存失效
 * 4. 缓存预热
 * 5. 缓存统计
 */
@Injectable()
export class CacheUsageExample {
  private readonly logger = new Logger(CacheUsageExample.name)

  constructor(
    private readonly tenantCache: TenantAwareCacheService,
  ) { }

  /**
   * @method getTenantData
   * @description 获取租户数据示例（带缓存）
   * 
   * 使用@TenantCache装饰器自动添加租户上下文
   */
  @TenantCache('tenant:data', { ttl: 1800, tags: ['tenant', 'data'] })
  async getTenantData(tenantId: string): Promise<any> {
    // 模拟从数据库获取数据
    this.logger.log(`Fetching tenant data for: ${tenantId}`)

    // 模拟数据库查询延迟
    await new Promise(resolve => setTimeout(resolve, 100))

    return {
      tenantId,
      name: `Tenant ${tenantId}`,
      settings: {
        theme: 'dark',
        language: 'zh-CN',
      },
      createdAt: new Date().toISOString(),
    }
  }

  /**
   * @method getUserProfile
   * @description 获取用户资料示例（带缓存）
   * 
   * 使用@Cache装饰器进行基础缓存
   */
  @Cache('user:profile', { ttl: 3600, tags: ['user', 'profile'] })
  async getUserProfile(userId: string): Promise<any> {
    this.logger.log(`Fetching user profile for: ${userId}`)

    // 模拟数据库查询
    await new Promise(resolve => setTimeout(resolve, 150))

    return {
      userId,
      name: `User ${userId}`,
      email: `user${userId}@example.com`,
      avatar: `https://example.com/avatars/${userId}.jpg`,
      lastLogin: new Date().toISOString(),
    }
  }

  /**
   * @method updateTenantSettings
   * @description 更新租户设置示例（带缓存失效）
   * 
   * 使用@InvalidateCache装饰器在更新后清除相关缓存
   */
  @InvalidateCache('tenant:data')
  async updateTenantSettings(tenantId: string, settings: any): Promise<void> {
    this.logger.log(`Updating tenant settings for: ${tenantId}`)

    // 模拟数据库更新
    await new Promise(resolve => setTimeout(resolve, 200))

    this.logger.log(`Tenant settings updated for: ${tenantId}`)
  }

  /**
   * @method getSystemStats
   * @description 获取系统统计示例（跳过缓存）
   * 
   * 使用@SkipCache装饰器跳过缓存
   */
  @SkipCache()
  async getSystemStats(): Promise<any> {
    this.logger.log('Fetching real-time system stats')

    // 模拟实时数据获取
    await new Promise(resolve => setTimeout(resolve, 50))

    return {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      disk: Math.random() * 100,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * @method warmUpTenantCache
   * @description 预热租户缓存示例
   */
  async warmUpTenantCache(tenantId: string): Promise<void> {
    this.logger.log(`Warming up cache for tenant: ${tenantId}`)

    // 预热常用数据
    const keysToWarm = [
      'tenant:data',
      'tenant:settings',
      'tenant:permissions',
    ]

    await this.tenantCache.warmUpTenantCache(keysToWarm, tenantId)

    this.logger.log(`Cache warmed up for tenant: ${tenantId}`)
  }

  /**
   * @method getCacheStats
   * @description 获取缓存统计示例
   */
  async getCacheStats(): Promise<any> {
    const stats = await this.tenantCache.getStats()

    this.logger.log('Cache statistics:', {
      totalHits: stats.totalHits,
      totalMisses: stats.totalMisses,
      memoryHitRate: `${(stats.memoryHitRate * 100).toFixed(2)}%`,
      redisHitRate: `${(stats.redisHitRate * 100).toFixed(2)}%`,
      overallHitRate: `${(stats.overallHitRate * 100).toFixed(2)}%`,
      errorRate: `${(stats.errorRate * 100).toFixed(2)}%`,
    })

    return stats
  }

  /**
   * @method invalidateTenantCache
   * @description 清除租户缓存示例
   */
  async invalidateTenantCache(tenantId: string): Promise<void> {
    this.logger.log(`Invalidating cache for tenant: ${tenantId}`)

    await this.tenantCache.invalidateTenantCache(tenantId)

    this.logger.log(`Cache invalidated for tenant: ${tenantId}`)
  }

  /**
   * @method getTenantDataWithManualCache
   * @description 手动缓存使用示例
   */
  async getTenantDataWithManualCache(tenantId: string): Promise<any> {
    // 手动设置租户上下文
    this.tenantCache.setTenantContext(tenantId)

    // 使用getTenantData方法自动处理缓存
    const data = await this.tenantCache.getTenantData(
      'manual:tenant:data',
      async () => {
        // 模拟从数据库获取数据
        this.logger.log(`Manually fetching tenant data for: ${tenantId}`)
        await new Promise(resolve => setTimeout(resolve, 100))

        return {
          tenantId,
          name: `Manual Tenant ${tenantId}`,
          data: 'This is manually cached data',
          timestamp: new Date().toISOString(),
        }
      },
      { ttl: 900, tags: ['manual', 'tenant'] }
    )

    return data
  }

  /**
   * @method demonstrateCacheIsolation
   * @description 演示缓存隔离示例
   */
  async demonstrateCacheIsolation(): Promise<void> {
    const tenant1 = 'tenant-001'
    const tenant2 = 'tenant-002'

    // 为不同租户设置数据
    this.tenantCache.setTenantContext(tenant1)
    await this.tenantCache.set('test:key', { data: 'Tenant 1 Data' })

    this.tenantCache.setTenantContext(tenant2)
    await this.tenantCache.set('test:key', { data: 'Tenant 2 Data' })

    // 验证隔离性
    this.tenantCache.setTenantContext(tenant1)
    const data1 = await this.tenantCache.get('test:key')

    this.tenantCache.setTenantContext(tenant2)
    const data2 = await this.tenantCache.get('test:key')

    this.logger.log('Cache isolation test:', {
      tenant1: data1,
      tenant2: data2,
      isolated: data1?.data !== data2?.data,
    })
  }
}

import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { User } from '../../domain/entities/user.entity'
import type { UserInfrastructureConfig } from '../config/user-infrastructure.config'

/**
 * @interface CacheEntry
 * @description
 * 缓存条目接口，定义缓存数据的结构。
 *
 * 主要字段：
 * 1. data: 缓存的数据内容
 * 2. timestamp: 缓存创建时间戳
 * 3. ttl: 缓存过期时间（秒）
 */
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

/**
 * @class UserCacheService
 * @description
 * 用户缓存服务，负责用户数据的缓存管理。
 * 提供用户信息的快速访问，减少数据库查询压力。
 *
 * 主要功能：
 * 1. 用户信息缓存：缓存用户基本信息、状态等
 * 2. 用户列表缓存：缓存分页查询结果
 * 3. 缓存失效管理：自动清理过期缓存
 * 4. 缓存统计：提供缓存命中率等统计信息
 *
 * 主要原理与机制：
 * 1. 使用内存Map实现缓存存储，支持TTL过期机制
 * 2. 通过配置服务获取缓存策略参数
 * 3. 支持缓存预热、批量操作等高级功能
 * 4. 提供缓存统计和监控能力
 */
@Injectable()
export class UserCacheService {
  private readonly logger = new Logger(UserCacheService.name)
  private readonly cache = new Map<string, CacheEntry<any>>()
  private readonly config: UserInfrastructureConfig

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) {
    this.config =
      this.configService.get<UserInfrastructureConfig>('userInfrastructure')

    // 启动缓存清理定时器
    if (this.config.cache.enabled) {
      this.startCleanupTimer()
    }
  }

  /**
   * @method get
   * @description 从缓存中获取数据
   * @param key 缓存键
   * @returns 缓存的数据，如果不存在或已过期则返回null
   */
  get<T>(key: string): T | null {
    if (!this.config.cache.enabled) {
      return null
    }

    const entry = this.cache.get(key)
    if (!entry) {
      return null
    }

    // 检查是否过期
    if (this.isExpired(entry)) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * @method set
   * @description 将数据存储到缓存中
   * @param key 缓存键
   * @param data 要缓存的数据
   * @param ttl 过期时间（秒），默认使用配置的TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    if (!this.config.cache.enabled) {
      return
    }

    // 检查缓存大小限制
    if (this.cache.size >= this.config.cache.maxSize) {
      this.evictOldest()
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.cache.ttl,
    }

    this.cache.set(key, entry)
  }

  /**
   * @method delete
   * @description 从缓存中删除数据
   * @param key 缓存键
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * @method clear
   * @description 清空所有缓存
   */
  clear(): void {
    this.cache.clear()
    this.logger.log('用户缓存已清空')
  }

  /**
   * @method getUser
   * @description 获取用户缓存
   * @param userId 用户ID
   * @param tenantId 租户ID
   * @returns 用户数据或null
   */
  getUser(userId: string, tenantId: string): User | null {
    const key = this.buildUserKey(userId, tenantId)
    return this.get<User>(key)
  }

  /**
   * @method setUser
   * @description 缓存用户数据
   * @param user 用户实体
   * @param ttl 过期时间（可选）
   */
  setUser(user: User, ttl?: number): void {
    const key = this.buildUserKey(user.id, user.tenantId)
    this.set(key, user, ttl)
  }

  /**
   * @method deleteUser
   * @description 删除用户缓存
   * @param userId 用户ID
   * @param tenantId 租户ID
   */
  deleteUser(userId: string, tenantId: string): void {
    const key = this.buildUserKey(userId, tenantId)
    this.delete(key)
  }

  /**
   * @method getUserList
   * @description 获取用户列表缓存
   * @param tenantId 租户ID
   * @param page 页码
   * @param limit 每页数量
   * @param filters 过滤条件
   * @returns 用户列表数据或null
   */
  getUserList(
    tenantId: string,
    page: number,
    limit: number,
    filters?: Record<string, any>,
  ): { users: User[]; total: number } | null {
    const key = this.buildUserListKey(tenantId, page, limit, filters)
    return this.get<{ users: User[]; total: number }>(key)
  }

  /**
   * @method setUserList
   * @description 缓存用户列表数据
   * @param tenantId 租户ID
   * @param page 页码
   * @param limit 每页数量
   * @param filters 过滤条件
   * @param data 用户列表数据
   * @param ttl 过期时间（可选）
   */
  setUserList(
    tenantId: string,
    page: number,
    limit: number,
    filters: Record<string, any> | undefined,
    data: { users: User[]; total: number },
    ttl?: number,
  ): void {
    const key = this.buildUserListKey(tenantId, page, limit, filters)
    this.set(key, data, ttl)
  }

  /**
   * @method invalidateUserList
   * @description 使租户下的所有用户列表缓存失效
   * @param tenantId 租户ID
   */
  invalidateUserList(tenantId: string): void {
    const pattern = `user-list:${tenantId}:`
    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) {
        this.delete(key)
      }
    }
    this.logger.log(`已清除租户 ${tenantId} 的用户列表缓存`)
  }

  /**
   * @method getStats
   * @description 获取缓存统计信息
   * @returns 缓存统计对象
   */
  getStats(): {
    size: number
    maxSize: number
    enabled: boolean
    ttl: number
  } {
    return {
      size: this.cache.size,
      maxSize: this.config.cache.maxSize,
      enabled: this.config.cache.enabled,
      ttl: this.config.cache.ttl,
    }
  }

  /**
   * @private
   * @method buildUserKey
   * @description 构建用户缓存键
   */
  private buildUserKey(userId: string, tenantId: string): string {
    return `user:${tenantId}:${userId}`
  }

  /**
   * @private
   * @method buildUserListKey
   * @description 构建用户列表缓存键
   */
  private buildUserListKey(
    tenantId: string,
    page: number,
    limit: number,
    filters?: Record<string, any>,
  ): string {
    const filterStr = filters ? JSON.stringify(filters) : 'no-filters'
    return `user-list:${tenantId}:${page}:${limit}:${filterStr}`
  }

  /**
   * @private
   * @method isExpired
   * @description 检查缓存条目是否过期
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    const now = Date.now()
    const expirationTime = entry.timestamp + entry.ttl * 1000
    return now > expirationTime
  }

  /**
   * @private
   * @method evictOldest
   * @description 清除最旧的缓存条目
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
      this.logger.debug(`已清除最旧的缓存条目: ${oldestKey}`)
    }
  }

  /**
   * @private
   * @method startCleanupTimer
   * @description 启动缓存清理定时器
   */
  private startCleanupTimer(): void {
    // 每5分钟清理一次过期缓存
    setInterval(
      () => {
        let cleanedCount = 0
        for (const [key, entry] of this.cache.entries()) {
          if (this.isExpired(entry)) {
            this.cache.delete(key)
            cleanedCount++
          }
        }
        if (cleanedCount > 0) {
          this.logger.debug(`清理了 ${cleanedCount} 个过期缓存条目`)
        }
      },
      5 * 60 * 1000,
    )
  }
}

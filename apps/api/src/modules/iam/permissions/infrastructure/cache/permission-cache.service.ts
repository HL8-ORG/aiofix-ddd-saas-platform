import { Injectable, Logger } from '@nestjs/common'
import type { Permission } from '../../domain/entities/permission.entity'

/**
 * @interface CacheEntry
 * @description 缓存条目接口
 */
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

/**
 * @class PermissionCacheService
 * @description
 * 权限缓存服务，负责权限数据的缓存管理。
 * 提供权限信息的快速访问，减少数据库查询压力，提升权限校验性能。
 */
@Injectable()
export class PermissionCacheService {
  private readonly logger = new Logger(PermissionCacheService.name)
  private readonly cache = new Map<string, CacheEntry<any>>()
  private readonly config = {
    enabled: true,
    ttl: 300, // 5分钟
    maxSize: 1000,
    cleanupInterval: 60000, // 1分钟
  }

  constructor() {
    if (this.config.enabled) {
      this.startCleanupTimer()
    }
  }

  /**
   * @method get
   * @description 从缓存中获取数据
   */
  get<T>(key: string): T | null {
    if (!this.config.enabled) {
      return null
    }

    const entry = this.cache.get(key)
    if (!entry || this.isExpired(entry)) {
      if (entry) this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * @method set
   * @description 将数据存储到缓存中
   */
  set<T>(key: string, data: T, ttl?: number): void {
    if (!this.config.enabled) {
      return
    }

    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest()
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.ttl,
    }

    this.cache.set(key, entry)
  }

  /**
   * @method delete
   * @description 从缓存中删除数据
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
  }

  /**
   * @method getPermission
   * @description 获取权限缓存
   */
  getPermission(permissionId: string, tenantId: string): Permission | null {
    const key = `permission:${tenantId}:${permissionId}`
    return this.get<Permission>(key)
  }

  /**
   * @method setPermission
   * @description 设置权限缓存
   */
  setPermission(permission: Permission, ttl?: number): void {
    const key = `permission:${permission.tenantId}:${permission.id}`
    this.set(key, permission, ttl)
  }

  /**
   * @method deletePermission
   * @description 删除权限缓存
   */
  deletePermission(permissionId: string, tenantId: string): void {
    const key = `permission:${tenantId}:${permissionId}`
    this.delete(key)
  }

  /**
   * @method getPermissionList
   * @description 获取权限列表缓存
   */
  getPermissionList(
    tenantId: string,
    page: number,
    limit: number,
    filters?: Record<string, any>,
  ): { permissions: Permission[]; total: number } | null {
    const filterStr = filters ? JSON.stringify(filters) : 'no-filters'
    const key = `permission_list:${tenantId}:${page}:${limit}:${filterStr}`
    return this.get<{ permissions: Permission[]; total: number }>(key)
  }

  /**
   * @method setPermissionList
   * @description 设置权限列表缓存
   */
  setPermissionList(
    tenantId: string,
    page: number,
    limit: number,
    filters: Record<string, any> | undefined,
    data: { permissions: Permission[]; total: number },
    ttl?: number,
  ): void {
    const filterStr = filters ? JSON.stringify(filters) : 'no-filters'
    const key = `permission_list:${tenantId}:${page}:${limit}:${filterStr}`
    this.set(key, data, ttl)
  }

  /**
   * @method invalidatePermissionList
   * @description 使权限列表缓存失效
   */
  invalidatePermissionList(tenantId: string): void {
    const keysToDelete: string[] = []
    for (const key of this.cache.keys()) {
      if (key.startsWith(`permission_list:${tenantId}:`)) {
        keysToDelete.push(key)
      }
    }
    keysToDelete.forEach(key => this.delete(key))
  }

  /**
   * @method getUserPermissions
   * @description 获取用户权限缓存
   */
  getUserPermissions(userId: string, tenantId: string): Permission[] | null {
    const key = `user_permissions:${tenantId}:${userId}`
    return this.get<Permission[]>(key)
  }

  /**
   * @method setUserPermissions
   * @description 设置用户权限缓存
   */
  setUserPermissions(
    userId: string,
    tenantId: string,
    permissions: Permission[],
    ttl?: number,
  ): void {
    const key = `user_permissions:${tenantId}:${userId}`
    this.set(key, permissions, ttl)
  }

  /**
   * @method deleteUserPermissions
   * @description 删除用户权限缓存
   */
  deleteUserPermissions(userId: string, tenantId: string): void {
    const key = `user_permissions:${tenantId}:${userId}`
    this.delete(key)
  }

  /**
   * @method getStats
   * @description 获取缓存统计信息
   */
  getStats(): {
    size: number
    maxSize: number
    enabled: boolean
    ttl: number
  } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      enabled: this.config.enabled,
      ttl: this.config.ttl,
    }
  }

  /**
   * @method isExpired
   * @description 检查缓存条目是否过期
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    const now = Date.now()
    const expirationTime = entry.timestamp + entry.ttl * 1000
    return now > expirationTime
  }

  /**
   * @method evictOldest
   * @description 淘汰最旧的缓存条目
   */
  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTimestamp = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp
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
   * @description 启动缓存清理定时器
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      const keysToDelete: string[] = []
      for (const [key, entry] of this.cache.entries()) {
        if (this.isExpired(entry)) {
          keysToDelete.push(key)
        }
      }
      keysToDelete.forEach(key => this.cache.delete(key))
      this.logger.debug(`Cleaned up ${keysToDelete.length} expired cache entries`)
    }, this.config.cleanupInterval)
  }
} 
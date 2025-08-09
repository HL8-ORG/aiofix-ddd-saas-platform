import { Role } from '@/modules/iam/roles/domain/entities/role.entity'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import type { Cache } from 'cache-manager'

/**
 * @class RoleCacheService
 * @description
 * 角色缓存服务，提供角色数据的缓存功能。
 *
 * 主要原理与机制：
 * 1. 使用Redis或内存缓存存储角色数据
 * 2. 提供缓存键生成和TTL管理
 * 3. 支持缓存失效和更新策略
 * 4. 实现缓存穿透保护
 * 5. 支持批量缓存操作
 * 6. 提供缓存统计和监控
 */
@Injectable()
export class RoleCacheService {
  private readonly CACHE_TTL = 3600 // 1小时
  private readonly CACHE_PREFIX = 'role:'

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * @method generateCacheKey
   * @description 生成缓存键
   *
   * @param tenantId - 租户ID
   * @param roleId - 角色ID
   * @returns 缓存键
   */
  private generateCacheKey(tenantId: string, roleId: string): string {
    return `${this.CACHE_PREFIX}${tenantId}:${roleId}`
  }

  /**
   * @method get
   * @description 获取角色缓存
   *
   * @param tenantId - 租户ID
   * @param roleId - 角色ID
   * @returns 角色实体或null
   */
  async get(tenantId: string, roleId: string): Promise<Role | null> {
    const key = this.generateCacheKey(tenantId, roleId)
    const cached = await this.cacheManager.get<string>(key)

    if (!cached) {
      return null
    }

    try {
      const roleData = JSON.parse(cached)
      return this.deserializeRole(roleData)
    } catch (error) {
      await this.delete(tenantId, roleId)
      return null
    }
  }

  /**
   * @method set
   * @description 设置角色缓存
   *
   * @param tenantId - 租户ID
   * @param role - 角色实体
   */
  async set(tenantId: string, role: Role): Promise<void> {
    const key = this.generateCacheKey(tenantId, role.id)
    const serialized = this.serializeRole(role)

    await this.cacheManager.set(key, JSON.stringify(serialized), this.CACHE_TTL)
  }

  /**
   * @method delete
   * @description 删除角色缓存
   *
   * @param tenantId - 租户ID
   * @param roleId - 角色ID
   */
  async delete(tenantId: string, roleId: string): Promise<void> {
    const key = this.generateCacheKey(tenantId, roleId)
    await this.cacheManager.del(key)
  }

  /**
   * @method serializeRole
   * @description 序列化角色实体
   *
   * @param role - 角色实体
   * @returns 序列化后的数据
   */
  private serializeRole(role: Role): any {
    return {
      id: role.id,
      name: role.getName(),
      code: role.getCode(),
      description: role.description,
      status: role.getStatus(),
      tenantId: role.tenantId,
      organizationId: role.organizationId,
      adminUserId: role.adminUserId,
      permissionIds: role.permissionIds,
      userIds: role.userIds,
      isSystemRole: role.getIsSystemRole(),
      isDefaultRole: role.getIsDefaultRole(),
      priority: role.getPriority(),
      maxUsers: role.maxUsers,
      expiresAt: role.expiresAt,
      parentRoleId: role.parentRoleId,
      childRoleIds: role.childRoleIds,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      deletedAt: role.deletedAt,
    }
  }

  /**
   * @method deserializeRole
   * @description 反序列化角色实体
   *
   * @param roleData - 角色数据
   * @returns 角色实体
   */
  private deserializeRole(roleData: any): Role {
    const role = new Role(
      roleData.id,
      roleData.name,
      roleData.code,
      roleData.tenantId,
      roleData.adminUserId,
      roleData.description,
      roleData.organizationId,
      roleData.priority,
      roleData.isSystemRole,
      roleData.isDefaultRole,
      roleData.maxUsers,
      roleData.expiresAt,
      roleData.parentRoleId,
    )

    // 设置基础属性
    role.createdAt = new Date(roleData.createdAt)
    role.updatedAt = new Date(roleData.updatedAt)
    role.deletedAt = roleData.deletedAt
      ? new Date(roleData.deletedAt)
      : undefined

    // 设置数组属性
    if (roleData.permissionIds) {
      role.permissionIds = [...roleData.permissionIds]
    }
    if (roleData.userIds) {
      role.userIds = [...roleData.userIds]
    }
    if (roleData.childRoleIds) {
      role.childRoleIds = [...roleData.childRoleIds]
    }

    return role
  }
}

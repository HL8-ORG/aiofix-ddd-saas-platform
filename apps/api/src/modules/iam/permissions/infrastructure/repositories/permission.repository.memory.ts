import { Injectable } from '@nestjs/common'
import type { Permission } from '../../domain/entities/permission.entity'
import { PermissionRepository } from '../../domain/repositories/permission.repository'
import type { PermissionAction } from '../../domain/value-objects/permission-action.value-object'
import type { PermissionStatus } from '../../domain/value-objects/permission-status.value-object'
import type { PermissionType } from '../../domain/value-objects/permission-type.value-object'

/**
 * @class PermissionRepositoryMemory
 * @description
 * 基于内存的权限仓储实现，用于测试和开发环境。
 * 支持多租户数据隔离和CASL权限管理。
 */
@Injectable()
export class PermissionRepositoryMemory extends PermissionRepository {
  private permissions = new Map<string, Permission>()

  async save(permission: Permission): Promise<Permission> {
    // 检查权限名称重复
    const existingPermissionByName = await this.findByName(
      permission.getName(),
      permission.tenantId,
    )
    if (existingPermissionByName && existingPermissionByName.id !== permission.id) {
      throw new Error('权限名称已存在')
    }

    // 检查权限代码重复
    const existingPermissionByCode = await this.findByCode(
      permission.getCode(),
      permission.tenantId,
    )
    if (existingPermissionByCode && existingPermissionByCode.id !== permission.id) {
      throw new Error('权限代码已存在')
    }

    this.permissions.set(permission.id, permission)
    return permission
  }

  async findById(id: string, tenantId: string): Promise<Permission | null> {
    const permission = this.permissions.get(id)
    // 只返回未删除的权限（inactive状态表示已删除）
    return permission && permission.tenantId === tenantId && permission.getStatus() !== 'inactive'
      ? permission
      : null
  }

  async findByCode(code: string, tenantId: string): Promise<Permission | null> {
    for (const permission of this.permissions.values()) {
      if (permission.tenantId === tenantId && permission.getCode() === code) {
        return permission
      }
    }
    return null
  }

  async findByName(name: string, tenantId: string): Promise<Permission | null> {
    for (const permission of this.permissions.values()) {
      if (permission.tenantId === tenantId && permission.getName() === name) {
        return permission
      }
    }
    return null
  }

  async findByType(
    type: PermissionType,
    tenantId: string,
    organizationId?: string,
  ): Promise<Permission[]> {
    const permissions: Permission[] = []
    for (const permission of this.permissions.values()) {
      if (
        permission.tenantId === tenantId &&
        permission.getType() === type &&
        (!organizationId || permission.organizationId === organizationId)
      ) {
        permissions.push(permission)
      }
    }
    return permissions
  }

  async findByStatus(
    status: PermissionStatus,
    tenantId: string,
    organizationId?: string,
  ): Promise<Permission[]> {
    const permissions: Permission[] = []
    for (const permission of this.permissions.values()) {
      if (
        permission.tenantId === tenantId &&
        permission.getStatus() === status &&
        (!organizationId || permission.organizationId === organizationId)
      ) {
        permissions.push(permission)
      }
    }
    return permissions
  }

  async findByAction(
    action: PermissionAction,
    tenantId: string,
    organizationId?: string,
  ): Promise<Permission[]> {
    const permissions: Permission[] = []
    for (const permission of this.permissions.values()) {
      if (
        permission.tenantId === tenantId &&
        permission.getAction() === action &&
        (!organizationId || permission.organizationId === organizationId)
      ) {
        permissions.push(permission)
      }
    }
    return permissions
  }

  async findByResource(
    resource: string,
    tenantId: string,
    organizationId?: string,
  ): Promise<Permission[]> {
    const permissions: Permission[] = []
    for (const permission of this.permissions.values()) {
      if (
        permission.tenantId === tenantId &&
        permission.resource === resource &&
        (!organizationId || permission.organizationId === organizationId)
      ) {
        permissions.push(permission)
      }
    }
    return permissions
  }

  async findByModule(
    module: string,
    tenantId: string,
    organizationId?: string,
  ): Promise<Permission[]> {
    const permissions: Permission[] = []
    for (const permission of this.permissions.values()) {
      if (
        permission.tenantId === tenantId &&
        permission.module === module &&
        (!organizationId || permission.organizationId === organizationId)
      ) {
        permissions.push(permission)
      }
    }
    return permissions
  }

  async findByRoleId(roleId: string, tenantId: string): Promise<Permission[]> {
    const permissions: Permission[] = []
    for (const permission of this.permissions.values()) {
      if (permission.tenantId === tenantId && permission.roleIds?.includes(roleId)) {
        permissions.push(permission)
      }
    }
    return permissions
  }

  async findByParentPermissionId(
    parentPermissionId: string,
    tenantId: string,
  ): Promise<Permission[]> {
    const permissions: Permission[] = []
    for (const permission of this.permissions.values()) {
      if (permission.tenantId === tenantId && permission.parentPermissionId === parentPermissionId) {
        permissions.push(permission)
      }
    }
    return permissions
  }

  async findSystemPermissions(tenantId: string): Promise<Permission[]> {
    const permissions: Permission[] = []
    for (const permission of this.permissions.values()) {
      if (permission.tenantId === tenantId && permission.getIsSystemPermission()) {
        permissions.push(permission)
      }
    }
    return permissions
  }

  async findDefaultPermissions(tenantId: string): Promise<Permission[]> {
    const permissions: Permission[] = []
    for (const permission of this.permissions.values()) {
      if (permission.tenantId === tenantId && permission.getIsDefaultPermission()) {
        permissions.push(permission)
      }
    }
    return permissions
  }

  async findExpiredPermissions(tenantId: string): Promise<Permission[]> {
    const permissions: Permission[] = []
    const now = new Date()
    for (const permission of this.permissions.values()) {
      if (permission.tenantId === tenantId && permission.expiresAt && permission.expiresAt < now) {
        permissions.push(permission)
      }
    }
    return permissions
  }

  async findActivePermissions(
    tenantId: string,
    organizationId?: string,
  ): Promise<Permission[]> {
    const permissions: Permission[] = []
    for (const permission of this.permissions.values()) {
      if (
        permission.tenantId === tenantId &&
        permission.getStatus() === 'active' &&
        (!organizationId || permission.organizationId === organizationId)
      ) {
        permissions.push(permission)
      }
    }
    return permissions
  }

  async findAll(
    tenantId: string,
    organizationId?: string,
    page?: number,
    limit?: number,
  ): Promise<{ permissions: Permission[]; total: number }> {
    const permissions: Permission[] = []
    for (const permission of this.permissions.values()) {
      if (
        permission.tenantId === tenantId &&
        permission.getStatus() !== 'deleted' &&
        (!organizationId || permission.organizationId === organizationId)
      ) {
        permissions.push(permission)
      }
    }

    // 按创建时间倒序排序
    permissions.sort((a, b) => {
      const aTime = a.createdAt?.getTime() || 0
      const bTime = b.createdAt?.getTime() || 0
      return bTime - aTime
    })

    const total = permissions.length
    const startIndex = page ? (page - 1) * (limit || 10) : 0
    const endIndex = startIndex + (limit || 10)
    const paginatedPermissions = permissions.slice(startIndex, endIndex)

    return {
      permissions: paginatedPermissions,
      total,
    }
  }

  async search(
    query: string,
    tenantId: string,
    organizationId?: string,
    page?: number,
    limit?: number,
  ): Promise<{ permissions: Permission[]; total: number }> {
    const permissions: Permission[] = []
    const queryLower = query.toLowerCase()

    for (const permission of this.permissions.values()) {
      if (
        permission.tenantId === tenantId &&
        permission.getStatus() !== 'deleted' &&
        (!organizationId || permission.organizationId === organizationId)
      ) {
        const matches =
          permission.getName().toLowerCase().includes(queryLower) ||
          permission.getCode().toLowerCase().includes(queryLower) ||
          permission.description?.toLowerCase().includes(queryLower)

        if (matches) {
          permissions.push(permission)
        }
      }
    }

    // 按创建时间倒序排序
    permissions.sort((a, b) => {
      const aTime = a.createdAt?.getTime() || 0
      const bTime = b.createdAt?.getTime() || 0
      return bTime - aTime
    })

    const total = permissions.length
    const startIndex = page ? (page - 1) * (limit || 10) : 0
    const endIndex = startIndex + (limit || 10)
    const paginatedPermissions = permissions.slice(startIndex, endIndex)

    return {
      permissions: paginatedPermissions,
      total,
    }
  }

  async countByTenant(tenantId: string, organizationId?: string): Promise<number> {
    let count = 0
    for (const permission of this.permissions.values()) {
      if (
        permission.tenantId === tenantId &&
        permission.getStatus() !== 'deleted' &&
        (!organizationId || permission.organizationId === organizationId)
      ) {
        count++
      }
    }
    return count
  }

  async countByType(
    type: PermissionType,
    tenantId: string,
    organizationId?: string,
  ): Promise<number> {
    let count = 0
    for (const permission of this.permissions.values()) {
      if (
        permission.tenantId === tenantId &&
        permission.getType() === type &&
        permission.getStatus() !== 'deleted' &&
        (!organizationId || permission.organizationId === organizationId)
      ) {
        count++
      }
    }
    return count
  }

  async countByStatus(
    status: PermissionStatus,
    tenantId: string,
    organizationId?: string,
  ): Promise<number> {
    let count = 0
    for (const permission of this.permissions.values()) {
      if (
        permission.tenantId === tenantId &&
        permission.getStatus() === status &&
        (!organizationId || permission.organizationId === organizationId)
      ) {
        count++
      }
    }
    return count
  }

  async exists(id: string, tenantId: string): Promise<boolean> {
    const permission = this.permissions.get(id)
    return permission ? permission.tenantId === tenantId : false
  }

  async existsByCode(
    code: string,
    tenantId: string,
    excludeId?: string,
  ): Promise<boolean> {
    for (const permission of this.permissions.values()) {
      if (
        permission.tenantId === tenantId &&
        permission.getCode() === code &&
        permission.id !== excludeId
      ) {
        return true
      }
    }
    return false
  }

  async existsByName(
    name: string,
    tenantId: string,
    excludeId?: string,
  ): Promise<boolean> {
    for (const permission of this.permissions.values()) {
      if (
        permission.tenantId === tenantId &&
        permission.getName() === name &&
        permission.id !== excludeId
      ) {
        return true
      }
    }
    return false
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const permission = this.permissions.get(id)
    if (permission && permission.tenantId === tenantId) {
      permission.markAsDeleted()
      this.permissions.set(id, permission)
      return true
    }
    return false
  }

  async deleteByTenant(tenantId: string): Promise<number> {
    let count = 0
    for (const permission of this.permissions.values()) {
      if (permission.tenantId === tenantId) {
        permission.markAsDeleted()
        this.permissions.set(permission.id, permission)
        count++
      }
    }
    return count
  }

  async deleteByOrganization(
    organizationId: string,
    tenantId: string,
  ): Promise<number> {
    let count = 0
    for (const permission of this.permissions.values()) {
      if (permission.tenantId === tenantId && permission.organizationId === organizationId) {
        permission.markAsDeleted()
        this.permissions.set(permission.id, permission)
        count++
      }
    }
    return count
  }

  async bulkSave(permissions: Permission[]): Promise<Permission[]> {
    for (const permission of permissions) {
      this.permissions.set(permission.id, permission)
    }
    return permissions
  }

  async bulkDelete(ids: string[], tenantId: string): Promise<number> {
    let count = 0
    for (const id of ids) {
      const permission = this.permissions.get(id)
      if (permission && permission.tenantId === tenantId) {
        permission.markAsDeleted()
        this.permissions.set(id, permission)
        count++
      }
    }
    return count
  }

  async findWithConditions(
    tenantId: string,
    organizationId?: string,
  ): Promise<Permission[]> {
    const permissions: Permission[] = []
    for (const permission of this.permissions.values()) {
      if (
        permission.tenantId === tenantId &&
        permission.conditions &&
        (!organizationId || permission.organizationId === organizationId)
      ) {
        permissions.push(permission)
      }
    }
    return permissions
  }

  async findWithFields(
    tenantId: string,
    organizationId?: string,
  ): Promise<Permission[]> {
    const permissions: Permission[] = []
    for (const permission of this.permissions.values()) {
      if (
        permission.tenantId === tenantId &&
        permission.fields &&
        permission.fields.length > 0 &&
        (!organizationId || permission.organizationId === organizationId)
      ) {
        permissions.push(permission)
      }
    }
    return permissions
  }

  async findByTags(
    tags: string[],
    tenantId: string,
    organizationId?: string,
  ): Promise<Permission[]> {
    const permissions: Permission[] = []
    for (const permission of this.permissions.values()) {
      if (
        permission.tenantId === tenantId &&
        permission.tags &&
        tags.some(tag => permission.tags!.includes(tag)) &&
        (!organizationId || permission.organizationId === organizationId)
      ) {
        permissions.push(permission)
      }
    }
    return permissions
  }

  clear(): void {
    this.permissions.clear()
  }
} 
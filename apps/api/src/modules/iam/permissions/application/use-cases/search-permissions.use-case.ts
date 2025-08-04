import { Inject, Injectable } from '@nestjs/common'
import { Permission } from '../../domain/entities/permission.entity'
import type { PermissionRepository } from '../../domain/repositories/permission.repository'
import type { PermissionType } from '../../domain/value-objects/permission-type.value-object'
import type { PermissionStatus } from '../../domain/value-objects/permission-status.value-object'
import type { PermissionAction } from '../../domain/value-objects/permission-action.value-object'

/**
 * @interface SearchPermissionsRequest
 * @description 搜索权限的请求参数
 */
export interface SearchPermissionsRequest {
  query: string
  tenantId: string
  organizationId?: string
  page?: number
  limit?: number
}

/**
 * @interface AdvancedSearchRequest
 * @description 高级搜索权限的请求参数
 */
export interface AdvancedSearchRequest {
  searchCriteria: {
    keyword?: string
    type?: string
    status?: string
    action?: string
    resource?: string
    module?: string
    roleId?: string
    parentPermissionId?: string
    isSystemPermission?: boolean
    isDefaultPermission?: boolean
    hasConditions?: boolean
    hasFields?: boolean
    dateRange?: {
      startDate: Date
      endDate: Date
    }
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }
  tenantId: string
  organizationId?: string
  page?: number
  limit?: number
}

/**
 * @class SearchPermissionsUseCase
 * @description
 * 搜索权限用例，负责权限搜索的核心业务逻辑。
 * 支持简单搜索、高级搜索、权限建议等功能。
 *
 * 主要原理与机制：
 * 1. 遵循DDD的Use Case模式，封装单一业务操作
 * 2. 支持多租户数据隔离，确保搜索安全性
 * 3. 提供多种搜索维度和过滤条件
 * 4. 支持分页和排序功能
 * 5. 支持权限建议和自动完成
 * 6. 支持按不同维度搜索权限
 * 7. 支持日期范围搜索
 */
@Injectable()
export class SearchPermissionsUseCase {
  constructor(
    @Inject('PermissionRepository')
    private readonly permissionRepository: PermissionRepository,
  ) { }

  /**
   * @method execute
   * @description 执行简单搜索权限
   * @param query 搜索关键词
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @param limit 限制数量（可选）
   * @returns {Promise<Permission[]>} 权限列表
   */
  async execute(query: string, tenantId: string, organizationId?: string, limit?: number): Promise<Permission[]> {
    const result = await this.permissionRepository.search(query, tenantId, organizationId, 1, limit)
    return result.permissions
  }

  /**
   * @method executeAdvancedSearch
   * @description 执行高级搜索权限
   * @param request 高级搜索请求参数
   * @returns {Promise<{ permissions: Permission[]; total: number; page: number; limit: number; totalPages: number }>} 搜索结果
   */
  async executeAdvancedSearch(request: AdvancedSearchRequest): Promise<{
    permissions: Permission[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const { searchCriteria, tenantId, organizationId, page = 1, limit = 10 } = request

    // 构建搜索条件
    const filters: any = {}

    if (searchCriteria.type) filters.type = searchCriteria.type
    if (searchCriteria.status) filters.status = searchCriteria.status
    if (searchCriteria.action) filters.action = searchCriteria.action
    if (searchCriteria.resource) filters.resource = searchCriteria.resource
    if (searchCriteria.module) filters.module = searchCriteria.module
    if (searchCriteria.roleId) filters.roleId = searchCriteria.roleId
    if (searchCriteria.parentPermissionId) filters.parentPermissionId = searchCriteria.parentPermissionId
    if (searchCriteria.isSystemPermission !== undefined) filters.isSystemPermission = searchCriteria.isSystemPermission
    if (searchCriteria.isDefaultPermission !== undefined) filters.isDefaultPermission = searchCriteria.isDefaultPermission
    if (searchCriteria.hasConditions !== undefined) filters.hasConditions = searchCriteria.hasConditions
    if (searchCriteria.hasFields !== undefined) filters.hasFields = searchCriteria.hasFields

    // 使用分页查询方法
    const result = await this.permissionRepository.findAll(tenantId, organizationId, page, limit)

    // 根据搜索条件过滤结果
    let filteredPermissions = result.permissions

    if (searchCriteria.keyword) {
      filteredPermissions = filteredPermissions.filter(permission =>
        permission.getName().toLowerCase().includes(searchCriteria.keyword!.toLowerCase()) ||
        permission.getCode().toLowerCase().includes(searchCriteria.keyword!.toLowerCase()) ||
        permission.description?.toLowerCase().includes(searchCriteria.keyword!.toLowerCase())
      )
    }

    if (searchCriteria.dateRange) {
      filteredPermissions = filteredPermissions.filter(permission => {
        const createdAt = new Date(permission.createdAt)
        return createdAt >= searchCriteria.dateRange!.startDate && createdAt <= searchCriteria.dateRange!.endDate
      })
    }

    // 排序
    if (searchCriteria.sortBy && searchCriteria.sortOrder) {
      filteredPermissions.sort((a, b) => {
        const aValue = this.getSortValue(a, searchCriteria.sortBy!)
        const bValue = this.getSortValue(b, searchCriteria.sortBy!)

        if (searchCriteria.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
    }

    const totalPages = Math.ceil(filteredPermissions.length / limit)

    return {
      permissions: filteredPermissions,
      total: filteredPermissions.length,
      page,
      limit,
      totalPages,
    }
  }

  /**
   * @method executeGetPermissionSuggestions
   * @description 获取权限建议
   * @param query 查询关键词
   * @param tenantId 租户ID
   * @param limit 限制数量
   * @returns {Promise<Array<{ id: string; name: string; code: string; type: string; status: string }>>} 权限建议列表
   */
  async executeGetPermissionSuggestions(query: string, tenantId: string, limit = 5): Promise<
    Array<{ id: string; name: string; code: string; type: string; status: string }>
  > {
    const permissions = await this.execute(query, tenantId, undefined, limit)

    return permissions.map(permission => ({
      id: permission.id,
      name: permission.getName(),
      code: permission.getCode(),
      type: permission.getType(),
      status: permission.getStatus(),
    }))
  }

  /**
   * @method executeSearchByName
   * @description 根据名称搜索权限
   * @param name 权限名称
   * @param tenantId 租户ID
   * @returns {Promise<Permission[]>} 权限列表
   */
  async executeSearchByName(name: string, tenantId: string): Promise<Permission[]> {
    const permission = await this.permissionRepository.findByName(name, tenantId)
    return permission ? [permission] : []
  }

  /**
   * @method executeSearchByCode
   * @description 根据代码搜索权限
   * @param code 权限代码
   * @param tenantId 租户ID
   * @returns {Promise<Permission | null>} 权限实体或null
   */
  async executeSearchByCode(code: string, tenantId: string): Promise<Permission | null> {
    return await this.permissionRepository.findByCode(code, tenantId)
  }

  /**
   * @method executeSearchByStatus
   * @description 根据状态搜索权限
   * @param status 权限状态
   * @param tenantId 租户ID
   * @returns {Promise<Permission[]>} 权限列表
   */
  async executeSearchByStatus(status: string, tenantId: string): Promise<Permission[]> {
    return await this.permissionRepository.findByStatus(status as PermissionStatus, tenantId)
  }

  /**
   * @method executeSearchByType
   * @description 根据类型搜索权限
   * @param type 权限类型
   * @param tenantId 租户ID
   * @returns {Promise<Permission[]>} 权限列表
   */
  async executeSearchByType(type: string, tenantId: string): Promise<Permission[]> {
    return await this.permissionRepository.findByType(type as PermissionType, tenantId)
  }

  /**
   * @method executeSearchByAction
   * @description 根据操作搜索权限
   * @param action 权限操作
   * @param tenantId 租户ID
   * @returns {Promise<Permission[]>} 权限列表
   */
  async executeSearchByAction(action: string, tenantId: string): Promise<Permission[]> {
    return await this.permissionRepository.findByAction(action as PermissionAction, tenantId)
  }

  /**
   * @method executeSearchByResource
   * @description 根据资源搜索权限
   * @param resource 权限资源
   * @param tenantId 租户ID
   * @returns {Promise<Permission[]>} 权限列表
   */
  async executeSearchByResource(resource: string, tenantId: string): Promise<Permission[]> {
    return await this.permissionRepository.findByResource(resource, tenantId)
  }

  /**
   * @method executeSearchByModule
   * @description 根据模块搜索权限
   * @param module 权限模块
   * @param tenantId 租户ID
   * @returns {Promise<Permission[]>} 权限列表
   */
  async executeSearchByModule(module: string, tenantId: string): Promise<Permission[]> {
    return await this.permissionRepository.findByModule(module, tenantId)
  }

  /**
   * @method executeSearchByRoleId
   * @description 根据角色ID搜索权限
   * @param roleId 角色ID
   * @param tenantId 租户ID
   * @returns {Promise<Permission[]>} 权限列表
   */
  async executeSearchByRoleId(roleId: string, tenantId: string): Promise<Permission[]> {
    return await this.permissionRepository.findByRoleId(roleId, tenantId)
  }

  /**
   * @method getSortValue
   * @description 获取排序值
   * @param permission 权限实体
   * @param sortBy 排序字段
   * @returns {any} 排序值
   */
  private getSortValue(permission: Permission, sortBy: string): any {
    switch (sortBy) {
      case 'name':
        return permission.getName()
      case 'code':
        return permission.getCode()
      case 'type':
        return permission.getType()
      case 'status':
        return permission.getStatus()
      case 'action':
        return permission.getAction()
      case 'createdAt':
        return new Date(permission.createdAt)
      case 'updatedAt':
        return new Date(permission.updatedAt)
      default:
        return permission.getName()
    }
  }
} 
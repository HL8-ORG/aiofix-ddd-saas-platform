import { Inject, Injectable } from '@nestjs/common'
import { Permission } from '../../domain/entities/permission.entity'
import type { PermissionRepository } from '../../domain/repositories/permission.repository'

/**
 * @interface GetPermissionsRequest
 * @description 获取权限列表的请求参数
 */
export interface GetPermissionsRequest {
  tenantId: string
  organizationId?: string
  page?: number
  limit?: number
  filters?: {
    type?: string
    status?: string
    action?: string
    resource?: string
    module?: string
    search?: string
  }
  sort?: {
    field: 'name' | 'code' | 'type' | 'status' | 'action' | 'createdAt' | 'updatedAt'
    order: 'asc' | 'desc'
  }
}

/**
 * @class GetPermissionsUseCase
 * @description
 * 获取权限列表用例，负责权限查询和分页的核心业务逻辑。
 * 支持多种查询方式，包括分页查询、搜索查询、条件过滤等。
 *
 * 主要原理与机制：
 * 1. 遵循DDD的Use Case模式，封装权限列表查询业务操作
 * 2. 支持多租户数据隔离，确保查询安全性
 * 3. 提供分页查询功能，支持大数据量的权限列表
 * 4. 支持搜索和过滤功能，满足复杂查询需求
 * 5. 支持多种权限类型的查询，如系统权限、默认权限等
 * 6. 支持条件权限和字段权限的查询
 * 7. 支持按标签查询权限
 */
@Injectable()
export class GetPermissionsUseCase {
  constructor(
    @Inject('PermissionRepository')
    private readonly permissionRepository: PermissionRepository,
  ) { }

  /**
   * @method execute
   * @description 执行获取权限列表的业务逻辑
   * @param request 获取权限列表请求参数
   * @returns {Promise<{ permissions: Permission[]; total: number }>} 权限列表和总数
   * 
   * 主要原理与机制：
   * 1. 解析请求参数，包括分页、过滤、排序等
   * 2. 如果有搜索条件，使用搜索方法
   * 3. 否则使用分页查询方法
   * 4. 返回权限列表和总数信息
   */
  async execute(request: GetPermissionsRequest): Promise<{ permissions: Permission[]; total: number }> {
    const { tenantId, organizationId, page = 1, limit = 10, filters, sort } = request

    // 如果有搜索条件，使用搜索方法
    if (filters?.search) {
      return await this.permissionRepository.search(
        filters.search,
        tenantId,
        organizationId,
        page,
        limit,
      )
    }

    // 否则使用分页查询
    return await this.permissionRepository.findAll(tenantId, organizationId, page, limit)
  }

  /**
   * @method executeAllPermissions
   * @description 获取所有权限
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @returns {Promise<Permission[]>} 权限列表
   * 
   * 主要原理与机制：
   * 1. 调用仓储的findAll方法获取所有权限
   * 2. 返回权限实体列表
   * 3. 支持组织级别的权限过滤
   */
  async executeAllPermissions(tenantId: string, organizationId?: string): Promise<Permission[]> {
    const result = await this.permissionRepository.findAll(tenantId, organizationId)
    return result.permissions
  }

  /**
   * @method executeActivePermissions
   * @description 获取激活状态的权限列表
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @returns {Promise<Permission[]>} 激活权限列表
   * 
   * 主要原理与机制：
   * 1. 调用仓储的findActivePermissions方法
   * 2. 只返回状态为激活的权限
   * 3. 支持组织级别的权限过滤
   */
  async executeActivePermissions(tenantId: string, organizationId?: string): Promise<Permission[]> {
    return await this.permissionRepository.findActivePermissions(tenantId, organizationId)
  }

  /**
   * @method executeSystemPermissions
   * @description 获取系统权限列表
   * @param tenantId 租户ID
   * @returns {Promise<Permission[]>} 系统权限列表
   * 
   * 主要原理与机制：
   * 1. 调用仓储的findSystemPermissions方法
   * 2. 返回系统预置的权限列表
   * 3. 系统权限不可删除，受保护
   */
  async executeSystemPermissions(tenantId: string): Promise<Permission[]> {
    return await this.permissionRepository.findSystemPermissions(tenantId)
  }

  /**
   * @method executeDefaultPermissions
   * @description 获取默认权限列表
   * @param tenantId 租户ID
   * @returns {Promise<Permission[]>} 默认权限列表
   * 
   * 主要原理与机制：
   * 1. 调用仓储的findDefaultPermissions方法
   * 2. 返回系统默认的权限列表
   * 3. 默认权限是基础权限，可供参考
   */
  async executeDefaultPermissions(tenantId: string): Promise<Permission[]> {
    return await this.permissionRepository.findDefaultPermissions(tenantId)
  }

  /**
   * @method executeExpiredPermissions
   * @description 获取过期权限列表
   * @param tenantId 租户ID
   * @returns {Promise<Permission[]>} 过期权限列表
   * 
   * 主要原理与机制：
   * 1. 调用仓储的findExpiredPermissions方法
   * 2. 返回已过期的权限列表
   * 3. 过期权限需要及时处理
   */
  async executeExpiredPermissions(tenantId: string): Promise<Permission[]> {
    return await this.permissionRepository.findExpiredPermissions(tenantId)
  }

  /**
   * @method executeWithConditions
   * @description 获取有条件权限的权限列表
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @returns {Promise<Permission[]>} 有条件权限的权限列表
   * 
   * 主要原理与机制：
   * 1. 调用仓储的findWithConditions方法
   * 2. 返回设置了条件权限的权限列表
   * 3. 条件权限支持动态权限控制
   */
  async executeWithConditions(tenantId: string, organizationId?: string): Promise<Permission[]> {
    return await this.permissionRepository.findWithConditions(tenantId, organizationId)
  }

  /**
   * @method executeWithFields
   * @description 获取有字段权限的权限列表
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @returns {Promise<Permission[]>} 有字段权限的权限列表
   * 
   * 主要原理与机制：
   * 1. 调用仓储的findWithFields方法
   * 2. 返回设置了字段权限的权限列表
   * 3. 字段权限支持细粒度数据控制
   */
  async executeWithFields(tenantId: string, organizationId?: string): Promise<Permission[]> {
    return await this.permissionRepository.findWithFields(tenantId, organizationId)
  }

  /**
   * @method executeByTags
   * @description 根据标签获取权限列表
   * @param tags 标签数组
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @returns {Promise<Permission[]>} 权限列表
   * 
   * 主要原理与机制：
   * 1. 调用仓储的findByTags方法
   * 2. 根据标签数组查询匹配的权限
   * 3. 支持多标签查询
   * 4. 支持组织级别的权限过滤
   */
  async executeByTags(tags: string[], tenantId: string, organizationId?: string): Promise<Permission[]> {
    return await this.permissionRepository.findByTags(tags, tenantId, organizationId)
  }
} 
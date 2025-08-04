import { Inject, Injectable } from '@nestjs/common'
import type { Permission } from '../domain/entities/permission.entity'
import type { PermissionRepository } from '../domain/repositories/permission.repository'
import {
  CreatePermissionUseCase,
  DeletePermissionUseCase,
  GetPermissionStatisticsUseCase,
  GetPermissionUseCase,
  GetPermissionsUseCase,
  SearchPermissionsUseCase,
  UpdatePermissionStatusUseCase,
  UpdatePermissionUseCase,
  type CreatePermissionRequest,
  type GetPermissionsRequest,
  type UpdatePermissionRequest,
  type SearchPermissionsRequest,
  type AdvancedSearchRequest,
} from './use-cases'

/**
 * @class PermissionsService
 * @description
 * 权限应用服务，负责协调各个Use Case完成权限管理的业务功能。
 * 这是应用层的核心服务，连接表现层和领域层，提供统一的权限管理接口。
 *
 * 主要原理与机制：
 * 1. 遵循Clean Architecture的应用服务模式
 * 2. 委托业务逻辑给专门的Use Case
 * 3. 提供统一的接口给表现层
 * 4. 处理跨Use Case的协调工作
 * 5. 确保权限管理业务规则的一致性
 * 6. 支持多租户权限隔离
 * 7. 集成CASL权限管理功能
 */
@Injectable()
export class PermissionsService {
  constructor(
    @Inject('PermissionRepository')
    private readonly permissionRepository: PermissionRepository,
    private readonly createPermissionUseCase: CreatePermissionUseCase,
    private readonly getPermissionUseCase: GetPermissionUseCase,
    private readonly getPermissionsUseCase: GetPermissionsUseCase,
    private readonly updatePermissionUseCase: UpdatePermissionUseCase,
    private readonly updatePermissionStatusUseCase: UpdatePermissionStatusUseCase,
    private readonly deletePermissionUseCase: DeletePermissionUseCase,
    private readonly searchPermissionsUseCase: SearchPermissionsUseCase,
    private readonly getPermissionStatisticsUseCase: GetPermissionStatisticsUseCase,
  ) { }

  /**
   * @method createPermission
   * @description 创建新权限
   * @param request 创建权限请求参数
   * @returns {Promise<Permission>} 创建的权限实体
   */
  async createPermission(request: CreatePermissionRequest): Promise<Permission> {
    return await this.createPermissionUseCase.execute(request)
  }

  /**
   * @method getPermissionById
   * @description 根据ID获取权限
   * @param id 权限ID
   * @param tenantId 租户ID
   * @returns {Promise<Permission>} 权限实体
   */
  async getPermissionById(id: string, tenantId: string): Promise<Permission> {
    return await this.getPermissionUseCase.execute(id, tenantId)
  }

  /**
   * @method getPermissionByCode
   * @description 根据代码获取权限
   * @param code 权限代码
   * @param tenantId 租户ID
   * @returns {Promise<Permission>} 权限实体
   */
  async getPermissionByCode(code: string, tenantId: string): Promise<Permission> {
    return await this.getPermissionUseCase.executeByCode(code, tenantId)
  }

  /**
   * @method getPermissionsWithPagination
   * @description 分页获取权限列表
   * @param request 获取权限列表请求参数
   * @returns {Promise<{ permissions: Permission[]; total: number }>} 权限列表和总数
   */
  async getPermissionsWithPagination(request: GetPermissionsRequest): Promise<{ permissions: Permission[]; total: number }> {
    return await this.getPermissionsUseCase.execute(request)
  }

  /**
   * @method activatePermission
   * @description 激活权限
   * @param id 权限ID
   * @param tenantId 租户ID
   * @returns {Promise<Permission>} 激活后的权限实体
   */
  async activatePermission(id: string, tenantId: string): Promise<Permission> {
    return await this.updatePermissionStatusUseCase.executeActivate(id, tenantId)
  }

  /**
   * @method suspendPermission
   * @description 禁用权限
   * @param id 权限ID
   * @param tenantId 租户ID
   * @returns {Promise<Permission>} 禁用后的权限实体
   */
  async suspendPermission(id: string, tenantId: string): Promise<Permission> {
    return await this.updatePermissionStatusUseCase.executeSuspend(id, tenantId)
  }

  /**
   * @method updatePermissionInfo
   * @description 更新权限基本信息
   * @param id 权限ID
   * @param request 更新权限请求参数
   * @param tenantId 租户ID
   * @returns {Promise<Permission>} 更新后的权限实体
   */
  async updatePermissionInfo(id: string, request: UpdatePermissionRequest, tenantId: string): Promise<Permission> {
    return await this.updatePermissionUseCase.execute(id, request, tenantId)
  }

  /**
   * @method deletePermission
   * @description 删除权限（软删除）
   * @param id 权限ID
   * @param tenantId 租户ID
   * @returns {Promise<boolean>} 删除结果
   */
  async deletePermission(id: string, tenantId: string): Promise<boolean> {
    return await this.deletePermissionUseCase.execute(id, tenantId)
  }

  /**
   * @method searchPermissions
   * @description 搜索权限
   * @param query 搜索关键词
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @param limit 限制数量（可选）
   * @returns {Promise<Permission[]>} 权限列表
   */
  async searchPermissions(query: string, tenantId: string, organizationId?: string, limit?: number): Promise<Permission[]> {
    return await this.searchPermissionsUseCase.execute(query, tenantId, organizationId, limit)
  }

  /**
   * @method getPermissionStatistics
   * @description 获取权限统计信息
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @returns {Promise<{ totalPermissions: number; activePermissions: number; suspendedPermissions: number; deletedPermissions: number; systemPermissions: number; defaultPermissions: number; expiredPermissions: number; permissionsWithConditions: number; permissionsWithFields: number }>} 权限统计信息
   */
  async getPermissionStatistics(tenantId: string, organizationId?: string) {
    return await this.getPermissionStatisticsUseCase.execute(tenantId, organizationId)
  }
} 
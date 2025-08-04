import { Injectable } from '@nestjs/common'
import { PermissionRepository } from '@/modules/iam/permissions/domain/repositories/permission.repository'
import { PermissionAction } from '@/modules/iam/permissions/domain/value-objects/permission-action.value-object'
import { PermissionStatus } from '@/modules/iam/permissions/domain/value-objects/permission-status.value-object'
import { PermissionType } from '@/modules/iam/permissions/domain/value-objects/permission-type.value-object'

/**
 * @interface CountPermissionsRequest
 * @description 统计权限数量的请求参数
 */
export interface CountPermissionsRequest {
  tenantId: string
  organizationId?: string
  type?: PermissionType
  status?: PermissionStatus
  action?: PermissionAction
  resource?: string
  module?: string
  adminUserId?: string
  parentPermissionId?: string
  isSystemPermission?: boolean
  isDefaultPermission?: boolean
}

/**
 * @class CountPermissionsUseCase
 * @description
 * 统计权限数量的用例，支持多种筛选条件。
 * 
 * 主要原理与机制：
 * 1. 接收筛选条件，构建查询参数
 * 2. 调用仓储层进行数据统计
 * 3. 支持多租户数据隔离
 * 4. 提供灵活的筛选条件组合
 * 5. 返回统计结果
 */
@Injectable()
export class CountPermissionsUseCase {
  constructor(private readonly permissionRepository: PermissionRepository) { }

  /**
   * @method execute
   * @description 执行统计权限数量
   * @param request 统计请求参数
   * @returns 权限数量
   */
  async execute(request: CountPermissionsRequest): Promise<number> {
    const {
      tenantId,
      organizationId,
      type,
      status,
      action,
      resource,
      module,
      adminUserId,
      parentPermissionId,
      isSystemPermission,
      isDefaultPermission,
    } = request

    // 根据筛选条件调用不同的统计方法
    if (type) {
      return await this.permissionRepository.countByType(type, tenantId, organizationId)
    }

    if (status) {
      return await this.permissionRepository.countByStatus(status, tenantId, organizationId)
    }

    // 如果有其他筛选条件，先获取权限列表再统计
    const permissions = await this.permissionRepository.findAll(
      tenantId,
      organizationId,
      1,
      10000, // 设置较大的限制以获取所有数据
    )

    let filteredPermissions = permissions.permissions

    // 应用筛选条件
    if (action) {
      filteredPermissions = filteredPermissions.filter(p => p.getAction() === action)
    }

    if (resource) {
      filteredPermissions = filteredPermissions.filter(p => p.resource === resource)
    }

    if (module) {
      filteredPermissions = filteredPermissions.filter(p => p.module === module)
    }

    if (adminUserId) {
      filteredPermissions = filteredPermissions.filter(p => p.adminUserId === adminUserId)
    }

    if (parentPermissionId) {
      filteredPermissions = filteredPermissions.filter(p => p.parentPermissionId === parentPermissionId)
    }

    if (isSystemPermission !== undefined) {
      filteredPermissions = filteredPermissions.filter(p => p.isSystemPermission === isSystemPermission)
    }

    if (isDefaultPermission !== undefined) {
      filteredPermissions = filteredPermissions.filter(p => p.isDefaultPermission === isDefaultPermission)
    }

    return filteredPermissions.length
  }
} 
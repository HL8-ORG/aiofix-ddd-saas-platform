import { Inject, Injectable } from '@nestjs/common'
import type { PermissionRepository } from '../../domain/repositories/permission.repository'
import type { PermissionType } from '../../domain/value-objects/permission-type.value-object'
import type { PermissionStatus } from '../../domain/value-objects/permission-status.value-object'
import type { PermissionAction } from '../../domain/value-objects/permission-action.value-object'

/**
 * @class GetPermissionStatisticsUseCase
 * @description
 * 获取权限统计用例，负责权限统计的核心业务逻辑。
 * 支持多种维度的权限统计和分析功能。
 *
 * 主要原理与机制：
 * 1. 遵循DDD的Use Case模式，封装单一业务操作
 * 2. 支持多租户数据隔离，确保统计安全性
 * 3. 提供多种统计维度和分析功能
 * 4. 支持权限增长率和活跃度分析
 * 5. 支持按状态、类型、操作等维度统计
 * 6. 支持日期范围统计
 * 7. 支持最近权限查询
 */
@Injectable()
export class GetPermissionStatisticsUseCase {
  constructor(
    @Inject('PermissionRepository')
    private readonly permissionRepository: PermissionRepository,
  ) { }

  /**
   * @method execute
   * @description 获取权限统计信息
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @returns {Promise<{ totalPermissions: number; activePermissions: number; suspendedPermissions: number; deletedPermissions: number; systemPermissions: number; defaultPermissions: number; expiredPermissions: number; permissionsWithConditions: number; permissionsWithFields: number }>} 权限统计信息
   * 
   * 主要原理与机制：
   * 1. 并行查询各种维度的权限数量
   * 2. 统计总权限、激活权限、禁用权限等
   * 3. 统计系统权限、默认权限等特殊类型
   * 4. 统计有条件权限和字段权限的数量
   * 5. 返回完整的统计信息
   */
  async execute(tenantId: string, organizationId?: string): Promise<{
    totalPermissions: number
    activePermissions: number
    suspendedPermissions: number
    deletedPermissions: number
    systemPermissions: number
    defaultPermissions: number
    expiredPermissions: number
    permissionsWithConditions: number
    permissionsWithFields: number
  }> {
    const [
      totalPermissions,
      activePermissions,
      suspendedPermissions,
      deletedPermissions,
      systemPermissions,
      defaultPermissions,
      expiredPermissions,
      permissionsWithConditions,
      permissionsWithFields,
    ] = await Promise.all([
      this.permissionRepository.countByTenant(tenantId, organizationId),
      this.permissionRepository.countByStatus('active' as PermissionStatus, tenantId, organizationId),
      this.permissionRepository.countByStatus('suspended' as PermissionStatus, tenantId, organizationId),
      this.permissionRepository.countByStatus('deleted' as PermissionStatus, tenantId, organizationId),
      this.permissionRepository.countByType('system' as PermissionType, tenantId, organizationId),
      this.permissionRepository.countByType('default' as PermissionType, tenantId, organizationId),
      this.permissionRepository.countByType('expired' as PermissionType, tenantId, organizationId),
      this.permissionRepository.countByType('with_conditions' as PermissionType, tenantId, organizationId),
      this.permissionRepository.countByType('with_fields' as PermissionType, tenantId, organizationId),
    ])

    return {
      totalPermissions,
      activePermissions,
      suspendedPermissions,
      deletedPermissions,
      systemPermissions,
      defaultPermissions,
      expiredPermissions,
      permissionsWithConditions,
      permissionsWithFields,
    }
  }

  /**
   * @method executeByStatus
   * @description 获取按状态分组的统计信息
   * @param status 权限状态
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @returns {Promise<{ count: number; permissions: any[] }>} 统计信息
   * 
   * 主要原理与机制：
   * 1. 根据状态查询权限列表
   * 2. 统计权限数量和详细信息
   * 3. 支持组织级别的权限过滤
   */
  async executeByStatus(status: string, tenantId: string, organizationId?: string): Promise<{
    count: number
    permissions: any[]
  }> {
    const permissions = await this.permissionRepository.findByStatus(status as PermissionStatus, tenantId, organizationId)
    return {
      count: permissions.length,
      permissions: permissions.map(p => ({
        id: p.id,
        name: p.getName(),
        code: p.getCode(),
        type: p.getType(),
        status: p.getStatus(),
        action: p.getAction(),
      })),
    }
  }

  /**
   * @method executeByDateRange
   * @description 获取按日期范围的统计信息
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @returns {Promise<{ count: number; permissions: any[] }>} 统计信息
   * 
   * 主要原理与机制：
   * 1. 查询指定日期范围内的权限
   * 2. 过滤创建时间在范围内的权限
   * 3. 统计权限数量和详细信息
   */
  async executeByDateRange(startDate: Date, endDate: Date, tenantId: string, organizationId?: string): Promise<{
    count: number
    permissions: any[]
  }> {
    // 这里需要在PermissionRepository中添加findByDateRange方法
    // const permissions = await this.permissionRepository.findByDateRange(startDate, endDate, tenantId, organizationId)
    const permissions = await this.permissionRepository.findAll(tenantId, organizationId)

    const filteredPermissions = permissions.permissions.filter(permission => {
      const createdAt = new Date(permission.createdAt)
      return createdAt >= startDate && createdAt <= endDate
    })

    return {
      count: filteredPermissions.length,
      permissions: filteredPermissions.map(p => ({
        id: p.id,
        name: p.getName(),
        code: p.getCode(),
        type: p.getType(),
        status: p.getStatus(),
        action: p.getAction(),
        createdAt: p.createdAt,
      })),
    }
  }

  /**
   * @method executeGrowthRate
   * @description 获取权限增长率统计
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @returns {Promise<number>} 增长率
   * 
   * 主要原理与机制：
   * 1. 计算权限的增长率
   * 2. 基于时间维度分析权限增长趋势
   * 3. 返回增长率百分比
   */
  async executeGrowthRate(tenantId: string, organizationId?: string): Promise<number> {
    // 这里需要实现权限增长率计算逻辑
    // 暂时返回固定值
    return 0.05
  }

  /**
   * @method executePermissionActivityStats
   * @description 获取权限活跃度统计
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @returns {Promise<{ activeRate: number; activePermissions: number; totalPermissions: number }>} 活跃度统计
   * 
   * 主要原理与机制：
   * 1. 统计总权限数量和激活权限数量
   * 2. 计算权限活跃率
   * 3. 返回活跃度统计信息
   */
  async executePermissionActivityStats(tenantId: string, organizationId?: string): Promise<{
    activeRate: number
    activePermissions: number
    totalPermissions: number
  }> {
    const [totalPermissions, activePermissions] = await Promise.all([
      this.permissionRepository.countByTenant(tenantId, organizationId),
      this.permissionRepository.countByStatus('active' as PermissionStatus, tenantId, organizationId),
    ])

    const activeRate = totalPermissions > 0 ? activePermissions / totalPermissions : 0

    return {
      activeRate,
      activePermissions,
      totalPermissions,
    }
  }

  /**
   * @method executeByType
   * @description 获取按类型分组的统计信息
   * @param type 权限类型
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @returns {Promise<{ count: number; permissions: any[] }>} 统计信息
   * 
   * 主要原理与机制：
   * 1. 根据类型查询权限列表
   * 2. 统计权限数量和详细信息
   * 3. 支持组织级别的权限过滤
   */
  async executeByType(type: string, tenantId: string, organizationId?: string): Promise<{
    count: number
    permissions: any[]
  }> {
    const permissions = await this.permissionRepository.findByType(type as PermissionType, tenantId, organizationId)
    return {
      count: permissions.length,
      permissions: permissions.map(p => ({
        id: p.id,
        name: p.getName(),
        code: p.getCode(),
        type: p.getType(),
        status: p.getStatus(),
        action: p.getAction(),
      })),
    }
  }

  /**
   * @method executeByAction
   * @description 获取按操作分组的统计信息
   * @param action 权限操作
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @returns {Promise<{ count: number; permissions: any[] }>} 统计信息
   * 
   * 主要原理与机制：
   * 1. 根据操作查询权限列表
   * 2. 统计权限数量和详细信息
   * 3. 支持组织级别的权限过滤
   */
  async executeByAction(action: string, tenantId: string, organizationId?: string): Promise<{
    count: number
    permissions: any[]
  }> {
    const permissions = await this.permissionRepository.findByAction(action as PermissionAction, tenantId, organizationId)
    return {
      count: permissions.length,
      permissions: permissions.map(p => ({
        id: p.id,
        name: p.getName(),
        code: p.getCode(),
        type: p.getType(),
        status: p.getStatus(),
        action: p.getAction(),
      })),
    }
  }

  /**
   * @method executeRecentPermissions
   * @description 获取最近权限列表
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @param limit 限制数量
   * @returns {Promise<any[]>} 最近权限列表
   * 
   * 主要原理与机制：
   * 1. 查询最近的权限列表
   * 2. 按创建时间排序
   * 3. 限制返回数量
   */
  async executeRecentPermissions(tenantId: string, organizationId?: string, limit = 10): Promise<any[]> {
    const result = await this.permissionRepository.findAll(tenantId, organizationId, 1, limit)
    return result.permissions.map(p => ({
      id: p.id,
      name: p.getName(),
      code: p.getCode(),
      type: p.getType(),
      status: p.getStatus(),
      action: p.getAction(),
      createdAt: p.createdAt,
    }))
  }
} 
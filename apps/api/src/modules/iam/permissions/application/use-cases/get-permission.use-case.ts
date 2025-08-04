import { Inject, Injectable } from '@nestjs/common'
import { Permission } from '../../domain/entities/permission.entity'
import type { PermissionRepository } from '../../domain/repositories/permission.repository'
import type { PermissionType } from '../../domain/value-objects/permission-type.value-object'
import type { PermissionStatus } from '../../domain/value-objects/permission-status.value-object'
import type { PermissionAction } from '../../domain/value-objects/permission-action.value-object'

/**
 * @class GetPermissionUseCase
 * @description
 * 获取权限用例，负责权限查询的核心业务逻辑。
 * 支持多种查询方式，包括按ID、代码、名称、类型、状态等维度查询权限。
 *
 * 主要原理与机制：
 * 1. 遵循DDD的Use Case模式，封装单一业务操作
 * 2. 支持多租户数据隔离，确保查询安全性
 * 3. 提供多种查询维度，满足不同业务场景需求
 * 4. 实现权限数据的精确查询和模糊查询
 * 5. 支持组织级别的权限查询，实现细粒度权限控制
 */
@Injectable()
export class GetPermissionUseCase {
  constructor(
    @Inject('PermissionRepository')
    private readonly permissionRepository: PermissionRepository,
  ) { }

  /**
   * @method execute
   * @description 根据ID获取权限
   * @param id 权限ID
   * @param tenantId 租户ID
   * @returns {Promise<Permission>} 权限实体
   */
  async execute(id: string, tenantId: string): Promise<Permission> {
    const permission = await this.permissionRepository.findById(id, tenantId)
    if (!permission) {
      throw new Error(`权限 "${id}" 不存在`)
    }
    return permission
  }

  /**
   * @method executeByCode
   * @description 根据代码获取权限
   * @param code 权限代码
   * @param tenantId 租户ID
   * @returns {Promise<Permission>} 权限实体
   */
  async executeByCode(code: string, tenantId: string): Promise<Permission> {
    const permission = await this.permissionRepository.findByCode(code, tenantId)
    if (!permission) {
      throw new Error(`权限代码 "${code}" 不存在`)
    }
    return permission
  }

  /**
   * @method executeByName
   * @description 根据名称获取权限列表
   * @param name 权限名称
   * @param tenantId 租户ID
   * @returns {Promise<Permission[]>} 权限列表
   */
  async executeByName(name: string, tenantId: string): Promise<Permission[]> {
    const permission = await this.permissionRepository.findByName(name, tenantId)
    if (!permission) {
      return []
    }
    return [permission]
  }

  /**
   * @method executeByType
   * @description 根据类型获取权限列表
   * @param type 权限类型
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @returns {Promise<Permission[]>} 权限列表
   */
  async executeByType(type: string, tenantId: string, organizationId?: string): Promise<Permission[]> {
    return await this.permissionRepository.findByType(type as PermissionType, tenantId, organizationId)
  }

  /**
   * @method executeByStatus
   * @description 根据状态获取权限列表
   * @param status 权限状态
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @returns {Promise<Permission[]>} 权限列表
   */
  async executeByStatus(status: string, tenantId: string, organizationId?: string): Promise<Permission[]> {
    return await this.permissionRepository.findByStatus(status as PermissionStatus, tenantId, organizationId)
  }

  /**
   * @method executeByAction
   * @description 根据操作获取权限列表
   * @param action 权限操作
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @returns {Promise<Permission[]>} 权限列表
   */
  async executeByAction(action: string, tenantId: string, organizationId?: string): Promise<Permission[]> {
    return await this.permissionRepository.findByAction(action as PermissionAction, tenantId, organizationId)
  }

  /**
   * @method executeByResource
   * @description 根据资源获取权限列表
   * @param resource 权限资源
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @returns {Promise<Permission[]>} 权限列表
   */
  async executeByResource(resource: string, tenantId: string, organizationId?: string): Promise<Permission[]> {
    return await this.permissionRepository.findByResource(resource, tenantId, organizationId)
  }

  /**
   * @method executeByModule
   * @description 根据模块获取权限列表
   * @param module 权限模块
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @returns {Promise<Permission[]>} 权限列表
   */
  async executeByModule(module: string, tenantId: string, organizationId?: string): Promise<Permission[]> {
    return await this.permissionRepository.findByModule(module, tenantId, organizationId)
  }

  /**
   * @method executeByRoleId
   * @description 根据角色ID获取权限列表
   * @param roleId 角色ID
   * @param tenantId 租户ID
   * @returns {Promise<Permission[]>} 权限列表
   */
  async executeByRoleId(roleId: string, tenantId: string): Promise<Permission[]> {
    return await this.permissionRepository.findByRoleId(roleId, tenantId)
  }

  /**
   * @method executeByParentPermissionId
   * @description 根据父权限ID获取权限列表
   * @param parentPermissionId 父权限ID
   * @param tenantId 租户ID
   * @returns {Promise<Permission[]>} 权限列表
   */
  async executeByParentPermissionId(parentPermissionId: string, tenantId: string): Promise<Permission[]> {
    return await this.permissionRepository.findByParentPermissionId(parentPermissionId, tenantId)
  }

  /**
   * @method executeSystemPermissions
   * @description 获取系统权限列表
   * @param tenantId 租户ID
   * @returns {Promise<Permission[]>} 系统权限列表
   */
  async executeSystemPermissions(tenantId: string): Promise<Permission[]> {
    return await this.permissionRepository.findSystemPermissions(tenantId)
  }

  /**
   * @method executeDefaultPermissions
   * @description 获取默认权限列表
   * @param tenantId 租户ID
   * @returns {Promise<Permission[]>} 默认权限列表
   */
  async executeDefaultPermissions(tenantId: string): Promise<Permission[]> {
    return await this.permissionRepository.findDefaultPermissions(tenantId)
  }

  /**
   * @method executeExpiredPermissions
   * @description 获取过期权限列表
   * @param tenantId 租户ID
   * @returns {Promise<Permission[]>} 过期权限列表
   */
  async executeExpiredPermissions(tenantId: string): Promise<Permission[]> {
    return await this.permissionRepository.findExpiredPermissions(tenantId)
  }

  /**
   * @method executeActivePermissions
   * @description 获取激活权限列表
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @returns {Promise<Permission[]>} 激活权限列表
   */
  async executeActivePermissions(tenantId: string, organizationId?: string): Promise<Permission[]> {
    return await this.permissionRepository.findActivePermissions(tenantId, organizationId)
  }
} 
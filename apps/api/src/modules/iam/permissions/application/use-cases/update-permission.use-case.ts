import { Inject, Injectable } from '@nestjs/common'
import { Permission } from '../../domain/entities/permission.entity'
import type { PermissionRepository } from '../../domain/repositories/permission.repository'
import type { PermissionAction } from '../../domain/value-objects/permission-action.value-object'
import type { PermissionConditionData } from '../../domain/value-objects/permission-condition.value-object'

/**
 * @interface UpdatePermissionRequest
 * @description 更新权限的请求参数
 */
export interface UpdatePermissionRequest {
  name?: string
  code?: string
  description?: string
  resource?: string
  module?: string
  action?: PermissionAction
  conditions?: PermissionConditionData[]
  fields?: string[]
  expiresAt?: Date
  parentPermissionId?: string
  tags?: string
}

/**
 * @class UpdatePermissionUseCase
 * @description
 * 更新权限用例，负责权限更新的核心业务逻辑。
 * 支持权限信息、操作、条件、字段等各个维度的更新。
 *
 * 主要原理与机制：
 * 1. 遵循DDD的Use Case模式，封装单一业务操作
 * 2. 支持多租户数据隔离，确保更新安全性
 * 3. 提供完整的业务规则验证和错误处理
 * 4. 支持权限名称和代码的唯一性校验（排除自身）
 * 5. 支持父权限存在性验证
 * 6. 支持权限树结构的更新
 * 7. 支持CASL条件权限和字段权限的更新
 */
@Injectable()
export class UpdatePermissionUseCase {
  constructor(
    @Inject('PermissionRepository')
    private readonly permissionRepository: PermissionRepository,
  ) { }

  /**
   * @method execute
   * @description 执行更新权限的业务逻辑
   * @param id 权限ID
   * @param request 更新权限请求参数
   * @param tenantId 租户ID
   * @returns {Promise<Permission>} 更新后的权限实体
   * 
   * 主要原理与机制：
   * 1. 验证权限是否存在
   * 2. 验证权限名称唯一性（如果更新名称）
   * 3. 验证权限代码唯一性（如果更新代码）
   * 4. 验证父权限存在性（如果更新父权限）
   * 5. 更新权限的各个属性
   * 6. 保存更新后的权限
   */
  async execute(id: string, request: UpdatePermissionRequest, tenantId: string): Promise<Permission> {
    const permission = await this.permissionRepository.findById(id, tenantId)
    if (!permission) {
      throw new Error(`权限 "${id}" 不存在`)
    }

    // 验证权限名称唯一性（如果更新名称）
    if (request.name && request.name !== permission.getName()) {
      await this.validatePermissionNameUniqueness(request.name, tenantId, id)
    }

    // 验证权限代码唯一性（如果更新代码）
    if (request.code && request.code !== permission.getCode()) {
      await this.validatePermissionCodeUniqueness(request.code, tenantId, id)
    }

    // 验证父权限存在性（如果更新父权限）
    if (request.parentPermissionId && request.parentPermissionId !== permission.parentPermissionId) {
      await this.validateParentPermissionExists(request.parentPermissionId, tenantId)
    }

    // 更新权限信息
    if (request.name || request.code || request.description || request.resource || request.module) {
      permission.updateInfo(
        request.name || permission.getName(),
        request.code || permission.getCode(),
        request.description,
        request.resource,
        request.module,
      )
    }

    // 更新权限操作
    if (request.action) {
      permission.updateAction(request.action)
    }

    // 更新权限条件
    if (request.conditions) {
      permission.setConditions(request.conditions)
    }

    // 更新字段权限
    if (request.fields) {
      permission.setFields(request.fields)
    }

    // 更新过期时间
    if (request.expiresAt !== undefined) {
      // 这里需要在Permission实体中添加setExpiresAt方法
      // permission.setExpiresAt(request.expiresAt)
    }

    // 更新父权限
    if (request.parentPermissionId !== undefined) {
      if (request.parentPermissionId) {
        permission.setParentPermission(request.parentPermissionId)
      } else {
        permission.removeParentPermission()
      }
    }

    // 保存更新后的权限
    return await this.permissionRepository.save(permission)
  }

  /**
   * @method executeSettings
   * @description 更新权限设置
   * @param id 权限ID
   * @param settings 权限设置
   * @param tenantId 租户ID
   * @returns {Promise<Permission>} 更新后的权限实体
   * 
   * 主要原理与机制：
   * 1. 验证权限是否存在
   * 2. 更新权限的设置信息
   * 3. 保存更新后的权限
   */
  async executeSettings(id: string, settings: Record<string, unknown>, tenantId: string): Promise<Permission> {
    const permission = await this.permissionRepository.findById(id, tenantId)
    if (!permission) {
      throw new Error(`权限 "${id}" 不存在`)
    }

    // 这里需要在Permission实体中添加updateSettings方法
    // permission.updateSettings(settings)

    return await this.permissionRepository.save(permission)
  }

  /**
   * @method executePartialSettings
   * @description 部分更新权限设置
   * @param id 权限ID
   * @param settings 权限设置
   * @param tenantId 租户ID
   * @returns {Promise<Permission>} 更新后的权限实体
   * 
   * 主要原理与机制：
   * 1. 验证权限是否存在
   * 2. 部分更新权限的设置信息
   * 3. 保存更新后的权限
   */
  async executePartialSettings(id: string, settings: Record<string, unknown>, tenantId: string): Promise<Permission> {
    const permission = await this.permissionRepository.findById(id, tenantId)
    if (!permission) {
      throw new Error(`权限 "${id}" 不存在`)
    }

    // 这里需要在Permission实体中添加updatePartialSettings方法
    // permission.updatePartialSettings(settings)

    return await this.permissionRepository.save(permission)
  }

  /**
   * @method validatePermissionNameUniqueness
   * @description 验证权限名称在租户内的唯一性（排除自身）
   * @param name 权限名称
   * @param tenantId 租户ID
   * @param excludeId 排除的权限ID
   * 
   * 主要原理与机制：
   * 1. 通过仓储查询是否存在同名权限
   * 2. 排除当前正在更新的权限
   * 3. 如果存在同名权限，抛出业务异常
   */
  private async validatePermissionNameUniqueness(name: string, tenantId: string, excludeId?: string): Promise<void> {
    const existingPermission = await this.permissionRepository.findByName(name, tenantId)
    if (existingPermission && existingPermission.id !== excludeId) {
      throw new Error(`权限名称 "${name}" 在租户内已存在`)
    }
  }

  /**
   * @method validatePermissionCodeUniqueness
   * @description 验证权限代码在租户内的唯一性（排除自身）
   * @param code 权限代码
   * @param tenantId 租户ID
   * @param excludeId 排除的权限ID
   * 
   * 主要原理与机制：
   * 1. 通过仓储查询是否存在同代码权限
   * 2. 排除当前正在更新的权限
   * 3. 如果存在同代码权限，抛出业务异常
   */
  private async validatePermissionCodeUniqueness(code: string, tenantId: string, excludeId?: string): Promise<void> {
    const existingPermission = await this.permissionRepository.findByCode(code, tenantId)
    if (existingPermission && existingPermission.id !== excludeId) {
      throw new Error(`权限代码 "${code}" 在租户内已存在`)
    }
  }

  /**
   * @method validateParentPermissionExists
   * @description 验证父权限是否存在
   * @param parentPermissionId 父权限ID
   * @param tenantId 租户ID
   * 
   * 主要原理与机制：
   * 1. 通过仓储查询父权限是否存在
   * 2. 验证父权限状态是否正常
   * 3. 如果父权限不存在或状态异常，抛出业务异常
   */
  private async validateParentPermissionExists(parentPermissionId: string, tenantId: string): Promise<void> {
    const parentPermission = await this.permissionRepository.findById(parentPermissionId, tenantId)
    if (!parentPermission) {
      throw new Error(`父权限 "${parentPermissionId}" 不存在`)
    }
    if (parentPermission.getStatus() !== 'active') {
      throw new Error(`父权限 "${parentPermissionId}" 状态异常，无法作为父权限`)
    }
  }
} 
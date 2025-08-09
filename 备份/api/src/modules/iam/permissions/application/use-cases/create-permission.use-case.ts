import { Inject, Injectable } from '@nestjs/common'
import { generateUuid } from '@/shared/domain/utils/uuid.util'
import { Permission } from '../../domain/entities/permission.entity'
import type { PermissionRepository } from '../../domain/repositories/permission.repository'
import type { PermissionAction } from '../../domain/value-objects/permission-action.value-object'
import type { PermissionType } from '../../domain/value-objects/permission-type.value-object'
import type { PermissionConditionData } from '../../domain/value-objects/permission-condition.value-object'

/**
 * @interface CreatePermissionRequest
 * @description 创建权限的请求参数
 */
export interface CreatePermissionRequest {
  name: string
  code: string
  type: PermissionType
  action: PermissionAction
  tenantId: string
  adminUserId: string
  description?: string
  organizationId?: string
  resource?: string
  module?: string
  isSystemPermission?: boolean
  isDefaultPermission?: boolean
  conditions?: PermissionConditionData[]
  fields?: string[]
  expiresAt?: Date
  parentPermissionId?: string
  tags?: string
}

/**
 * @class CreatePermissionUseCase
 * @description
 * 创建权限用例，负责权限创建的核心业务逻辑。
 * 支持多租户隔离、CASL条件权限、字段级权限等高级功能。
 *
 * 主要原理与机制：
 * 1. 遵循DDD的Use Case模式，封装单一业务操作
 * 2. 支持多租户数据隔离，确保权限安全性
 * 3. 集成CASL权限管理，支持条件权限和字段权限
 * 4. 实现权限树结构，支持父子权限关系
 * 5. 提供完整的业务规则验证和错误处理
 * 6. 支持权限名称和代码的唯一性校验
 * 7. 支持父权限存在性验证
 */
@Injectable()
export class CreatePermissionUseCase {
  constructor(
    @Inject('PermissionRepository')
    private readonly permissionRepository: PermissionRepository,
  ) { }

  /**
   * @method execute
   * @description 执行创建权限的业务逻辑
   * @param request 创建权限请求参数
   * @returns {Promise<Permission>} 创建的权限实体
   * 
   * 主要原理与机制：
   * 1. 验证权限名称在租户内的唯一性
   * 2. 验证权限代码在租户内的唯一性
   * 3. 验证父权限存在性（如果指定了父权限）
   * 4. 创建权限实体并保存到仓储
   * 5. 更新父权限的子权限列表（如果指定了父权限）
   */
  async execute(request: CreatePermissionRequest): Promise<Permission> {
    // 验证权限名称唯一性
    await this.validatePermissionNameUniqueness(request.name, request.tenantId)

    // 验证权限代码唯一性
    await this.validatePermissionCodeUniqueness(request.code, request.tenantId)

    // 验证父权限存在性
    if (request.parentPermissionId) {
      await this.validateParentPermissionExists(request.parentPermissionId, request.tenantId)
    }

    // 创建权限实体
    const permission = new Permission(
      generateUuid(),
      request.name,
      request.code,
      request.type,
      request.action,
      request.tenantId,
      request.adminUserId,
      request.description,
      request.organizationId,
      request.resource,
      request.module,
      request.isSystemPermission,
      request.isDefaultPermission,
      request.conditions,
      request.fields,
      request.expiresAt,
      request.parentPermissionId,
    )

    // 保存权限
    const savedPermission = await this.permissionRepository.save(permission)

    // 更新父权限的子权限列表
    if (request.parentPermissionId) {
      await this.updateParentPermissionChildren(
        request.parentPermissionId,
        savedPermission.id,
        request.tenantId,
      )
    }

    return savedPermission
  }

  /**
   * @method validatePermissionNameUniqueness
   * @description 验证权限名称在租户内的唯一性
   * @param name 权限名称
   * @param tenantId 租户ID
   * 
   * 主要原理与机制：
   * 1. 通过仓储查询是否存在同名权限
   * 2. 确保权限名称在租户内唯一
   * 3. 如果存在同名权限，抛出业务异常
   */
  private async validatePermissionNameUniqueness(name: string, tenantId: string): Promise<void> {
    const existingPermission = await this.permissionRepository.findByName(name, tenantId)
    if (existingPermission) {
      throw new Error(`权限名称 "${name}" 在租户内已存在`)
    }
  }

  /**
   * @method validatePermissionCodeUniqueness
   * @description 验证权限代码在租户内的唯一性
   * @param code 权限代码
   * @param tenantId 租户ID
   * 
   * 主要原理与机制：
   * 1. 通过仓储查询是否存在同代码权限
   * 2. 确保权限代码在租户内唯一
   * 3. 如果存在同代码权限，抛出业务异常
   */
  private async validatePermissionCodeUniqueness(code: string, tenantId: string): Promise<void> {
    const existingPermission = await this.permissionRepository.findByCode(code, tenantId)
    if (existingPermission) {
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

  /**
   * @method updateParentPermissionChildren
   * @description 更新父权限的子权限列表
   * @param parentPermissionId 父权限ID
   * @param childPermissionId 子权限ID
   * @param tenantId 租户ID
   * 
   * 主要原理与机制：
   * 1. 查询父权限实体
   * 2. 调用父权限的addChildPermission方法
   * 3. 保存更新后的父权限
   */
  private async updateParentPermissionChildren(
    parentPermissionId: string,
    childPermissionId: string,
    tenantId: string,
  ): Promise<void> {
    const parentPermission = await this.permissionRepository.findById(parentPermissionId, tenantId)
    if (parentPermission) {
      parentPermission.addChildPermission(childPermissionId)
      await this.permissionRepository.save(parentPermission)
    }
  }
} 
/**
 * @class TenantDomainService
 * @description
 * 租户领域服务，处理跨实体的业务逻辑。该服务包含租户生命周期管理、
 * 业务规则验证、状态转换等核心业务逻辑。
 *
 * 主要原理与机制：
 * 1. 业务规则验证：验证租户创建、更新、状态转换的业务规则
 * 2. 状态转换管理：管理租户状态转换的合法性
 * 3. 业务逻辑封装：封装复杂的业务逻辑
 * 4. 领域事件触发：触发相应的领域事件
 * 5. 数据一致性：确保数据一致性
 */
import { Inject, Injectable } from '@nestjs/common'
import type { Tenant } from '../entities/tenant.entity'
import { TenantStatus } from '../entities/tenant.entity'
import {
  TenantAlreadyExistsException,
  TenantCannotBeActivatedException,
  TenantCannotBeDeletedException,
  TenantCannotBeRestoredException,
  TenantCannotBeSuspendedException,
  TenantInvalidStateException,
  TenantNotFoundException,
  TenantOperationNotAllowedException,
} from '../exceptions/tenant-domain.exception'
import type { ITenantRepository } from '../repositories/tenant.repository.interface'
import type { TenantCode } from '../value-objects/tenant-code.vo'
import type { TenantName } from '../value-objects/tenant-name.vo'

@Injectable()
export class TenantDomainService {
  constructor(
    @Inject('ITenantRepository')
    private readonly tenantRepository: ITenantRepository,
  ) {}

  /**
   * @method validateTenantCreation
   * @description 验证租户创建的业务规则
   * @param name 租户名称
   * @param code 租户编码
   * @param adminUserId 管理员用户ID
   */
  async validateTenantCreation(
    name: TenantName,
    code: TenantCode,
    adminUserId: string,
  ): Promise<void> {
    // 1. 验证租户名称唯一性
    const existingTenantByName = await this.tenantRepository.findByName(name)
    if (existingTenantByName) {
      throw new TenantAlreadyExistsException(name.toString(), 'name')
    }

    // 2. 验证租户编码唯一性
    const existingTenantByCode = await this.tenantRepository.findByCode(code)
    if (existingTenantByCode) {
      throw new TenantAlreadyExistsException(code.toString(), 'code')
    }

    // 3. 验证管理员用户ID不为空
    if (!adminUserId || adminUserId.trim() === '') {
      throw new Error('Admin user ID is required')
    }
  }

  /**
   * @method validateTenantActivation
   * @description 验证租户激活的业务规则
   * @param tenant 租户实体
   * @param activatedBy 激活操作者ID
   */
  validateTenantActivation(tenant: Tenant, activatedBy: string): void {
    // 1. 验证租户存在
    if (!tenant) {
      throw new TenantNotFoundException('unknown')
    }

    // 2. 验证租户状态
    if (tenant.status !== TenantStatus.PENDING) {
      throw new TenantCannotBeActivatedException(tenant.id, tenant.status)
    }

    // 3. 验证操作者ID
    if (!activatedBy || activatedBy.trim() === '') {
      throw new Error('Activated by user ID is required')
    }
  }

  /**
   * @method validateTenantSuspension
   * @description 验证租户禁用的业务规则
   * @param tenant 租户实体
   * @param suspendedBy 禁用操作者ID
   */
  validateTenantSuspension(tenant: Tenant, suspendedBy: string): void {
    // 1. 验证租户存在
    if (!tenant) {
      throw new TenantNotFoundException('unknown')
    }

    // 2. 验证租户状态
    if (tenant.status !== TenantStatus.ACTIVE) {
      throw new TenantCannotBeSuspendedException(tenant.id, tenant.status)
    }

    // 3. 验证操作者ID
    if (!suspendedBy || suspendedBy.trim() === '') {
      throw new Error('Suspended by user ID is required')
    }
  }

  /**
   * @method validateTenantDeletion
   * @description 验证租户删除的业务规则
   * @param tenant 租户实体
   * @param deletedBy 删除操作者ID
   */
  validateTenantDeletion(tenant: Tenant, deletedBy: string): void {
    // 1. 验证租户存在
    if (!tenant) {
      throw new TenantNotFoundException('unknown')
    }

    // 2. 验证租户状态
    if (tenant.status === TenantStatus.DELETED) {
      throw new Error('Tenant is already deleted')
    }

    // 3. 验证操作者ID
    if (!deletedBy || deletedBy.trim() === '') {
      throw new Error('Deleted by user ID is required')
    }
  }

  /**
   * @method validateTenantRestoration
   * @description 验证租户恢复的业务规则
   * @param tenant 租户实体
   * @param restoredBy 恢复操作者ID
   */
  validateTenantRestoration(tenant: Tenant, restoredBy: string): void {
    // 1. 验证租户存在
    if (!tenant) {
      throw new TenantNotFoundException('unknown')
    }

    // 2. 验证租户状态
    if (tenant.status !== TenantStatus.DELETED) {
      throw new TenantCannotBeRestoredException(tenant.id, tenant.status)
    }

    // 3. 验证操作者ID
    if (!restoredBy || restoredBy.trim() === '') {
      throw new Error('Restored by user ID is required')
    }
  }

  /**
   * @method validateTenantSettingsUpdate
   * @description 验证租户配置更新的业务规则
   * @param tenant 租户实体
   * @param settings 新配置
   * @param updatedBy 更新操作者ID
   */
  validateTenantSettingsUpdate(
    tenant: Tenant,
    settings: Record<string, any>,
    updatedBy: string,
  ): void {
    // 1. 验证租户存在
    if (!tenant) {
      throw new TenantNotFoundException('unknown')
    }

    // 2. 验证租户状态（只有激活状态的租户可以更新配置）
    if (tenant.status !== TenantStatus.ACTIVE) {
      throw new TenantOperationNotAllowedException(
        tenant.id,
        'updateSettings',
        `Tenant is not active (current status: ${tenant.status})`,
      )
    }

    // 3. 验证配置对象
    if (!settings || typeof settings !== 'object') {
      throw new Error('Settings must be a valid object')
    }

    // 4. 验证操作者ID
    if (!updatedBy || updatedBy.trim() === '') {
      throw new Error('Updated by user ID is required')
    }

    // 5. 验证配置内容（可以根据具体业务需求添加更多验证）
    this.validateSettingsContent(settings)
  }

  /**
   * @method validateSettingsContent
   * @description 验证配置内容
   * @param settings 配置对象
   */
  private validateSettingsContent(settings: Record<string, any>): void {
    // 这里可以根据具体业务需求添加配置验证逻辑
    // 例如：验证主题设置、语言设置等

    // 示例：验证主题设置
    if (settings.theme && !['light', 'dark', 'auto'].includes(settings.theme)) {
      throw new Error('Invalid theme setting')
    }

    // 示例：验证语言设置
    if (settings.language && !['zh-CN', 'en-US'].includes(settings.language)) {
      throw new Error('Invalid language setting')
    }
  }

  /**
   * @method canTenantBeActivated
   * @description 检查租户是否可以激活
   * @param tenant 租户实体
   * @returns boolean 是否可以激活
   */
  canTenantBeActivated(tenant: Tenant): boolean {
    return tenant.status === TenantStatus.PENDING
  }

  /**
   * @method canTenantBeSuspended
   * @description 检查租户是否可以禁用
   * @param tenant 租户实体
   * @returns boolean 是否可以禁用
   */
  canTenantBeSuspended(tenant: Tenant): boolean {
    return tenant.status === TenantStatus.ACTIVE
  }

  /**
   * @method canTenantBeDeleted
   * @description 检查租户是否可以删除
   * @param tenant 租户实体
   * @returns boolean 是否可以删除
   */
  canTenantBeDeleted(tenant: Tenant): boolean {
    return tenant.status !== TenantStatus.DELETED
  }

  /**
   * @method canTenantBeRestored
   * @description 检查租户是否可以恢复
   * @param tenant 租户实体
   * @returns boolean 是否可以恢复
   */
  canTenantBeRestored(tenant: Tenant): boolean {
    return tenant.status === TenantStatus.DELETED
  }

  /**
   * @method canTenantUpdateSettings
   * @description 检查租户是否可以更新配置
   * @param tenant 租户实体
   * @returns boolean 是否可以更新配置
   */
  canTenantUpdateSettings(tenant: Tenant): boolean {
    return tenant.status === TenantStatus.ACTIVE
  }

  /**
   * @method getTenantStatusTransitions
   * @description 获取租户状态转换规则
   * @param currentStatus 当前状态
   * @returns string[] 允许转换的目标状态列表
   */
  getTenantStatusTransitions(currentStatus: TenantStatus): TenantStatus[] {
    switch (currentStatus) {
      case TenantStatus.PENDING:
        return [
          TenantStatus.ACTIVE,
          TenantStatus.SUSPENDED,
          TenantStatus.DELETED,
        ]
      case TenantStatus.ACTIVE:
        return [TenantStatus.SUSPENDED, TenantStatus.DELETED]
      case TenantStatus.SUSPENDED:
        return [TenantStatus.ACTIVE, TenantStatus.DELETED]
      case TenantStatus.DELETED:
        return [TenantStatus.SUSPENDED]
      default:
        return []
    }
  }

  /**
   * @method isValidStatusTransition
   * @description 检查状态转换是否有效
   * @param fromStatus 起始状态
   * @param toStatus 目标状态
   * @returns boolean 转换是否有效
   */
  isValidStatusTransition(
    fromStatus: TenantStatus,
    toStatus: TenantStatus,
  ): boolean {
    const allowedTransitions = this.getTenantStatusTransitions(fromStatus)
    return allowedTransitions.includes(toStatus)
  }
}

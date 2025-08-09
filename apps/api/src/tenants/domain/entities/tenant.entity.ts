/**
 * @class Tenant
 * @description
 * 租户聚合根，作为IAM系统的核心聚合根。租户是多租户SaaS平台的基础，
 * 负责数据隔离、用户管理、权限控制等核心功能。
 *
 * 主要原理与机制：
 * 1. 作为聚合根，管理租户级别的所有业务操作
 * 2. 实现多租户数据隔离，确保不同租户间数据安全
 * 3. 支持租户生命周期管理（创建、激活、禁用、删除）
 * 4. 提供租户配置管理，支持功能开关和权限策略
 * 5. 继承BaseEntity获得通用属性和方法
 */
import { BaseEntity } from '../../../shared/domain/entities/base.entity'
import type { TenantCode } from '../value-objects/tenant-code.vo'
import type { TenantName } from '../value-objects/tenant-name.vo'

/**
 * @enum TenantStatus
 * @description 租户状态枚举
 */
export enum TenantStatus {
  PENDING = 'PENDING', // 待激活
  ACTIVE = 'ACTIVE', // 激活
  SUSPENDED = 'SUSPENDED', // 禁用
  DELETED = 'DELETED', // 已删除
}

/**
 * @class Tenant
 * @description 租户聚合根
 */
export class Tenant extends BaseEntity {
  /**
   * @property name
   * @description 租户名称
   */
  name: TenantName

  /**
   * @property code
   * @description 租户编码
   */
  code: TenantCode

  /**
   * @property description
   * @description 租户描述
   */
  description?: string

  /**
   * @property status
   * @description 租户状态
   */
  status: TenantStatus

  /**
   * @property adminUserId
   * @description 租户管理员用户ID
   */
  adminUserId: string

  /**
   * @property settings
   * @description 租户配置
   */
  settings: Record<string, any>

  /**
   * @constructor
   * @description 构造函数
   */
  constructor(
    id: string,
    name: TenantName,
    code: TenantCode,
    adminUserId: string,
    description?: string,
    settings?: Record<string, any>,
  ) {
    super(id)
    this.name = name
    this.code = code
    this.adminUserId = adminUserId
    this.description = description
    this.settings = settings || {}
    this.status = TenantStatus.PENDING
    // 租户实体的tenantId就是自己的id
    this.tenantId = id
  }

  /**
   * @method activate
   * @description 激活租户
   * @param activatedBy {string} 激活者ID
   */
  activate(activatedBy?: string): void {
    if (this.status === TenantStatus.ACTIVE) {
      throw new Error('租户已经是激活状态')
    }
    if (this.status === TenantStatus.DELETED) {
      throw new Error('已删除的租户无法激活')
    }

    this.status = TenantStatus.ACTIVE
    this.markAsUpdated(activatedBy)
  }

  /**
   * @method suspend
   * @description 禁用租户
   * @param suspendedBy {string} 禁用者ID
   */
  suspend(suspendedBy?: string): void {
    if (this.status === TenantStatus.SUSPENDED) {
      throw new Error('租户已经是禁用状态')
    }
    if (this.status === TenantStatus.DELETED) {
      throw new Error('已删除的租户无法禁用')
    }

    this.status = TenantStatus.SUSPENDED
    this.markAsUpdated(suspendedBy)
  }

  /**
   * @method delete
   * @description 删除租户
   * @param deletedBy {string} 删除者ID
   */
  delete(deletedBy?: string): void {
    if (this.status === TenantStatus.DELETED) {
      throw new Error('租户已经是删除状态')
    }

    this.status = TenantStatus.DELETED
    this.softDelete(deletedBy)
  }

  /**
   * @method restore
   * @description 恢复租户
   * @param restoredBy {string} 恢复者ID
   */
  restore(restoredBy?: string): void {
    if (this.status !== TenantStatus.DELETED) {
      throw new Error('只有已删除的租户才能恢复')
    }

    this.status = TenantStatus.SUSPENDED
    super.restore(restoredBy)
  }

  /**
   * @method updateSettings
   * @description 更新租户配置
   * @param settings {Record<string, any>} 新配置
   * @param updatedBy {string} 更新者ID
   */
  updateSettings(settings: Record<string, any>, updatedBy?: string): void {
    this.settings = { ...this.settings, ...settings }
    this.markAsUpdated(updatedBy)
  }

  /**
   * @method getSetting
   * @description 获取租户配置
   * @param key {string} 配置键
   * @returns {any} 配置值
   */
  getSetting(key: string): any {
    return this.settings[key]
  }

  /**
   * @method setSetting
   * @description 设置租户配置
   * @param key {string} 配置键
   * @param value {any} 配置值
   * @param updatedBy {string} 更新者ID
   */
  setSetting(key: string, value: any, updatedBy?: string): void {
    this.settings[key] = value
    this.markAsUpdated(updatedBy)
  }

  /**
   * @method isActive
   * @description 检查租户是否激活
   * @returns {boolean} 是否激活
   */
  isActive(): boolean {
    return this.status === TenantStatus.ACTIVE
  }

  /**
   * @method isSuspended
   * @description 检查租户是否禁用
   * @returns {boolean} 是否禁用
   */
  isSuspended(): boolean {
    return this.status === TenantStatus.SUSPENDED
  }

  /**
   * @method validate
   * @description 验证租户状态
   * @throws {Error} 验证失败时抛出异常
   */
  validate(): void {
    if (!this.name) {
      throw new Error('租户名称不能为空')
    }
    if (!this.code) {
      throw new Error('租户编码不能为空')
    }
    if (!this.adminUserId) {
      throw new Error('租户管理员不能为空')
    }
    if (!this.tenantId) {
      throw new Error('租户ID不能为空')
    }
  }

  /**
   * @method getBusinessKey
   * @description 获取业务键
   * @returns {string} 业务键
   */
  getBusinessKey(): string {
    return `${this.id}:${this.code.getValue()}`
  }

  /**
   * @method toJSON
   * @description 转换为JSON对象
   * @returns {object} JSON对象
   */
  toJSON(): object {
    return {
      ...super.toJSON(),
      name: this.name.getValue(),
      code: this.code.getValue(),
      description: this.description,
      status: this.status,
      adminUserId: this.adminUserId,
      settings: this.settings,
    }
  }
}

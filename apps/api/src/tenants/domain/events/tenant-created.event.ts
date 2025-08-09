import { TenantStatus } from '../entities/tenant.entity'
import type { TenantCode } from '../value-objects/tenant-code.vo'
import type { TenantName } from '../value-objects/tenant-name.vo'
/**
 * @class TenantCreatedEvent
 * @description
 * 租户创建事件，当租户被创建时触发。该事件包含租户创建时的所有相关信息，
 * 用于通知其他系统组件租户已创建，并触发相关的初始化流程。
 *
 * 主要原理与机制：
 * 1. 继承BaseDomainEvent获得通用事件功能
 * 2. 包含租户创建时的完整信息
 * 3. 支持事件路由和处理
 * 4. 提供事件元数据用于追踪
 */
import { BaseDomainEvent } from './base-domain-event'

/**
 * @interface TenantCreatedEventData
 * @description 租户创建事件数据接口
 */
export interface TenantCreatedEventData {
  /**
   * @property tenantName
   * @description 租户名称
   */
  tenantName: string

  /**
   * @property tenantCode
   * @description 租户编码
   */
  tenantCode: string

  /**
   * @property description
   * @description 租户描述
   */
  description?: string

  /**
   * @property adminUserId
   * @description 租户管理员用户ID
   */
  adminUserId: string

  /**
   * @property status
   * @description 租户状态
   */
  status: TenantStatus

  /**
   * @property settings
   * @description 租户初始配置
   */
  settings: Record<string, any>

  /**
   * @property createdBy
   * @description 创建者ID
   */
  createdBy?: string
}

/**
 * @class TenantCreatedEvent
 * @description 租户创建事件
 */
export class TenantCreatedEvent extends BaseDomainEvent {
  /**
   * @property data
   * @description 事件数据
   */
  readonly data: TenantCreatedEventData

  /**
   * @constructor
   * @description 构造函数
   * @param tenantId {string} 租户ID
   * @param tenantName {TenantName} 租户名称值对象
   * @param tenantCode {TenantCode} 租户编码值对象
   * @param adminUserId {string} 租户管理员用户ID
   * @param description {string} 租户描述
   * @param settings {Record<string, any>} 租户配置
   * @param createdBy {string} 创建者ID
   * @param metadata {Record<string, any>} 事件元数据
   */
  constructor(
    tenantId: string,
    tenantName: TenantName,
    tenantCode: TenantCode,
    adminUserId: string,
    description?: string,
    settings: Record<string, any> = {},
    createdBy?: string,
    metadata: Record<string, any> = {},
  ) {
    super(tenantId, tenantId, metadata)

    this.data = {
      tenantName: tenantName.getValue(),
      tenantCode: tenantCode.getValue(),
      description,
      adminUserId,
      status: TenantStatus.PENDING,
      settings,
      createdBy,
    }

    // 添加默认元数据
    this.addMetadata('eventCategory', 'TENANT_LIFECYCLE')
    this.addMetadata('eventPriority', 'HIGH')
    this.addMetadata('requiresNotification', true)
  }

  /**
   * @method getTenantName
   * @description 获取租户名称
   * @returns {string} 租户名称
   */
  getTenantName(): string {
    return this.data.tenantName
  }

  /**
   * @method getTenantCode
   * @description 获取租户编码
   * @returns {string} 租户编码
   */
  getTenantCode(): string {
    return this.data.tenantCode
  }

  /**
   * @method getAdminUserId
   * @description 获取管理员用户ID
   * @returns {string} 管理员用户ID
   */
  getAdminUserId(): string {
    return this.data.adminUserId
  }

  /**
   * @method getDescription
   * @description 获取租户描述
   * @returns {string | undefined} 租户描述
   */
  getDescription(): string | undefined {
    return this.data.description
  }

  /**
   * @method getSettings
   * @description 获取租户配置
   * @returns {Record<string, any>} 租户配置
   */
  getSettings(): Record<string, any> {
    return this.data.settings
  }

  /**
   * @method getStatus
   * @description 获取租户状态
   * @returns {TenantStatus} 租户状态
   */
  getStatus(): TenantStatus {
    return this.data.status
  }

  /**
   * @method getCreatedBy
   * @description 获取创建者ID
   * @returns {string | undefined} 创建者ID
   */
  getCreatedBy(): string | undefined {
    return this.data.createdBy
  }

  /**
   * @method toJSON
   * @description 将事件转换为JSON对象
   * @returns {object} JSON对象
   */
  toJSON(): object {
    return {
      ...super.toJSON(),
      data: this.data,
    }
  }

  /**
   * @method toString
   * @description 将事件转换为字符串
   * @returns {string} 字符串表示
   */
  toString(): string {
    return `TenantCreatedEvent(${this.aggregateId}, ${this.data.tenantName})`
  }
}

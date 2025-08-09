/**
 * @class TenantDeletedEvent
 * @description
 * 租户删除事件，当租户被删除时触发。该事件包含租户的基本信息
 * 和删除操作的详细信息，用于通知其他系统组件租户已被删除。
 *
 * 主要原理与机制：
 * 1. 继承自BaseDomainEvent，获得基础事件功能
 * 2. 包含租户删除的详细信息
 * 3. 支持事件溯源和审计
 * 4. 用于触发后续的业务流程
 */
import { BaseDomainEvent } from './base-domain-event'

/**
 * @interface TenantDeletedEventData
 * @description 租户删除事件数据
 */
export interface TenantDeletedEventData {
  /**
   * @property tenantId
   * @description 租户ID
   */
  tenantId: string

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
   * @property deletedBy
   * @description 删除操作者ID
   */
  deletedBy: string

  /**
   * @property reason
   * @description 删除原因
   */
  reason?: string

  /**
   * @property deletedAt
   * @description 删除时间
   */
  deletedAt: Date

  /**
   * @property previousStatus
   * @description 删除前的状态
   */
  previousStatus: string

  /**
   * @property softDelete
   * @description 是否为软删除
   */
  softDelete: boolean

  /**
   * @property dataRetentionDays
   * @description 数据保留天数
   */
  dataRetentionDays?: number
}

/**
 * @class TenantDeletedEvent
 * @description 租户删除事件
 */
export class TenantDeletedEvent extends BaseDomainEvent {
  /**
   * @property data
   * @description 事件数据
   */
  readonly data: TenantDeletedEventData

  /**
   * @constructor
   * @description 构造函数
   * @param tenantId 租户ID
   * @param tenantName 租户名称
   * @param tenantCode 租户编码
   * @param deletedBy 删除操作者ID
   * @param reason 删除原因
   * @param previousStatus 删除前的状态
   * @param softDelete 是否为软删除
   * @param dataRetentionDays 数据保留天数
   * @param metadata 事件元数据
   */
  constructor(
    tenantId: string,
    tenantName: string,
    tenantCode: string,
    deletedBy: string,
    reason: string | undefined,
    previousStatus: string,
    softDelete = true,
    dataRetentionDays?: number,
    metadata: Record<string, any> = {},
  ) {
    super(tenantId, tenantId, {
      eventCategory: 'TENANT_LIFECYCLE',
      eventPriority: 'HIGH',
      requiresNotification: true,
      requiresAudit: true,
      ...metadata,
    })

    this.data = {
      tenantId,
      tenantName,
      tenantCode,
      deletedBy,
      reason,
      deletedAt: new Date(),
      previousStatus,
      softDelete,
      dataRetentionDays,
    }
  }

  /**
   * @method getTenantId
   * @description 获取租户ID
   * @returns string 租户ID
   */
  getTenantId(): string {
    return this.data.tenantId
  }

  /**
   * @method getTenantName
   * @description 获取租户名称
   * @returns string 租户名称
   */
  getTenantName(): string {
    return this.data.tenantName
  }

  /**
   * @method getTenantCode
   * @description 获取租户编码
   * @returns string 租户编码
   */
  getTenantCode(): string {
    return this.data.tenantCode
  }

  /**
   * @method getDeletedBy
   * @description 获取删除操作者ID
   * @returns string 删除操作者ID
   */
  getDeletedBy(): string {
    return this.data.deletedBy
  }

  /**
   * @method getReason
   * @description 获取删除原因
   * @returns string | undefined 删除原因
   */
  getReason(): string | undefined {
    return this.data.reason
  }

  /**
   * @method getDeletedAt
   * @description 获取删除时间
   * @returns Date 删除时间
   */
  getDeletedAt(): Date {
    return this.data.deletedAt
  }

  /**
   * @method getPreviousStatus
   * @description 获取删除前的状态
   * @returns string 删除前的状态
   */
  getPreviousStatus(): string {
    return this.data.previousStatus
  }

  /**
   * @method isSoftDelete
   * @description 是否为软删除
   * @returns boolean 是否为软删除
   */
  isSoftDelete(): boolean {
    return this.data.softDelete
  }

  /**
   * @method getDataRetentionDays
   * @description 获取数据保留天数
   * @returns number | undefined 数据保留天数
   */
  getDataRetentionDays(): number | undefined {
    return this.data.dataRetentionDays
  }

  /**
   * @method toJSON
   * @description 将事件转换为JSON对象
   * @returns object JSON对象
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
   * @returns string 字符串表示
   */
  toString(): string {
    return `TenantDeletedEvent(${this.data.tenantId}, ${this.data.tenantName})`
  }
}

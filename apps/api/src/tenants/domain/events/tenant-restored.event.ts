/**
 * @class TenantRestoredEvent
 * @description
 * 租户恢复事件，当租户从删除状态恢复时触发。该事件包含租户的基本信息
 * 和恢复操作的详细信息，用于通知其他系统组件租户已被恢复。
 *
 * 主要原理与机制：
 * 1. 继承自BaseDomainEvent，获得基础事件功能
 * 2. 包含租户恢复的详细信息
 * 3. 支持事件溯源和审计
 * 4. 用于触发后续的业务流程
 */
import { BaseDomainEvent } from './base-domain-event'

/**
 * @interface TenantRestoredEventData
 * @description 租户恢复事件数据
 */
export interface TenantRestoredEventData {
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
   * @property restoredBy
   * @description 恢复操作者ID
   */
  restoredBy: string

  /**
   * @property reason
   * @description 恢复原因
   */
  reason?: string

  /**
   * @property restoredAt
   * @description 恢复时间
   */
  restoredAt: Date

  /**
   * @property newStatus
   * @description 恢复后的新状态
   */
  newStatus: string

  /**
   * @property previousStatus
   * @description 恢复前的状态
   */
  previousStatus: string

  /**
   * @property dataRecoveryInfo
   * @description 数据恢复信息
   */
  dataRecoveryInfo?: {
    recoveredUsers: number
    recoveredOrganizations: number
    recoveredData: boolean
  }
}

/**
 * @class TenantRestoredEvent
 * @description 租户恢复事件
 */
export class TenantRestoredEvent extends BaseDomainEvent {
  /**
   * @property data
   * @description 事件数据
   */
  readonly data: TenantRestoredEventData

  /**
   * @constructor
   * @description 构造函数
   * @param tenantId 租户ID
   * @param tenantName 租户名称
   * @param tenantCode 租户编码
   * @param restoredBy 恢复操作者ID
   * @param reason 恢复原因
   * @param newStatus 恢复后的新状态
   * @param previousStatus 恢复前的状态
   * @param dataRecoveryInfo 数据恢复信息
   * @param metadata 事件元数据
   */
  constructor(
    tenantId: string,
    tenantName: string,
    tenantCode: string,
    restoredBy: string,
    reason: string | undefined,
    newStatus: string,
    previousStatus: string,
    dataRecoveryInfo?: {
      recoveredUsers: number
      recoveredOrganizations: number
      recoveredData: boolean
    },
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
      restoredBy,
      reason,
      restoredAt: new Date(),
      newStatus,
      previousStatus,
      dataRecoveryInfo,
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
   * @method getRestoredBy
   * @description 获取恢复操作者ID
   * @returns string 恢复操作者ID
   */
  getRestoredBy(): string {
    return this.data.restoredBy
  }

  /**
   * @method getReason
   * @description 获取恢复原因
   * @returns string | undefined 恢复原因
   */
  getReason(): string | undefined {
    return this.data.reason
  }

  /**
   * @method getRestoredAt
   * @description 获取恢复时间
   * @returns Date 恢复时间
   */
  getRestoredAt(): Date {
    return this.data.restoredAt
  }

  /**
   * @method getNewStatus
   * @description 获取恢复后的新状态
   * @returns string 恢复后的新状态
   */
  getNewStatus(): string {
    return this.data.newStatus
  }

  /**
   * @method getPreviousStatus
   * @description 获取恢复前的状态
   * @returns string 恢复前的状态
   */
  getPreviousStatus(): string {
    return this.data.previousStatus
  }

  /**
   * @method getDataRecoveryInfo
   * @description 获取数据恢复信息
   * @returns object | undefined 数据恢复信息
   */
  getDataRecoveryInfo():
    | {
        recoveredUsers: number
        recoveredOrganizations: number
        recoveredData: boolean
      }
    | undefined {
    return this.data.dataRecoveryInfo
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
    return `TenantRestoredEvent(${this.data.tenantId}, ${this.data.tenantName})`
  }
}

import { TenantStatus } from '../entities/tenant.entity'
/**
 * @class TenantSuspendedEvent
 * @description
 * 租户禁用事件，当租户被禁用时触发。该事件包含租户禁用时的相关信息，
 * 用于通知其他系统组件租户已禁用，并触发相关的业务流程。
 *
 * 主要原理与机制：
 * 1. 继承BaseDomainEvent获得通用事件功能
 * 2. 包含租户禁用时的关键信息
 * 3. 支持事件路由和处理
 * 4. 提供事件元数据用于追踪
 */
import { BaseDomainEvent } from './base-domain-event'

/**
 * @interface TenantSuspendedEventData
 * @description 租户禁用事件数据接口
 */
export interface TenantSuspendedEventData {
  /**
   * @property previousStatus
   * @description 禁用前的状态
   */
  previousStatus: TenantStatus

  /**
   * @property newStatus
   * @description 禁用后的状态
   */
  newStatus: TenantStatus

  /**
   * @property suspendedBy
   * @description 禁用者ID
   */
  suspendedBy?: string

  /**
   * @property suspensionReason
   * @description 禁用原因
   */
  suspensionReason?: string

  /**
   * @property suspensionTime
   * @description 禁用时间
   */
  suspensionTime: Date

  /**
   * @property suspensionDuration
   * @description 禁用持续时间（可选，永久禁用时为null）
   */
  suspensionDuration?: number // 以分钟为单位
}

/**
 * @class TenantSuspendedEvent
 * @description 租户禁用事件
 */
export class TenantSuspendedEvent extends BaseDomainEvent {
  /**
   * @property data
   * @description 事件数据
   */
  readonly data: TenantSuspendedEventData

  /**
   * @constructor
   * @description 构造函数
   * @param tenantId {string} 租户ID
   * @param previousStatus {TenantStatus} 禁用前的状态
   * @param suspendedBy {string} 禁用者ID
   * @param suspensionReason {string} 禁用原因
   * @param suspensionDuration {number} 禁用持续时间（分钟）
   * @param metadata {Record<string, any>} 事件元数据
   */
  constructor(
    tenantId: string,
    previousStatus: TenantStatus,
    suspendedBy?: string,
    suspensionReason?: string,
    suspensionDuration?: number,
    metadata: Record<string, any> = {},
  ) {
    super(tenantId, tenantId, metadata)

    this.data = {
      previousStatus,
      newStatus: TenantStatus.SUSPENDED,
      suspendedBy,
      suspensionReason,
      suspensionTime: new Date(),
      suspensionDuration,
    }

    // 添加默认元数据
    this.addMetadata('eventCategory', 'TENANT_LIFECYCLE')
    this.addMetadata('eventPriority', 'HIGH')
    this.addMetadata('requiresNotification', true)
    this.addMetadata('affectsUserAccess', true)
    this.addMetadata('isTemporary', !!suspensionDuration)
  }

  /**
   * @method getPreviousStatus
   * @description 获取禁用前的状态
   * @returns {TenantStatus} 禁用前的状态
   */
  getPreviousStatus(): TenantStatus {
    return this.data.previousStatus
  }

  /**
   * @method getNewStatus
   * @description 获取禁用后的状态
   * @returns {TenantStatus} 禁用后的状态
   */
  getNewStatus(): TenantStatus {
    return this.data.newStatus
  }

  /**
   * @method getSuspendedBy
   * @description 获取禁用者ID
   * @returns {string | undefined} 禁用者ID
   */
  getSuspendedBy(): string | undefined {
    return this.data.suspendedBy
  }

  /**
   * @method getSuspensionReason
   * @description 获取禁用原因
   * @returns {string | undefined} 禁用原因
   */
  getSuspensionReason(): string | undefined {
    return this.data.suspensionReason
  }

  /**
   * @method getSuspensionTime
   * @description 获取禁用时间
   * @returns {Date} 禁用时间
   */
  getSuspensionTime(): Date {
    return this.data.suspensionTime
  }

  /**
   * @method getSuspensionDuration
   * @description 获取禁用持续时间
   * @returns {number | undefined} 禁用持续时间（分钟）
   */
  getSuspensionDuration(): number | undefined {
    return this.data.suspensionDuration
  }

  /**
   * @method isTemporarySuspension
   * @description 检查是否为临时禁用
   * @returns {boolean} 是否为临时禁用
   */
  isTemporarySuspension(): boolean {
    return !!this.data.suspensionDuration
  }

  /**
   * @method isPermanentSuspension
   * @description 检查是否为永久禁用
   * @returns {boolean} 是否为永久禁用
   */
  isPermanentSuspension(): boolean {
    return !this.data.suspensionDuration
  }

  /**
   * @method getSuspensionEndTime
   * @description 获取禁用结束时间（仅临时禁用有效）
   * @returns {Date | null} 禁用结束时间
   */
  getSuspensionEndTime(): Date | null {
    if (!this.data.suspensionDuration) {
      return null
    }
    return new Date(
      this.data.suspensionTime.getTime() +
        this.data.suspensionDuration * 60 * 1000,
    )
  }

  /**
   * @method isStatusTransitionValid
   * @description 检查状态转换是否有效
   * @returns {boolean} 状态转换是否有效
   */
  isStatusTransitionValid(): boolean {
    return (
      this.data.previousStatus !== TenantStatus.SUSPENDED &&
      this.data.previousStatus !== TenantStatus.DELETED
    )
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
    const duration = this.data.suspensionDuration
      ? ` for ${this.data.suspensionDuration} minutes`
      : ' permanently'
    return `TenantSuspendedEvent(${this.aggregateId}, ${this.data.previousStatus} -> ${this.data.newStatus}${duration})`
  }
}

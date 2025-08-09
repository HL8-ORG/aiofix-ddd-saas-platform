import { TenantStatus } from '../entities/tenant.entity'
/**
 * @class TenantActivatedEvent
 * @description
 * 租户激活事件，当租户被激活时触发。该事件包含租户激活时的相关信息，
 * 用于通知其他系统组件租户已激活，并触发相关的业务流程。
 *
 * 主要原理与机制：
 * 1. 继承BaseDomainEvent获得通用事件功能
 * 2. 包含租户激活时的关键信息
 * 3. 支持事件路由和处理
 * 4. 提供事件元数据用于追踪
 */
import { BaseDomainEvent } from './base-domain-event'

/**
 * @interface TenantActivatedEventData
 * @description 租户激活事件数据接口
 */
export interface TenantActivatedEventData {
  /**
   * @property previousStatus
   * @description 激活前的状态
   */
  previousStatus: TenantStatus

  /**
   * @property newStatus
   * @description 激活后的状态
   */
  newStatus: TenantStatus

  /**
   * @property activatedBy
   * @description 激活者ID
   */
  activatedBy?: string

  /**
   * @property activationReason
   * @description 激活原因
   */
  activationReason?: string

  /**
   * @property activationTime
   * @description 激活时间
   */
  activationTime: Date
}

/**
 * @class TenantActivatedEvent
 * @description 租户激活事件
 */
export class TenantActivatedEvent extends BaseDomainEvent {
  /**
   * @property data
   * @description 事件数据
   */
  readonly data: TenantActivatedEventData

  /**
   * @constructor
   * @description 构造函数
   * @param tenantId {string} 租户ID
   * @param previousStatus {TenantStatus} 激活前的状态
   * @param activatedBy {string} 激活者ID
   * @param activationReason {string} 激活原因
   * @param metadata {Record<string, any>} 事件元数据
   */
  constructor(
    tenantId: string,
    previousStatus: TenantStatus,
    activatedBy?: string,
    activationReason?: string,
    metadata: Record<string, any> = {},
  ) {
    super(tenantId, tenantId, metadata)

    this.data = {
      previousStatus,
      newStatus: TenantStatus.ACTIVE,
      activatedBy,
      activationReason,
      activationTime: new Date(),
    }

    // 添加默认元数据
    this.addMetadata('eventCategory', 'TENANT_LIFECYCLE')
    this.addMetadata('eventPriority', 'HIGH')
    this.addMetadata('requiresNotification', true)
    this.addMetadata('affectsUserAccess', true)
  }

  /**
   * @method getPreviousStatus
   * @description 获取激活前的状态
   * @returns {TenantStatus} 激活前的状态
   */
  getPreviousStatus(): TenantStatus {
    return this.data.previousStatus
  }

  /**
   * @method getNewStatus
   * @description 获取激活后的状态
   * @returns {TenantStatus} 激活后的状态
   */
  getNewStatus(): TenantStatus {
    return this.data.newStatus
  }

  /**
   * @method getActivatedBy
   * @description 获取激活者ID
   * @returns {string | undefined} 激活者ID
   */
  getActivatedBy(): string | undefined {
    return this.data.activatedBy
  }

  /**
   * @method getActivationReason
   * @description 获取激活原因
   * @returns {string | undefined} 激活原因
   */
  getActivationReason(): string | undefined {
    return this.data.activationReason
  }

  /**
   * @method getActivationTime
   * @description 获取激活时间
   * @returns {Date} 激活时间
   */
  getActivationTime(): Date {
    return this.data.activationTime
  }

  /**
   * @method isStatusTransitionValid
   * @description 检查状态转换是否有效
   * @returns {boolean} 状态转换是否有效
   */
  isStatusTransitionValid(): boolean {
    return (
      this.data.previousStatus !== TenantStatus.ACTIVE &&
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
    return `TenantActivatedEvent(${this.aggregateId}, ${this.data.previousStatus} -> ${this.data.newStatus})`
  }
}

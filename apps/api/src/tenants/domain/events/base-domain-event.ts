import { generateUuid } from '@/shared/utils/uuid.util'

/**
 * @abstract class BaseDomainEvent
 * @description
 * 基础领域事件抽象类，定义所有领域事件的通用属性和方法。
 * 该抽象类采用DDD设计模式，作为所有领域事件的基类，
 * 提供事件ID、时间戳、版本号等通用属性，以及事件序列化等通用方法。
 *
 * 主要原理与机制：
 * 1. 使用抽象类定义通用属性和方法，子类继承获得基础功能
 * 2. 提供事件唯一标识，确保事件的唯一性
 * 3. 支持事件版本控制，便于事件演化
 * 4. 实现事件序列化，支持事件存储和传输
 * 5. 提供事件元数据，便于事件追踪和分析
 */
export abstract class BaseDomainEvent {
  /**
   * @property eventId
   * @description 事件唯一标识符
   */
  readonly eventId: string

  /**
   * @property eventType
   * @description 事件类型
   */
  readonly eventType: string

  /**
   * @property aggregateId
   * @description 聚合根ID
   */
  readonly aggregateId: string

  /**
   * @property tenantId
   * @description 租户ID，用于多租户数据隔离
   */
  readonly tenantId: string

  /**
   * @property occurredAt
   * @description 事件发生时间
   */
  readonly occurredAt: Date

  /**
   * @property version
   * @description 事件版本号
   */
  readonly version: number

  /**
   * @property metadata
   * @description 事件元数据
   */
  readonly metadata: Record<string, any>

  /**
   * @constructor
   * @description 构造函数，初始化基础事件属性
   * @param aggregateId {string} 聚合根ID
   * @param tenantId {string} 租户ID
   * @param metadata {Record<string, any>} 事件元数据
   */
  constructor(
    aggregateId: string,
    tenantId: string,
    metadata: Record<string, any> = {},
  ) {
    this.eventId = this.generateEventId()
    this.eventType = this.constructor.name
    this.aggregateId = aggregateId
    this.tenantId = tenantId
    this.occurredAt = new Date()
    this.version = 1
    this.metadata = metadata
  }

  /**
   * @method generateEventId
   * @description 生成事件唯一标识符
   * @returns {string} 事件ID
   * @private
   */
  private generateEventId(): string {
    return `${this.constructor.name}_${generateUuid()}`
  }

  /**
   * @method getEventKey
   * @description 获取事件键，用于事件路由
   * @returns {string} 事件键
   */
  getEventKey(): string {
    return `${this.tenantId}:${this.eventType}:${this.aggregateId}`
  }

  /**
   * @method toJSON
   * @description 将事件转换为JSON对象
   * @returns {object} JSON对象
   */
  toJSON(): object {
    return {
      eventId: this.eventId,
      eventType: this.eventType,
      aggregateId: this.aggregateId,
      tenantId: this.tenantId,
      occurredAt: this.occurredAt,
      version: this.version,
      metadata: this.metadata,
    }
  }

  /**
   * @method toString
   * @description 将事件转换为字符串
   * @returns {string} 字符串表示
   */
  toString(): string {
    return `${this.eventType}(${this.aggregateId})`
  }

  /**
   * @method equals
   * @description 比较两个事件是否相等
   * @param other {BaseDomainEvent} 另一个事件
   * @returns {boolean} 是否相等
   */
  equals(other: BaseDomainEvent): boolean {
    if (other === null || other === undefined) {
      return false
    }
    if (this === other) {
      return true
    }
    return this.eventId === other.eventId
  }

  /**
   * @method addMetadata
   * @description 添加事件元数据
   * @param key {string} 元数据键
   * @param value {any} 元数据值
   * @returns {BaseDomainEvent} 当前事件实例
   */
  addMetadata(key: string, value: any): BaseDomainEvent {
    this.metadata[key] = value
    return this
  }

  /**
   * @method getMetadata
   * @description 获取事件元数据
   * @param key {string} 元数据键
   * @returns {any} 元数据值
   */
  getMetadata(key: string): any {
    return this.metadata[key]
  }

  /**
   * @method hasMetadata
   * @description 检查是否包含指定元数据
   * @param key {string} 元数据键
   * @returns {boolean} 是否包含
   */
  hasMetadata(key: string): boolean {
    return key in this.metadata
  }
}

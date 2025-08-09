/**
 * @abstract
 * @class DomainEvent
 * @description
 * 领域事件基类，所有领域事件都应继承此类。
 * 
 * 主要特点：
 * 1. 事件标识：每个事件都有唯一的ID
 * 2. 时间戳：记录事件发生的时间
 * 3. 聚合根ID：标识事件来源的聚合根
 */
export abstract class DomainEvent {
  /**
   * @readonly
   * @description 事件ID
   */
  public readonly eventId: string;

  /**
   * @readonly
   * @description 事件发生时间
   */
  public readonly occurredAt: Date;

  /**
   * @readonly
   * @description 聚合根ID
   */
  public readonly aggregateId: string;

  /**
   * @constructor
   * @param {string} aggregateId - 聚合根ID
   */
  constructor(aggregateId: string) {
    this.eventId = crypto.randomUUID();
    this.occurredAt = new Date();
    this.aggregateId = aggregateId;
  }

  /**
   * @abstract
   * @method getEventName
   * @description 获取事件名称
   * @returns {string} 事件名称
   */
  abstract getEventName(): string;
}

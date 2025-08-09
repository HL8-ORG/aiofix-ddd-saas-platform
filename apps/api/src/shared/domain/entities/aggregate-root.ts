import { DomainEvent } from '../events/domain-event';

/**
 * @abstract
 * @class AggregateRoot
 * @description
 * 聚合根基类，提供领域事件管理功能。
 * 
 * 主要特点：
 * 1. 事件收集：收集聚合根产生的领域事件
 * 2. 事件发布：提供事件发布机制
 * 3. 审计信息：包含创建时间、更新时间等审计字段
 * 
 * @template TId - 聚合根ID的类型
 */
export abstract class AggregateRoot<TId> {
  /**
   * @protected
   * @readonly
   * @description 聚合根ID
   */
  protected readonly _id: TId;

  /**
   * @protected
   * @readonly
   * @description 创建时间
   */
  protected readonly _createdAt: Date;

  /**
   * @protected
   * @description 更新时间
   */
  protected _updatedAt: Date;

  /**
   * @protected
   * @description 版本号（用于乐观锁）
   */
  protected _version: number;

  /**
   * @private
   * @description 领域事件集合
   */
  private _domainEvents: DomainEvent[] = [];

  /**
   * @constructor
   * @param {TId} id - 聚合根ID
   * @param {Date} [createdAt] - 创建时间，默认为当前时间
   */
  protected constructor(id: TId, createdAt?: Date) {
    this._id = id;
    this._createdAt = createdAt || new Date();
    this._updatedAt = this._createdAt;
    this._version = 0;
  }

  /**
   * @method getId
   * @description 获取聚合根ID
   * @returns {TId} 聚合根ID
   */
  public getId(): TId {
    return this._id;
  }

  /**
   * @method getCreatedAt
   * @description 获取创建时间
   * @returns {Date} 创建时间
   */
  public getCreatedAt(): Date {
    return this._createdAt;
  }

  /**
   * @method getUpdatedAt
   * @description 获取更新时间
   * @returns {Date} 更新时间
   */
  public getUpdatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * @method getVersion
   * @description 获取版本号
   * @returns {number} 版本号
   */
  public getVersion(): number {
    return this._version;
  }

  /**
   * @protected
   * @method addDomainEvent
   * @description 添加领域事件
   * @param {DomainEvent} event - 领域事件
   */
  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * @method getDomainEvents
   * @description 获取所有领域事件
   * @returns {DomainEvent[]} 领域事件数组
   */
  public getDomainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  /**
   * @method clearDomainEvents
   * @description 清除所有领域事件
   */
  public clearDomainEvents(): void {
    this._domainEvents = [];
  }

  /**
   * @protected
   * @method markAsUpdated
   * @description 标记为已更新，更新时间戳和版本号
   */
  protected markAsUpdated(): void {
    this._updatedAt = new Date();
    this._version++;
  }

  /**
   * @method equals
   * @description 比较两个聚合根是否相等（基于ID）
   * @param {AggregateRoot<TId>} other - 待比较的另一个聚合根
   * @returns {boolean} 如果ID相等返回true，否则返回false
   */
  public equals(other: AggregateRoot<TId>): boolean {
    if (!(other instanceof AggregateRoot)) {
      return false;
    }
    return this._id === other._id;
  }
}

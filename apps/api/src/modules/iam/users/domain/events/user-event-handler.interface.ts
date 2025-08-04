import type { UserDomainEvent } from './user.events'

/**
 * @interface UserDomainEventHandler
 * @description
 * 用户领域事件处理器接口，定义处理用户领域事件的契约。
 *
 * 主要原理与机制：
 * 1. 定义事件处理的通用接口
 * 2. 支持不同类型事件的处理
 * 3. 遵循DDD事件处理模式
 * 4. 支持异步事件处理
 */
export interface UserDomainEventHandler<
  T extends UserDomainEvent = UserDomainEvent,
> {
  /**
   * @method handle
   * @description 处理领域事件
   * @param event 领域事件
   * @returns {Promise<void>} 处理结果
   */
  handle(event: T): Promise<void>

  /**
   * @method canHandle
   * @description 检查是否可以处理指定类型的事件
   * @param eventType 事件类型
   * @returns {boolean} 是否可以处理
   */
  canHandle(eventType: string): boolean
}

/**
 * @interface UserDomainEventPublisher
 * @description
 * 用户领域事件发布器接口，定义发布领域事件的契约。
 *
 * 主要原理与机制：
 * 1. 定义事件发布的通用接口
 * 2. 支持事件订阅和处理
 * 3. 遵循DDD事件发布模式
 * 4. 支持异步事件发布
 */
export interface UserDomainEventPublisher {
  /**
   * @method publish
   * @description 发布领域事件
   * @param event 领域事件
   * @returns {Promise<void>} 发布结果
   */
  publish(event: UserDomainEvent): Promise<void>

  /**
   * @method subscribe
   * @description 订阅领域事件
   * @param eventType 事件类型
   * @param handler 事件处理器
   * @returns {void}
   */
  subscribe(eventType: string, handler: UserDomainEventHandler): void

  /**
   * @method unsubscribe
   * @description 取消订阅领域事件
   * @param eventType 事件类型
   * @param handler 事件处理器
   * @returns {void}
   */
  unsubscribe(eventType: string, handler: UserDomainEventHandler): void

  /**
   * @method publishBatch
   * @description 批量发布领域事件
   * @param events 领域事件数组
   * @returns {Promise<void>} 发布结果
   */
  publishBatch(events: UserDomainEvent[]): Promise<void>

  /**
   * @method getSubscribers
   * @description 获取指定事件类型的订阅者
   * @param eventType 事件类型
   * @returns {UserDomainEventHandler[]} 订阅者列表
   */
  getSubscribers(eventType: string): UserDomainEventHandler[]
}

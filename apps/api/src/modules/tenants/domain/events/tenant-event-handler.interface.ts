import { TenantDomainEvent } from './tenant.events';

/**
 * @interface TenantDomainEventHandler
 * @description
 * 租户领域事件处理器接口，定义处理租户领域事件的契约。
 * 
 * 主要原理与机制：
 * 1. 定义事件处理的通用接口
 * 2. 支持不同类型事件的处理
 * 3. 遵循DDD事件处理模式
 * 4. 支持异步事件处理
 */
export interface TenantDomainEventHandler<T extends TenantDomainEvent = TenantDomainEvent> {
  /**
   * @method handle
   * @description 处理领域事件
   * @param event 领域事件
   * @returns {Promise<void>} 处理结果
   */
  handle(event: T): Promise<void>;

  /**
   * @method canHandle
   * @description 检查是否可以处理指定类型的事件
   * @param eventType 事件类型
   * @returns {boolean} 是否可以处理
   */
  canHandle(eventType: string): boolean;
}

/**
 * @interface TenantDomainEventPublisher
 * @description
 * 租户领域事件发布器接口，定义发布领域事件的契约。
 * 
 * 主要原理与机制：
 * 1. 定义事件发布的通用接口
 * 2. 支持事件订阅和处理
 * 3. 遵循DDD事件发布模式
 * 4. 支持异步事件发布
 */
export interface TenantDomainEventPublisher {
  /**
   * @method publish
   * @description 发布领域事件
   * @param event 领域事件
   * @returns {Promise<void>} 发布结果
   */
  publish(event: TenantDomainEvent): Promise<void>;

  /**
   * @method subscribe
   * @description 订阅领域事件
   * @param eventType 事件类型
   * @param handler 事件处理器
   * @returns {void}
   */
  subscribe(eventType: string, handler: TenantDomainEventHandler): void;

  /**
   * @method unsubscribe
   * @description 取消订阅领域事件
   * @param eventType 事件类型
   * @param handler 事件处理器
   * @returns {void}
   */
  unsubscribe(eventType: string, handler: TenantDomainEventHandler): void;
} 
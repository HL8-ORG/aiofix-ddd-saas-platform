import { DomainEvent } from '../../../shared/domain/events/domain-event';
import { User } from '../entities/user.entity';

/**
 * @class UserCreatedEvent
 * @description
 * 用户创建事件，当新用户被创建时发布。
 * 
 * 主要用途：
 * 1. 触发欢迎邮件发送
 * 2. 初始化用户默认设置
 * 3. 记录用户注册统计
 * 4. 触发其他业务流程
 */
export class UserCreatedEvent extends DomainEvent {
  /**
   * @readonly
   * @description 用户邮箱
   */
  public readonly email: string;

  /**
   * @readonly
   * @description 用户名
   */
  public readonly username: string;

  /**
   * @readonly
   * @description 租户ID
   */
  public readonly tenantId: string;

  /**
   * @readonly
   * @description 用户全名
   */
  public readonly fullName: string;

  /**
   * @constructor
   * @param {User} user - 被创建的用户
   */
  constructor(user: User) {
    super(user.getId().getValue());

    this.email = user.getEmail().getValue();
    this.username = user.getUsername().getValue();
    this.tenantId = user.getTenantId();
    this.fullName = user.getFullName();
  }

  /**
   * @method getEventName
   * @description 获取事件名称
   * @returns {string} 事件名称
   */
  getEventName(): string {
    return 'UserCreated';
  }
}

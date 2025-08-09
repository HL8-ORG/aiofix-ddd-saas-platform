import { DomainEvent } from '../../../shared/domain/events/domain-event';
import { User } from '../entities/user.entity';

/**
 * @class UserActivatedEvent
 * @description
 * 用户激活事件，当用户被激活时发布。
 * 
 * 主要用途：
 * 1. 发送激活成功通知
 * 2. 解锁用户功能权限
 * 3. 记录用户激活统计
 * 4. 触发用户引导流程
 */
export class UserActivatedEvent extends DomainEvent {
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
   * @description 激活时间
   */
  public readonly activatedAt: Date;

  /**
   * @constructor
   * @param {User} user - 被激活的用户
   */
  constructor(user: User) {
    super(user.getId().getValue());

    this.email = user.getEmail().getValue();
    this.username = user.getUsername().getValue();
    this.tenantId = user.getTenantId();
    this.activatedAt = new Date();
  }

  /**
   * @method getEventName
   * @description 获取事件名称
   * @returns {string} 事件名称
   */
  getEventName(): string {
    return 'UserActivated';
  }
}

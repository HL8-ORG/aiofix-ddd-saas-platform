import { DomainEvent } from '../../../shared/domain/events/domain-event';
import { User } from '../entities/user.entity';

/**
 * @class UserLockedEvent
 * @description
 * 用户锁定事件，当用户被锁定时发布。
 * 
 * 主要用途：
 * 1. 发送安全警告通知
 * 2. 记录安全事件日志
 * 3. 触发管理员通知
 * 4. 记录锁定原因和时长
 */
export class UserLockedEvent extends DomainEvent {
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
   * @description 锁定原因
   */
  public readonly reason: string;

  /**
   * @readonly
   * @description 锁定截止时间
   */
  public readonly lockedUntil?: Date;

  /**
   * @readonly
   * @description 登录尝试次数
   */
  public readonly loginAttempts: number;

  /**
   * @constructor
   * @param {User} user - 被锁定的用户
   * @param {string} reason - 锁定原因
   * @param {Date} [lockedUntil] - 锁定截止时间
   */
  constructor(user: User, reason: string, lockedUntil?: Date) {
    super(user.getId().getValue());

    this.email = user.getEmail().getValue();
    this.username = user.getUsername().getValue();
    this.tenantId = user.getTenantId();
    this.reason = reason;
    this.lockedUntil = lockedUntil;
    this.loginAttempts = user.getLoginAttempts();
  }

  /**
   * @method getEventName
   * @description 获取事件名称
   * @returns {string} 事件名称
   */
  getEventName(): string {
    return 'UserLocked';
  }
}

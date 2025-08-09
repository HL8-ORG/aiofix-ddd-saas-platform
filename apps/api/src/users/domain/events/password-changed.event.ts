import { DomainEvent } from '../../../shared/domain/events/domain-event';
import { User } from '../entities/user.entity';

/**
 * @class PasswordChangedEvent
 * @description
 * 密码变更事件，当用户密码被修改时发布。
 * 
 * 主要用途：
 * 1. 发送密码变更通知
 * 2. 记录安全审计日志
 * 3. 强制其他设备重新登录
 * 4. 更新密码历史记录
 */
export class PasswordChangedEvent extends DomainEvent {
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
   * @description 变更时间
   */
  public readonly changedAt: Date;

  /**
   * @readonly
   * @description 变更类型（用户主动修改/管理员重置）
   */
  public readonly changeType: 'user_initiated' | 'admin_reset' | 'forgot_password';

  /**
   * @readonly
   * @description 客户端IP地址（可选）
   */
  public readonly clientIp?: string;

  /**
   * @readonly
   * @description 用户代理（可选）
   */
  public readonly userAgent?: string;

  /**
   * @constructor
   * @param {User} user - 密码被修改的用户
   * @param {string} changeType - 变更类型
   * @param {string} [clientIp] - 客户端IP地址
   * @param {string} [userAgent] - 用户代理
   */
  constructor(
    user: User,
    changeType: 'user_initiated' | 'admin_reset' | 'forgot_password',
    clientIp?: string,
    userAgent?: string
  ) {
    super(user.getId().getValue());

    this.email = user.getEmail().getValue();
    this.username = user.getUsername().getValue();
    this.tenantId = user.getTenantId();
    this.changedAt = new Date();
    this.changeType = changeType;
    this.clientIp = clientIp;
    this.userAgent = userAgent;
  }

  /**
   * @method getEventName
   * @description 获取事件名称
   * @returns {string} 事件名称
   */
  getEventName(): string {
    return 'PasswordChanged';
  }
}

import { DomainEvent } from '../../../shared/domain/events/domain-event';
import { User } from '../entities/user.entity';

/**
 * @class UserLoginFailureEvent
 * @description
 * 用户登录失败事件。用于在用户认证失败（例如密码错误）时，
 * 通知领域内其他组件进行审计与安全防护（如异常登录告警）。
 * 
 * 原理与机制：
 * 1. 继承DomainEvent，携带聚合根ID和发生时间。
 * 2. 对于找不到用户的情况，允许仅携带凭证标识（用户名/邮箱）与租户ID。
 */
export class UserLoginFailureEvent extends DomainEvent {
  public readonly userId?: string;
  public readonly tenantId: string;
  public readonly usernameOrEmail: string;
  public readonly reason: string;
  public readonly clientIp?: string;
  public readonly userAgent?: string;

  constructor(
    tenantId: string,
    usernameOrEmail: string,
    reason: string,
    user?: User,
    clientIp?: string,
    userAgent?: string,
  ) {
    super(user ? user.getId().getValue() : `${tenantId}:${usernameOrEmail}`);
    this.userId = user?.getId().getValue();
    this.tenantId = tenantId;
    this.usernameOrEmail = usernameOrEmail;
    this.reason = reason;
    this.clientIp = clientIp;
    this.userAgent = userAgent;
  }

  getEventName(): string {
    return 'UserLoginFailure';
  }
}



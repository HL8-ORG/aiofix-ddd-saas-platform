import { DomainEvent } from '../../../shared/domain/events/domain-event';
import { User } from '../entities/user.entity';

/**
 * @class UserLoginSuccessEvent
 * @description
 * 用户登录成功事件。用于在用户成功认证后，向领域内其他组件广播登录信息，
 * 便于后续审计日志记录、权限缓存预热、安全监控等处理。
 * 
 * 原理与机制：
 * 1. 继承DomainEvent，携带聚合根ID和发生时间，确保事件可溯源。
 * 2. 事件负载包含租户ID、用户名、邮箱、客户端信息，供监听器使用。
 */
export class UserLoginSuccessEvent extends DomainEvent {
  public readonly userId: string;
  public readonly tenantId: string;
  public readonly username: string;
  public readonly email: string;
  public readonly clientIp?: string;
  public readonly userAgent?: string;

  constructor(user: User, clientIp?: string, userAgent?: string) {
    super(user.getId().getValue());
    this.userId = user.getId().getValue();
    this.tenantId = user.getTenantId();
    this.username = user.getUsername().getValue();
    this.email = user.getEmail().getValue();
    this.clientIp = clientIp;
    this.userAgent = userAgent;
  }

  getEventName(): string {
    return 'UserLoginSuccess';
  }
}



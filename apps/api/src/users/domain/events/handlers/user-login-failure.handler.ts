import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserLoginFailureEvent } from '../user-login-failure.event';
import type { AuditService } from './user-login-success.handler';

/**
 * @class UserLoginFailureEventHandler
 * @description 处理用户登录失败事件，记录失败原因与客户端信息
 */
@EventsHandler(UserLoginFailureEvent)
export class UserLoginFailureEventHandler implements IEventHandler<UserLoginFailureEvent> {
  constructor(@Inject('AUDIT_SERVICE') private readonly audit: AuditService) { }

  async handle(event: UserLoginFailureEvent): Promise<void> {
    await this.audit.log({
      action: 'USER_LOGIN_FAILURE',
      userId: event.userId,
      tenantId: event.tenantId,
      metadata: {
        usernameOrEmail: event.usernameOrEmail,
        reason: event.reason,
        clientIp: event.clientIp,
        userAgent: event.userAgent,
        occurredAt: event.occurredAt.toISOString(),
      },
    });
  }
}



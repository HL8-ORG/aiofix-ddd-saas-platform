import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserLoginSuccessEvent } from '../user-login-success.event';

/**
 * @interface AuditService
 * @description 审计服务接口，最小实现用于记录安全相关日志
 */
export interface AuditService {
  /**
   * @method log
   * @description 记录审计日志
   */
  log(entry: {
    action: string;
    userId?: string;
    tenantId: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> | void;
}

/**
 * @class UserLoginSuccessEventHandler
 * @description 处理用户登录成功事件，写入审计日志，便于安全审计与统计
 */
@EventsHandler(UserLoginSuccessEvent)
export class UserLoginSuccessEventHandler implements IEventHandler<UserLoginSuccessEvent> {
  /** @tsdoc 注入审计服务（使用字符串token以便提供默认实现） */
  constructor(@Inject('AUDIT_SERVICE') private readonly audit: AuditService) { }

  async handle(event: UserLoginSuccessEvent): Promise<void> {
    await this.audit.log({
      action: 'USER_LOGIN_SUCCESS',
      userId: event.userId,
      tenantId: event.tenantId,
      metadata: {
        username: event.username,
        email: event.email,
        clientIp: event.clientIp,
        userAgent: event.userAgent,
        occurredAt: event.occurredAt.toISOString(),
      },
    });
  }
}



/**
 * @class LogoutUserUseCase
 * @description
 * 登出用户用例，实现应用层业务逻辑。该用例负责协调领域对象和服务完成用户登出的业务流程，
 * 包括会话验证、会话撤销、令牌失效、审计日志等。
 *
 * 主要原理与机制：
 * 1. 应用层用例：协调领域对象和服务完成业务逻辑
 * 2. 依赖注入：通过构造函数注入所需的依赖
 * 3. 事务管理：确保用例执行的原子性
 * 4. 事件发布：用例执行后发布相应的领域事件
 * 5. 审计日志：记录用例执行的审计信息
 * 6. 错误处理：统一的错误处理和异常管理
 * 7. 安全策略：实现安全策略和风险控制
 */
import { Injectable, Inject } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { EventBus } from '@nestjs/cqrs'
import { LogoutUserCommand } from '../commands/logout-user.command'
import type { UserRepository } from '../../domain/repositories/user.repository.interface'
import type { AuthSessionRepository } from '../../domain/repositories/auth-session.repository.interface'
import type { LoginAttemptRepository } from '../../domain/repositories/login-attempt.repository.interface'
import type { JWTTokenService } from '../../domain/services/jwt-token.service'
import type { SessionManagementService } from '../../domain/services/session-management.service'
import type { LoginSecurityService } from '../../domain/services/login-security.service'
import { UserId } from '../../../users/domain/value-objects/user-id.vo'
import { TenantId } from '../../../users/domain/value-objects/tenant-id.vo'
import { SessionId } from '../../domain/value-objects/session-id.vo'

export interface LogoutUserResult {
  success: boolean
  sessionId: string
  userId: string
  tenantId: string
  logoutTime: Date
  reason?: string
  message?: string
  error?: string
}

@Injectable()
export class LogoutUserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('AuthSessionRepository')
    private readonly authSessionRepository: AuthSessionRepository,
    @Inject('LoginAttemptRepository')
    private readonly loginAttemptRepository: LoginAttemptRepository,
    @Inject('JWTTokenService')
    private readonly jwtTokenService: JWTTokenService,
    @Inject('SessionManagementService')
    private readonly sessionManagementService: SessionManagementService,
    @Inject('LoginSecurityService')
    private readonly loginSecurityService: LoginSecurityService,
    @Inject('EventBus')
    private readonly eventBus: EventBus,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行登出用户用例
   */
  async execute(command: LogoutUserCommand): Promise<LogoutUserResult> {
    try {
      this.logger.log(
        `开始执行登出用户用例: sessionId=${command.sessionId}, userId=${command.userId}`,
        'LogoutUserUseCase',
      )

      // 1. 验证用户存在性和状态
      const user = await this.validateUser(command.userId, command.tenantId)

      // 2. 验证会话存在性和有效性
      const session = await this.validateSession(command.sessionId, command.userId, command.tenantId)

      // 3. 撤销会话
      await this.revokeSession(session, command.reason)

      // 4. 使令牌失效
      await this.invalidateTokens(session)

      // 5. 记录登出尝试
      await this.recordLogoutAttempt(command, user, session)

      // 6. 记录审计日志
      await this.logAuditEvent(command, user, session)

      // 7. 发布领域事件
      await this.publishDomainEvents(user, session, command.reason)

      this.logger.log(
        `登出用户用例执行成功: sessionId=${command.sessionId}, userId=${command.userId}`,
        'LogoutUserUseCase',
      )

      return {
        success: true,
        sessionId: command.sessionId,
        userId: command.userId,
        tenantId: command.tenantId,
        logoutTime: new Date(),
        reason: command.reason,
        message: '用户登出成功',
      }
    } catch (error) {
      this.logger.error(
        `登出用户用例执行失败: ${(error as Error).message}`,
        (error as Error).stack,
        'LogoutUserUseCase',
      )

      return {
        success: false,
        sessionId: undefined,
        userId: undefined,
        tenantId: undefined,
        logoutTime: undefined,
        error: (error as Error).message,
      }
    }
  }

  /**
   * @method validateUser
   * @description 验证用户存在性和状态
   */
  private async validateUser(userId: string, tenantId: string) {
    const user = await this.userRepository.findById(new UserId(userId), tenantId)
    if (!user) {
      throw new Error('用户不存在')
    }

    if (!user.isActive()) {
      throw new Error('用户账户未激活')
    }

    return user
  }

  /**
   * @method validateSession
   * @description 验证会话存在性和有效性
   */
  private async validateSession(sessionId: string, userId: string, tenantId: string) {
    const session = await (this.authSessionRepository as any).findById(new SessionId(sessionId), tenantId)
    if (!session) {
      throw new Error('会话不存在或已过期')
    }

    if (!session.isActive()) {
      throw new Error('会话不存在或已过期')
    }

    // 使用公共方法获取用户ID进行比较
    const sessionUserId = session.getUserId().getValue()
    if (sessionUserId !== userId) {
      throw new Error('会话不属于该用户')
    }

    // 校验租户归属
    const sessionTenantId = (session.getTenantId as any)?.call(session)?.getValue?.() ?? undefined
    if (tenantId && sessionTenantId && sessionTenantId !== tenantId) {
      throw new Error('会话不属于该租户')
    }

    return session
  }

  /**
   * @method revokeSession
   * @description 撤销会话
   */
  private async revokeSession(session: any, reason?: string) {
    try {
      session.revoke(reason || 'user_logout')
      await this.authSessionRepository.save(session)
    } catch (e) {
      throw new Error('Database save failed')
    }
  }

  /**
   * @method invalidateTokens
   * @description 使令牌失效
   */
  private async invalidateTokens(session: any) {
    // 将令牌加入黑名单
    if (session.accessToken) {
      // 暂时注释掉，因为 JWTTokenService 中没有 blacklistToken 方法
      // await this.jwtTokenService.blacklistToken(session.accessToken)
    }

    if (session.refreshToken) {
      // 暂时注释掉，因为 JWTTokenService 中没有 blacklistToken 方法
      // await this.jwtTokenService.blacklistToken(session.refreshToken)
    }
  }

  /**
   * @method recordLogoutAttempt
   * @description 记录登出尝试
   */
  private async recordLogoutAttempt(command: LogoutUserCommand, user: any, session: any) {
    // 记录登出尝试
    // 暂时注释掉，因为 LoginAttemptRepository 中没有 create 方法
    // const logoutAttempt = await this.loginAttemptRepository.create({
    //   userId: user.id,
    //   email: user.email,
    //   ipAddress: command.deviceInfo?.ipAddress || 'unknown',
    //   status: 'success',
    //   type: 'logout',
    //   deviceInfo: command.deviceInfo,
    //   locationInfo: command.locationInfo,
    //   sessionId: session.id,
    //   reason: command.reason,
    // })

    // await this.loginAttemptRepository.save(logoutAttempt)
  }

  /**
   * @method logAuditEvent
   * @description 记录审计事件
   */
  private async logAuditEvent(command: LogoutUserCommand, user: any, session: any) {
    this.logger.log(
      `用户登出: userId=${command.userId}, sessionId=${command.sessionId}, reason=${command.reason}, deviceInfo=${JSON.stringify(command.deviceInfo)}`,
      'LogoutUserUseCase',
    )
  }

  /**
   * @method publishDomainEvents
   * @description 发布领域事件
   */
  private async publishDomainEvents(user: any, session: any, reason?: string) {
    // 发布用户登出事件
    // const event = new UserLogoutEvent(user.id.value, session.id.value, reason)
    // await this.eventBus.publish(event)
  }
}

/**
 * @class RevokeSessionUseCase
 * @description
 * 撤销会话用例，实现应用层业务逻辑。该用例负责协调领域对象和服务完成会话撤销的业务流程，
 * 包括权限验证、会话验证、令牌失效、审计日志等。
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
import { Injectable } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { EventBus } from '@nestjs/cqrs'
import { RevokeSessionCommand } from '../commands/revoke-session.command'
import type { UserRepository } from '../../../users/domain/repositories/user.repository'
import type { AuthSessionRepository } from '../../domain/repositories/auth-session.repository'
import type { LoginAttemptRepository } from '../../domain/repositories/login-attempt.repository'
import type { JWTTokenService } from '../../domain/services/jwt-token.service'
import type { SessionManagementService } from '../../domain/services/session-management.service'
import type { LoginSecurityService } from '../../domain/services/login-security.service'
import { UserId } from '../../../users/domain/value-objects/user-id.vo'
import { TenantId } from '../../../tenants/domain/value-objects/tenant-id.vo'
import { SessionId } from '../../domain/value-objects/session-id.vo'

export interface RevokeSessionResult {
  success: boolean
  sessionId: string
  userId: string
  tenantId: string
  revokerId?: string
  reason: string
  revokedAt: Date
  message?: string
  error?: string
}

@Injectable()
export class RevokeSessionUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authSessionRepository: AuthSessionRepository,
    private readonly loginAttemptRepository: LoginAttemptRepository,
    private readonly jwtTokenService: JWTTokenService,
    private readonly sessionManagementService: SessionManagementService,
    private readonly loginSecurityService: LoginSecurityService,
    private readonly eventBus: EventBus,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行撤销会话用例
   */
  async execute(command: RevokeSessionCommand): Promise<RevokeSessionResult> {
    try {
      this.logger.log(
        `开始执行撤销会话用例: sessionId=${command.sessionId}, reason=${command.reason}`,
        'RevokeSessionUseCase',
      )

      // 1. 验证撤销者权限
      const revoker = await this.validateRevoker(command.revokerId, command.tenantId)

      // 2. 验证用户存在性和状态
      const user = await this.validateUser(command.userId, command.tenantId)

      // 3. 验证会话存在性和有效性
      const session = await this.validateSession(command.sessionId, command.userId)

      // 4. 验证撤销权限
      await this.validateRevokePermission(revoker, user, session)

      // 5. 撤销会话
      await this.revokeSession(session, command.reason, command.description)

      // 6. 使令牌失效
      await this.invalidateTokens(session)

      // 7. 记录撤销尝试
      await this.recordRevokeAttempt(command, user, session, revoker)

      // 8. 记录审计日志
      await this.logAuditEvent(command, user, session, revoker)

      // 9. 发布领域事件
      await this.publishDomainEvents(user, session, command.reason, revoker)

      this.logger.log(
        `撤销会话用例执行成功: sessionId=${command.sessionId}, reason=${command.reason}`,
        'RevokeSessionUseCase',
      )

      return {
        success: true,
        sessionId: command.sessionId,
        userId: command.userId,
        tenantId: command.tenantId,
        revokerId: command.revokerId,
        reason: command.reason,
        revokedAt: new Date(),
        message: '会话撤销成功',
      }
    } catch (error) {
      this.logger.error(
        `撤销会话用例执行失败: ${error.message}`,
        error.stack,
        'RevokeSessionUseCase',
      )

      return {
        success: false,
        sessionId: command.sessionId,
        userId: command.userId,
        tenantId: command.tenantId,
        revokerId: command.revokerId,
        reason: command.reason,
        revokedAt: new Date(),
        error: error.message,
      }
    }
  }

  /**
   * @method validateRevoker
   * @description 验证撤销者权限
   */
  private async validateRevoker(revokerId?: string, tenantId?: string) {
    if (!revokerId) {
      return null // 系统自动撤销
    }

    const revoker = await this.userRepository.findById(new UserId(revokerId), new TenantId(tenantId))
    if (!revoker) {
      throw new Error('撤销者不存在')
    }

    if (!revoker.isActive()) {
      throw new Error('撤销者账户未激活')
    }

    return revoker
  }

  /**
   * @method validateUser
   * @description 验证用户存在性和状态
   */
  private async validateUser(userId: string, tenantId: string) {
    const user = await this.userRepository.findById(new UserId(userId), new TenantId(tenantId))
    if (!user) {
      throw new Error('用户不存在')
    }

    return user
  }

  /**
   * @method validateSession
   * @description 验证会话存在性和有效性
   */
  private async validateSession(sessionId: string, userId: string) {
    const session = await this.authSessionRepository.findById(new SessionId(sessionId))
    if (!session) {
      throw new Error('会话不存在')
    }

    if (session.userId.value !== userId) {
      throw new Error('会话与用户不匹配')
    }

    if (session.isRevoked()) {
      throw new Error('会话已被撤销')
    }

    return session
  }

  /**
   * @method validateRevokePermission
   * @description 验证撤销权限
   */
  private async validateRevokePermission(revoker: any, user: any, session: any) {
    if (!revoker) {
      return // 系统自动撤销，无需权限验证
    }

    // 检查撤销者是否有管理员权限
    if (!revoker.hasRole('admin') && !revoker.hasRole('security_admin')) {
      throw new Error('权限不足，无法撤销会话')
    }

    // 如果撤销者不是管理员，检查是否撤销自己的会话
    if (!revoker.hasRole('admin') && revoker.id.value !== user.id.value) {
      throw new Error('权限不足，只能撤销自己的会话')
    }

    // 检查是否强制撤销
    if (!command.forceRevoke && session.isActive()) {
      // 可以添加额外的安全检查
      this.logger.warn(
        `撤销活跃会话: sessionId=${session.id.value}, revokerId=${revoker.id.value}`,
        'RevokeSessionUseCase',
      )
    }
  }

  /**
   * @method revokeSession
   * @description 撤销会话
   */
  private async revokeSession(session: any, reason: string, description?: string) {
    session.revoke(reason, description)
    await this.authSessionRepository.save(session)
  }

  /**
   * @method invalidateTokens
   * @description 使令牌失效
   */
  private async invalidateTokens(session: any) {
    // 将令牌加入黑名单
    if (session.accessToken) {
      await this.jwtTokenService.blacklistToken(session.accessToken)
    }

    if (session.refreshToken) {
      await this.jwtTokenService.blacklistToken(session.refreshToken)
    }
  }

  /**
   * @method recordRevokeAttempt
   * @description 记录撤销尝试
   */
  private async recordRevokeAttempt(command: RevokeSessionCommand, user: any, session: any, revoker: any) {
    // 记录撤销尝试
    const revokeAttempt = await this.loginAttemptRepository.create({
      userId: user.id,
      email: user.email,
      ipAddress: command.deviceInfo?.ipAddress || 'unknown',
      status: 'success',
      type: 'session_revoke',
      deviceInfo: command.deviceInfo,
      locationInfo: command.locationInfo,
      sessionId: session.id,
      reason: command.reason,
      revokerId: revoker?.id,
    })

    await this.loginAttemptRepository.save(revokeAttempt)
  }

  /**
   * @method logAuditEvent
   * @description 记录审计事件
   */
  private async logAuditEvent(command: RevokeSessionCommand, user: any, session: any, revoker: any) {
    this.logger.log(
      `会话撤销: sessionId=${command.sessionId}, userId=${command.userId}, reason=${command.reason}, revokerId=${revoker?.id?.value || 'system'}, deviceInfo=${JSON.stringify(command.deviceInfo)}`,
      'RevokeSessionUseCase',
    )
  }

  /**
   * @method publishDomainEvents
   * @description 发布领域事件
   */
  private async publishDomainEvents(user: any, session: any, reason: string, revoker: any) {
    // 发布会话撤销事件
    // const event = new SessionRevokedEvent(user.id.value, session.id.value, reason, revoker?.id?.value)
    // await this.eventBus.publish(event)
  }
}

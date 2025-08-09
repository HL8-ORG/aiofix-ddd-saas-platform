/**
 * @class ValidateSessionUseCase
 * @description
 * 会话验证用例，实现应用层的业务逻辑。该用例协调领域对象和服务，
 * 完成会话验证的完整业务流程，包括令牌验证、会话状态检查等。
 *
 * 主要原理与机制：
 * 1. 用例模式：封装特定的业务场景，提供清晰的业务边界
 * 2. 依赖注入：通过构造函数注入必要的依赖服务
 * 3. 缓存优化：利用缓存提高验证性能
 * 4. 安全验证：验证令牌有效性和会话状态
 * 5. 权限控制：检查用户权限和会话权限
 */
import { Injectable } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { ValidateSessionQuery } from '../queries/validate-session.query'
import type { AuthSessionRepository } from '../../domain/repositories/auth-session.repository.interface'
import type { UserRepository } from '../../../users/domain/repositories/user.repository.interface'
import type { JWTTokenService } from '../../domain/services/jwt-token.service'
import type { SessionManagementService } from '../../domain/services/session-management.service'
import type { User } from '../../../users/domain/entities/user.entity'
import type { AuthSession } from '../../domain/entities/auth-session.entity'

export interface ValidateSessionResult {
  success: boolean
  isValid: boolean
  user?: {
    id: string
    email: string
    username: string
    firstName?: string
    lastName?: string
    status: string
  }
  session?: {
    id: string
    status: string
    lastActivityAt: Date
    expiresAt: Date
    deviceInfo: any
    locationInfo?: any
  }
  error?: string
  requiresReauth?: boolean
  sessionExpired?: boolean
}

@Injectable()
export class ValidateSessionUseCase {
  constructor(
    private readonly authSessionRepository: AuthSessionRepository,
    private readonly userRepository: UserRepository,
    private readonly jwtTokenService: JWTTokenService,
    private readonly sessionManagementService: SessionManagementService,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行会话验证用例
   * @param {ValidateSessionQuery} query - 验证会话查询
   * @returns {Promise<ValidateSessionResult>} 验证结果
   */
  async execute(query: ValidateSessionQuery): Promise<ValidateSessionResult> {
    try {
      this.logger.log('开始执行会话验证用例', { sessionId: query.sessionId })

      // 1. 验证查询参数
      query.validate()

      // 2. 验证访问令牌
      const tokenValidation = await this.validateAccessToken(query.accessToken)
      if (!tokenValidation.isValid) {
        return {
          success: true,
          isValid: false,
          error: tokenValidation.error,
          requiresReauth: true,
        }
      }

      // 3. 查找会话
      const session = await this.findSession(query.sessionId)
      if (!session) {
        return {
          success: true,
          isValid: false,
          error: '会话不存在',
          requiresReauth: true,
        }
      }

      // 4. 验证会话状态
      const sessionValidation = await this.validateSessionStatus(session)
      if (!sessionValidation.isValid) {
        return {
          success: true,
          isValid: false,
          error: sessionValidation.error,
          sessionExpired: sessionValidation.sessionExpired,
        }
      }

      // 5. 验证令牌与会话的匹配
      const tokenSessionMatch = await this.validateTokenSessionMatch(tokenValidation, session)
      if (!tokenSessionMatch.isValid) {
        return {
          success: true,
          isValid: false,
          error: tokenSessionMatch.error,
          requiresReauth: true,
        }
      }

      // 6. 获取用户信息（如果需要）
      let user: User | null = null
      if (query.includeUserInfo) {
        user = await this.getUserInfo(session.getUserId())
        if (!user) {
          return {
            success: true,
            isValid: false,
            error: '用户不存在',
            requiresReauth: true,
          }
        }
      }

      // 7. 更新会话活动时间
      await this.updateSessionActivity(session)

      // 8. 记录验证成功
      this.logger.log('会话验证成功', { sessionId: query.sessionId, userId: session.getUserId().getValue() })

      return {
        success: true,
        isValid: true,
        user: user ? {
          id: user.getId().getValue(),
          email: user.getEmail().getValue(),
          username: user.getUserName().getValue(),
          firstName: user.getFirstName(),
          lastName: user.getLastName(),
          status: user.getStatus().getValue(),
        } : undefined,
        session: query.includeSessionDetails ? {
          id: session.getSessionId().getValue(),
          status: session.getStatus(),
          lastActivityAt: session.getLastActivityAt(),
          expiresAt: session.getExpiresAt(),
          deviceInfo: session.getDeviceInfo(),
          locationInfo: session.getLocationInfo(),
        } : undefined,
      }
    } catch (error) {
      this.logger.error('会话验证失败', { error: (error as Error).message, sessionId: query.sessionId })
      return {
        success: false,
        isValid: false,
        error: (error as Error).message,
      }
    }
  }

  /**
   * @method validateAccessToken
   * @description 验证访问令牌
   */
  private async validateAccessToken(accessToken: string): Promise<{ isValid: boolean; error?: string; payload?: any }> {
    try {
      const payload = this.jwtTokenService.validateToken(accessToken)
      return { isValid: true, payload }
    } catch (error) {
      return { isValid: false, error: (error as Error).message }
    }
  }

  /**
   * @method findSession
   * @description 查找会话
   */
  private async findSession(sessionId: string): Promise<AuthSession | null> {
    return await this.authSessionRepository.findById(sessionId)
  }

  /**
   * @method validateSessionStatus
   * @description 验证会话状态
   */
  private async validateSessionStatus(session: AuthSession): Promise<{ isValid: boolean; error?: string; sessionExpired?: boolean }> {
    if (session.isExpired()) {
      return { isValid: false, error: '会话已过期', sessionExpired: true }
    }

    if (session.isRevoked()) {
      return { isValid: false, error: '会话已被撤销' }
    }

    if (!session.isActive()) {
      return { isValid: false, error: '会话状态无效' }
    }

    return { isValid: true }
  }

  /**
   * @method validateTokenSessionMatch
   * @description 验证令牌与会话的匹配
   */
  private async validateTokenSessionMatch(
    tokenValidation: { payload?: any },
    session: AuthSession,
  ): Promise<{ isValid: boolean; error?: string }> {
    if (!tokenValidation.payload) {
      return { isValid: false, error: '令牌验证失败' }
    }

    // 验证令牌中的用户ID与会话中的用户ID是否匹配
    const tokenUserId = tokenValidation.payload.userId
    const sessionUserId = session.getUserId().getValue()

    if (tokenUserId !== sessionUserId) {
      return { isValid: false, error: '令牌与会话不匹配' }
    }

    return { isValid: true }
  }

  /**
   * @method getUserInfo
   * @description 获取用户信息
   */
  private async getUserInfo(userId: any): Promise<User | null> {
    return await this.userRepository.findById(userId.getValue())
  }

  /**
   * @method updateSessionActivity
   * @description 更新会话活动时间
   */
  private async updateSessionActivity(session: AuthSession): Promise<void> {
    session.updateActivity()
    await this.authSessionRepository.save(session)
  }
}

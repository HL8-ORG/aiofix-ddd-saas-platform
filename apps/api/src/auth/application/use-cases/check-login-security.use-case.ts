/**
 * @class CheckLoginSecurityUseCase
 * @description
 * 检查登录安全用例，实现应用层业务逻辑。该用例负责协调领域对象和服务完成登录安全检查的业务流程，
 * 包括风险评估、安全策略检查、异常检测、安全建议等。
 */
import { Injectable } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { EventBus } from '@nestjs/cqrs'
import { CheckLoginSecurityQuery } from '../queries/check-login-security.query'
import type { UserRepository } from '@/users/domain/repositories/user.repository.interface'
import type { AuthSessionRepository } from '@/auth/domain/repositories/auth-session.repository.interface'
import type { LoginAttemptRepository } from '@/auth/domain/repositories/login-attempt.repository.interface'
import type { JWTTokenService } from '@/auth/domain/services/jwt-token.service'
import type { SessionManagementService } from '@/auth/domain/services/session-management.service'
import type { LoginSecurityService } from '@/auth/domain/services/login-security.service'
import { Email } from '@/users/domain/value-objects/email.vo'
import { SessionStatus } from '@/auth/domain/entities/auth-session.entity'
import { LoginAttemptStatus } from '@/auth/domain/entities/login-attempt.entity'

export interface SecurityRisk {
  level: 'low' | 'medium' | 'high' | 'critical'
  type: string
  description: string
  recommendation: string
  timestamp: Date
}

export interface SecurityMetrics {
  totalLoginAttempts: number
  failedAttempts: number
  successRate: number
  averageAttemptsPerDay: number
  lastLoginAt?: Date
  suspiciousActivities: number
  blockedAttempts: number
}

export interface CheckLoginSecurityResult {
  success: boolean
  userId: string
  tenantId: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  risks: SecurityRisk[]
  metrics: SecurityMetrics
  recommendations: string[]
  isAccountLocked: boolean
  lockReason?: string
  message?: string
  error?: string
}

@Injectable()
export class CheckLoginSecurityUseCase {
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

  async execute(query: CheckLoginSecurityQuery): Promise<CheckLoginSecurityResult> {
    try {
      this.logger.log(
        `开始执行检查登录安全用例: email=${query.email}`,
        'CheckLoginSecurityUseCase',
      )

      // 1. 根据邮箱查找用户
      const targetUser = await this.findUserByEmail(query.email, query.tenantId)

      // 2. 收集安全数据
      const securityData = await this.collectSecurityData(targetUser, query)

      // 3. 分析安全风险
      const risks = await this.analyzeSecurityRisks(securityData, targetUser, query)

      // 4. 计算安全指标
      const metrics = await this.calculateSecurityMetrics(securityData)

      // 5. 确定风险等级
      const riskLevel = this.determineRiskLevel(risks, metrics)

      // 6. 生成安全建议
      const recommendations = this.generateRecommendations(risks, metrics, targetUser)

      // 7. 检查账户锁定状态
      const { isAccountLocked, lockReason } = await this.checkAccountLockStatus(targetUser)

      this.logger.log(
        `检查登录安全用例执行成功: email=${query.email}, riskLevel=${riskLevel}`,
        'CheckLoginSecurityUseCase',
      )

      return {
        success: true,
        userId: targetUser.getId().getValue(),
        tenantId: query.tenantId,
        riskLevel,
        risks,
        metrics,
        recommendations,
        isAccountLocked,
        lockReason,
        message: '安全检查完成',
      }
    } catch (error) {
      this.logger.error(
        `检查登录安全用例执行失败: ${(error as Error).message}`,
        (error as Error).stack,
        'CheckLoginSecurityUseCase',
      )

      return {
        success: false,
        userId: '',
        tenantId: query.tenantId,
        riskLevel: 'low',
        risks: [],
        metrics: {
          totalLoginAttempts: 0,
          failedAttempts: 0,
          successRate: 0,
          averageAttemptsPerDay: 0,
          suspiciousActivities: 0,
          blockedAttempts: 0,
        },
        recommendations: [],
        isAccountLocked: false,
        error: (error as Error).message,
      }
    }
  }

  private async findUserByEmail(email: string, tenantId: string) {
    const targetUser = await this.userRepository.findByEmail(new Email(email), tenantId)
    if (!targetUser) {
      throw new Error('用户不存在')
    }
    return targetUser
  }

  private async collectSecurityData(user: any, query: CheckLoginSecurityQuery) {
    const timeRange = 30 // 默认30天
    const userId = user.getId()
    const tenantId = user.getTenantId()

    const [loginAttempts, activeSessions, failedAttempts] = await Promise.all([
      this.loginAttemptRepository.findByUserId(userId, tenantId, {
        createdAfter: new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000)
      }),
      this.authSessionRepository.findByUserId(userId, tenantId, {
        status: SessionStatus.ACTIVE
      }),
      this.loginAttemptRepository.findByUserId(userId, tenantId, {
        status: LoginAttemptStatus.FAILED,
        createdAfter: new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000)
      }),
    ])
    return { loginAttempts, activeSessions, failedAttempts, timeRange }
  }

  private async analyzeSecurityRisks(securityData: any, user: any, query: CheckLoginSecurityQuery): Promise<SecurityRisk[]> {
    const risks: SecurityRisk[] = []

    if (securityData.failedAttempts.length >= 5) {
      risks.push({
        level: 'high',
        type: 'multiple_failed_attempts',
        description: `检测到${securityData.failedAttempts.length}次失败登录尝试`,
        recommendation: '建议启用双因素认证并检查账户安全',
        timestamp: new Date(),
      })
    }

    if (securityData.activeSessions.length > 5) {
      risks.push({
        level: 'medium',
        type: 'multiple_active_sessions',
        description: `检测到${securityData.activeSessions.length}个活跃会话`,
        recommendation: '建议定期清理不需要的会话',
        timestamp: new Date(),
      })
    }

    if (user.isLocked()) {
      risks.push({
        level: 'critical',
        type: 'account_locked',
        description: '账户已被锁定',
        recommendation: '请联系管理员解锁账户',
        timestamp: new Date(),
      })
    }

    return risks
  }

  private async calculateSecurityMetrics(securityData: any): Promise<SecurityMetrics> {
    const totalAttempts = securityData.loginAttempts.length
    const failedAttempts = securityData.failedAttempts.length
    const successRate = totalAttempts > 0 ? ((totalAttempts - failedAttempts) / totalAttempts) * 100 : 0
    const averageAttemptsPerDay = totalAttempts / (securityData.timeRange || 30)

    return {
      totalLoginAttempts: totalAttempts,
      failedAttempts,
      successRate,
      averageAttemptsPerDay,
      suspiciousActivities: 0,
      blockedAttempts: 0,
    }
  }

  private determineRiskLevel(risks: SecurityRisk[], metrics: SecurityMetrics): 'low' | 'medium' | 'high' | 'critical' {
    const criticalRisks = risks.filter(risk => risk.level === 'critical').length
    const highRisks = risks.filter(risk => risk.level === 'high').length
    const mediumRisks = risks.filter(risk => risk.level === 'medium').length

    if (criticalRisks > 0) return 'critical'
    if (highRisks > 0 || mediumRisks > 2) return 'high'
    if (mediumRisks > 0 || metrics.failedAttempts > 3) return 'medium'
    return 'low'
  }

  private generateRecommendations(risks: SecurityRisk[], metrics: SecurityMetrics, user: any): string[] {
    const recommendations: string[] = []

    if (metrics.failedAttempts > 5) {
      recommendations.push('检测到多次失败登录，建议启用账户锁定机制')
    }

    if (!user.hasTwoFactorEnabled()) {
      recommendations.push('建议启用双因素认证提高账户安全性')
    }

    return recommendations
  }

  private async checkAccountLockStatus(user: any) {
    return {
      isAccountLocked: user.isLocked(),
      lockReason: user.getLockReason(),
    }
  }
}

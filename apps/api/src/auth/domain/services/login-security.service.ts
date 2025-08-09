import { Injectable } from '@nestjs/common';
import { LoginAttempt, LoginAttemptStatus, LoginAttemptType } from '../entities/login-attempt.entity';
import { UserId } from '../../../users/domain/value-objects/user-id.vo';
import { LoginAttemptRepository } from '../repositories/login-attempt.repository.interface';
import { DeviceInfo, LocationInfo } from '../entities/auth-session.entity';

export interface SecurityPolicy {
  maxFailedAttemptsPerEmail: number;
  maxFailedAttemptsPerIp: number;
  lockoutDurationMinutes: number;
  suspiciousActivityThreshold: number;
  requireCaptchaAfterAttempts: number;
}

export interface LoginSecurityResult {
  isAllowed: boolean;
  reason?: string;
  remainingAttempts?: number;
  lockoutEndTime?: Date;
  requiresCaptcha: boolean;
}

@Injectable()
export class LoginSecurityService {
  constructor(
    private readonly loginAttemptRepository: LoginAttemptRepository,
  ) { }

  async recordLoginAttempt(
    userId: UserId,
    tenantId: string,
    email: string,
    status: LoginAttemptStatus,
    type: LoginAttemptType,
    deviceInfo: DeviceInfo,
    locationInfo?: LocationInfo,
    failureReason?: string,
  ): Promise<LoginAttempt> {
    const loginAttempt = LoginAttempt.create({
      id: this.generateAttemptId(),
      userId,
      tenantId,
      email,
      status,
      type,
      deviceInfo,
      locationInfo,
      failureReason,
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
    });

    return this.loginAttemptRepository.save(loginAttempt);
  }

  async checkLoginSecurity(
    email: string,
    tenantId: string,
    ipAddress: string,
    policy: SecurityPolicy,
  ): Promise<LoginSecurityResult> {
    const now = new Date();
    const lockoutDurationMs = policy.lockoutDurationMinutes * 60 * 1000;

    // 检查邮箱锁定状态
    const emailFailedAttempts = await this.loginAttemptRepository.getRecentFailedAttempts(
      email,
      tenantId,
      policy.lockoutDurationMinutes,
    );

    if (emailFailedAttempts.length >= policy.maxFailedAttemptsPerEmail) {
      const oldestAttempt = emailFailedAttempts[0];
      const lockoutEndTime = new Date(oldestAttempt.getCreatedAt().getTime() + lockoutDurationMs);

      if (now < lockoutEndTime) {
        return {
          isAllowed: false,
          reason: 'Account temporarily locked due to too many failed attempts',
          lockoutEndTime,
          requiresCaptcha: true,
        };
      }
    }

    // 检查IP地址锁定状态
    const ipFailedAttempts = await this.loginAttemptRepository.getRecentFailedAttemptsByIp(
      ipAddress,
      tenantId,
      policy.lockoutDurationMinutes,
    );

    if (ipFailedAttempts.length >= policy.maxFailedAttemptsPerIp) {
      const oldestAttempt = ipFailedAttempts[0];
      const lockoutEndTime = new Date(oldestAttempt.getCreatedAt().getTime() + lockoutDurationMs);

      if (now < lockoutEndTime) {
        return {
          isAllowed: false,
          reason: 'IP address temporarily blocked due to suspicious activity',
          lockoutEndTime,
          requiresCaptcha: true,
        };
      }
    }

    // 计算剩余尝试次数
    const remainingEmailAttempts = Math.max(0, policy.maxFailedAttemptsPerEmail - emailFailedAttempts.length);
    const remainingIpAttempts = Math.max(0, policy.maxFailedAttemptsPerIp - ipFailedAttempts.length);
    const remainingAttempts = Math.min(remainingEmailAttempts, remainingIpAttempts);

    // 检查是否需要验证码
    const requiresCaptcha = emailFailedAttempts.length >= policy.requireCaptchaAfterAttempts ||
      ipFailedAttempts.length >= policy.requireCaptchaAfterAttempts;

    return {
      isAllowed: true,
      remainingAttempts,
      requiresCaptcha,
    };
  }

  async isAccountLocked(email: string, tenantId: string, policy: SecurityPolicy): Promise<boolean> {
    const failedAttempts = await this.loginAttemptRepository.getRecentFailedAttempts(
      email,
      tenantId,
      policy.lockoutDurationMinutes,
    );

    return failedAttempts.length >= policy.maxFailedAttemptsPerEmail;
  }

  async isIpBlocked(ipAddress: string, tenantId: string, policy: SecurityPolicy): Promise<boolean> {
    const failedAttempts = await this.loginAttemptRepository.getRecentFailedAttemptsByIp(
      ipAddress,
      tenantId,
      policy.lockoutDurationMinutes,
    );

    return failedAttempts.length >= policy.maxFailedAttemptsPerIp;
  }

  async getRemainingAttempts(email: string, tenantId: string, policy: SecurityPolicy): Promise<number> {
    const failedAttempts = await this.loginAttemptRepository.getRecentFailedAttempts(
      email,
      tenantId,
      policy.lockoutDurationMinutes,
    );

    return Math.max(0, policy.maxFailedAttemptsPerEmail - failedAttempts.length);
  }

  async getLockoutEndTime(email: string, tenantId: string, policy: SecurityPolicy): Promise<Date | null> {
    const failedAttempts = await this.loginAttemptRepository.getRecentFailedAttempts(
      email,
      tenantId,
      policy.lockoutDurationMinutes,
    );

    if (failedAttempts.length >= policy.maxFailedAttemptsPerEmail) {
      const oldestAttempt = failedAttempts[0];
      return new Date(oldestAttempt.getCreatedAt().getTime() + policy.lockoutDurationMinutes * 60 * 1000);
    }

    return null;
  }

  async detectSuspiciousActivity(
    email: string,
    tenantId: string,
    ipAddress: string,
    policy: SecurityPolicy,
  ): Promise<boolean> {
    const emailAttempts = await this.loginAttemptRepository.getRecentFailedAttempts(email, tenantId, 60);
    const ipAttempts = await this.loginAttemptRepository.getRecentFailedAttemptsByIp(ipAddress, tenantId, 60);

    return emailAttempts.length >= policy.suspiciousActivityThreshold ||
      ipAttempts.length >= policy.suspiciousActivityThreshold;
  }

  async getLoginHistory(
    email: string,
    tenantId: string,
    hours: number = 24,
  ): Promise<LoginAttempt[]> {
    const attempts = await this.loginAttemptRepository.findByEmail(email, tenantId, {
      createdAfter: new Date(Date.now() - hours * 60 * 60 * 1000),
      orderBy: 'createdAt',
      orderDirection: 'DESC',
    });

    return attempts;
  }

  async getFailedAttemptsCount(
    email: string,
    tenantId: string,
    minutes: number = 60,
  ): Promise<number> {
    return this.loginAttemptRepository.countFailedAttemptsByEmail(email, tenantId, {
      createdAfter: new Date(Date.now() - minutes * 60 * 1000),
    });
  }

  async getIpAttemptsCount(
    ipAddress: string,
    tenantId: string,
    minutes: number = 60,
  ): Promise<number> {
    return this.loginAttemptRepository.countByIpAddress(ipAddress, tenantId, {
      createdAfter: new Date(Date.now() - minutes * 60 * 1000),
    });
  }

  async cleanupOldAttempts(tenantId: string, daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    return this.loginAttemptRepository.deleteOldAttempts(tenantId, cutoffDate);
  }

  async resetUserAttempts(userId: UserId, tenantId: string): Promise<void> {
    await this.loginAttemptRepository.deleteByUserId(userId, tenantId);
  }

  async resetEmailAttempts(email: string, tenantId: string): Promise<void> {
    await this.loginAttemptRepository.deleteByEmail(email, tenantId);
  }

  private generateAttemptId(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(16).toString('hex');
  }
}

import { Injectable } from '@nestjs/common';
import { AuthSession, SessionStatus, DeviceInfo, LocationInfo } from '../entities/auth-session.entity';
import { SessionId } from '../value-objects/session-id.vo';
import { JWTToken } from '../value-objects/jwt-token.vo';
import { RefreshToken } from '../value-objects/refresh-token.vo';
import { UserId } from '../../../users/domain/value-objects/user-id.vo';
import type { AuthSessionRepository } from '../repositories/auth-session.repository.interface';
import { SessionNotFoundException, SessionExpiredException, SessionRevokedException, TooManySessionsException } from '../exceptions/session.exception';

export interface CreateSessionOptions {
  deviceInfo: DeviceInfo;
  locationInfo?: LocationInfo;
  maxSessionsPerUser?: number;
}

@Injectable()
export class SessionManagementService {
  constructor(
    private readonly sessionRepository: AuthSessionRepository,
  ) { }

  async createSession(
    userId: UserId,
    tenantId: string,
    accessToken: JWTToken,
    refreshToken: RefreshToken,
    options: CreateSessionOptions,
  ): Promise<AuthSession> {
    // 检查用户会话数量限制
    if (options.maxSessionsPerUser) {
      const activeSessions = await this.sessionRepository.countByUserId(userId, tenantId, { status: SessionStatus.ACTIVE });
      if (activeSessions >= options.maxSessionsPerUser) {
        throw new TooManySessionsException(userId.getValue());
      }
    }

    const sessionId = SessionId.generate();
    const expiresAt = new Date(accessToken.getExpiresAt().getTime());

    const session = AuthSession.create({
      sessionId: new SessionId(sessionId),
      userId,
      tenantId,
      accessToken,
      refreshToken,
      deviceInfo: options.deviceInfo,
      locationInfo: options.locationInfo,
      status: SessionStatus.ACTIVE,
      expiresAt,
    });

    return this.sessionRepository.save(session);
  }

  async getSession(sessionId: SessionId): Promise<AuthSession> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new SessionNotFoundException(sessionId.getValue());
    }
    return session;
  }

  async getUserSessions(userId: UserId, tenantId: string): Promise<AuthSession[]> {
    return this.sessionRepository.findByUserId(userId, tenantId);
  }

  async getActiveSessions(userId: UserId, tenantId: string): Promise<AuthSession[]> {
    return this.sessionRepository.findByUserId(userId, tenantId, { status: SessionStatus.ACTIVE });
  }

  async updateSessionActivity(sessionId: SessionId): Promise<AuthSession> {
    const session = await this.getSession(sessionId);
    session.updateActivity();
    return this.sessionRepository.save(session);
  }

  async revokeSession(sessionId: SessionId): Promise<void> {
    const session = await this.getSession(sessionId);
    session.revoke();
    await this.sessionRepository.save(session);
  }

  async revokeAllUserSessions(userId: UserId, tenantId: string): Promise<number> {
    return this.sessionRepository.revokeAllUserSessions(userId, tenantId);
  }

  async suspendSession(sessionId: SessionId): Promise<void> {
    const session = await this.getSession(sessionId);
    session.suspend();
    await this.sessionRepository.save(session);
  }

  async activateSession(sessionId: SessionId): Promise<void> {
    const session = await this.getSession(sessionId);
    session.activate();
    await this.sessionRepository.save(session);
  }

  async deleteSession(sessionId: SessionId): Promise<void> {
    await this.sessionRepository.delete(sessionId);
  }

  async deleteUserSessions(userId: UserId, tenantId: string): Promise<void> {
    await this.sessionRepository.deleteByUserId(userId, tenantId);
  }

  async cleanupExpiredSessions(tenantId: string): Promise<number> {
    return this.sessionRepository.deleteExpiredSessions(tenantId);
  }

  async isSessionActive(sessionId: SessionId): Promise<boolean> {
    try {
      const session = await this.getSession(sessionId);
      return session.isActive();
    } catch {
      return false;
    }
  }

  async isSessionExpired(sessionId: SessionId): Promise<boolean> {
    try {
      const session = await this.getSession(sessionId);
      return session.isExpired();
    } catch {
      return true;
    }
  }

  async isSessionRevoked(sessionId: SessionId): Promise<boolean> {
    try {
      const session = await this.getSession(sessionId);
      return session.isRevoked();
    } catch {
      return true;
    }
  }

  async getSessionTimeToExpiry(sessionId: SessionId): Promise<number> {
    const session = await this.getSession(sessionId);
    return session.getTimeToExpiry();
  }

  async getSessionInactivityDuration(sessionId: SessionId): Promise<number> {
    const session = await this.getSession(sessionId);
    return session.getInactivityDuration();
  }

  async countUserSessions(userId: UserId, tenantId: string): Promise<number> {
    return this.sessionRepository.countByUserId(userId, tenantId);
  }

  async countActiveSessions(tenantId: string): Promise<number> {
    return this.sessionRepository.countActiveSessions(tenantId);
  }

  async findSessionsByDevice(tenantId: string, userAgent: string, ipAddress: string): Promise<AuthSession[]> {
    return this.sessionRepository.findByDeviceInfo(tenantId, userAgent, ipAddress);
  }

  async findExpiredSessions(tenantId: string): Promise<AuthSession[]> {
    return this.sessionRepository.findExpiredSessions(tenantId);
  }

  async findRevokedSessions(tenantId: string): Promise<AuthSession[]> {
    return this.sessionRepository.findRevokedSessions(tenantId);
  }

  async existsActiveSession(userId: UserId, tenantId: string): Promise<boolean> {
    return this.sessionRepository.existsActiveSession(userId, tenantId);
  }

  async validateSession(sessionId: SessionId): Promise<AuthSession> {
    const session = await this.getSession(sessionId);

    if (session.isExpired()) {
      throw new SessionExpiredException(sessionId.getValue());
    }

    if (session.isRevoked()) {
      throw new SessionRevokedException(sessionId.getValue());
    }

    return session;
  }
}

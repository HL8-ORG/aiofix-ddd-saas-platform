import { SessionId } from '../value-objects/session-id.vo';
import { JWTToken } from '../value-objects/jwt-token.vo';
import { RefreshToken } from '../value-objects/refresh-token.vo';
import { UserId } from '../../../users/domain/value-objects/user-id.vo';
import { SessionExpiredException, SessionRevokedException } from '../exceptions/session.exception';

/**
 * @enum SessionStatus
 * @description 会话状态枚举
 */
export enum SessionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  SUSPENDED = 'suspended',
}

/**
 * @interface DeviceInfo
 * @description 设备信息接口
 */
export interface DeviceInfo {
  userAgent: string;
  ipAddress: string;
  deviceType?: string;
  browser?: string;
  os?: string;
}

/**
 * @interface LocationInfo
 * @description 地理位置信息接口
 */
export interface LocationInfo {
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * @interface AuthSessionProps
 * @description AuthSession属性接口
 */
export interface AuthSessionProps {
  sessionId: SessionId;
  userId: UserId;
  tenantId: string;
  accessToken: JWTToken;
  refreshToken: RefreshToken;
  deviceInfo: DeviceInfo;
  locationInfo?: LocationInfo;
  status?: SessionStatus;
  lastActivityAt?: Date;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * @class AuthSession
 * @description 认证会话聚合根，用于管理用户认证会话
 */
export class AuthSession {
  private readonly sessionId: SessionId;
  private readonly userId: UserId;
  private readonly tenantId: string;
  private readonly accessToken: JWTToken;
  private readonly refreshToken: RefreshToken;
  private readonly deviceInfo: DeviceInfo;
  private readonly locationInfo?: LocationInfo;
  private status: SessionStatus;
  private lastActivityAt: Date;
  private readonly expiresAt: Date;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: AuthSessionProps) {
    this.sessionId = props.sessionId;
    this.userId = props.userId;
    this.tenantId = props.tenantId;
    this.accessToken = props.accessToken;
    this.refreshToken = props.refreshToken;
    this.deviceInfo = props.deviceInfo;
    this.locationInfo = props.locationInfo;
    this.status = props.status || SessionStatus.ACTIVE;
    this.lastActivityAt = props.lastActivityAt || new Date();
    this.expiresAt = props.expiresAt;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  static create(props: AuthSessionProps): AuthSession {
    return new AuthSession(props);
  }

  getSessionId(): SessionId {
    return this.sessionId;
  }

  getUserId(): UserId {
    return this.userId;
  }

  getTenantId(): string {
    return this.tenantId;
  }

  getAccessToken(): JWTToken {
    return this.accessToken;
  }

  getRefreshToken(): RefreshToken {
    return this.refreshToken;
  }

  getDeviceInfo(): DeviceInfo {
    return this.deviceInfo;
  }

  getLocationInfo(): LocationInfo | undefined {
    return this.locationInfo;
  }

  getStatus(): SessionStatus {
    return this.status;
  }

  getLastActivityAt(): Date {
    return this.lastActivityAt;
  }

  getExpiresAt(): Date {
    return this.expiresAt;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  isActive(): boolean {
    return this.status === SessionStatus.ACTIVE && !this.isExpired();
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isRevoked(): boolean {
    return this.status === SessionStatus.REVOKED;
  }

  updateActivity(): void {
    if (this.isExpired()) {
      throw new SessionExpiredException(this.sessionId.getValue());
    }

    if (this.isRevoked()) {
      throw new SessionRevokedException(this.sessionId.getValue());
    }

    this.lastActivityAt = new Date();
    this.updatedAt = new Date();
  }

  revoke(): void {
    this.status = SessionStatus.REVOKED;
    this.updatedAt = new Date();
  }

  suspend(): void {
    this.status = SessionStatus.SUSPENDED;
    this.updatedAt = new Date();
  }

  activate(): void {
    this.status = SessionStatus.ACTIVE;
    this.updatedAt = new Date();
  }

  getTimeToExpiry(): number {
    return this.expiresAt.getTime() - new Date().getTime();
  }

  getInactivityDuration(): number {
    return new Date().getTime() - this.lastActivityAt.getTime();
  }

  equals(other: AuthSession): boolean {
    if (!(other instanceof AuthSession)) {
      return false;
    }
    return this.sessionId.equals(other.sessionId);
  }

  toString(): string {
    return `AuthSession(${this.sessionId.getValue()})`;
  }
}

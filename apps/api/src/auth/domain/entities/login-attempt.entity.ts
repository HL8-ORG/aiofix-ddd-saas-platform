import { UserId } from '../../../users/domain/value-objects/user-id.vo';
import { DeviceInfo, LocationInfo } from './auth-session.entity';

/**
 * @enum LoginAttemptStatus
 * @description 登录尝试状态枚举
 */
export enum LoginAttemptStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  BLOCKED = 'blocked',
}

/**
 * @enum LoginAttemptType
 * @description 登录尝试类型枚举
 */
export enum LoginAttemptType {
  PASSWORD = 'password',
  OTP = 'otp',
  SSO = 'sso',
  MAGIC_LINK = 'magic_link',
}

/**
 * @interface LoginAttemptProps
 * @description LoginAttempt属性接口
 */
export interface LoginAttemptProps {
  id: string;
  userId: UserId;
  tenantId: string;
  email: string;
  status: LoginAttemptStatus;
  type: LoginAttemptType;
  deviceInfo: DeviceInfo;
  locationInfo?: LocationInfo;
  failureReason?: string;
  ipAddress: string;
  userAgent: string;
  createdAt?: Date;
}

/**
 * @class LoginAttempt
 * @description 登录尝试聚合根，用于管理登录尝试记录
 */
export class LoginAttempt {
  private readonly id: string;
  private readonly userId: UserId;
  private readonly tenantId: string;
  private readonly email: string;
  private readonly status: LoginAttemptStatus;
  private readonly type: LoginAttemptType;
  private readonly deviceInfo: DeviceInfo;
  private readonly locationInfo?: LocationInfo;
  private readonly failureReason?: string;
  private readonly ipAddress: string;
  private readonly userAgent: string;
  private readonly createdAt: Date;

  constructor(props: LoginAttemptProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.tenantId = props.tenantId;
    this.email = props.email;
    this.status = props.status;
    this.type = props.type;
    this.deviceInfo = props.deviceInfo;
    this.locationInfo = props.locationInfo;
    this.failureReason = props.failureReason;
    this.ipAddress = props.ipAddress;
    this.userAgent = props.userAgent;
    this.createdAt = props.createdAt || new Date();
  }

  static create(props: LoginAttemptProps): LoginAttempt {
    return new LoginAttempt(props);
  }

  getId(): string {
    return this.id;
  }

  getUserId(): UserId {
    return this.userId;
  }

  getTenantId(): string {
    return this.tenantId;
  }

  getEmail(): string {
    return this.email;
  }

  getStatus(): LoginAttemptStatus {
    return this.status;
  }

  getType(): LoginAttemptType {
    return this.type;
  }

  getDeviceInfo(): DeviceInfo {
    return this.deviceInfo;
  }

  getLocationInfo(): LocationInfo | undefined {
    return this.locationInfo;
  }

  getFailureReason(): string | undefined {
    return this.failureReason;
  }

  getIpAddress(): string {
    return this.ipAddress;
  }

  getUserAgent(): string {
    return this.userAgent;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  isSuccess(): boolean {
    return this.status === LoginAttemptStatus.SUCCESS;
  }

  isFailed(): boolean {
    return this.status === LoginAttemptStatus.FAILED;
  }

  isBlocked(): boolean {
    return this.status === LoginAttemptStatus.BLOCKED;
  }

  isPasswordLogin(): boolean {
    return this.type === LoginAttemptType.PASSWORD;
  }

  isOTPLogin(): boolean {
    return this.type === LoginAttemptType.OTP;
  }

  isSSOLogin(): boolean {
    return this.type === LoginAttemptType.SSO;
  }

  isMagicLinkLogin(): boolean {
    return this.type === LoginAttemptType.MAGIC_LINK;
  }

  getAgeInMinutes(): number {
    const now = new Date();
    const diffMs = now.getTime() - this.createdAt.getTime();
    return Math.floor(diffMs / (1000 * 60));
  }

  getAgeInHours(): number {
    const now = new Date();
    const diffMs = now.getTime() - this.createdAt.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60));
  }

  getAgeInDays(): number {
    const now = new Date();
    const diffMs = now.getTime() - this.createdAt.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  equals(other: LoginAttempt): boolean {
    if (!(other instanceof LoginAttempt)) {
      return false;
    }
    return this.id === other.id;
  }

  toString(): string {
    return `LoginAttempt(${this.id})`;
  }
}

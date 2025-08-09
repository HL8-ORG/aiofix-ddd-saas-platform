import { AggregateRoot } from '../../../shared/domain/entities/aggregate-root';
import { UserId } from '../value-objects/user-id.vo';
import { Email } from '../value-objects/email.vo';
import { UserName } from '../value-objects/username.vo';
import { Password } from '../value-objects/password.vo';
import { PhoneNumber } from '../value-objects/phone-number.vo';
import { UserStatus, UserStatusType } from '../value-objects/user-status.vo';
import { UserCreatedEvent } from '../events/user-created.event';
import { UserActivatedEvent } from '../events/user-activated.event';
import { UserLockedEvent } from '../events/user-locked.event';
import { PasswordChangedEvent } from '../events/password-changed.event';
import { UserLoginSuccessEvent } from '../events/user-login-success.event';
import { UserLoginFailureEvent } from '../events/user-login-failure.event';
import {
  UserAlreadyActivatedException,
  UserNotActivatedException,
  UserLockedException,
  UserDeletedException,
  InvalidUserStatusTransitionException,
  IncorrectPasswordException,
  UserRequiredFieldException,
} from '../exceptions/user.exception';

/**
 * @interface UserProps
 * @description 用户创建属性接口
 */
export interface UserProps {
  email: Email;
  username: UserName;
  password: Password;
  phoneNumber?: PhoneNumber;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  tenantId: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  lastLoginAt?: Date;
  loginAttempts?: number;
  lockedUntil?: Date;
  status?: UserStatus;
  createdAt?: Date;
}

/**
 * @class User
 * @description
 * 用户聚合根，封装用户的所有业务逻辑和规则。
 * 
 * 主要特点：
 * 1. 身份管理：管理用户的基本身份信息
 * 2. 状态管理：管理用户的各种状态转换
 * 3. 安全控制：密码验证、登录尝试控制等
 * 4. 多租户支持：支持多租户数据隔离
 * 
 * 使用场景：
 * 1. 用户注册和激活
 * 2. 用户认证和授权
 * 3. 用户信息管理
 * 4. 用户状态控制
 */
export class User extends AggregateRoot<UserId> {
  private _email: Email;
  private _username: UserName;
  private _password: Password;
  private _phoneNumber?: PhoneNumber;
  private _firstName?: string;
  private _lastName?: string;
  private _displayName?: string;
  private _avatar?: string;
  private _tenantId: string;
  private _adminUserId?: string;
  private _status: UserStatus;
  private _isEmailVerified: boolean;
  private _isPhoneVerified: boolean;
  private _twoFactorEnabled: boolean = false;
  private _twoFactorSecret?: string;
  private _preferences?: Record<string, unknown>;
  private _lastLoginAt?: Date;
  private _loginAttempts: number;
  private _lockedUntil?: Date;
  private _passwordChangedAt?: Date;
  private _deletedAt?: Date;

  /**
   * 最大登录尝试次数
   */
  private static readonly MAX_LOGIN_ATTEMPTS = 5;

  /**
   * 账户锁定时长（分钟）
   */
  private static readonly LOCK_DURATION_MINUTES = 30;

  /**
   * @constructor
   * @description 创建用户聚合根
   * @param {UserProps} props - 用户属性
   * @param {UserId} [id] - 用户ID，如果未提供则自动生成
   */
  private constructor(props: UserProps, id?: UserId) {
    super(id || UserId.generate(), props.createdAt);

    this.validateRequiredFields(props);

    this._email = props.email;
    this._username = props.username;
    this._password = props.password;
    this._phoneNumber = props.phoneNumber;
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._displayName = props.firstName && props.lastName ? `${props.firstName} ${props.lastName}` : undefined;
    this._avatar = props.avatar;
    this._tenantId = props.tenantId;
    this._adminUserId = (props as any).adminUserId; // 向后兼容：暂不强制
    this._status = props.status || UserStatus.pending('User created');
    this._isEmailVerified = props.isEmailVerified || false;
    this._isPhoneVerified = props.isPhoneVerified || false;
    this._twoFactorEnabled = (props as any).twoFactorEnabled ?? false;
    this._twoFactorSecret = (props as any).twoFactorSecret;
    this._preferences = (props as any).preferences;
    this._lastLoginAt = props.lastLoginAt;
    this._loginAttempts = props.loginAttempts || 0;
    this._lockedUntil = props.lockedUntil;
    this._passwordChangedAt = undefined;
    this._deletedAt = undefined;
  }

  /**
   * @static
   * @method create
   * @description 创建新用户
   * @param {UserProps} props - 用户属性
   * @returns {User} 新的用户实例
   */
  static create(props: UserProps): User {
    const user = new User(props);
    // 发布用户创建事件
    user.addDomainEvent(new UserCreatedEvent(user));
    return user;
  }

  /**
   * @static
   * @method reconstitute
   * @description 从持久化数据重构用户实例
   * @param {UserProps} props - 用户属性
   * @param {UserId} id - 用户ID
   * @returns {User} 重构的用户实例
   */
  static reconstitute(props: UserProps, id: UserId): User {
    return new User(props, id);
  }

  /**
   * @private
   * @method validateRequiredFields
   * @description 验证必填字段
   * @param {UserProps} props - 用户属性
   */
  private validateRequiredFields(props: UserProps): void {
    if (!props.email) {
      throw new UserRequiredFieldException('email');
    }
    if (!props.username) {
      throw new UserRequiredFieldException('username');
    }
    if (!props.password) {
      throw new UserRequiredFieldException('password');
    }
    if (!props.tenantId) {
      throw new UserRequiredFieldException('tenantId');
    }
  }

  // Getters
  public getEmail(): Email {
    return this._email;
  }

  public getUsername(): UserName {
    return this._username;
  }

  public getPhoneNumber(): PhoneNumber | undefined {
    return this._phoneNumber;
  }

  public getFirstName(): string | undefined {
    return this._firstName;
  }

  public getLastName(): string | undefined {
    return this._lastName;
  }

  public getFullName(): string {
    if (this._firstName && this._lastName) {
      return `${this._firstName} ${this._lastName}`;
    }
    return this._firstName || this._lastName || this._username.getValue();
  }

  /**
   * @method getDisplayName
   * @description 获取显示名称
   */
  public getDisplayName(): string {
    return this._displayName || this.getFullName();
  }

  public getAvatar(): string | undefined {
    return this._avatar;
  }

  public getTenantId(): string {
    return this._tenantId;
  }

  /**
   * @method getAdminUserId
   * @description 获取创建该用户的管理员ID（可选）
   */
  public getAdminUserId(): string | undefined {
    return this._adminUserId;
  }

  public getStatus(): UserStatus {
    return this._status;
  }

  public isEmailVerified(): boolean {
    return this._isEmailVerified;
  }

  public isPhoneVerified(): boolean {
    return this._isPhoneVerified;
  }

  public getLastLoginAt(): Date | undefined {
    return this._lastLoginAt;
  }

  public getLoginAttempts(): number {
    return this._loginAttempts;
  }

  public getLockedUntil(): Date | undefined {
    return this._lockedUntil;
  }

  /**
   * @method isTwoFactorEnabled
   * @description 是否启用二步验证
   */
  public isTwoFactorEnabled(): boolean {
    return this._twoFactorEnabled;
  }

  /**
   * @method getTwoFactorSecret
   * @description 获取二步验证密钥
   */
  public getTwoFactorSecret(): string | undefined {
    return this._twoFactorSecret;
  }

  /**
   * @method getPreferences
   * @description 获取用户偏好设置
   */
  public getPreferences(): Record<string, unknown> | undefined {
    return this._preferences;
  }

  /**
   * @method getPasswordChangedAt
   * @description 获取密码最近变更时间
   */
  public getPasswordChangedAt(): Date | undefined {
    return this._passwordChangedAt;
  }

  /**
   * @method getDeletedAt
   * @description 获取软删除时间
   */
  public getDeletedAt(): Date | undefined {
    return this._deletedAt;
  }

  // 业务方法

  /**
   * @method activate
   * @description 激活用户
   * @throws {UserAlreadyActivatedException} 如果用户已经激活
   * @throws {InvalidUserStatusTransitionException} 如果状态转换无效
   */
  public activate(): void {
    if (this._status.isActive()) {
      throw new UserAlreadyActivatedException();
    }

    if (!this._status.canTransitionTo(UserStatusType.ACTIVE)) {
      throw new InvalidUserStatusTransitionException(
        this._status.getValue(),
        UserStatusType.ACTIVE
      );
    }

    this._status = UserStatus.active('User activated');
    this._isEmailVerified = true;
    this.markAsUpdated();

    // 发布用户激活事件
    this.addDomainEvent(new UserActivatedEvent(this));
  }

  /**
   * @method deactivate
   * @description 停用用户
   * @param {string} [reason] - 停用原因
   * @throws {InvalidUserStatusTransitionException} 如果状态转换无效
   */
  public deactivate(reason?: string): void {
    if (!this._status.canTransitionTo(UserStatusType.INACTIVE)) {
      throw new InvalidUserStatusTransitionException(
        this._status.getValue(),
        UserStatusType.INACTIVE
      );
    }

    this._status = UserStatus.inactive(reason || 'User deactivated');
    this.markAsUpdated();
  }

  /**
   * @method suspend
   * @description 暂停用户（SUSPENDED）
   * @param {string} [reason] - 暂停原因
   * @throws {InvalidUserStatusTransitionException} 如果状态转换无效
   */
  public suspend(reason?: string): void {
    if (!this._status.canTransitionTo(UserStatusType.SUSPENDED)) {
      throw new InvalidUserStatusTransitionException(
        this._status.getValue(),
        UserStatusType.SUSPENDED
      );
    }

    this._status = UserStatus.suspended(reason || 'User suspended');
    this.markAsUpdated();
  }

  /**
   * @method restore
   * @description 从暂停状态恢复为活跃（SUSPENDED -> ACTIVE）
   * @param {string} [reason] - 恢复原因
   * @throws {InvalidUserStatusTransitionException} 如果状态转换无效
   */
  public restore(reason?: string): void {
    if (!this._status.canTransitionTo(UserStatusType.ACTIVE)) {
      throw new InvalidUserStatusTransitionException(
        this._status.getValue(),
        UserStatusType.ACTIVE
      );
    }
    this._status = UserStatus.active(reason || 'User restored');
    this.markAsUpdated();
  }

  /**
   * @method lock
   * @description 锁定用户
   * @param {string} [reason] - 锁定原因
   * @param {Date} [until] - 锁定截止时间
   * @throws {InvalidUserStatusTransitionException} 如果状态转换无效
   */
  public lock(reason?: string, until?: Date): void {
    if (!this._status.canTransitionTo(UserStatusType.LOCKED)) {
      throw new InvalidUserStatusTransitionException(
        this._status.getValue(),
        UserStatusType.LOCKED
      );
    }

    this._status = UserStatus.locked(reason || 'User locked');
    this._lockedUntil = until;
    this.markAsUpdated();

    // 发布用户锁定事件
    this.addDomainEvent(new UserLockedEvent(this, reason || 'User locked', until));
  }

  /**
   * @method unlock
   * @description 解锁用户
   * @throws {InvalidUserStatusTransitionException} 如果状态转换无效
   */
  public unlock(): void {
    if (!this._status.canTransitionTo(UserStatusType.ACTIVE)) {
      throw new InvalidUserStatusTransitionException(
        this._status.getValue(),
        UserStatusType.ACTIVE
      );
    }

    this._status = UserStatus.active('User unlocked');
    this._lockedUntil = undefined;
    this._loginAttempts = 0;
    this.markAsUpdated();
  }

  /**
   * @method delete
   * @description 删除用户（软删除）
   * @param {string} [reason] - 删除原因
   */
  public delete(reason?: string): void {
    this._status = UserStatus.deleted(reason || 'User deleted');
    this._deletedAt = new Date();
    this.markAsUpdated();
  }

  /**
   * @method verifyPassword
   * @description 验证密码
   * @param {string} plainPassword - 明文密码
   * @returns {boolean} 密码是否正确
   * @throws {UserLockedException} 如果用户被锁定
   * @throws {UserDeletedException} 如果用户已删除
   */
  public verifyPassword(plainPassword: string): boolean {
    this.ensureUserCanLogin();

    const isValid = this._password.verify(plainPassword);

    if (isValid) {
      this.resetLoginAttempts();
      this.updateLastLogin();
      // 记录登录成功事件（无客户端上下文时不包含IP/UA）
      this.addDomainEvent(new UserLoginSuccessEvent(this));
    } else {
      this.incrementLoginAttempts();
      // 记录登录失败事件（此处仅携带用户名/邮箱占位与租户）
      this.addDomainEvent(
        new UserLoginFailureEvent(
          this._tenantId,
          this._username.getValue() || this._email.getValue(),
          'Incorrect password',
          this,
        ),
      );
    }

    return isValid;
  }

  /**
   * @method changePassword
   * @description 修改密码
   * @param {string} currentPassword - 当前密码
   * @param {Password} newPassword - 新密码
   * @throws {IncorrectPasswordException} 如果当前密码错误
   */
  public changePassword(currentPassword: string, newPassword: Password, clientIp?: string, userAgent?: string): void {
    if (!this._password.verify(currentPassword)) {
      throw new IncorrectPasswordException();
    }

    this._password = newPassword;
    this._passwordChangedAt = new Date();
    this.markAsUpdated();

    // 发布密码变更事件
    this.addDomainEvent(new PasswordChangedEvent(this, 'user_initiated', clientIp, userAgent));
  }

  /**
   * @method resetPassword
   * @description 重置密码（管理员操作或忘记密码）
   * @param {Password} newPassword - 新密码
   */
  public resetPassword(newPassword: Password, resetType: 'admin_reset' | 'forgot_password' = 'admin_reset'): void {
    this._password = newPassword;
    this._loginAttempts = 0;
    this._passwordChangedAt = new Date();
    this.markAsUpdated();

    // 发布密码重置事件
    this.addDomainEvent(new PasswordChangedEvent(this, resetType));
  }

  /**
   * @method updateProfile
   * @description 更新用户档案
   * @param {object} updates - 更新的字段
   */
  public updateProfile(updates: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    phoneNumber?: PhoneNumber;
  }): void {
    if (updates.firstName !== undefined) {
      this._firstName = updates.firstName;
    }
    if (updates.lastName !== undefined) {
      this._lastName = updates.lastName;
    }
    if (updates.avatar !== undefined) {
      this._avatar = updates.avatar;
    }
    if (updates.phoneNumber !== undefined) {
      this._phoneNumber = updates.phoneNumber;
      this._isPhoneVerified = false; // 重置电话验证状态
    }

    this.markAsUpdated();
  }

  /**
   * @method verifyEmail
   * @description 验证邮箱
   */
  public verifyEmail(): void {
    this._isEmailVerified = true;
    this.markAsUpdated();
  }

  /**
   * @method verifyPhone
   * @description 验证手机号
   */
  public verifyPhone(): void {
    if (!this._phoneNumber) {
      throw new Error('No phone number to verify');
    }
    this._isPhoneVerified = true;
    this.markAsUpdated();
  }

  /**
   * @method enableTwoFactor
   * @description 启用二步验证
   * @param {string} secret - 二步验证密钥
   */
  public enableTwoFactor(secret: string): void {
    this._twoFactorEnabled = true;
    this._twoFactorSecret = secret;
    this.markAsUpdated();
  }

  /**
   * @method disableTwoFactor
   * @description 禁用二步验证
   */
  public disableTwoFactor(): void {
    this._twoFactorEnabled = false;
    this._twoFactorSecret = undefined;
    this.markAsUpdated();
  }

  /**
   * @private
   * @method ensureUserCanLogin
   * @description 确保用户可以登录
   * @throws {UserLockedException} 如果用户被锁定
   * @throws {UserDeletedException} 如果用户已删除
   */
  private ensureUserCanLogin(): void {
    if (this._status.isDeleted()) {
      throw new UserDeletedException();
    }

    if (this._status.isLocked()) {
      // 检查锁定是否已过期
      if (this._lockedUntil && this._lockedUntil > new Date()) {
        throw new UserLockedException(`User is locked until ${this._lockedUntil.toISOString()}`);
      } else if (this._lockedUntil && this._lockedUntil <= new Date()) {
        // 自动解锁
        this.unlock();
      } else {
        throw new UserLockedException();
      }
    }
  }

  /**
   * @private
   * @method incrementLoginAttempts
   * @description 增加登录尝试次数
   */
  private incrementLoginAttempts(): void {
    this._loginAttempts++;

    if (this._loginAttempts >= User.MAX_LOGIN_ATTEMPTS) {
      const lockUntil = new Date();
      lockUntil.setMinutes(lockUntil.getMinutes() + User.LOCK_DURATION_MINUTES);
      this.lock('Too many failed login attempts', lockUntil);
    }

    this.markAsUpdated();
  }

  /**
   * @private
   * @method resetLoginAttempts
   * @description 重置登录尝试次数
   */
  private resetLoginAttempts(): void {
    this._loginAttempts = 0;
    this.markAsUpdated();
  }

  /**
   * @private
   * @method updateLastLogin
   * @description 更新最后登录时间
   */
  private updateLastLogin(): void {
    this._lastLoginAt = new Date();
    this.markAsUpdated();
  }

  /**
   * @method canPerformAction
   * @description 检查用户是否可以执行操作
   * @returns {boolean} 用户是否可以执行操作
   */
  public canPerformAction(): boolean {
    return this._status.isActive() && this._isEmailVerified;
  }

  /**
   * @method toSnapshot
   * @description 创建用户快照（用于持久化）
   * @returns {object} 用户快照对象
   */
  public toSnapshot(): {
    id: string;
    email: string;
    username: string;
    passwordHash: string;
    phoneNumber?: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    avatar?: string;
    tenantId: string;
    adminUserId?: string;
    status: string;
    statusReason?: string;
    statusChangedAt: Date;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    twoFactorEnabled?: boolean;
    twoFactorSecret?: string;
    preferences?: Record<string, unknown>;
    lastLoginAt?: Date;
    loginAttempts: number;
    lockedUntil?: Date;
    passwordChangedAt?: Date;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    version: number;
  } {
    return {
      id: this._id.getValue(),
      email: this._email.getValue(),
      username: this._username.getValue(),
      passwordHash: this._password.getHash(),
      phoneNumber: this._phoneNumber?.getValue(),
      firstName: this._firstName,
      lastName: this._lastName,
      displayName: this._displayName,
      avatar: this._avatar,
      tenantId: this._tenantId,
      adminUserId: this._adminUserId,
      status: this._status.getValue(),
      statusReason: this._status.getReason(),
      statusChangedAt: this._status.getChangedAt(),
      isEmailVerified: this._isEmailVerified,
      isPhoneVerified: this._isPhoneVerified,
      twoFactorEnabled: this._twoFactorEnabled,
      twoFactorSecret: this._twoFactorSecret,
      preferences: this._preferences,
      lastLoginAt: this._lastLoginAt,
      loginAttempts: this._loginAttempts,
      lockedUntil: this._lockedUntil,
      passwordChangedAt: this._passwordChangedAt,
      deletedAt: this._deletedAt,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      version: this._version,
    };
  }
}

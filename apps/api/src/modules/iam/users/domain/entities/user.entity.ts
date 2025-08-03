import { Expose, Transform } from 'class-transformer';
import { IsUUID, IsOptional, IsString, MaxLength, IsBoolean } from 'class-validator';
import { BaseEntity } from '@/shared/domain/entities/base.entity';
import { Username } from '../value-objects/username.value-object';
import { Email } from '../value-objects/email.value-object';
import { Phone } from '../value-objects/phone.value-object';
import { UserStatusValue, UserStatus } from '../value-objects/user-status.value-object';
import { generateUuid } from '@/shared/domain/utils/uuid.util';
import {
  UserCreatedEvent,
  UserActivatedEvent,
  UserSuspendedEvent,
  UserDeletedEvent,
  UserRestoredEvent,
  UserInfoUpdatedEvent,
  UserContactInfoUpdatedEvent,
  UserPasswordUpdatedEvent,
  UserLoginSuccessEvent,
  UserLoginFailureEvent,
  UserEmailVerifiedEvent,
  UserPhoneVerifiedEvent,
  UserTwoFactorEnabledEvent,
  UserTwoFactorDisabledEvent,
  UserPreferencesUpdatedEvent,
  UserAssignedToOrganizationEvent,
  UserRemovedFromOrganizationEvent,
  UserRoleAssignedEvent,
  UserRoleRemovedEvent,
} from '../events/user.events';

/**
 * @class User
 * @description
 * 用户领域实体，作为用户聚合的根实体。
 * 封装用户的核心业务逻辑、状态管理和生命周期。
 * 
 * 主要原理与机制：
 * 1. 遵循DDD聚合根设计原则，管理用户相关的所有业务规则
 * 2. 通过值对象封装用户名、邮箱、手机号等属性
 * 3. 实现用户状态机，管理用户生命周期
 * 4. 支持软删除和审计功能
 * 5. 集成领域事件，支持事件驱动架构
 * 6. 以租户ID为标识，实现数据软隔离
 */
export class User extends BaseEntity {
  /**
   * @property username
   * @description 用户名，在租户内唯一
   */
  @Expose()
  username: Username;

  /**
   * @property email
   * @description 邮箱地址，在租户内唯一
   */
  @Expose()
  email: Email;

  /**
   * @property phone
   * @description 手机号码，可选
   */
  @Expose()
  phone?: Phone;

  /**
   * @property firstName
   * @description 名
   */
  @IsString({ message: '名必须是字符串' })
  @MaxLength(50, { message: '名不能超过50个字符' })
  @Expose()
  firstName: string;

  /**
   * @property lastName
   * @description 姓
   */
  @IsString({ message: '姓必须是字符串' })
  @MaxLength(50, { message: '姓不能超过50个字符' })
  @Expose()
  lastName: string;

  /**
   * @property displayName
   * @description 显示名称，可选，默认firstName + lastName
   */
  @IsOptional()
  @IsString({ message: '显示名称必须是字符串' })
  @MaxLength(100, { message: '显示名称不能超过100个字符' })
  @Expose()
  displayName?: string;

  /**
   * @property avatar
   * @description 头像URL，可选
   */
  @IsOptional()
  @IsString({ message: '头像URL必须是字符串' })
  @MaxLength(500, { message: '头像URL不能超过500个字符' })
  @Expose()
  avatar?: string;

  /**
   * @property status
   * @description 用户状态
   */
  @Expose()
  status: UserStatusValue;

  /**
   * @property tenantId
   * @description 所属租户ID，实现数据隔离
   */
  @IsUUID('4', { message: '租户ID必须是有效的UUID v4格式' })
  @Expose()
  tenantId: string;

  /**
   * @property organizationIds
   * @description 所属组织ID列表，支持多组织
   */
  @IsOptional()
  @Expose()
  organizationIds: string[] = [];

  /**
   * @property roleIds
   * @description 用户角色ID列表，支持多角色
   */
  @IsOptional()
  @Expose()
  roleIds: string[] = [];

  /**
   * @property adminUserId
   * @description 创建该用户的管理员ID
   */
  @IsUUID('4', { message: '管理员用户ID必须是有效的UUID v4格式' })
  @Expose()
  adminUserId: string;

  /**
   * @property passwordHash
   * @description 密码哈希，加密存储
   */
  @IsString({ message: '密码哈希必须是字符串' })
  passwordHash: string;

  /**
   * @property lastLoginAt
   * @description 最后登录时间
   */
  @IsOptional()
  @Expose()
  lastLoginAt?: Date;

  /**
   * @property loginAttempts
   * @description 登录失败次数
   */
  loginAttempts: number = 0;

  /**
   * @property lockedUntil
   * @description 锁定截止时间
   */
  @IsOptional()
  lockedUntil?: Date;

  /**
   * @property emailVerified
   * @description 邮箱验证状态
   */
  @IsBoolean({ message: '邮箱验证状态必须是布尔值' })
  emailVerified: boolean = false;

  /**
   * @property phoneVerified
   * @description 手机验证状态
   */
  @IsBoolean({ message: '手机验证状态必须是布尔值' })
  phoneVerified: boolean = false;

  /**
   * @property twoFactorEnabled
   * @description 二步验证启用状态
   */
  @IsBoolean({ message: '二步验证启用状态必须是布尔值' })
  twoFactorEnabled: boolean = false;

  /**
   * @property twoFactorSecret
   * @description 二步验证密钥，加密存储
   */
  @IsOptional()
  @IsString({ message: '二步验证密钥必须是字符串' })
  twoFactorSecret?: string;

  /**
   * @property preferences
   * @description 用户偏好设置，JSON格式
   */
  @IsOptional()
  @Expose()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return {};
      }
    }
    return value || {};
  })
  preferences: Record<string, any> = {};

  /**
   * @property _domainEvents
   * @description 领域事件列表
   */
  private _domainEvents: any[] = [];

  /**
   * @constructor
   * @description 创建用户实体
   * @param id 用户ID
   * @param username 用户名
   * @param email 邮箱地址
   * @param firstName 名
   * @param lastName 姓
   * @param tenantId 租户ID
   * @param adminUserId 管理员用户ID
   * @param passwordHash 密码哈希
   * @param phone 手机号，可选
   * @param displayName 显示名称，可选
   * @param avatar 头像URL，可选
   * @param organizationIds 组织ID列表，可选
   * @param roleIds 角色ID列表，可选
   * @param preferences 偏好设置，可选
   */
  constructor(
    id: string,
    username: string,
    email: string,
    firstName: string,
    lastName: string,
    tenantId: string,
    adminUserId: string,
    passwordHash: string,
    phone?: string,
    displayName?: string,
    avatar?: string,
    organizationIds?: string[],
    roleIds?: string[],
    preferences?: Record<string, any>
  ) {
    super();
    this.id = id;
    this.username = new Username(username);
    this.email = new Email(email);
    this.firstName = firstName;
    this.lastName = lastName;
    this.tenantId = tenantId;
    this.adminUserId = adminUserId;
    this.passwordHash = passwordHash;
    this.status = UserStatusValue.pending();
    this.loginAttempts = 0;
    this.emailVerified = false;
    this.phoneVerified = false;
    this.twoFactorEnabled = false;
    this.preferences = preferences || {};
    this.createdAt = new Date();
    this.updatedAt = new Date();

    // 设置可选字段
    if (phone) {
      this.phone = new Phone(phone);
    }
    if (displayName) {
      this.displayName = displayName;
    } else {
      this.displayName = `${firstName} ${lastName}`;
    }
    if (avatar) {
      this.avatar = avatar;
    }
    if (organizationIds) {
      this.organizationIds = organizationIds;
    }
    if (roleIds) {
      this.roleIds = roleIds;
    }

    // 添加用户创建事件
    this.addDomainEvent(new UserCreatedEvent(this));
  }

  /**
   * @method activate
   * @description 激活用户
   * @throws {Error} 当用户无法激活时抛出异常
   */
  activate(): void {
    if (!this.status.canActivate()) {
      throw new Error(`用户当前状态为${this.status.getDisplayName()}，无法激活`);
    }
    this.status = UserStatusValue.active();
    this.updateUserTimestamp();

    // 添加用户激活事件
    this.addDomainEvent(new UserActivatedEvent(this));
  }

  /**
   * @method suspend
   * @description 禁用用户
   * @throws {Error} 当用户无法禁用时抛出异常
   */
  suspend(): void {
    if (!this.status.canSuspend()) {
      throw new Error(`用户当前状态为${this.status.getDisplayName()}，无法禁用`);
    }
    this.status = UserStatusValue.suspended();
    this.updateUserTimestamp();

    // 添加用户禁用事件
    this.addDomainEvent(new UserSuspendedEvent(this));
  }

  /**
   * @method markAsDeleted
   * @description 标记用户为已删除（软删除）
   * @throws {Error} 当用户无法删除时抛出异常
   */
  markAsDeleted(): void {
    if (!this.status.canDelete()) {
      throw new Error(`用户当前状态为${this.status.getDisplayName()}，无法删除`);
    }
    this.status = UserStatusValue.deleted();
    this.deletedAt = new Date();
    this.updateUserTimestamp();

    // 添加用户删除事件
    this.addDomainEvent(new UserDeletedEvent(this));
  }

  /**
   * @method restore
   * @description 恢复用户
   * @throws {Error} 当用户无法恢复时抛出异常
   */
  restore(): void {
    if (!this.status.canRestore()) {
      throw new Error(`用户当前状态为${this.status.getDisplayName()}，无法恢复`);
    }
    this.status = UserStatusValue.suspended();
    this.deletedAt = undefined;
    this.updateUserTimestamp();

    // 添加用户恢复事件
    this.addDomainEvent(new UserRestoredEvent(this));
  }

  /**
   * @method updateInfo
   * @description 更新用户基本信息
   * @param firstName 名
   * @param lastName 姓
   * @param displayName 显示名称，可选
   * @param avatar 头像URL，可选
   */
  updateInfo(firstName: string, lastName: string, displayName?: string, avatar?: string): void {
    const oldInfo = {
      firstName: this.firstName,
      lastName: this.lastName,
      displayName: this.displayName,
      avatar: this.avatar,
    };

    this.firstName = firstName;
    this.lastName = lastName;
    if (displayName) {
      this.displayName = displayName;
    } else {
      this.displayName = `${firstName} ${lastName}`;
    }
    if (avatar) {
      this.avatar = avatar;
    }
    this.updateUserTimestamp();

    const newInfo = {
      firstName: this.firstName,
      lastName: this.lastName,
      displayName: this.displayName,
      avatar: this.avatar,
    };

    // 添加用户信息更新事件
    this.addDomainEvent(new UserInfoUpdatedEvent(this, oldInfo, newInfo));
  }

  /**
   * @method updateContactInfo
   * @description 更新用户联系信息
   * @param email 邮箱地址
   * @param phone 手机号，可选
   */
  updateContactInfo(email: string, phone?: string): void {
    const oldContactInfo = {
      email: this.getEmail(),
      phone: this.getPhone(),
    };

    this.email = new Email(email);
    if (phone) {
      this.phone = new Phone(phone);
    }
    this.updateUserTimestamp();

    const newContactInfo = {
      email: this.getEmail(),
      phone: this.getPhone(),
    };

    // 添加用户联系信息更新事件
    this.addDomainEvent(new UserContactInfoUpdatedEvent(this, oldContactInfo, newContactInfo));
  }

  /**
   * @method updatePassword
   * @description 更新用户密码
   * @param passwordHash 新的密码哈希
   */
  updatePassword(passwordHash: string): void {
    this.passwordHash = passwordHash;
    this.loginAttempts = 0;
    this.lockedUntil = undefined;
    this.updateUserTimestamp();

    // 添加密码更新事件
    this.addDomainEvent(new UserPasswordUpdatedEvent(this));
  }

  /**
   * @method recordLoginSuccess
   * @description 记录登录成功
   */
  recordLoginSuccess(): void {
    this.lastLoginAt = new Date();
    this.loginAttempts = 0;
    this.lockedUntil = undefined;
    this.updateUserTimestamp();

    // 添加登录成功事件
    this.addDomainEvent(new UserLoginSuccessEvent(this));
  }

  /**
   * @method recordLoginFailure
   * @description 记录登录失败
   */
  recordLoginFailure(): void {
    this.loginAttempts++;

    // 如果失败次数达到5次，锁定账户30分钟
    if (this.loginAttempts >= 5) {
      this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30分钟
    }

    this.updateUserTimestamp();

    // 添加登录失败事件
    this.addDomainEvent(new UserLoginFailureEvent(this));
  }

  /**
   * @method verifyEmail
   * @description 验证邮箱
   */
  verifyEmail(): void {
    this.emailVerified = true;
    this.updateUserTimestamp();

    // 添加邮箱验证事件
    this.addDomainEvent(new UserEmailVerifiedEvent(this));
  }

  /**
   * @method verifyPhone
   * @description 验证手机号
   */
  verifyPhone(): void {
    this.phoneVerified = true;
    this.updateUserTimestamp();

    // 添加手机号验证事件
    this.addDomainEvent(new UserPhoneVerifiedEvent(this));
  }

  /**
   * @method enableTwoFactor
   * @description 启用二步验证
   * @param secret 二步验证密钥
   */
  enableTwoFactor(secret: string): void {
    this.twoFactorEnabled = true;
    this.twoFactorSecret = secret;
    this.updateUserTimestamp();

    // 添加二步验证启用事件
    this.addDomainEvent(new UserTwoFactorEnabledEvent(this));
  }

  /**
   * @method disableTwoFactor
   * @description 禁用二步验证
   */
  disableTwoFactor(): void {
    this.twoFactorEnabled = false;
    this.twoFactorSecret = undefined;
    this.updateUserTimestamp();

    // 添加二步验证禁用事件
    this.addDomainEvent(new UserTwoFactorDisabledEvent(this));
  }

  /**
   * @method updatePreferences
   * @description 更新用户偏好设置
   * @param preferences 新的偏好设置
   */
  updatePreferences(preferences: Record<string, any>): void {
    const oldPreferences = { ...this.preferences };
    this.preferences = { ...this.preferences, ...preferences };
    this.updateUserTimestamp();

    // 添加偏好设置更新事件
    this.addDomainEvent(new UserPreferencesUpdatedEvent(this, oldPreferences, this.preferences));
  }

  /**
   * @method assignToOrganization
   * @description 分配用户到组织
   * @param organizationId 组织ID
   */
  assignToOrganization(organizationId: string): void {
    if (!this.organizationIds.includes(organizationId)) {
      this.organizationIds.push(organizationId);
      this.updateUserTimestamp();

      // 添加组织分配事件
      this.addDomainEvent(new UserAssignedToOrganizationEvent(this, organizationId));
    }
  }

  /**
   * @method removeFromOrganization
   * @description 从组织中移除用户
   * @param organizationId 组织ID，可选，如果不提供则移除所有组织
   */
  removeFromOrganization(organizationId?: string): void {
    if (organizationId) {
      // 移除指定组织
      const index = this.organizationIds.indexOf(organizationId);
      if (index > -1) {
        this.organizationIds.splice(index, 1);
        this.updateUserTimestamp();

        // 添加组织移除事件
        this.addDomainEvent(new UserRemovedFromOrganizationEvent(this, organizationId));
      }
    } else {
      // 移除所有组织
      const removedOrganizations = [...this.organizationIds];
      this.organizationIds = [];
      this.updateUserTimestamp();

      // 为每个移除的组织添加事件
      removedOrganizations.forEach(orgId => {
        this.addDomainEvent(new UserRemovedFromOrganizationEvent(this, orgId));
      });
    }
  }

  /**
   * @method isInOrganization
   * @description 检查用户是否属于指定组织
   * @param organizationId 组织ID
   * @returns {boolean} 是否属于该组织
   */
  isInOrganization(organizationId: string): boolean {
    return this.organizationIds.includes(organizationId);
  }

  /**
   * @method getOrganizationIds
   * @description 获取用户所属的所有组织ID
   * @returns {string[]} 组织ID列表
   */
  getOrganizationIds(): string[] {
    return [...this.organizationIds];
  }

  /**
   * @method assignRole
   * @description 为用户分配角色
   * @param roleId 角色ID
   */
  assignRole(roleId: string): void {
    if (!this.roleIds.includes(roleId)) {
      this.roleIds.push(roleId);
      this.updateUserTimestamp();

      // 添加角色分配事件
      this.addDomainEvent(new UserRoleAssignedEvent(this, roleId));
    }
  }

  /**
   * @method removeRole
   * @description 移除用户角色
   * @param roleId 角色ID，可选，如果不提供则移除所有角色
   */
  removeRole(roleId?: string): void {
    if (roleId) {
      // 移除指定角色
      const index = this.roleIds.indexOf(roleId);
      if (index > -1) {
        this.roleIds.splice(index, 1);
        this.updateUserTimestamp();

        // 添加角色移除事件
        this.addDomainEvent(new UserRoleRemovedEvent(this, roleId));
      }
    } else {
      // 移除所有角色
      const removedRoles = [...this.roleIds];
      this.roleIds = [];
      this.updateUserTimestamp();

      // 为每个移除的角色添加事件
      removedRoles.forEach(roleId => {
        this.addDomainEvent(new UserRoleRemovedEvent(this, roleId));
      });
    }
  }

  /**
   * @method hasRole
   * @description 检查用户是否拥有指定角色
   * @param roleId 角色ID
   * @returns {boolean} 是否拥有该角色
   */
  hasRole(roleId: string): boolean {
    return this.roleIds.includes(roleId);
  }

  /**
   * @method getRoleIds
   * @description 获取用户的所有角色ID
   * @returns {string[]} 角色ID列表
   */
  getRoleIds(): string[] {
    return [...this.roleIds];
  }

  /**
   * @method isLocked
   * @description 检查用户是否被锁定
   * @returns {boolean} 是否被锁定
   */
  isLocked(): boolean {
    if (!this.lockedUntil) {
      return false;
    }
    return new Date() < this.lockedUntil;
  }

  /**
   * @method canLogin
   * @description 检查用户是否可以登录
   * @returns {boolean} 是否可以登录
   */
  canLogin(): boolean {
    return this.status.canLogin() && !this.isLocked() && !this.isDeleted();
  }

  /**
   * @method isActive
   * @description 检查用户是否处于激活状态
   * @returns {boolean} 如果用户激活返回true，否则返回false
   */
  isActive(): boolean {
    return this.status.isActive() && !this.isDeleted();
  }

  /**
   * @method isSuspended
   * @description 检查用户是否被禁用
   * @returns {boolean} 如果用户被禁用返回true，否则返回false
   */
  isSuspended(): boolean {
    return this.status.isSuspended();
  }

  /**
   * @method getUsername
   * @description 获取用户名
   * @returns {string} 用户名
   */
  getUsername(): string {
    return this.username.getValue();
  }

  /**
   * @method getEmail
   * @description 获取邮箱地址
   * @returns {string} 邮箱地址
   */
  getEmail(): string {
    return this.email.getValue();
  }

  /**
   * @method getPhone
   * @description 获取手机号
   * @returns {string} 手机号，如果未设置返回空字符串
   */
  getPhone(): string {
    return this.phone?.getValue() || '';
  }

  /**
   * @method getStatus
   * @description 获取用户状态
   * @returns {string} 用户状态
   */
  getStatus(): string {
    return this.status.getValue();
  }

  /**
   * @method getStatusDisplayName
   * @description 获取用户状态显示名称
   * @returns {string} 状态显示名称
   */
  getStatusDisplayName(): string {
    return this.status.getDisplayName();
  }

  /**
   * @method getStatusDescription
   * @description 获取用户状态描述
   * @returns {string} 状态描述
   */
  getStatusDescription(): string {
    return this.status.getDescription();
  }

  /**
   * @method getFullName
   * @description 获取用户全名
   * @returns {string} 全名
   */
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * @method addDomainEvent
   * @description 添加领域事件
   * @param event 领域事件
   */
  addDomainEvent(event: any): void {
    this._domainEvents.push(event);
  }

  /**
   * @method clearDomainEvents
   * @description 清除领域事件
   */
  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  /**
   * @method getDomainEvents
   * @description 获取领域事件列表
   * @returns {any[]} 领域事件列表
   */
  getDomainEvents(): any[] {
    return [...this._domainEvents];
  }

  /**
   * @method hasDomainEvents
   * @description 检查是否有领域事件
   * @returns {boolean} 是否有领域事件
   */
  hasDomainEvents(): boolean {
    return this._domainEvents.length > 0;
  }

  /**
   * @method updateUserTimestamp
   * @description 更新用户时间戳
   */
  private updateUserTimestamp(): void {
    this.updatedAt = new Date();
  }
} 
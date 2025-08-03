import { User } from '../entities/user.entity';

/**
 * @abstract class UserDomainEvent
 * @description
 * 用户领域事件基类，所有用户相关的领域事件都继承此类。
 * 
 * 主要原理与机制：
 * 1. 提供事件的基础属性和方法
 * 2. 自动生成事件ID和时间戳
 * 3. 支持事件序列化
 * 4. 遵循DDD事件设计模式
 */
export abstract class UserDomainEvent {
  readonly eventId: string;
  readonly occurredOn: Date;
  readonly userId: string;
  readonly tenantId: string;
  readonly eventType: string;

  constructor(userId: string, tenantId: string) {
    this.eventId = this.generateEventId();
    this.occurredOn = new Date();
    this.userId = userId;
    this.tenantId = tenantId;
    this.eventType = this.constructor.name;
  }

  /**
   * @method generateEventId
   * @description 生成唯一的事件ID
   * @returns {string} 事件ID
   */
  private generateEventId(): string {
    return `user_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * @method toJSON
   * @description 将事件转换为JSON格式
   * @returns {object} JSON对象
   */
  toJSON(): object {
    return {
      eventId: this.eventId,
      occurredOn: this.occurredOn.toISOString(),
      userId: this.userId,
      tenantId: this.tenantId,
      eventType: this.eventType,
    };
  }
}

/**
 * @class UserCreatedEvent
 * @description 用户创建事件
 */
export class UserCreatedEvent extends UserDomainEvent {
  readonly userData: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    displayName?: string;
    phone?: string;
    adminUserId: string;
    organizationIds: string[];
    roleIds: string[];
  };

  constructor(user: User) {
    super(user.id, user.tenantId);
    this.userData = {
      username: user.getUsername(),
      email: user.getEmail(),
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      phone: user.getPhone(),
      adminUserId: user.adminUserId,
      organizationIds: user.getOrganizationIds(),
      roleIds: user.getRoleIds(),
    };
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      userData: this.userData,
    };
  }
}

/**
 * @class UserActivatedEvent
 * @description 用户激活事件
 */
export class UserActivatedEvent extends UserDomainEvent {
  readonly activatedBy?: string;
  readonly reason?: string;

  constructor(user: User, activatedBy?: string, reason?: string) {
    super(user.id, user.tenantId);
    this.activatedBy = activatedBy;
    this.reason = reason;
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      activatedBy: this.activatedBy,
      reason: this.reason,
    };
  }
}

/**
 * @class UserSuspendedEvent
 * @description 用户禁用事件
 */
export class UserSuspendedEvent extends UserDomainEvent {
  readonly suspendedBy?: string;
  readonly reason?: string;

  constructor(user: User, suspendedBy?: string, reason?: string) {
    super(user.id, user.tenantId);
    this.suspendedBy = suspendedBy;
    this.reason = reason;
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      suspendedBy: this.suspendedBy,
      reason: this.reason,
    };
  }
}

/**
 * @class UserDeletedEvent
 * @description 用户删除事件
 */
export class UserDeletedEvent extends UserDomainEvent {
  readonly deletedBy?: string;
  readonly reason?: string;

  constructor(user: User, deletedBy?: string, reason?: string) {
    super(user.id, user.tenantId);
    this.deletedBy = deletedBy;
    this.reason = reason;
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      deletedBy: this.deletedBy,
      reason: this.reason,
    };
  }
}

/**
 * @class UserRestoredEvent
 * @description 用户恢复事件
 */
export class UserRestoredEvent extends UserDomainEvent {
  readonly restoredBy?: string;
  readonly reason?: string;

  constructor(user: User, restoredBy?: string, reason?: string) {
    super(user.id, user.tenantId);
    this.restoredBy = restoredBy;
    this.reason = reason;
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      restoredBy: this.restoredBy,
      reason: this.reason,
    };
  }
}

/**
 * @class UserInfoUpdatedEvent
 * @description 用户信息更新事件
 */
export class UserInfoUpdatedEvent extends UserDomainEvent {
  readonly updatedBy?: string;
  readonly oldInfo: {
    firstName: string;
    lastName: string;
    displayName?: string;
    avatar?: string;
  };
  readonly newInfo: {
    firstName: string;
    lastName: string;
    displayName?: string;
    avatar?: string;
  };

  constructor(
    user: User,
    oldInfo: { firstName: string; lastName: string; displayName?: string; avatar?: string },
    newInfo: { firstName: string; lastName: string; displayName?: string; avatar?: string },
    updatedBy?: string
  ) {
    super(user.id, user.tenantId);
    this.oldInfo = oldInfo;
    this.newInfo = newInfo;
    this.updatedBy = updatedBy;
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      updatedBy: this.updatedBy,
      oldInfo: this.oldInfo,
      newInfo: this.newInfo,
    };
  }
}

/**
 * @class UserContactInfoUpdatedEvent
 * @description 用户联系信息更新事件
 */
export class UserContactInfoUpdatedEvent extends UserDomainEvent {
  readonly updatedBy?: string;
  readonly oldContactInfo: {
    email: string;
    phone?: string;
  };
  readonly newContactInfo: {
    email: string;
    phone?: string;
  };

  constructor(
    user: User,
    oldContactInfo: { email: string; phone?: string },
    newContactInfo: { email: string; phone?: string },
    updatedBy?: string
  ) {
    super(user.id, user.tenantId);
    this.oldContactInfo = oldContactInfo;
    this.newContactInfo = newContactInfo;
    this.updatedBy = updatedBy;
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      updatedBy: this.updatedBy,
      oldContactInfo: this.oldContactInfo,
      newContactInfo: this.newContactInfo,
    };
  }
}

/**
 * @class UserPasswordUpdatedEvent
 * @description 用户密码更新事件
 */
export class UserPasswordUpdatedEvent extends UserDomainEvent {
  readonly updatedBy?: string;
  readonly reason?: string;

  constructor(user: User, updatedBy?: string, reason?: string) {
    super(user.id, user.tenantId);
    this.updatedBy = updatedBy;
    this.reason = reason;
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      updatedBy: this.updatedBy,
      reason: this.reason,
    };
  }
}

/**
 * @class UserLoginSuccessEvent
 * @description 用户登录成功事件
 */
export class UserLoginSuccessEvent extends UserDomainEvent {
  readonly loginAt: Date;
  readonly ipAddress?: string;
  readonly userAgent?: string;

  constructor(user: User, ipAddress?: string, userAgent?: string) {
    super(user.id, user.tenantId);
    this.loginAt = new Date();
    this.ipAddress = ipAddress;
    this.userAgent = userAgent;
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      loginAt: this.loginAt.toISOString(),
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
    };
  }
}

/**
 * @class UserLoginFailureEvent
 * @description 用户登录失败事件
 */
export class UserLoginFailureEvent extends UserDomainEvent {
  readonly failureAt: Date;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly failureReason?: string;
  readonly loginAttempts: number;

  constructor(user: User, ipAddress?: string, userAgent?: string, failureReason?: string) {
    super(user.id, user.tenantId);
    this.failureAt = new Date();
    this.ipAddress = ipAddress;
    this.userAgent = userAgent;
    this.failureReason = failureReason;
    this.loginAttempts = user.loginAttempts;
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      failureAt: this.failureAt.toISOString(),
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      failureReason: this.failureReason,
      loginAttempts: this.loginAttempts,
    };
  }
}

/**
 * @class UserEmailVerifiedEvent
 * @description 用户邮箱验证事件
 */
export class UserEmailVerifiedEvent extends UserDomainEvent {
  readonly verifiedAt: Date;
  readonly verifiedBy?: string;

  constructor(user: User, verifiedBy?: string) {
    super(user.id, user.tenantId);
    this.verifiedAt = new Date();
    this.verifiedBy = verifiedBy;
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      verifiedAt: this.verifiedAt.toISOString(),
      verifiedBy: this.verifiedBy,
    };
  }
}

/**
 * @class UserPhoneVerifiedEvent
 * @description 用户手机号验证事件
 */
export class UserPhoneVerifiedEvent extends UserDomainEvent {
  readonly verifiedAt: Date;
  readonly verifiedBy?: string;

  constructor(user: User, verifiedBy?: string) {
    super(user.id, user.tenantId);
    this.verifiedAt = new Date();
    this.verifiedBy = verifiedBy;
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      verifiedAt: this.verifiedAt.toISOString(),
      verifiedBy: this.verifiedBy,
    };
  }
}

/**
 * @class UserTwoFactorEnabledEvent
 * @description 用户二步验证启用事件
 */
export class UserTwoFactorEnabledEvent extends UserDomainEvent {
  readonly enabledAt: Date;
  readonly enabledBy?: string;

  constructor(user: User, enabledBy?: string) {
    super(user.id, user.tenantId);
    this.enabledAt = new Date();
    this.enabledBy = enabledBy;
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      enabledAt: this.enabledAt.toISOString(),
      enabledBy: this.enabledBy,
    };
  }
}

/**
 * @class UserTwoFactorDisabledEvent
 * @description 用户二步验证禁用事件
 */
export class UserTwoFactorDisabledEvent extends UserDomainEvent {
  readonly disabledAt: Date;
  readonly disabledBy?: string;

  constructor(user: User, disabledBy?: string) {
    super(user.id, user.tenantId);
    this.disabledAt = new Date();
    this.disabledBy = disabledBy;
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      disabledAt: this.disabledAt.toISOString(),
      disabledBy: this.disabledBy,
    };
  }
}

/**
 * @class UserPreferencesUpdatedEvent
 * @description 用户偏好设置更新事件
 */
export class UserPreferencesUpdatedEvent extends UserDomainEvent {
  readonly updatedBy?: string;
  readonly oldPreferences: Record<string, any>;
  readonly newPreferences: Record<string, any>;

  constructor(
    user: User,
    oldPreferences: Record<string, any>,
    newPreferences: Record<string, any>,
    updatedBy?: string
  ) {
    super(user.id, user.tenantId);
    this.oldPreferences = oldPreferences;
    this.newPreferences = newPreferences;
    this.updatedBy = updatedBy;
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      updatedBy: this.updatedBy,
      oldPreferences: this.oldPreferences,
      newPreferences: this.newPreferences,
    };
  }
}

/**
 * @class UserAssignedToOrganizationEvent
 * @description 用户分配到组织事件
 */
export class UserAssignedToOrganizationEvent extends UserDomainEvent {
  readonly organizationId: string;
  readonly assignedBy?: string;
  readonly assignedAt: Date;

  constructor(user: User, organizationId: string, assignedBy?: string) {
    super(user.id, user.tenantId);
    this.organizationId = organizationId;
    this.assignedBy = assignedBy;
    this.assignedAt = new Date();
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      organizationId: this.organizationId,
      assignedBy: this.assignedBy,
      assignedAt: this.assignedAt.toISOString(),
    };
  }
}

/**
 * @class UserRemovedFromOrganizationEvent
 * @description 用户从组织移除事件
 */
export class UserRemovedFromOrganizationEvent extends UserDomainEvent {
  readonly organizationId?: string;
  readonly removedBy?: string;
  readonly removedAt: Date;

  constructor(user: User, organizationId?: string, removedBy?: string) {
    super(user.id, user.tenantId);
    this.organizationId = organizationId;
    this.removedBy = removedBy;
    this.removedAt = new Date();
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      organizationId: this.organizationId,
      removedBy: this.removedBy,
      removedAt: this.removedAt.toISOString(),
    };
  }
}

/**
 * @class UserRoleAssignedEvent
 * @description 用户角色分配事件
 */
export class UserRoleAssignedEvent extends UserDomainEvent {
  readonly roleId: string;
  readonly assignedBy?: string;
  readonly assignedAt: Date;

  constructor(user: User, roleId: string, assignedBy?: string) {
    super(user.id, user.tenantId);
    this.roleId = roleId;
    this.assignedBy = assignedBy;
    this.assignedAt = new Date();
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      roleId: this.roleId,
      assignedBy: this.assignedBy,
      assignedAt: this.assignedAt.toISOString(),
    };
  }
}

/**
 * @class UserRoleRemovedEvent
 * @description 用户角色移除事件
 */
export class UserRoleRemovedEvent extends UserDomainEvent {
  readonly roleId: string;
  readonly removedBy?: string;
  readonly removedAt: Date;

  constructor(user: User, roleId: string, removedBy?: string) {
    super(user.id, user.tenantId);
    this.roleId = roleId;
    this.removedBy = removedBy;
    this.removedAt = new Date();
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      roleId: this.roleId,
      removedBy: this.removedBy,
      removedAt: this.removedAt.toISOString(),
    };
  }
} 
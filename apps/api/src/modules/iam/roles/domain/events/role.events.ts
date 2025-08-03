import { Role } from '../entities/role.entity';

/**
 * @abstract RoleDomainEvent
 * @description
 * 角色领域事件抽象基类，定义角色相关领域事件的通用结构。
 * 
 * 主要原理与机制：
 * 1. 提供角色领域事件的统一接口
 * 2. 包含事件发生时间和角色信息
 * 3. 支持事件序列化和反序列化
 * 4. 便于事件存储和传输
 */
export abstract class RoleDomainEvent {
  /**
   * @property eventId
   * @description 事件唯一标识
   */
  readonly eventId: string;

  /**
   * @property eventType
   * @description 事件类型
   */
  readonly eventType: string;

  /**
   * @property occurredOn
   * @description 事件发生时间
   */
  readonly occurredOn: Date;

  /**
   * @property roleId
   * @description 角色ID
   */
  readonly roleId: string;

  /**
   * @property tenantId
   * @description 租户ID
   */
  readonly tenantId: string;

  /**
   * @property roleData
   * @description 角色数据快照
   */
  readonly roleData: any;

  /**
   * @constructor
   * @description 创建角色领域事件
   * @param role 角色实体
   */
  constructor(role: Role) {
    this.eventId = `${role.id}_${Date.now()}`;
    this.eventType = this.constructor.name;
    this.occurredOn = new Date();
    this.roleId = role.id;
    this.tenantId = role.tenantId;
    this.roleData = {
      id: role.id,
      name: role.getName(),
      code: role.getCode(),
      description: role.description,
      status: role.getStatus(),
      tenantId: role.tenantId,
      organizationId: role.organizationId,
      adminUserId: role.adminUserId,
      permissionIds: role.getPermissionIds(),
      userIds: role.getUserIds(),
      isSystemRole: role.isSystemRole,
      isDefaultRole: role.isDefaultRole,
      priority: role.getPriority(),
      maxUsers: role.maxUsers,
      expiresAt: role.expiresAt,
      parentRoleId: role.parentRoleId,
      childRoleIds: role.childRoleIds,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      deletedAt: role.deletedAt,
    };
  }

  /**
   * @method toJSON
   * @description 转换为JSON格式
   * @returns {object} JSON对象
   */
  toJSON(): object {
    return {
      eventId: this.eventId,
      eventType: this.eventType,
      occurredOn: this.occurredOn,
      roleId: this.roleId,
      tenantId: this.tenantId,
      roleData: this.roleData,
    };
  }
}

/**
 * @class RoleCreatedEvent
 * @description 角色创建事件
 */
export class RoleCreatedEvent extends RoleDomainEvent {
  constructor(role: Role) {
    super(role);
  }
}

/**
 * @class RoleActivatedEvent
 * @description 角色激活事件
 */
export class RoleActivatedEvent extends RoleDomainEvent {
  constructor(role: Role) {
    super(role);
  }
}

/**
 * @class RoleSuspendedEvent
 * @description 角色禁用事件
 */
export class RoleSuspendedEvent extends RoleDomainEvent {
  constructor(role: Role) {
    super(role);
  }
}

/**
 * @class RoleDeletedEvent
 * @description 角色删除事件
 */
export class RoleDeletedEvent extends RoleDomainEvent {
  constructor(role: Role) {
    super(role);
  }
}

/**
 * @class RoleRestoredEvent
 * @description 角色恢复事件
 */
export class RoleRestoredEvent extends RoleDomainEvent {
  constructor(role: Role) {
    super(role);
  }
}

/**
 * @class RoleInfoUpdatedEvent
 * @description 角色信息更新事件
 */
export class RoleInfoUpdatedEvent extends RoleDomainEvent {
  /**
   * @property oldInfo
   * @description 更新前的角色信息
   */
  readonly oldInfo: {
    name: string;
    code: string;
    description?: string;
    priority: number;
  };

  /**
   * @property newInfo
   * @description 更新后的角色信息
   */
  readonly newInfo: {
    name: string;
    code: string;
    description?: string;
    priority: number;
  };

  constructor(
    role: Role,
    oldInfo: { name: string; code: string; description?: string; priority: number },
    newInfo: { name: string; code: string; description?: string; priority: number }
  ) {
    super(role);
    this.oldInfo = oldInfo;
    this.newInfo = newInfo;
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      oldInfo: this.oldInfo,
      newInfo: this.newInfo,
    };
  }
}

/**
 * @class RolePermissionAssignedEvent
 * @description 角色权限分配事件
 */
export class RolePermissionAssignedEvent extends RoleDomainEvent {
  /**
   * @property permissionId
   * @description 分配的权限ID
   */
  readonly permissionId: string;

  constructor(role: Role, permissionId: string) {
    super(role);
    this.permissionId = permissionId;
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      permissionId: this.permissionId,
    };
  }
}

/**
 * @class RolePermissionRemovedEvent
 * @description 角色权限移除事件
 */
export class RolePermissionRemovedEvent extends RoleDomainEvent {
  /**
   * @property permissionId
   * @description 移除的权限ID
   */
  readonly permissionId: string;

  constructor(role: Role, permissionId: string) {
    super(role);
    this.permissionId = permissionId;
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      permissionId: this.permissionId,
    };
  }
}

/**
 * @class RoleUserAssignedEvent
 * @description 角色用户分配事件
 */
export class RoleUserAssignedEvent extends RoleDomainEvent {
  /**
   * @property userId
   * @description 分配的用户ID
   */
  readonly userId: string;

  constructor(role: Role, userId: string) {
    super(role);
    this.userId = userId;
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      userId: this.userId,
    };
  }
}

/**
 * @class RoleUserRemovedEvent
 * @description 角色用户移除事件
 */
export class RoleUserRemovedEvent extends RoleDomainEvent {
  /**
   * @property userId
   * @description 移除的用户ID
   */
  readonly userId: string;

  constructor(role: Role, userId: string) {
    super(role);
    this.userId = userId;
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      userId: this.userId,
    };
  }
}

/**
 * @class RoleInheritanceSetEvent
 * @description 角色继承设置事件
 */
export class RoleInheritanceSetEvent extends RoleDomainEvent {
  /**
   * @property oldParentRoleId
   * @description 之前的父角色ID
   */
  readonly oldParentRoleId?: string;

  /**
   * @property newParentRoleId
   * @description 新的父角色ID
   */
  readonly newParentRoleId: string;

  constructor(role: Role, oldParentRoleId: string | undefined, newParentRoleId: string) {
    super(role);
    this.oldParentRoleId = oldParentRoleId;
    this.newParentRoleId = newParentRoleId;
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      oldParentRoleId: this.oldParentRoleId,
      newParentRoleId: this.newParentRoleId,
    };
  }
}

/**
 * @class RoleInheritanceRemovedEvent
 * @description 角色继承移除事件
 */
export class RoleInheritanceRemovedEvent extends RoleDomainEvent {
  /**
   * @property removedParentRoleId
   * @description 移除的父角色ID
   */
  readonly removedParentRoleId: string;

  constructor(role: Role, removedParentRoleId: string) {
    super(role);
    this.removedParentRoleId = removedParentRoleId;
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      removedParentRoleId: this.removedParentRoleId,
    };
  }
} 
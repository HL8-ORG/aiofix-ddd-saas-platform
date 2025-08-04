import type { Permission } from '../entities/permission.entity'

/**
 * @abstract PermissionDomainEvent
 * @description 权限领域事件抽象基类
 */
export abstract class PermissionDomainEvent {
  public readonly occurredOn: Date
  public readonly permission: Permission

  constructor(permission: Permission) {
    this.occurredOn = new Date()
    this.permission = permission
  }
}

/**
 * @class PermissionCreatedEvent
 * @description 权限创建事件
 */
export class PermissionCreatedEvent extends PermissionDomainEvent {
  constructor(permission: Permission) {
    super(permission)
  }
}

/**
 * @class PermissionActivatedEvent
 * @description 权限激活事件
 */
export class PermissionActivatedEvent extends PermissionDomainEvent {
  constructor(permission: Permission) {
    super(permission)
  }
}

/**
 * @class PermissionSuspendedEvent
 * @description 权限暂停事件
 */
export class PermissionSuspendedEvent extends PermissionDomainEvent {
  constructor(permission: Permission) {
    super(permission)
  }
}

/**
 * @class PermissionDeletedEvent
 * @description 权限删除事件
 */
export class PermissionDeletedEvent extends PermissionDomainEvent {
  constructor(permission: Permission) {
    super(permission)
  }
}

/**
 * @class PermissionRestoredEvent
 * @description 权限恢复事件
 */
export class PermissionRestoredEvent extends PermissionDomainEvent {
  constructor(permission: Permission) {
    super(permission)
  }
}

/**
 * @class PermissionInfoUpdatedEvent
 * @description 权限信息更新事件
 */
export class PermissionInfoUpdatedEvent extends PermissionDomainEvent {
  constructor(permission: Permission) {
    super(permission)
  }
}

/**
 * @class PermissionActionUpdatedEvent
 * @description 权限操作更新事件
 */
export class PermissionActionUpdatedEvent extends PermissionDomainEvent {
  constructor(permission: Permission) {
    super(permission)
  }
}

/**
 * @class PermissionConditionUpdatedEvent
 * @description 权限条件更新事件
 */
export class PermissionConditionUpdatedEvent extends PermissionDomainEvent {
  constructor(permission: Permission) {
    super(permission)
  }
}

/**
 * @class PermissionFieldsUpdatedEvent
 * @description 权限字段更新事件
 */
export class PermissionFieldsUpdatedEvent extends PermissionDomainEvent {
  constructor(permission: Permission) {
    super(permission)
  }
}

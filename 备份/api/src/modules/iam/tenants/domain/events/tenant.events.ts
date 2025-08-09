import type { Tenant } from '../entities/tenant.entity'

/**
 * @abstract class TenantDomainEvent
 * @description
 * 租户领域事件基类，所有租户相关的领域事件都继承此类。
 */
export abstract class TenantDomainEvent {
  readonly eventId: string
  readonly occurredOn: Date
  readonly tenantId: string
  readonly eventType: string

  constructor(tenantId: string) {
    this.eventId = this.generateEventId()
    this.occurredOn = new Date()
    this.tenantId = tenantId
    this.eventType = this.constructor.name
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  toJSON(): object {
    return {
      eventId: this.eventId,
      occurredOn: this.occurredOn.toISOString(),
      tenantId: this.tenantId,
      eventType: this.eventType,
    }
  }
}

/**
 * @class TenantCreatedEvent
 * @description 租户创建事件
 */
export class TenantCreatedEvent extends TenantDomainEvent {
  readonly tenantData: {
    name: string
    code: string
    adminUserId: string
    description?: string
    settings?: Record<string, any>
  }

  constructor(tenant: Tenant) {
    super(tenant.id)
    this.tenantData = {
      name: tenant.getName(),
      code: tenant.getCode(),
      adminUserId: tenant.adminUserId,
      description: tenant.description,
      settings: tenant.settings,
    }
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      tenantData: this.tenantData,
    }
  }
}

/**
 * @class TenantActivatedEvent
 * @description 租户激活事件
 */
export class TenantActivatedEvent extends TenantDomainEvent {
  readonly activatedBy?: string
  readonly reason?: string

  constructor(tenant: Tenant, activatedBy?: string, reason?: string) {
    super(tenant.id)
    this.activatedBy = activatedBy
    this.reason = reason
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      activatedBy: this.activatedBy,
      reason: this.reason,
    }
  }
}

/**
 * @class TenantSuspendedEvent
 * @description 租户暂停事件
 */
export class TenantSuspendedEvent extends TenantDomainEvent {
  readonly suspendedBy?: string
  readonly reason?: string

  constructor(tenant: Tenant, suspendedBy?: string, reason?: string) {
    super(tenant.id)
    this.suspendedBy = suspendedBy
    this.reason = reason
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      suspendedBy: this.suspendedBy,
      reason: this.reason,
    }
  }
}

/**
 * @class TenantDeletedEvent
 * @description 租户删除事件
 */
export class TenantDeletedEvent extends TenantDomainEvent {
  readonly deletedBy?: string
  readonly reason?: string

  constructor(tenant: Tenant, deletedBy?: string, reason?: string) {
    super(tenant.id)
    this.deletedBy = deletedBy
    this.reason = reason
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      deletedBy: this.deletedBy,
      reason: this.reason,
    }
  }
}

/**
 * @class TenantSettingsUpdatedEvent
 * @description 租户配置更新事件
 */
export class TenantSettingsUpdatedEvent extends TenantDomainEvent {
  readonly updatedBy?: string
  readonly oldSettings: Record<string, any>
  readonly newSettings: Record<string, any>

  constructor(
    tenant: Tenant,
    oldSettings: Record<string, any>,
    newSettings: Record<string, any>,
    updatedBy?: string,
  ) {
    super(tenant.id)
    this.oldSettings = oldSettings
    this.newSettings = newSettings
    this.updatedBy = updatedBy
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      updatedBy: this.updatedBy,
      oldSettings: this.oldSettings,
      newSettings: this.newSettings,
    }
  }
}

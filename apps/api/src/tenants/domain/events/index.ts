/**
 * @file index.ts
 * @description
 * 租户子领域事件索引文件，导出所有领域事件类和相关接口。
 * 该文件作为事件模块的统一入口，便于其他模块引用和使用。
 */

// 基础事件
export { BaseDomainEvent } from './base-domain-event'

// 租户生命周期事件
export { TenantCreatedEvent } from './tenant-created.event'
export type { TenantCreatedEventData } from './tenant-created.event'

export { TenantActivatedEvent } from './tenant-activated.event'
export type { TenantActivatedEventData } from './tenant-activated.event'

export { TenantSuspendedEvent } from './tenant-suspended.event'
export type { TenantSuspendedEventData } from './tenant-suspended.event'

export { TenantDeletedEvent } from './tenant-deleted.event'
export type { TenantDeletedEventData } from './tenant-deleted.event'

export { TenantRestoredEvent } from './tenant-restored.event'
export type { TenantRestoredEventData } from './tenant-restored.event'

// 租户配置事件
export { TenantSettingsUpdatedEvent } from './tenant-settings-updated.event'
export type { TenantSettingsUpdatedEventData } from './tenant-settings-updated.event'

import type { TenantActivatedEvent } from './tenant-activated.event'
// 事件类型联合类型
import type { TenantCreatedEvent } from './tenant-created.event'
import type { TenantDeletedEvent } from './tenant-deleted.event'
import type { TenantRestoredEvent } from './tenant-restored.event'
import type { TenantSettingsUpdatedEvent } from './tenant-settings-updated.event'
import type { TenantSuspendedEvent } from './tenant-suspended.event'

export type TenantDomainEvent =
  | TenantCreatedEvent
  | TenantActivatedEvent
  | TenantSuspendedEvent
  | TenantDeletedEvent
  | TenantRestoredEvent
  | TenantSettingsUpdatedEvent

// 事件类型枚举
export enum TenantEventType {
  TENANT_CREATED = 'TenantCreatedEvent',
  TENANT_ACTIVATED = 'TenantActivatedEvent',
  TENANT_SUSPENDED = 'TenantSuspendedEvent',
  TENANT_DELETED = 'TenantDeletedEvent',
  TENANT_RESTORED = 'TenantRestoredEvent',
  TENANT_SETTINGS_UPDATED = 'TenantSettingsUpdatedEvent',
}

// 事件分类枚举
export enum TenantEventCategory {
  TENANT_LIFECYCLE = 'TENANT_LIFECYCLE',
  TENANT_CONFIGURATION = 'TENANT_CONFIGURATION',
}

// 事件优先级枚举
export enum TenantEventPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

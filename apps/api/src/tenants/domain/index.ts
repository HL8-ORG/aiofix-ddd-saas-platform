/**
 * @file index.ts
 * @description 租户领域层索引文件，导出所有领域组件
 */

// 实体
export { Tenant, TenantStatus } from './entities/tenant.entity'

// 值对象
export { TenantName } from './value-objects/tenant-name.vo'
export { TenantCode } from './value-objects/tenant-code.vo'

// 领域事件
export { BaseDomainEvent } from './events/base-domain-event'
export { TenantCreatedEvent } from './events/tenant-created.event'
export { TenantActivatedEvent } from './events/tenant-activated.event'
export { TenantSuspendedEvent } from './events/tenant-suspended.event'
export { TenantDeletedEvent } from './events/tenant-deleted.event'
export { TenantRestoredEvent } from './events/tenant-restored.event'
export { TenantSettingsUpdatedEvent } from './events/tenant-settings-updated.event'

// 仓储接口
export type { ITenantRepository } from './repositories/tenant.repository.interface'

// 领域服务
export { TenantDomainService } from './services/tenant-domain.service'

// 领域异常
export {
  TenantDomainException,
  TenantNotFoundException,
  TenantAlreadyExistsException,
  TenantInvalidStateException,
  TenantCannotBeActivatedException,
  TenantCannotBeSuspendedException,
  TenantCannotBeDeletedException,
  TenantCannotBeRestoredException,
  TenantNameInvalidException,
  TenantCodeInvalidException,
  TenantSettingsInvalidException,
  TenantOperationNotAllowedException,
} from './exceptions/tenant-domain.exception'

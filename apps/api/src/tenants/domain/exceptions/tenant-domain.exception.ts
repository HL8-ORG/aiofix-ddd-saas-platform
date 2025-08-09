/**
 * @class TenantDomainException
 * @description
 * 租户领域异常基类，定义租户相关的领域异常。该异常类继承自Error，
 * 用于表示租户领域中的业务异常。
 *
 * 主要原理与机制：
 * 1. 异常分类：按业务场景分类异常类型
 * 2. 错误信息：提供详细的错误信息
 * 3. 错误代码：支持错误代码标识
 * 4. 异常追踪：支持异常堆栈追踪
 */
export abstract class TenantDomainException extends Error {
  /**
   * @property errorCode
   * @description 错误代码
   */
  public readonly errorCode: string

  /**
   * @property tenantId
   * @description 租户ID（如果相关）
   */
  public readonly tenantId?: string

  /**
   * @constructor
   * @description 构造函数
   * @param message 错误消息
   * @param errorCode 错误代码
   * @param tenantId 租户ID
   */
  constructor(message: string, errorCode: string, tenantId?: string) {
    super(message)
    this.name = this.constructor.name
    this.errorCode = errorCode
    this.tenantId = tenantId
  }
}

/**
 * @class TenantNotFoundException
 * @description 租户未找到异常
 */
export class TenantNotFoundException extends TenantDomainException {
  constructor(tenantId: string) {
    super(`Tenant not found: ${tenantId}`, 'TENANT_NOT_FOUND', tenantId)
  }
}

/**
 * @class TenantAlreadyExistsException
 * @description 租户已存在异常
 */
export class TenantAlreadyExistsException extends TenantDomainException {
  constructor(identifier: string, type: 'name' | 'code') {
    super(
      `Tenant with ${type} '${identifier}' already exists`,
      'TENANT_ALREADY_EXISTS',
    )
  }
}

/**
 * @class TenantInvalidStateException
 * @description 租户状态无效异常
 */
export class TenantInvalidStateException extends TenantDomainException {
  constructor(tenantId: string, currentStatus: string, expectedStatus: string) {
    super(
      `Tenant ${tenantId} is in invalid state: ${currentStatus}, expected: ${expectedStatus}`,
      'TENANT_INVALID_STATE',
      tenantId,
    )
  }
}

/**
 * @class TenantCannotBeActivatedException
 * @description 租户无法激活异常
 */
export class TenantCannotBeActivatedException extends TenantDomainException {
  constructor(tenantId: string, currentStatus: string) {
    super(
      `Tenant ${tenantId} cannot be activated from status: ${currentStatus}`,
      'TENANT_CANNOT_BE_ACTIVATED',
      tenantId,
    )
  }
}

/**
 * @class TenantCannotBeSuspendedException
 * @description 租户无法禁用异常
 */
export class TenantCannotBeSuspendedException extends TenantDomainException {
  constructor(tenantId: string, currentStatus: string) {
    super(
      `Tenant ${tenantId} cannot be suspended from status: ${currentStatus}`,
      'TENANT_CANNOT_BE_SUSPENDED',
      tenantId,
    )
  }
}

/**
 * @class TenantCannotBeDeletedException
 * @description 租户无法删除异常
 */
export class TenantCannotBeDeletedException extends TenantDomainException {
  constructor(tenantId: string, currentStatus: string) {
    super(
      `Tenant ${tenantId} cannot be deleted from status: ${currentStatus}`,
      'TENANT_CANNOT_BE_DELETED',
      tenantId,
    )
  }
}

/**
 * @class TenantCannotBeRestoredException
 * @description 租户无法恢复异常
 */
export class TenantCannotBeRestoredException extends TenantDomainException {
  constructor(tenantId: string, currentStatus: string) {
    super(
      `Tenant ${tenantId} cannot be restored from status: ${currentStatus}`,
      'TENANT_CANNOT_BE_RESTORED',
      tenantId,
    )
  }
}

/**
 * @class TenantNameInvalidException
 * @description 租户名称无效异常
 */
export class TenantNameInvalidException extends TenantDomainException {
  constructor(name: string, reason: string) {
    super(`Invalid tenant name '${name}': ${reason}`, 'TENANT_NAME_INVALID')
  }
}

/**
 * @class TenantCodeInvalidException
 * @description 租户编码无效异常
 */
export class TenantCodeInvalidException extends TenantDomainException {
  constructor(code: string, reason: string) {
    super(`Invalid tenant code '${code}': ${reason}`, 'TENANT_CODE_INVALID')
  }
}

/**
 * @class TenantSettingsInvalidException
 * @description 租户配置无效异常
 */
export class TenantSettingsInvalidException extends TenantDomainException {
  constructor(tenantId: string, reason: string) {
    super(
      `Invalid tenant settings for tenant ${tenantId}: ${reason}`,
      'TENANT_SETTINGS_INVALID',
      tenantId,
    )
  }
}

/**
 * @class TenantOperationNotAllowedException
 * @description 租户操作不被允许异常
 */
export class TenantOperationNotAllowedException extends TenantDomainException {
  constructor(tenantId: string, operation: string, reason: string) {
    super(
      `Operation '${operation}' not allowed for tenant ${tenantId}: ${reason}`,
      'TENANT_OPERATION_NOT_ALLOWED',
      tenantId,
    )
  }
}

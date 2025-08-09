import { User } from 'src/users/domain/entities/user.entity'
import { UserId } from 'src/users/domain/value-objects/user-id.vo'

/**
 * @interface AuthorizationContext
 * @description 授权判断上下文，用于传递租户隔离、资源范围等上下文信息。
 */
export interface AuthorizationContext {
  tenantId?: string
  resourceTenantId?: string
  resourceOwnerUserId?: string
}

/**
 * @interface AuthorizationPolicyProvider
 * @description 提供用户角色与权限集合的抽象接口。
 */
export interface AuthorizationPolicyProvider {
  getUserRoles(userId: UserId, tenantId: string): Promise<string[]>
  getUserPermissions(userId: UserId, tenantId: string): Promise<string[]>
}

/**
 * @class AuthorizationService
 * @description 用户授权领域服务，基于用户、租户与权限码进行授权校验。
 */
export class AuthorizationService {
  constructor(private readonly policyProvider: AuthorizationPolicyProvider) { }

  async can(user: User, permissionCode: string, context?: AuthorizationContext): Promise<boolean> {
    if (!this.isUserAllowedForAuth(user)) return false
    if (context?.tenantId && user.getTenantId() !== context.tenantId) return false
    if (context?.resourceTenantId && context.resourceTenantId !== user.getTenantId()) return false
    const permissions = await this.policyProvider.getUserPermissions(user.getId(), user.getTenantId())
    return permissions.includes(permissionCode)
  }

  async hasAny(user: User, permissionCodes: string[], context?: AuthorizationContext): Promise<boolean> {
    if (!this.isUserAllowedForAuth(user)) return false
    if (context?.tenantId && user.getTenantId() !== context.tenantId) return false
    if (context?.resourceTenantId && context.resourceTenantId !== user.getTenantId()) return false
    const permissions = await this.policyProvider.getUserPermissions(user.getId(), user.getTenantId())
    return permissionCodes.some(code => permissions.includes(code))
  }

  async hasAll(user: User, permissionCodes: string[], context?: AuthorizationContext): Promise<boolean> {
    if (!this.isUserAllowedForAuth(user)) return false
    if (context?.tenantId && user.getTenantId() !== context.tenantId) return false
    if (context?.resourceTenantId && context.resourceTenantId !== user.getTenantId()) return false
    const permissions = await this.policyProvider.getUserPermissions(user.getId(), user.getTenantId())
    return permissionCodes.every(code => permissions.includes(code))
  }

  async isInRole(user: User, roleCode: string, context?: AuthorizationContext): Promise<boolean> {
    if (!this.isUserAllowedForAuth(user)) return false
    if (context?.tenantId && user.getTenantId() !== context.tenantId) return false
    const roles = await this.policyProvider.getUserRoles(user.getId(), user.getTenantId())
    return roles.includes(roleCode)
  }

  private isUserAllowedForAuth(user: User): boolean {
    const status = user.getStatus()
    if (status.isDeleted()) return false
    if (!status.isActive()) return false
    return true
  }
}



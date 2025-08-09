import { UserId } from 'src/users/domain/value-objects/user-id.vo'
import { AuthorizationPolicyProvider } from './authorization.service'

/**
 * @class InMemoryAuthorizationPolicyProvider
 * @description 内存版授权策略提供者，仅用于开发/测试。
 */
export class InMemoryAuthorizationPolicyProvider implements AuthorizationPolicyProvider {
  private readonly userRolesByTenant = new Map<string, Map<string, Set<string>>>()
  private readonly userPermissionsByTenant = new Map<string, Map<string, Set<string>>>()

  seedUserRoles(userId: string, tenantId: string, roles: string[]): void {
    const tenantMap = this.ensureTenantMap(this.userRolesByTenant, tenantId)
    const roleSet = tenantMap.get(userId) ?? new Set<string>()
    roles.forEach(r => roleSet.add(r))
    tenantMap.set(userId, roleSet)
  }

  seedUserPermissions(userId: string, tenantId: string, permissions: string[]): void {
    const tenantMap = this.ensureTenantMap(this.userPermissionsByTenant, tenantId)
    const permSet = tenantMap.get(userId) ?? new Set<string>()
    permissions.forEach(p => permSet.add(p))
    tenantMap.set(userId, permSet)
  }

  async getUserRoles(userId: UserId, tenantId: string): Promise<string[]> {
    const tenantMap = this.userRolesByTenant.get(tenantId)
    if (!tenantMap) return []
    const set = tenantMap.get(userId.getValue())
    return set ? Array.from(set) : []
  }

  async getUserPermissions(userId: UserId, tenantId: string): Promise<string[]> {
    const tenantMap = this.userPermissionsByTenant.get(tenantId)
    if (!tenantMap) return []
    const set = tenantMap.get(userId.getValue())
    return set ? Array.from(set) : []
  }

  private ensureTenantMap<T>(root: Map<string, Map<string, Set<T>>>, tenantId: string): Map<string, Set<T>> {
    const existing = root.get(tenantId)
    if (existing) return existing
    const created = new Map<string, Set<T>>()
    root.set(tenantId, created)
    return created
  }
}



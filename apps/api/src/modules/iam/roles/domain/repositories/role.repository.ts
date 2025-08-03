import { Role } from '../entities/role.entity';

/**
 * @abstract RoleRepository
 * @description
 * 角色仓储抽象类，定义角色数据访问的接口。
 * 
 * 主要原理与机制：
 * 1. 遵循DDD仓储模式，提供角色实体的持久化抽象
 * 2. 支持多租户隔离，所有查询都基于租户ID过滤
 * 3. 提供完整的CRUD操作和业务查询方法
 * 4. 支持角色继承关系和权限管理查询
 * 5. 确保数据访问的一致性和安全性
 */
export abstract class RoleRepository {
  /**
   * @method findById
   * @description 根据ID查找角色
   * @param id 角色ID
   * @param tenantId 租户ID
   * @returns {Promise<Role | null>} 角色实体或null
   */
  abstract findById(id: string, tenantId: string): Promise<Role | null>;

  /**
   * @method findByCode
   * @description 根据代码查找角色
   * @param code 角色代码
   * @param tenantId 租户ID
   * @returns {Promise<Role | null>} 角色实体或null
   */
  abstract findByCode(code: string, tenantId: string): Promise<Role | null>;

  /**
   * @method findByName
   * @description 根据名称查找角色
   * @param name 角色名称
   * @param tenantId 租户ID
   * @returns {Promise<Role | null>} 角色实体或null
   */
  abstract findByName(name: string, tenantId: string): Promise<Role | null>;

  /**
   * @method findByTenant
   * @description 查找租户下的所有角色
   * @param tenantId 租户ID
   * @returns {Promise<Role[]>} 角色列表
   */
  abstract findByTenant(tenantId: string): Promise<Role[]>;

  /**
   * @method findByOrganization
   * @description 查找组织下的角色
   * @param organizationId 组织ID
   * @param tenantId 租户ID
   * @returns {Promise<Role[]>} 角色列表
   */
  abstract findByOrganization(organizationId: string, tenantId: string): Promise<Role[]>;

  /**
   * @method findByUser
   * @description 查找用户拥有的角色
   * @param userId 用户ID
   * @param tenantId 租户ID
   * @returns {Promise<Role[]>} 角色列表
   */
  abstract findByUser(userId: string, tenantId: string): Promise<Role[]>;

  /**
   * @method findByPermission
   * @description 查找拥有指定权限的角色
   * @param permissionId 权限ID
   * @param tenantId 租户ID
   * @returns {Promise<Role[]>} 角色列表
   */
  abstract findByPermission(permissionId: string, tenantId: string): Promise<Role[]>;

  /**
   * @method findSystemRoles
   * @description 查找系统角色
   * @param tenantId 租户ID
   * @returns {Promise<Role[]>} 系统角色列表
   */
  abstract findSystemRoles(tenantId: string): Promise<Role[]>;

  /**
   * @method findDefaultRoles
   * @description 查找默认角色
   * @param tenantId 租户ID
   * @returns {Promise<Role[]>} 默认角色列表
   */
  abstract findDefaultRoles(tenantId: string): Promise<Role[]>;

  /**
   * @method findActiveRoles
   * @description 查找激活状态的角色
   * @param tenantId 租户ID
   * @returns {Promise<Role[]>} 激活角色列表
   */
  abstract findActiveRoles(tenantId: string): Promise<Role[]>;

  /**
   * @method findSuspendedRoles
   * @description 查找禁用状态的角色
   * @param tenantId 租户ID
   * @returns {Promise<Role[]>} 禁用角色列表
   */
  abstract findSuspendedRoles(tenantId: string): Promise<Role[]>;

  /**
   * @method findDeletedRoles
   * @description 查找已删除的角色
   * @param tenantId 租户ID
   * @returns {Promise<Role[]>} 已删除角色列表
   */
  abstract findDeletedRoles(tenantId: string): Promise<Role[]>;

  /**
   * @method findExpiredRoles
   * @description 查找已过期的角色
   * @param tenantId 租户ID
   * @returns {Promise<Role[]>} 已过期角色列表
   */
  abstract findExpiredRoles(tenantId: string): Promise<Role[]>;

  /**
   * @method findParentRoles
   * @description 查找父角色
   * @param roleId 角色ID
   * @param tenantId 租户ID
   * @returns {Promise<Role[]>} 父角色列表
   */
  abstract findParentRoles(roleId: string, tenantId: string): Promise<Role[]>;

  /**
   * @method findChildRoles
   * @description 查找子角色
   * @param roleId 角色ID
   * @param tenantId 租户ID
   * @returns {Promise<Role[]>} 子角色列表
   */
  abstract findChildRoles(roleId: string, tenantId: string): Promise<Role[]>;

  /**
   * @method findRolesByPriority
   * @description 根据优先级范围查找角色
   * @param minPriority 最小优先级
   * @param maxPriority 最大优先级
   * @param tenantId 租户ID
   * @returns {Promise<Role[]>} 角色列表
   */
  abstract findRolesByPriority(minPriority: number, maxPriority: number, tenantId: string): Promise<Role[]>;

  /**
   * @method findRolesWithUserCount
   * @description 查找角色及其用户数量
   * @param tenantId 租户ID
   * @returns {Promise<Array<{ role: Role; userCount: number }>>} 角色和用户数量列表
   */
  abstract findRolesWithUserCount(tenantId: string): Promise<Array<{ role: Role; userCount: number }>>;

  /**
   * @method findRolesWithPermissionCount
   * @description 查找角色及其权限数量
   * @param tenantId 租户ID
   * @returns {Promise<Array<{ role: Role; permissionCount: number }>>} 角色和权限数量列表
   */
  abstract findRolesWithPermissionCount(tenantId: string): Promise<Array<{ role: Role; permissionCount: number }>>;

  /**
   * @method save
   * @description 保存角色
   * @param role 角色实体
   * @returns {Promise<void>}
   */
  abstract save(role: Role): Promise<void>;

  /**
   * @method saveMany
   * @description 批量保存角色
   * @param roles 角色实体列表
   * @returns {Promise<void>}
   */
  abstract saveMany(roles: Role[]): Promise<void>;

  /**
   * @method delete
   * @description 删除角色
   * @param id 角色ID
   * @param tenantId 租户ID
   * @returns {Promise<void>}
   */
  abstract delete(id: string, tenantId: string): Promise<void>;

  /**
   * @method deleteMany
   * @description 批量删除角色
   * @param ids 角色ID列表
   * @param tenantId 租户ID
   * @returns {Promise<void>}
   */
  abstract deleteMany(ids: string[], tenantId: string): Promise<void>;

  /**
   * @method exists
   * @description 检查角色是否存在
   * @param id 角色ID
   * @param tenantId 租户ID
   * @returns {Promise<boolean>} 是否存在
   */
  abstract exists(id: string, tenantId: string): Promise<boolean>;

  /**
   * @method existsByCode
   * @description 检查角色代码是否存在
   * @param code 角色代码
   * @param tenantId 租户ID
   * @param excludeId 排除的角色ID，可选
   * @returns {Promise<boolean>} 是否存在
   */
  abstract existsByCode(code: string, tenantId: string, excludeId?: string): Promise<boolean>;

  /**
   * @method existsByName
   * @description 检查角色名称是否存在
   * @param name 角色名称
   * @param tenantId 租户ID
   * @param excludeId 排除的角色ID，可选
   * @returns {Promise<boolean>} 是否存在
   */
  abstract existsByName(name: string, tenantId: string, excludeId?: string): Promise<boolean>;

  /**
   * @method countByTenant
   * @description 统计租户下的角色数量
   * @param tenantId 租户ID
   * @returns {Promise<number>} 角色数量
   */
  abstract countByTenant(tenantId: string): Promise<number>;

  /**
   * @method countByOrganization
   * @description 统计组织下的角色数量
   * @param organizationId 组织ID
   * @param tenantId 租户ID
   * @returns {Promise<number>} 角色数量
   */
  abstract countByOrganization(organizationId: string, tenantId: string): Promise<number>;

  /**
   * @method countByUser
   * @description 统计用户拥有的角色数量
   * @param userId 用户ID
   * @param tenantId 租户ID
   * @returns {Promise<number>} 角色数量
   */
  abstract countByUser(userId: string, tenantId: string): Promise<number>;

  /**
   * @method countByPermission
   * @description 统计拥有指定权限的角色数量
   * @param permissionId 权限ID
   * @param tenantId 租户ID
   * @returns {Promise<number>} 角色数量
   */
  abstract countByPermission(permissionId: string, tenantId: string): Promise<number>;

  /**
   * @method countSystemRoles
   * @description 统计系统角色数量
   * @param tenantId 租户ID
   * @returns {Promise<number>} 系统角色数量
   */
  abstract countSystemRoles(tenantId: string): Promise<number>;

  /**
   * @method countDefaultRoles
   * @description 统计默认角色数量
   * @param tenantId 租户ID
   * @returns {Promise<number>} 默认角色数量
   */
  abstract countDefaultRoles(tenantId: string): Promise<number>;

  /**
   * @method countActiveRoles
   * @description 统计激活角色数量
   * @param tenantId 租户ID
   * @returns {Promise<number>} 激活角色数量
   */
  abstract countActiveRoles(tenantId: string): Promise<number>;

  /**
   * @method countSuspendedRoles
   * @description 统计禁用角色数量
   * @param tenantId 租户ID
   * @returns {Promise<number>} 禁用角色数量
   */
  abstract countSuspendedRoles(tenantId: string): Promise<number>;

  /**
   * @method countDeletedRoles
   * @description 统计已删除角色数量
   * @param tenantId 租户ID
   * @returns {Promise<number>} 已删除角色数量
   */
  abstract countDeletedRoles(tenantId: string): Promise<number>;

  /**
   * @method countExpiredRoles
   * @description 统计已过期角色数量
   * @param tenantId 租户ID
   * @returns {Promise<number>} 已过期角色数量
   */
  abstract countExpiredRoles(tenantId: string): Promise<number>;
} 
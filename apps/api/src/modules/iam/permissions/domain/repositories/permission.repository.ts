import { Permission } from '../entities/permission.entity';
import { PermissionType } from '../value-objects/permission-type.value-object';
import { PermissionStatus } from '../value-objects/permission-status.value-object';
import { PermissionAction } from '../value-objects/permission-action.value-object';

/**
 * @abstract PermissionRepository
 * @description
 * 权限仓储抽象类，定义权限数据访问的契约。
 * 支持多租户、条件查询、批量操作等高级功能。
 * 
 * 主要原理与机制：
 * 1. 定义权限数据访问的标准接口
 * 2. 支持多租户数据隔离
 * 3. 提供丰富的查询和操作方法
 * 4. 支持事务和批量操作
 */
export abstract class PermissionRepository {
  /**
   * @method save
   * @description 保存权限
   * @param permission 权限实体
   * @returns {Promise<Permission>} 保存后的权限
   */
  abstract save(permission: Permission): Promise<Permission>;

  /**
   * @method findById
   * @description 根据ID查找权限
   * @param id 权限ID
   * @param tenantId 租户ID
   * @returns {Promise<Permission | null>} 权限实体或null
   */
  abstract findById(id: string, tenantId: string): Promise<Permission | null>;

  /**
   * @method findByCode
   * @description 根据代码查找权限
   * @param code 权限代码
   * @param tenantId 租户ID
   * @returns {Promise<Permission | null>} 权限实体或null
   */
  abstract findByCode(code: string, tenantId: string): Promise<Permission | null>;

  /**
   * @method findByName
   * @description 根据名称查找权限
   * @param name 权限名称
   * @param tenantId 租户ID
   * @returns {Promise<Permission | null>} 权限实体或null
   */
  abstract findByName(name: string, tenantId: string): Promise<Permission | null>;

  /**
   * @method findByType
   * @description 根据类型查找权限列表
   * @param type 权限类型
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @returns {Promise<Permission[]>} 权限列表
   */
  abstract findByType(type: PermissionType, tenantId: string, organizationId?: string): Promise<Permission[]>;

  /**
   * @method findByStatus
   * @description 根据状态查找权限列表
   * @param status 权限状态
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @returns {Promise<Permission[]>} 权限列表
   */
  abstract findByStatus(status: PermissionStatus, tenantId: string, organizationId?: string): Promise<Permission[]>;

  /**
   * @method findByAction
   * @description 根据操作查找权限列表
   * @param action 权限操作
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @returns {Promise<Permission[]>} 权限列表
   */
  abstract findByAction(action: PermissionAction, tenantId: string, organizationId?: string): Promise<Permission[]>;

  /**
   * @method findByResource
   * @description 根据资源查找权限列表
   * @param resource 权限资源
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @returns {Promise<Permission[]>} 权限列表
   */
  abstract findByResource(resource: string, tenantId: string, organizationId?: string): Promise<Permission[]>;

  /**
   * @method findByModule
   * @description 根据模块查找权限列表
   * @param module 权限模块
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @returns {Promise<Permission[]>} 权限列表
   */
  abstract findByModule(module: string, tenantId: string, organizationId?: string): Promise<Permission[]>;

  /**
   * @method findByRoleId
   * @description 根据角色ID查找权限列表
   * @param roleId 角色ID
   * @param tenantId 租户ID
   * @returns {Promise<Permission[]>} 权限列表
   */
  abstract findByRoleId(roleId: string, tenantId: string): Promise<Permission[]>;

  /**
   * @method findByParentPermissionId
   * @description 根据父权限ID查找权限列表
   * @param parentPermissionId 父权限ID
   * @param tenantId 租户ID
   * @returns {Promise<Permission[]>} 权限列表
   */
  abstract findByParentPermissionId(parentPermissionId: string, tenantId: string): Promise<Permission[]>;

  /**
   * @method findSystemPermissions
   * @description 查找系统权限列表
   * @param tenantId 租户ID
   * @returns {Promise<Permission[]>} 系统权限列表
   */
  abstract findSystemPermissions(tenantId: string): Promise<Permission[]>;

  /**
   * @method findDefaultPermissions
   * @description 查找默认权限列表
   * @param tenantId 租户ID
   * @returns {Promise<Permission[]>} 默认权限列表
   */
  abstract findDefaultPermissions(tenantId: string): Promise<Permission[]>;

  /**
   * @method findExpiredPermissions
   * @description 查找过期权限列表
   * @param tenantId 租户ID
   * @returns {Promise<Permission[]>} 过期权限列表
   */
  abstract findExpiredPermissions(tenantId: string): Promise<Permission[]>;

  /**
   * @method findActivePermissions
   * @description 查找激活权限列表
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @returns {Promise<Permission[]>} 激活权限列表
   */
  abstract findActivePermissions(tenantId: string, organizationId?: string): Promise<Permission[]>;

  /**
   * @method findAll
   * @description 查找所有权限
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @param page 页码
   * @param limit 每页数量
   * @returns {Promise<{ permissions: Permission[]; total: number }>} 权限列表和总数
   */
  abstract findAll(tenantId: string, organizationId?: string, page?: number, limit?: number): Promise<{ permissions: Permission[]; total: number }>;

  /**
   * @method search
   * @description 搜索权限
   * @param query 搜索查询
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @param page 页码
   * @param limit 每页数量
   * @returns {Promise<{ permissions: Permission[]; total: number }>} 权限列表和总数
   */
  abstract search(query: string, tenantId: string, organizationId?: string, page?: number, limit?: number): Promise<{ permissions: Permission[]; total: number }>;

  /**
   * @method countByTenant
   * @description 统计租户权限数量
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @returns {Promise<number>} 权限数量
   */
  abstract countByTenant(tenantId: string, organizationId?: string): Promise<number>;

  /**
   * @method countByType
   * @description 统计指定类型的权限数量
   * @param type 权限类型
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @returns {Promise<number>} 权限数量
   */
  abstract countByType(type: PermissionType, tenantId: string, organizationId?: string): Promise<number>;

  /**
   * @method countByStatus
   * @description 统计指定状态的权限数量
   * @param status 权限状态
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @returns {Promise<number>} 权限数量
   */
  abstract countByStatus(status: PermissionStatus, tenantId: string, organizationId?: string): Promise<number>;

  /**
   * @method exists
   * @description 检查权限是否存在
   * @param id 权限ID
   * @param tenantId 租户ID
   * @returns {Promise<boolean>} 是否存在
   */
  abstract exists(id: string, tenantId: string): Promise<boolean>;

  /**
   * @method existsByCode
   * @description 检查权限代码是否存在
   * @param code 权限代码
   * @param tenantId 租户ID
   * @param excludeId 排除的权限ID
   * @returns {Promise<boolean>} 是否存在
   */
  abstract existsByCode(code: string, tenantId: string, excludeId?: string): Promise<boolean>;

  /**
   * @method existsByName
   * @description 检查权限名称是否存在
   * @param name 权限名称
   * @param tenantId 租户ID
   * @param excludeId 排除的权限ID
   * @returns {Promise<boolean>} 是否存在
   */
  abstract existsByName(name: string, tenantId: string, excludeId?: string): Promise<boolean>;

  /**
   * @method delete
   * @description 删除权限
   * @param id 权限ID
   * @param tenantId 租户ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  abstract delete(id: string, tenantId: string): Promise<boolean>;

  /**
   * @method deleteByTenant
   * @description 删除租户所有权限
   * @param tenantId 租户ID
   * @returns {Promise<number>} 删除的权限数量
   */
  abstract deleteByTenant(tenantId: string): Promise<number>;

  /**
   * @method deleteByOrganization
   * @description 删除组织所有权限
   * @param organizationId 组织ID
   * @param tenantId 租户ID
   * @returns {Promise<number>} 删除的权限数量
   */
  abstract deleteByOrganization(organizationId: string, tenantId: string): Promise<number>;

  /**
   * @method bulkSave
   * @description 批量保存权限
   * @param permissions 权限列表
   * @returns {Promise<Permission[]>} 保存后的权限列表
   */
  abstract bulkSave(permissions: Permission[]): Promise<Permission[]>;

  /**
   * @method bulkDelete
   * @description 批量删除权限
   * @param ids 权限ID列表
   * @param tenantId 租户ID
   * @returns {Promise<number>} 删除的权限数量
   */
  abstract bulkDelete(ids: string[], tenantId: string): Promise<number>;

  /**
   * @method findWithConditions
   * @description 查找有条件的权限
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @returns {Promise<Permission[]>} 权限列表
   */
  abstract findWithConditions(tenantId: string, organizationId?: string): Promise<Permission[]>;

  /**
   * @method findWithFields
   * @description 查找有字段限制的权限
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @returns {Promise<Permission[]>} 权限列表
   */
  abstract findWithFields(tenantId: string, organizationId?: string): Promise<Permission[]>;

  /**
   * @method findByTags
   * @description 根据标签查找权限
   * @param tags 标签数组
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @returns {Promise<Permission[]>} 权限列表
   */
  abstract findByTags(tags: string[], tenantId: string, organizationId?: string): Promise<Permission[]>;
} 
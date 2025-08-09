/**
 * @interface ITenantRepository
 * @description
 * 租户仓储接口，定义租户数据访问的抽象契约。该接口采用依赖倒置原则，
 * 确保领域层不依赖具体的数据访问实现，而是依赖抽象。
 *
 * 主要原理与机制：
 * 1. 数据访问抽象：定义租户数据的增删改查操作
 * 2. 多租户隔离：确保租户间数据隔离
 * 3. 查询优化：支持高效的查询操作
 * 4. 事务管理：支持事务性操作
 * 5. 缓存支持：支持缓存机制
 */
import type { Tenant } from '../entities/tenant.entity'
import type { TenantStatus } from '../entities/tenant.entity'
import type { TenantCode } from '../value-objects/tenant-code.vo'
import type { TenantName } from '../value-objects/tenant-name.vo'

export interface ITenantRepository {
  /**
   * @method save
   * @description 保存租户实体
   * @param tenant 租户实体
   * @returns Promise<Tenant> 保存后的租户实体
   */
  save(tenant: Tenant): Promise<Tenant>

  /**
   * @method findById
   * @description 根据ID查找租户
   * @param id 租户ID
   * @returns Promise<Tenant | null> 租户实体或null
   */
  findById(id: string): Promise<Tenant | null>

  /**
   * @method findByCode
   * @description 根据编码查找租户
   * @param code 租户编码
   * @returns Promise<Tenant | null> 租户实体或null
   */
  findByCode(code: TenantCode): Promise<Tenant | null>

  /**
   * @method findByName
   * @description 根据名称查找租户
   * @param name 租户名称
   * @returns Promise<Tenant | null> 租户实体或null
   */
  findByName(name: TenantName): Promise<Tenant | null>

  /**
   * @method findByStatus
   * @description 根据状态查找租户列表
   * @param status 租户状态
   * @returns Promise<Tenant[]> 租户实体列表
   */
  findByStatus(status: TenantStatus): Promise<Tenant[]>

  /**
   * @method findAll
   * @description 查找所有租户
   * @returns Promise<Tenant[]> 所有租户实体列表
   */
  findAll(): Promise<Tenant[]>

  /**
   * @method findWithPagination
   * @description 分页查找租户
   * @param page 页码
   * @param size 页大小
   * @param filters 过滤条件
   * @returns Promise<{tenants: Tenant[], total: number}> 分页结果
   */
  findWithPagination(
    page: number,
    size: number,
    filters?: {
      status?: TenantStatus
      search?: string
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    },
  ): Promise<{ tenants: Tenant[]; total: number }>

  /**
   * @method exists
   * @description 检查租户是否存在
   * @param id 租户ID
   * @returns Promise<boolean> 是否存在
   */
  exists(id: string): Promise<boolean>

  /**
   * @method existsByCode
   * @description 检查租户编码是否存在
   * @param code 租户编码
   * @returns Promise<boolean> 是否存在
   */
  existsByCode(code: TenantCode): Promise<boolean>

  /**
   * @method existsByName
   * @description 检查租户名称是否存在
   * @param name 租户名称
   * @returns Promise<boolean> 是否存在
   */
  existsByName(name: TenantName): Promise<boolean>

  /**
   * @method delete
   * @description 删除租户
   * @param id 租户ID
   * @returns Promise<void>
   */
  delete(id: string): Promise<void>

  /**
   * @method count
   * @description 统计租户数量
   * @param filters 过滤条件
   * @returns Promise<number> 租户数量
   */
  count(filters?: {
    status?: TenantStatus
    search?: string
  }): Promise<number>

  /**
   * @method findActiveTenants
   * @description 查找活跃租户
   * @returns Promise<Tenant[]> 活跃租户列表
   */
  findActiveTenants(): Promise<Tenant[]>

  /**
   * @method findPendingTenants
   * @description 查找待激活租户
   * @returns Promise<Tenant[]> 待激活租户列表
   */
  findPendingTenants(): Promise<Tenant[]>

  /**
   * @method findSuspendedTenants
   * @description 查找已禁用租户
   * @returns Promise<Tenant[]> 已禁用租户列表
   */
  findSuspendedTenants(): Promise<Tenant[]>

  /**
   * @method findDeletedTenants
   * @description 查找已删除租户
   * @returns Promise<Tenant[]> 已删除租户列表
   */
  findDeletedTenants(): Promise<Tenant[]>
}

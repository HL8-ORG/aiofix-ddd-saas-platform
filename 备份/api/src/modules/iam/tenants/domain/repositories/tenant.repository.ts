import type { Tenant } from '../entities/tenant.entity'
import type { TenantCode } from '../value-objects/tenant-code.value-object'
import type { TenantStatus } from '../value-objects/tenant-status.value-object'

/**
 * @abstract class TenantRepository
 * @description
 * 租户仓储抽象类，定义租户数据访问的抽象契约和通用实现。
 * 这是领域层的一部分，不依赖具体的数据访问技术。
 *
 * 主要原理与机制：
 * 1. 定义在领域层，遵循依赖倒置原则
 * 2. 使用领域对象作为参数和返回值
 * 3. 提供领域特定的查询方法
 * 4. 支持分页、排序、过滤等高级查询
 * 5. 定义事务边界和聚合根操作
 * 6. 包含通用实现和模板方法
 */
export abstract class TenantRepository {
  /**
   * @method save
   * @description 保存租户实体（创建或更新）
   * @param tenant 租户实体
   * @returns {Promise<Tenant>} 保存后的租户实体
   */
  abstract save(tenant: Tenant): Promise<Tenant>

  /**
   * @method findById
   * @description 根据ID查找租户
   * @param id 租户ID
   * @returns {Promise<Tenant | null>} 租户实体或null
   */
  abstract findById(id: string): Promise<Tenant | null>

  /**
   * @method findByCode
   * @description 根据租户编码查找租户
   * @param code 租户编码值对象
   * @returns {Promise<Tenant | null>} 租户实体或null
   */
  abstract findByCode(code: TenantCode): Promise<Tenant | null>

  /**
   * @method findByCodeString
   * @description 根据租户编码字符串查找租户
   * @param code 租户编码字符串
   * @returns {Promise<Tenant | null>} 租户实体或null
   */
  abstract findByCodeString(code: string): Promise<Tenant | null>

  /**
   * @method findByName
   * @description 根据租户名称查找租户
   * @param name 租户名称
   * @returns {Promise<Tenant[]>} 匹配的租户列表
   */
  abstract findByName(name: string): Promise<Tenant[]>

  /**
   * @method findByStatus
   * @description 根据状态查找租户
   * @param status 租户状态
   * @returns {Promise<Tenant[]>} 匹配的租户列表
   */
  abstract findByStatus(status: TenantStatus): Promise<Tenant[]>

  /**
   * @method findByAdminUserId
   * @description 根据管理员用户ID查找租户
   * @param adminUserId 管理员用户ID
   * @returns {Promise<Tenant[]>} 匹配的租户列表
   */
  abstract findByAdminUserId(adminUserId: string): Promise<Tenant[]>

  /**
   * @method findActive
   * @description 查找所有激活状态的租户
   * @returns {Promise<Tenant[]>} 激活状态的租户列表
   */
  abstract findActive(): Promise<Tenant[]>

  /**
   * @method findPending
   * @description 查找所有待激活状态的租户
   * @returns {Promise<Tenant[]>} 待激活状态的租户列表
   */
  abstract findPending(): Promise<Tenant[]>

  /**
   * @method findSuspended
   * @description 查找所有禁用状态的租户
   * @returns {Promise<Tenant[]>} 禁用状态的租户列表
   */
  abstract findSuspended(): Promise<Tenant[]>

  /**
   * @method findDeleted
   * @description 查找所有已删除的租户
   * @returns {Promise<Tenant[]>} 已删除的租户列表
   */
  abstract findDeleted(): Promise<Tenant[]>

  /**
   * @method findAll
   * @description 查找所有租户（不包括已删除的）
   * @returns {Promise<Tenant[]>} 所有租户列表
   */
  abstract findAll(): Promise<Tenant[]>

  /**
   * @method findAllWithDeleted
   * @description 查找所有租户（包括已删除的）
   * @returns {Promise<Tenant[]>} 所有租户列表
   */
  abstract findAllWithDeleted(): Promise<Tenant[]>

  /**
   * @method exists
   * @description 检查租户是否存在
   * @param id 租户ID
   * @returns {Promise<boolean>} 如果存在返回true，否则返回false
   */
  abstract exists(id: string): Promise<boolean>

  /**
   * @method existsByCode
   * @description 检查租户编码是否已存在
   * @param code 租户编码值对象
   * @returns {Promise<boolean>} 如果存在返回true，否则返回false
   */
  abstract existsByCode(code: TenantCode): Promise<boolean>

  /**
   * @method existsByCodeString
   * @description 检查租户编码字符串是否已存在
   * @param code 租户编码字符串
   * @returns {Promise<boolean>} 如果存在返回true，否则返回false
   */
  abstract existsByCodeString(code: string): Promise<boolean>

  /**
   * @method count
   * @description 统计租户数量
   * @returns {Promise<number>} 租户数量
   */
  abstract count(): Promise<number>

  /**
   * @method countByStatus
   * @description 根据状态统计租户数量
   * @param status 租户状态
   * @returns {Promise<number>} 指定状态的租户数量
   */
  abstract countByStatus(status: TenantStatus): Promise<number>

  /**
   * @method delete
   * @description 删除租户（软删除）
   * @param id 租户ID
   * @returns {Promise<boolean>} 如果删除成功返回true，否则返回false
   */
  abstract delete(id: string): Promise<boolean>

  /**
   * @method hardDelete
   * @description 硬删除租户（物理删除）
   * @param id 租户ID
   * @returns {Promise<boolean>} 如果删除成功返回true，否则返回false
   */
  abstract hardDelete(id: string): Promise<boolean>

  /**
   * @method restore
   * @description 恢复已删除的租户
   * @param id 租户ID
   * @returns {Promise<boolean>} 如果恢复成功返回true，否则返回false
   */
  abstract restore(id: string): Promise<boolean>

  /**
   * @method updateStatus
   * @description 更新租户状态
   * @param id 租户ID
   * @param status 新状态
   * @returns {Promise<boolean>} 如果更新成功返回true，否则返回false
   */
  abstract updateStatus(id: string, status: TenantStatus): Promise<boolean>

  /**
   * @method updateSettings
   * @description 更新租户配置
   * @param id 租户ID
   * @param settings 新配置
   * @returns {Promise<boolean>} 如果更新成功返回true，否则返回false
   */
  abstract updateSettings(
    id: string,
    settings: Record<string, any>,
  ): Promise<boolean>

  /**
   * @method findWithPagination
   * @description 分页查询租户
   * @param page 页码（从1开始）
   * @param limit 每页数量
   * @param filters 过滤条件
   * @param sort 排序条件
   * @returns {Promise<{ tenants: Tenant[], total: number, page: number, limit: number }>} 分页结果
   */
  abstract findWithPagination(
    page: number,
    limit: number,
    filters?: {
      status?: TenantStatus
      adminUserId?: string
      search?: string
    },
    sort?: {
      field: 'name' | 'code' | 'status' | 'createdAt' | 'updatedAt'
      order: 'asc' | 'desc'
    },
  ): Promise<{
    tenants: Tenant[]
    total: number
    page: number
    limit: number
    totalPages: number
  }>

  /**
   * @method findBySearch
   * @description 根据搜索条件查找租户
   * @param search 搜索关键词
   * @param limit 限制返回数量
   * @returns {Promise<Tenant[]>} 匹配的租户列表
   */
  abstract findBySearch(search: string, limit?: number): Promise<Tenant[]>

  /**
   * @method findRecent
   * @description 查找最近创建的租户
   * @param limit 限制返回数量
   * @returns {Promise<Tenant[]>} 最近创建的租户列表
   */
  abstract findRecent(limit?: number): Promise<Tenant[]>

  /**
   * @method findByDateRange
   * @description 根据创建时间范围查找租户
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns {Promise<Tenant[]>} 匹配的租户列表
   */
  abstract findByDateRange(startDate: Date, endDate: Date): Promise<Tenant[]>
}

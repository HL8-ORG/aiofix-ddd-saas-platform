import type { User } from '../entities/user.entity'
import type { Email } from '../value-objects/email.value-object'
import type { Phone } from '../value-objects/phone.value-object'
import type { UserStatusValue } from '../value-objects/user-status.value-object'
import type { Username } from '../value-objects/username.value-object'

/**
 * @abstract class UserRepository
 * @description
 * 用户仓储抽象类，定义用户数据访问的抽象契约和通用实现。
 * 这是领域层的一部分，不依赖具体的数据访问技术。
 *
 * 主要原理与机制：
 * 1. 定义在领域层，遵循依赖倒置原则
 * 2. 使用领域对象作为参数和返回值
 * 3. 提供领域特定的查询方法
 * 4. 支持分页、排序、过滤等高级查询
 * 5. 定义事务边界和聚合根操作
 * 6. 包含通用实现和模板方法
 * 7. 以租户ID为标识，实现数据软隔离
 */
export abstract class UserRepository {
  /**
   * @method save
   * @description 保存用户实体（创建或更新）
   * @param user 用户实体
   * @returns {Promise<User>} 保存后的用户实体
   */
  abstract save(user: User): Promise<User>

  /**
   * @method findById
   * @description 根据ID查找用户
   * @param id 用户ID
   * @param tenantId 租户ID（用于数据隔离）
   * @returns {Promise<User | null>} 用户实体或null
   */
  abstract findById(id: string, tenantId: string): Promise<User | null>

  /**
   * @method findByUsername
   * @description 根据用户名查找用户
   * @param username 用户名值对象
   * @param tenantId 租户ID（用于数据隔离）
   * @returns {Promise<User | null>} 用户实体或null
   */
  abstract findByUsername(
    username: Username,
    tenantId: string,
  ): Promise<User | null>

  /**
   * @method findByUsernameString
   * @description 根据用户名字符串查找用户
   * @param username 用户名字符串
   * @param tenantId 租户ID（用于数据隔离）
   * @returns {Promise<User | null>} 用户实体或null
   */
  abstract findByUsernameString(
    username: string,
    tenantId: string,
  ): Promise<User | null>

  /**
   * @method findByEmail
   * @description 根据邮箱查找用户
   * @param email 邮箱值对象
   * @param tenantId 租户ID（用于数据隔离）
   * @returns {Promise<User | null>} 用户实体或null
   */
  abstract findByEmail(email: Email, tenantId: string): Promise<User | null>

  /**
   * @method findByEmailString
   * @description 根据邮箱字符串查找用户
   * @param email 邮箱字符串
   * @param tenantId 租户ID（用于数据隔离）
   * @returns {Promise<User | null>} 用户实体或null
   */
  abstract findByEmailString(
    email: string,
    tenantId: string,
  ): Promise<User | null>

  /**
   * @method findByPhone
   * @description 根据手机号查找用户
   * @param phone 手机号值对象
   * @param tenantId 租户ID（用于数据隔离）
   * @returns {Promise<User | null>} 用户实体或null
   */
  abstract findByPhone(phone: Phone, tenantId: string): Promise<User | null>

  /**
   * @method findByPhoneString
   * @description 根据手机号字符串查找用户
   * @param phone 手机号字符串
   * @param tenantId 租户ID（用于数据隔离）
   * @returns {Promise<User | null>} 用户实体或null
   */
  abstract findByPhoneString(
    phone: string,
    tenantId: string,
  ): Promise<User | null>

  /**
   * @method findByIds
   * @description 根据ID列表批量查找用户
   * @param ids 用户ID列表
   * @param tenantId 租户ID（用于数据隔离）
   * @returns {Promise<User[]>} 用户实体列表
   */
  abstract findByIds(ids: string[], tenantId: string): Promise<User[]>

  /**
   * @method findByOrganizationId
   * @description 根据组织ID查找用户
   * @param organizationId 组织ID
   * @param tenantId 租户ID（用于数据隔离）
   * @returns {Promise<User[]>} 匹配的用户列表
   */
  abstract findByOrganizationId(
    organizationId: string,
    tenantId: string,
  ): Promise<User[]>

  /**
   * @method findByRoleId
   * @description 根据角色ID查找用户
   * @param roleId 角色ID
   * @param tenantId 租户ID（用于数据隔离）
   * @returns {Promise<User[]>} 匹配的用户列表
   */
  abstract findByRoleId(roleId: string, tenantId: string): Promise<User[]>

  /**
   * @method findByStatus
   * @description 根据状态查找用户
   * @param status 用户状态
   * @param tenantId 租户ID（用于数据隔离）
   * @returns {Promise<User[]>} 匹配的用户列表
   */
  abstract findByStatus(
    status: UserStatusValue,
    tenantId: string,
  ): Promise<User[]>

  /**
   * @method findByAdminUserId
   * @description 根据管理员用户ID查找用户
   * @param adminUserId 管理员用户ID
   * @param tenantId 租户ID（用于数据隔离）
   * @returns {Promise<User[]>} 匹配的用户列表
   */
  abstract findByAdminUserId(
    adminUserId: string,
    tenantId: string,
  ): Promise<User[]>

  /**
   * @method findActive
   * @description 查找所有激活状态的用户
   * @param tenantId 租户ID（用于数据隔离）
   * @returns {Promise<User[]>} 激活状态的用户列表
   */
  abstract findActive(tenantId: string): Promise<User[]>

  /**
   * @method findPending
   * @description 查找所有待激活状态的用户
   * @param tenantId 租户ID（用于数据隔离）
   * @returns {Promise<User[]>} 待激活状态的用户列表
   */
  abstract findPending(tenantId: string): Promise<User[]>

  /**
   * @method findSuspended
   * @description 查找所有禁用状态的用户
   * @param tenantId 租户ID（用于数据隔离）
   * @returns {Promise<User[]>} 禁用状态的用户列表
   */
  abstract findSuspended(tenantId: string): Promise<User[]>

  /**
   * @method findDeleted
   * @description 查找所有已删除的用户
   * @param tenantId 租户ID（用于数据隔离）
   * @returns {Promise<User[]>} 已删除的用户列表
   */
  abstract findDeleted(tenantId: string): Promise<User[]>

  /**
   * @method findAll
   * @description 查找所有用户（不包括已删除的）
   * @param tenantId 租户ID（用于数据隔离）
   * @returns {Promise<User[]>} 所有用户列表
   */
  abstract findAll(tenantId: string): Promise<User[]>

  /**
   * @method findAllWithDeleted
   * @description 查找所有用户（包括已删除的）
   * @param tenantId 租户ID（用于数据隔离）
   * @returns {Promise<User[]>} 所有用户列表
   */
  abstract findAllWithDeleted(tenantId: string): Promise<User[]>

  /**
   * @method exists
   * @description 检查用户是否存在
   * @param id 用户ID
   * @param tenantId 租户ID（用于数据隔离）
   * @returns {Promise<boolean>} 如果存在返回true，否则返回false
   */
  abstract exists(id: string, tenantId: string): Promise<boolean>

  /**
   * @method existsByUsername
   * @description 检查用户名是否已存在
   * @param username 用户名值对象
   * @param tenantId 租户ID（用于数据隔离）
   * @param excludeId 排除的用户ID（用于更新时检查）
   * @returns {Promise<boolean>} 如果存在返回true，否则返回false
   */
  abstract existsByUsername(
    username: Username,
    tenantId: string,
    excludeId?: string,
  ): Promise<boolean>

  /**
   * @method existsByUsernameString
   * @description 检查用户名字符串是否已存在
   * @param username 用户名字符串
   * @param tenantId 租户ID（用于数据隔离）
   * @param excludeId 排除的用户ID（用于更新时检查）
   * @returns {Promise<boolean>} 如果存在返回true，否则返回false
   */
  abstract existsByUsernameString(
    username: string,
    tenantId: string,
    excludeId?: string,
  ): Promise<boolean>

  /**
   * @method existsByEmail
   * @description 检查邮箱是否已存在
   * @param email 邮箱值对象
   * @param tenantId 租户ID（用于数据隔离）
   * @param excludeId 排除的用户ID（用于更新时检查）
   * @returns {Promise<boolean>} 如果存在返回true，否则返回false
   */
  abstract existsByEmail(
    email: Email,
    tenantId: string,
    excludeId?: string,
  ): Promise<boolean>

  /**
   * @method existsByEmailString
   * @description 检查邮箱字符串是否已存在
   * @param email 邮箱字符串
   * @param tenantId 租户ID（用于数据隔离）
   * @param excludeId 排除的用户ID（用于更新时检查）
   * @returns {Promise<boolean>} 如果存在返回true，否则返回false
   */
  abstract existsByEmailString(
    email: string,
    tenantId: string,
    excludeId?: string,
  ): Promise<boolean>

  /**
   * @method existsByPhone
   * @description 检查手机号是否已存在
   * @param phone 手机号值对象
   * @param tenantId 租户ID（用于数据隔离）
   * @param excludeId 排除的用户ID（用于更新时检查）
   * @returns {Promise<boolean>} 如果存在返回true，否则返回false
   */
  abstract existsByPhone(
    phone: Phone,
    tenantId: string,
    excludeId?: string,
  ): Promise<boolean>

  /**
   * @method existsByPhoneString
   * @description 检查手机号字符串是否已存在
   * @param phone 手机号字符串
   * @param tenantId 租户ID（用于数据隔离）
   * @param excludeId 排除的用户ID（用于更新时检查）
   * @returns {Promise<boolean>} 如果存在返回true，否则返回false
   */
  abstract existsByPhoneString(
    phone: string,
    tenantId: string,
    excludeId?: string,
  ): Promise<boolean>

  /**
   * @method count
   * @description 统计用户数量
   * @param tenantId 租户ID（用于数据隔离）
   * @returns {Promise<number>} 用户数量
   */
  abstract count(tenantId: string): Promise<number>

  /**
   * @method countByStatus
   * @description 根据状态统计用户数量
   * @param status 用户状态
   * @param tenantId 租户ID（用于数据隔离）
   * @returns {Promise<number>} 指定状态的用户数量
   */
  abstract countByStatus(
    status: UserStatusValue,
    tenantId: string,
  ): Promise<number>

  /**
   * @method delete
   * @description 删除用户（软删除）
   * @param id 用户ID
   * @param tenantId 租户ID（用于数据隔离）
   * @returns {Promise<boolean>} 如果删除成功返回true，否则返回false
   */
  abstract delete(id: string, tenantId: string): Promise<boolean>

  /**
   * @method hardDelete
   * @description 硬删除用户（物理删除）
   * @param id 用户ID
   * @param tenantId 租户ID（用于数据隔离）
   * @returns {Promise<boolean>} 如果删除成功返回true，否则返回false
   */
  abstract hardDelete(id: string, tenantId: string): Promise<boolean>

  /**
   * @method restore
   * @description 恢复已删除的用户
   * @param id 用户ID
   * @param tenantId 租户ID（用于数据隔离）
   * @returns {Promise<boolean>} 如果恢复成功返回true，否则返回false
   */
  abstract restore(id: string, tenantId: string): Promise<boolean>

  /**
   * @method updateStatus
   * @description 更新用户状态
   * @param id 用户ID
   * @param status 新状态
   * @param tenantId 租户ID（用于数据隔离）
   * @returns {Promise<boolean>} 如果更新成功返回true，否则返回false
   */
  abstract updateStatus(
    id: string,
    status: UserStatusValue,
    tenantId: string,
  ): Promise<boolean>

  /**
   * @method findWithPagination
   * @description 分页查询用户
   * @param page 页码（从1开始）
   * @param limit 每页数量
   * @param tenantId 租户ID（用于数据隔离）
   * @param filters 过滤条件
   * @param sort 排序条件
   * @returns {Promise<{ users: User[], total: number, page: number, limit: number }>} 分页结果
   */
  abstract findWithPagination(
    page: number,
    limit: number,
    tenantId: string,
    filters?: {
      status?: UserStatusValue
      organizationId?: string
      roleId?: string
      adminUserId?: string
      search?: string
    },
    sort?: {
      field:
        | 'username'
        | 'email'
        | 'firstName'
        | 'lastName'
        | 'status'
        | 'createdAt'
        | 'updatedAt'
      order: 'asc' | 'desc'
    },
  ): Promise<{
    users: User[]
    total: number
    page: number
    limit: number
    totalPages: number
  }>

  /**
   * @method findBySearch
   * @description 根据搜索条件查找用户
   * @param search 搜索关键词
   * @param tenantId 租户ID（用于数据隔离）
   * @param limit 限制返回数量
   * @returns {Promise<User[]>} 匹配的用户列表
   */
  abstract findBySearch(
    search: string,
    tenantId: string,
    limit?: number,
  ): Promise<User[]>

  /**
   * @method findRecent
   * @description 查找最近创建的用户
   * @param tenantId 租户ID（用于数据隔离）
   * @param limit 限制返回数量
   * @returns {Promise<User[]>} 最近创建的用户列表
   */
  abstract findRecent(tenantId: string, limit?: number): Promise<User[]>

  /**
   * @method findByDateRange
   * @description 根据创建时间范围查找用户
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @param tenantId 租户ID（用于数据隔离）
   * @returns {Promise<User[]>} 匹配的用户列表
   */
  abstract findByDateRange(
    startDate: Date,
    endDate: Date,
    tenantId: string,
  ): Promise<User[]>

  /**
   * @method findLocked
   * @description 查找被锁定的用户
   * @param tenantId 租户ID（用于数据隔离）
   * @returns {Promise<User[]>} 被锁定的用户列表
   */
  abstract findLocked(tenantId: string): Promise<User[]>

  /**
   * @method findWithFailedLoginAttempts
   * @description 查找登录失败次数超过阈值的用户
   * @param threshold 失败次数阈值
   * @param tenantId 租户ID（用于数据隔离）
   * @returns {Promise<User[]>} 符合条件的用户列表
   */
  abstract findWithFailedLoginAttempts(
    threshold: number,
    tenantId: string,
  ): Promise<User[]>

  // ==================== 统计相关方法 ====================

  /**
   * @method getActiveUserCount
   * @description 获取活跃用户数量
   * @param tenantId 租户ID（用于数据隔离）
   * @returns {Promise<number>} 活跃用户数量
   */
  abstract getActiveUserCount(tenantId: string): Promise<number>

  /**
   * @method getNewUserCount
   * @description 获取指定天数内的新用户数量
   * @param tenantId 租户ID（用于数据隔离）
   * @param days 天数
   * @returns {Promise<number>} 新用户数量
   */
  abstract getNewUserCount(tenantId: string, days: number): Promise<number>

  /**
   * @method getDeletedUserCount
   * @description 获取指定天数内的删除用户数量
   * @param tenantId 租户ID（用于数据隔离）
   * @param days 天数
   * @returns {Promise<number>} 删除用户数量
   */
  abstract getDeletedUserCount(tenantId: string, days: number): Promise<number>

  /**
   * @method countByOrganization
   * @description 按组织统计用户数量
   * @param tenantId 租户ID（用于数据隔离）
   * @returns {Promise<Record<string, number>>} 组织用户数量映射
   */
  abstract countByOrganization(
    tenantId: string,
  ): Promise<Record<string, number>>

  /**
   * @method countByRole
   * @description 按角色统计用户数量
   * @param tenantId 租户ID（用于数据隔离）
   * @returns {Promise<Record<string, number>>} 角色用户数量映射
   */
  abstract countByRole(tenantId: string): Promise<Record<string, number>>

  /**
   * @method countByDateRange
   * @description 按日期范围统计用户数量
   * @param tenantId 租户ID（用于数据隔离）
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns {Promise<Record<string, number>>} 日期用户数量映射
   */
  abstract countByDateRange(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Record<string, number>>

  /**
   * @method countByTenant
   * @description 按租户统计用户数量
   * @param tenantIds 租户ID列表
   * @returns {Promise<Record<string, { totalUsers: number; activeUsers: number; newUsers: number }>>} 租户用户统计映射
   */
  abstract countByTenant(
    tenantIds: string[],
  ): Promise<
    Record<
      string,
      { totalUsers: number; activeUsers: number; newUsers: number }
    >
  >
}

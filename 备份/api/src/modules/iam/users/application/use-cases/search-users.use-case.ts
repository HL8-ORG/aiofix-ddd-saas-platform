import type { User } from '@/modules/iam/users/domain/entities/user.entity'
import type { UserRepository } from '@/modules/iam/users/domain/repositories/user.repository'
import { Injectable } from '@nestjs/common'

/**
 * @class SearchUsersUseCase
 * @description
 * 搜索用户用例，实现用户搜索的具体业务逻辑。
 *
 * 主要原理与机制：
 * 1. 遵循Clean Architecture的Use Case模式
 * 2. 协调领域对象和基础设施服务
 * 3. 实现具体的业务用例逻辑
 * 4. 处理搜索条件和结果过滤
 * 5. 提供清晰的接口边界
 */
@Injectable()
export class SearchUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * @method execute
   * @description 执行搜索用户用例
   *
   * @param searchTerm - 搜索关键词
   * @param tenantId - 租户ID
   * @param page - 页码
   * @param limit - 每页数量
   * @param filters - 过滤条件
   * @returns 搜索结果
   */
  async execute(
    searchTerm: string,
    tenantId: string,
    page = 1,
    limit = 10,
    filters?: {
      status?: string
      organizationId?: string
      roleId?: string
    },
  ): Promise<{
    users: User[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    return await this.userRepository.findWithPagination(page, limit, tenantId, {
      search: searchTerm,
      status: filters?.status as any,
      organizationId: filters?.organizationId,
      roleId: filters?.roleId,
    })
  }

  /**
   * @method executeByUsername
   * @description 根据用户名搜索用户
   *
   * @param username - 用户名关键词
   * @param tenantId - 租户ID
   * @param limit - 限制返回数量
   * @returns 用户列表
   */
  async executeByUsername(
    username: string,
    tenantId: string,
    limit = 10,
  ): Promise<User[]> {
    // 使用模糊搜索查找用户名包含关键词的用户
    const allUsers = await this.userRepository.findAll(tenantId)
    const filteredUsers = allUsers.filter((user) =>
      user.username.getValue().toLowerCase().includes(username.toLowerCase()),
    )

    return filteredUsers.slice(0, limit)
  }

  /**
   * @method executeByEmail
   * @description 根据邮箱搜索用户
   *
   * @param email - 邮箱关键词
   * @param tenantId - 租户ID
   * @param limit - 限制返回数量
   * @returns 用户列表
   */
  async executeByEmail(
    email: string,
    tenantId: string,
    limit = 10,
  ): Promise<User[]> {
    // 使用模糊搜索查找邮箱包含关键词的用户
    const allUsers = await this.userRepository.findAll(tenantId)
    const filteredUsers = allUsers.filter((user) =>
      user.email.getValue().toLowerCase().includes(email.toLowerCase()),
    )

    return filteredUsers.slice(0, limit)
  }

  /**
   * @method executeByPhone
   * @description 根据手机号搜索用户
   *
   * @param phone - 手机号关键词
   * @param tenantId - 租户ID
   * @param limit - 限制返回数量
   * @returns 用户列表
   */
  async executeByPhone(
    phone: string,
    tenantId: string,
    limit = 10,
  ): Promise<User[]> {
    // 使用模糊搜索查找手机号包含关键词的用户
    const allUsers = await this.userRepository.findAll(tenantId)
    const filteredUsers = allUsers.filter(
      (user) => user.phone && user.phone.getValue().includes(phone),
    )

    return filteredUsers.slice(0, limit)
  }

  /**
   * @method executeByDisplayName
   * @description 根据显示名称搜索用户
   *
   * @param displayName - 显示名称关键词
   * @param tenantId - 租户ID
   * @param limit - 限制返回数量
   * @returns 用户列表
   */
  async executeByDisplayName(
    displayName: string,
    tenantId: string,
    limit = 10,
  ): Promise<User[]> {
    // 使用模糊搜索查找显示名称包含关键词的用户
    const allUsers = await this.userRepository.findAll(tenantId)
    const filteredUsers = allUsers.filter(
      (user) =>
        user.displayName &&
        user.displayName.toLowerCase().includes(displayName.toLowerCase()),
    )

    return filteredUsers.slice(0, limit)
  }

  /**
   * @method executeAdvancedSearch
   * @description 高级搜索用户
   *
   * @param searchCriteria - 搜索条件
   * @param tenantId - 租户ID
   * @param page - 页码
   * @param limit - 每页数量
   * @returns 搜索结果
   */
  async executeAdvancedSearch(
    searchCriteria: {
      keyword?: string
      status?: string
      organizationId?: string
      roleId?: string
      dateRange?: {
        startDate: Date
        endDate: Date
      }
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    },
    tenantId: string,
    page = 1,
    limit = 10,
  ): Promise<{
    users: User[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    return await this.userRepository.findWithPagination(
      page,
      limit,
      tenantId,
      {
        search: searchCriteria.keyword,
        status: searchCriteria.status as any,
        organizationId: searchCriteria.organizationId,
        roleId: searchCriteria.roleId,
      },
      searchCriteria.sortBy && searchCriteria.sortOrder
        ? {
            field: searchCriteria.sortBy as any,
            order: searchCriteria.sortOrder,
          }
        : undefined,
    )
  }

  /**
   * @method executeGetRecentUsers
   * @description 获取最近创建的用户
   *
   * @param tenantId - 租户ID
   * @param limit - 限制返回数量
   * @returns 用户列表
   */
  async executeGetRecentUsers(tenantId: string, limit = 10): Promise<User[]> {
    return await this.userRepository.findRecent(tenantId, limit)
  }

  /**
   * @method executeGetUsersByDateRange
   * @description 根据创建时间范围获取用户
   *
   * @param startDate - 开始日期
   * @param endDate - 结束日期
   * @param tenantId - 租户ID
   * @returns 用户列表
   */
  async executeGetUsersByDateRange(
    startDate: Date,
    endDate: Date,
    tenantId: string,
  ): Promise<User[]> {
    return await this.userRepository.findByDateRange(
      startDate,
      endDate,
      tenantId,
    )
  }

  /**
   * @method executeGetLockedUsers
   * @description 获取被锁定的用户
   *
   * @param tenantId - 租户ID
   * @returns 用户列表
   */
  async executeGetLockedUsers(tenantId: string): Promise<User[]> {
    return await this.userRepository.findLocked(tenantId)
  }

  /**
   * @method executeGetUsersWithFailedLoginAttempts
   * @description 获取登录失败次数超过阈值的用户
   *
   * @param threshold - 失败次数阈值
   * @param tenantId - 租户ID
   * @returns 用户列表
   */
  async executeGetUsersWithFailedLoginAttempts(
    threshold: number,
    tenantId: string,
  ): Promise<User[]> {
    return await this.userRepository.findWithFailedLoginAttempts(
      threshold,
      tenantId,
    )
  }

  /**
   * @method executeGetUserSuggestions
   * @description 获取用户建议（用于自动完成）
   *
   * @param query - 查询关键词
   * @param tenantId - 租户ID
   * @param limit - 限制返回数量
   * @returns 用户建议列表
   */
  async executeGetUserSuggestions(
    query: string,
    tenantId: string,
    limit = 5,
  ): Promise<
    Array<{ id: string; username: string; displayName: string; email: string }>
  > {
    const users = await this.userRepository.findBySearch(query, tenantId, limit)

    return users.map((user) => ({
      id: user.id,
      username: user.username.getValue(),
      displayName: user.displayName || `${user.firstName} ${user.lastName}`,
      email: user.email.getValue(),
    }))
  }

  /**
   * @method executeSearchByUsername
   * @description 根据用户名搜索用户
   */
  async executeSearchByUsername(
    username: string,
    tenantId: string,
  ): Promise<User[]> {
    const user = await this.userRepository.findByUsernameString(
      username,
      tenantId,
    )
    return user ? [user] : []
  }

  /**
   * @method executeSearchByEmail
   * @description 根据邮箱搜索用户
   */
  async executeSearchByEmail(email: string, tenantId: string): Promise<User[]> {
    const user = await this.userRepository.findByEmailString(email, tenantId)
    return user ? [user] : []
  }

  /**
   * @method executeSearchByPhone
   * @description 根据手机号搜索用户
   */
  async executeSearchByPhone(phone: string, tenantId: string): Promise<User[]> {
    const user = await this.userRepository.findByPhoneString(phone, tenantId)
    return user ? [user] : []
  }

  /**
   * @method executeSearchByOrganization
   * @description 根据组织搜索用户
   */
  async executeSearchByOrganization(
    organizationId: string,
    tenantId: string,
  ): Promise<User[]> {
    return await this.userRepository.findByOrganizationId(
      organizationId,
      tenantId,
    )
  }

  /**
   * @method executeSearchByRole
   * @description 根据角色搜索用户
   */
  async executeSearchByRole(roleId: string, tenantId: string): Promise<User[]> {
    return await this.userRepository.findByRoleId(roleId, tenantId)
  }
}

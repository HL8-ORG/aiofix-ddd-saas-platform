import { Inject, Injectable } from '@nestjs/common'
import type { User } from '../domain/entities/user.entity'
import type { UserRepository } from '../domain/repositories/user.repository'
import type { AssignRoleToUserUseCase } from './use-cases/assign-role-to-user.use-case'
import type { AssignUserToOrganizationUseCase } from './use-cases/assign-user-to-organization.use-case'
import type { CreateUserUseCase } from './use-cases/create-user.use-case'
import type { DeleteUserUseCase } from './use-cases/delete-user.use-case'
import type { GetUserStatisticsUseCase } from './use-cases/get-user-statistics.use-case'
import type { GetUserUseCase } from './use-cases/get-user.use-case'
import type { GetUsersUseCase } from './use-cases/get-users.use-case'
import type { SearchUsersUseCase } from './use-cases/search-users.use-case'
import type { UpdateUserStatusUseCase } from './use-cases/update-user-status.use-case'
import type { UpdateUserUseCase } from './use-cases/update-user.use-case'

/**
 * @class UsersService
 * @description
 * 用户应用服务，负责协调各个use cases完成业务用例。
 * 这是应用层的核心服务，连接表现层和use cases层。
 */
@Injectable()
export class UsersService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly updateUserStatusUseCase: UpdateUserStatusUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly assignUserToOrganizationUseCase: AssignUserToOrganizationUseCase,
    private readonly assignRoleToUserUseCase: AssignRoleToUserUseCase,
    private readonly searchUsersUseCase: SearchUsersUseCase,
    private readonly getUserStatisticsUseCase: GetUserStatisticsUseCase,
  ) {}

  /**
   * @method createUser
   * @description 创建新用户
   */
  async createUser(
    username: string,
    email: string,
    firstName: string,
    lastName: string,
    tenantId: string,
    adminUserId: string,
    passwordHash: string,
    phone?: string,
    displayName?: string,
    avatar?: string,
    organizationIds?: string[],
    roleIds?: string[],
    preferences?: Record<string, unknown>,
  ): Promise<User> {
    return await this.createUserUseCase.execute(
      {
        username,
        email,
        firstName,
        lastName,
        passwordHash,
        phone,
        displayName,
        avatar,
        organizationIds,
        roleIds,
        preferences,
      },
      tenantId,
      adminUserId,
    )
  }

  /**
   * @method getUserById
   * @description 根据ID获取用户
   */
  async getUserById(id: string, tenantId: string): Promise<User> {
    return await this.getUserUseCase.execute(id, tenantId)
  }

  /**
   * @method getUserByUsername
   * @description 根据用户名获取用户
   */
  async getUserByUsername(username: string, tenantId: string): Promise<User> {
    return await this.getUserUseCase.executeByUsername(username, tenantId)
  }

  /**
   * @method getUserByEmail
   * @description 根据邮箱获取用户
   */
  async getUserByEmail(email: string, tenantId: string): Promise<User> {
    return await this.getUserUseCase.executeByEmail(email, tenantId)
  }

  /**
   * @method getAllUsers
   * @description 获取所有用户
   */
  async getAllUsers(tenantId: string): Promise<User[]> {
    return await this.getUsersUseCase.executeAllUsers(tenantId)
  }

  /**
   * @method getActiveUsers
   * @description 获取所有激活状态的用户
   */
  async getActiveUsers(tenantId: string): Promise<User[]> {
    return await this.getUsersUseCase.executeActiveUsers(tenantId)
  }

  /**
   * @method getUsersWithPagination
   * @description 分页获取用户列表
   */
  async getUsersWithPagination(
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
    return await this.getUsersUseCase.execute(tenantId, page, limit)
  }

  /**
   * @method activateUser
   * @description 激活用户
   */
  async activateUser(
    id: string,
    tenantId: string,
    adminUserId: string,
  ): Promise<User> {
    return await this.updateUserStatusUseCase.executeActivate(
      id,
      tenantId,
      adminUserId,
    )
  }

  /**
   * @method suspendUser
   * @description 禁用用户
   */
  async suspendUser(
    id: string,
    tenantId: string,
    adminUserId: string,
    reason: string,
  ): Promise<User> {
    return await this.updateUserStatusUseCase.executeSuspend(
      id,
      tenantId,
      adminUserId,
      reason,
    )
  }

  /**
   * @method updateUserInfo
   * @description 更新用户基本信息
   */
  async updateUserInfo(
    id: string,
    tenantId: string,
    firstName: string,
    lastName: string,
    displayName?: string,
    avatar?: string,
  ): Promise<User> {
    return await this.updateUserUseCase.execute(
      id,
      {
        firstName,
        lastName,
        displayName,
        avatar,
      },
      tenantId,
    )
  }

  /**
   * @method updateUserContactInfo
   * @description 更新用户联系信息
   */
  async updateUserContactInfo(
    id: string,
    tenantId: string,
    email: string,
    phone?: string,
  ): Promise<User> {
    const updateData: { email: string; phone?: string } = { email }
    if (phone) {
      updateData.phone = phone
    }
    return await this.updateUserUseCase.execute(id, updateData, tenantId)
  }

  /**
   * @method deleteUser
   * @description 删除用户（软删除）
   */
  async deleteUser(
    id: string,
    tenantId: string,
    adminUserId: string,
  ): Promise<boolean> {
    return await this.deleteUserUseCase.execute(id, tenantId, adminUserId)
  }

  /**
   * @method restoreUser
   * @description 恢复已删除的用户
   */
  async restoreUser(
    id: string,
    tenantId: string,
    adminUserId: string,
  ): Promise<boolean> {
    return await this.deleteUserUseCase.executeRestore(
      id,
      tenantId,
      adminUserId,
    )
  }

  /**
   * @method assignUserToOrganization
   * @description 将用户分配到组织
   */
  async assignUserToOrganization(
    id: string,
    tenantId: string,
    organizationId: string,
    adminUserId: string,
  ): Promise<User> {
    return await this.assignUserToOrganizationUseCase.execute(
      id,
      organizationId,
      tenantId,
      adminUserId,
    )
  }

  /**
   * @method removeUserFromOrganization
   * @description 从组织移除用户
   */
  async removeUserFromOrganization(
    id: string,
    tenantId: string,
    organizationId: string,
    adminUserId: string,
  ): Promise<User> {
    return await this.assignUserToOrganizationUseCase.executeRemoveFromOrganization(
      id,
      organizationId,
      tenantId,
      adminUserId,
    )
  }

  /**
   * @method assignRoleToUser
   * @description 为用户分配角色
   */
  async assignRoleToUser(
    id: string,
    tenantId: string,
    roleId: string,
    adminUserId: string,
  ): Promise<User> {
    return await this.assignRoleToUserUseCase.execute(
      id,
      roleId,
      tenantId,
      adminUserId,
    )
  }

  /**
   * @method removeRoleFromUser
   * @description 移除用户角色
   */
  async removeRoleFromUser(
    id: string,
    tenantId: string,
    roleId: string,
    adminUserId: string,
  ): Promise<User> {
    return await this.assignRoleToUserUseCase.executeRemoveRole(
      id,
      roleId,
      tenantId,
      adminUserId,
    )
  }

  /**
   * @method searchUsers
   * @description 搜索用户
   */
  async searchUsers(
    searchTerm: string,
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
    return await this.searchUsersUseCase.execute(
      searchTerm,
      tenantId,
      page,
      limit,
    )
  }

  /**
   * @method searchUsersAdvanced
   * @description 高级搜索用户
   */
  async searchUsersAdvanced(
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
    return await this.searchUsersUseCase.executeAdvancedSearch(
      searchCriteria,
      tenantId,
      page,
      limit,
    )
  }

  /**
   * @method getUserSuggestions
   * @description 获取用户建议（用于自动完成）
   */
  async getUserSuggestions(
    query: string,
    tenantId: string,
    limit = 5,
  ): Promise<
    Array<{ id: string; username: string; displayName: string; email: string }>
  > {
    return await this.searchUsersUseCase.executeGetUserSuggestions(
      query,
      tenantId,
      limit,
    )
  }

  /**
   * @method getUsersByOrganization
   * @description 获取组织下的所有用户
   */
  async getUsersByOrganization(
    organizationId: string,
    tenantId: string,
  ): Promise<User[]> {
    return await this.assignUserToOrganizationUseCase.executeGetUsersByOrganization(
      organizationId,
      tenantId,
    )
  }

  /**
   * @method getUsersByRole
   * @description 获取拥有指定角色的所有用户
   */
  async getUsersByRole(roleId: string, tenantId: string): Promise<User[]> {
    return await this.assignRoleToUserUseCase.executeGetUsersByRole(
      roleId,
      tenantId,
    )
  }

  /**
   * @method getUserOrganizations
   * @description 获取用户所属的所有组织
   */
  async getUserOrganizations(
    userId: string,
    tenantId: string,
  ): Promise<string[]> {
    return await this.assignUserToOrganizationUseCase.executeGetUserOrganizations(
      userId,
      tenantId,
    )
  }

  /**
   * @method getUserRoles
   * @description 获取用户的所有角色
   */
  async getUserRoles(userId: string, tenantId: string): Promise<string[]> {
    return await this.assignRoleToUserUseCase.executeGetUserRoles(
      userId,
      tenantId,
    )
  }

  /**
   * @method getUserStatistics
   * @description 获取用户统计信息
   */
  async getUserStatistics(tenantId: string) {
    return await this.getUserStatisticsUseCase.execute(tenantId)
  }

  /**
   * @method getUserStatisticsByStatus
   * @description 获取按状态分组的用户统计
   */
  async getUserStatisticsByStatus(tenantId: string) {
    return await this.getUserStatisticsUseCase.executeByStatus(tenantId)
  }

  /**
   * @method getUserStatisticsByOrganization
   * @description 获取按组织分组的用户统计
   */
  async getUserStatisticsByOrganization(tenantId: string) {
    return await this.getUserStatisticsUseCase.executeByOrganization(tenantId)
  }

  /**
   * @method getUserStatisticsByRole
   * @description 获取按角色分组的用户统计
   */
  async getUserStatisticsByRole(tenantId: string) {
    return await this.getUserStatisticsUseCase.executeByRole(tenantId)
  }
}

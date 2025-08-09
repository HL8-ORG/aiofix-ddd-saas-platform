import type { User } from '@/modules/iam/users/domain/entities/user.entity'
import type { UserRepository } from '@/modules/iam/users/domain/repositories/user.repository'
import {
  UserStatus,
  type UserStatusValue,
} from '@/modules/iam/users/domain/value-objects/user-status.value-object'
import { Injectable } from '@nestjs/common'

/**
 * @class GetUsersUseCase
 * @description
 * 获取用户列表用例，实现用户查询的具体业务逻辑。
 *
 * 主要原理与机制：
 * 1. 遵循Clean Architecture的Use Case模式
 * 2. 协调领域对象和基础设施服务
 * 3. 实现具体的业务用例逻辑
 * 4. 处理查询过滤和分页
 * 5. 提供清晰的接口边界
 */
@Injectable()
export class GetUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * @method execute
   * @description 执行获取用户列表用例
   *
   * @param tenantId - 租户ID
   * @param page - 页码
   * @param limit - 每页数量
   * @param filters - 过滤条件
   * @param sort - 排序条件
   * @returns 用户列表和分页信息
   */
  async execute(
    tenantId: string,
    page = 1,
    limit = 10,
    filters?: {
      status?: UserStatusValue
      organizationId?: string
      roleId?: string
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
  }> {
    // 根据过滤条件获取用户
    let users: User[] = []

    if (filters?.search) {
      // 搜索用户
      const searchResult = await this.userRepository.findWithPagination(
        page,
        limit,
        tenantId,
        { search: filters.search },
      )
      return searchResult
    } else if (filters?.status) {
      // 根据状态过滤
      switch (filters.status.getValue()) {
        case UserStatus.ACTIVE:
          users = await this.userRepository.findActive(tenantId)
          break
        case UserStatus.SUSPENDED:
          users = await this.userRepository.findSuspended(tenantId)
          break
        case UserStatus.DELETED:
          users = await this.userRepository.findDeleted(tenantId)
          break
        default:
          users = await this.userRepository.findAll(tenantId)
      }
    } else if (filters?.organizationId) {
      // 根据组织过滤
      users = await this.userRepository.findByOrganizationId(
        filters.organizationId,
        tenantId,
      )
    } else if (filters?.roleId) {
      // 根据角色过滤
      users = await this.userRepository.findByRoleId(filters.roleId, tenantId)
    } else {
      // 获取所有用户
      users = await this.userRepository.findAll(tenantId)
    }

    // 确保users是数组
    const safeUsers = users || []

    // 计算总数和分页信息
    const total = safeUsers.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedUsers = safeUsers.slice(startIndex, endIndex)

    return {
      users: paginatedUsers,
      total,
      page,
      limit,
      totalPages,
    }
  }

  /**
   * @method executeActiveUsers
   * @description 获取活跃用户列表
   *
   * @param tenantId - 租户ID
   * @returns 活跃用户列表
   */
  async executeActiveUsers(tenantId: string): Promise<User[]> {
    return await this.userRepository.findActive(tenantId)
  }

  /**
   * @method executeAllUsers
   * @description 获取所有用户列表
   *
   * @param tenantId - 租户ID
   * @returns 所有用户列表
   */
  async executeAllUsers(tenantId: string): Promise<User[]> {
    return await this.userRepository.findAll(tenantId)
  }
}

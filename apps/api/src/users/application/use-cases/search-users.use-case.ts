/**
 * @class SearchUsersUseCase
 * @description 搜索用户用例，实现应用层业务逻辑
 */
import { Injectable, Inject } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { SearchUsersQuery, type SearchUsersResult } from '../queries/search-users.query'
import type { UserRepository } from '../../domain/repositories/user.repository.interface'
import type { User } from '../../domain/entities/user.entity'

@Injectable()
export class SearchUsersUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
  ) { }

  async execute(query: SearchUsersQuery): Promise<SearchUsersResult> {
    try {
      this.logger.log(
        `开始执行搜索用户用例: tenantId=${query.tenantId}, searchTerm=${query.searchTerm || '无'}`,
        'SearchUsersUseCase',
      )

      query.validate()

      // 构建搜索条件
      const searchCriteria = this.buildSearchCriteria(query)

      // 执行搜索（这里需要根据实际的仓储接口实现）
      const { users, total } = await this.searchUsers(query.tenantId, searchCriteria, query)

      // 构建用户信息列表
      const userList = this.buildUserList(users, false)

      // 构建分页信息
      const pagination = this.buildPagination(query.page!, query.size!, total)

      this.logger.log(
        `搜索用户用例执行成功: tenantId=${query.tenantId}, found=${total}, users=${userList.length}`,
        'SearchUsersUseCase',
      )

      return {
        success: true,
        users: userList,
        pagination,
      }
    } catch (error) {
      this.logger.error(
        `搜索用户用例执行失败: ${(error as Error).message}`,
        (error as Error).stack,
        'SearchUsersUseCase',
      )

      return {
        success: false,
        users: [],
        pagination: {
          page: query.page || 1,
          size: query.size || 20,
          total: 0,
          totalPages: 0,
        },
        error: (error as Error).message,
      }
    }
  }

  private buildSearchCriteria(query: SearchUsersQuery): any {
    const criteria: any = {
      tenantId: query.tenantId,
      includeDeleted: query.includeDeleted,
    }

    if (query.searchTerm) {
      criteria.searchTerm = query.searchTerm
    }

    if (query.status) {
      criteria.status = query.status
    }

    if (query.organizationId) {
      criteria.organizationId = query.organizationId
    }

    if (query.roleId) {
      criteria.roleId = query.roleId
    }

    return criteria
  }

  private async searchUsers(
    tenantId: string,
    criteria: any,
    query: SearchUsersQuery,
  ): Promise<{ users: User[]; total: number }> {
    // 构建查询选项
    const options = {
      limit: query.size,
      offset: (query.page! - 1) * query.size!,
      sortBy: (query.sortBy as 'createdAt' | 'updatedAt' | 'username' | 'email') || 'createdAt',
      sortOrder: query.sortOrder || 'desc',
      search: criteria.searchTerm,
      includeDeleted: criteria.includeDeleted,
    }

    // 根据状态过滤
    if (criteria.status) {
      const users = await this.userRepository.findUsersByStatus(criteria.status, tenantId, options) || []
      const total = await this.userRepository.count(tenantId, { status: criteria.status, includeDeleted: criteria.includeDeleted }) || 0
      return { users, total }
    }

    // 默认查询所有用户
    const users = await this.userRepository.findUsersForTenant(tenantId, options) || []
    const total = await this.userRepository.count(tenantId, { includeDeleted: criteria.includeDeleted }) || 0
    return { users, total }
  }

  private buildUserList(users: User[], includeSensitiveData: boolean = false): any[] {
    if (!users || !Array.isArray(users)) {
      return []
    }

    return users.map(user => ({
      id: user.getId().getValue(),
      email: user.getEmail().getValue(),
      username: user.getUsername().getValue(),
      firstName: user.getFirstName(),
      lastName: user.getLastName(),
      displayName: user.getDisplayName(),
      avatar: user.getAvatar(),
      phone: user.getPhoneNumber()?.getValue(),
      status: user.getStatus().getValue(),
      emailVerified: user.isEmailVerified(),
      phoneVerified: user.isPhoneVerified(),
      twoFactorEnabled: user.isTwoFactorEnabled(),
      lastLoginAt: user.getLastLoginAt(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    }))
  }

  private buildPagination(page: number, size: number, total: number): any {
    return {
      page,
      size,
      total,
      totalPages: Math.ceil(total / size),
    }
  }
}

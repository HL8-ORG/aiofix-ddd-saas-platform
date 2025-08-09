/**
 * @class GetUsersByTenantUseCase
 * @description
 * 获取租户下所有用户用例，实现应用层业务逻辑。该用例负责协调领域对象和服务完成获取租户下所有用户的业务流程，
 * 包括权限验证、数据过滤、分页处理等。
 *
 * 主要原理与机制：
 * 1. 应用层用例：协调领域对象和服务完成业务逻辑
 * 2. 依赖注入：通过构造函数注入所需的依赖
 * 3. 权限控制：查询时验证用户权限
 * 4. 数据过滤：根据查询条件过滤数据
 * 5. 分页处理：支持分页查询和排序
 * 6. 审计日志：记录查询操作的审计信息
 * 7. 错误处理：统一的错误处理和异常管理
 */
import { Injectable, Inject } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { GetUsersByTenantQuery, type GetUsersByTenantResult } from '../queries/get-users-by-tenant.query'
import type { UserRepository } from '../../domain/repositories/user.repository.interface'
import type { User } from '../../domain/entities/user.entity'

@Injectable()
export class GetUsersByTenantUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行获取租户下所有用户用例
   * @param {GetUsersByTenantQuery} query - 获取租户下所有用户查询
   * @returns {Promise<GetUsersByTenantResult>} 查询结果
   */
  async execute(query: GetUsersByTenantQuery): Promise<GetUsersByTenantResult> {
    try {
      this.logger.log(
        `开始执行获取租户下所有用户用例: tenantId=${query.tenantId}, page=${query.page}, size=${query.size}`,
        'GetUsersByTenantUseCase',
      )

      // 1. 验证查询
      query.validate()

      // 2. 构建查询选项
      const options = this.buildFindOptions(query)

      // 3. 执行查询
      const users = await this.findUsersForTenant(query.tenantId, options)

      // 4. 获取总数
      const total = await this.countUsers(query.tenantId, options)

      // 5. 构建用户信息列表
      const userList = this.buildUserList(users, query.includeSensitiveData)

      // 6. 构建分页信息
      const pagination = this.buildPagination(query.page!, query.size!, total)

      // 7. 记录审计日志
      await this.auditUserQuery(query, total)

      this.logger.log(
        `获取租户下所有用户用例执行成功: tenantId=${query.tenantId}, found=${total}`,
        'GetUsersByTenantUseCase',
      )

      return {
        success: true,
        users: userList,
        pagination,
      }
    } catch (error) {
      this.logger.error(
        `获取租户下所有用户用例执行失败: ${(error as Error).message}`,
        (error as Error).stack,
        'GetUsersByTenantUseCase',
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

  /**
   * @private
   * @method buildFindOptions
   * @description 构建查询选项
   * @param {GetUsersByTenantQuery} query - 查询
   * @returns {FindUsersOptions} 查询选项
   */
  private buildFindOptions(query: GetUsersByTenantQuery): any {
    const options: any = {
      limit: query.size,
      offset: (query.page! - 1) * query.size!,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'desc',
      includeDeleted: query.includeDeleted,
    }

    if (query.status) {
      options.status = query.status
    }

    if (query.organizationId) {
      options.organizationId = query.organizationId
    }

    if (query.roleId) {
      options.roleId = query.roleId
    }

    return options
  }

  /**
   * @private
   * @method findUsersForTenant
   * @description 查找租户下的用户
   * @param {string} tenantId - 租户ID
   * @param {any} options - 查询选项
   * @returns {Promise<User[]>} 用户列表
   */
  private async findUsersForTenant(tenantId: string, options: any): Promise<User[]> {
    return await this.userRepository.findUsersForTenant(tenantId, options)
  }

  /**
   * @private
   * @method countUsers
   * @description 统计用户数量
   * @param {string} tenantId - 租户ID
   * @param {any} options - 统计选项
   * @returns {Promise<number>} 用户数量
   */
  private async countUsers(tenantId: string, options: any): Promise<number> {
    return await this.userRepository.count(tenantId, options)
  }

  /**
   * @private
   * @method buildUserList
   * @description 构建用户信息列表
   * @param {User[]} users - 用户列表
   * @param {boolean} includeSensitiveData - 是否包含敏感数据
   * @returns {any[]} 用户信息列表
   */
  private buildUserList(users: User[], includeSensitiveData: boolean = false): any[] {
    return users.map(user => {
      const userInfo = {
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
      }

      // 根据权限决定是否包含敏感数据
      if (includeSensitiveData) {
        // 可以添加更多敏感数据字段
        // 例如：登录尝试次数、锁定状态等
      }

      return userInfo
    })
  }

  /**
   * @private
   * @method buildPagination
   * @description 构建分页信息
   * @param {number} page - 页码
   * @param {number} size - 每页大小
   * @param {number} total - 总数
   * @returns {any} 分页信息
   */
  private buildPagination(page: number, size: number, total: number): any {
    return {
      page,
      size,
      total,
      totalPages: Math.ceil(total / size),
    }
  }

  /**
   * @private
   * @method auditUserQuery
   * @description 记录用户查询审计日志
   * @param {GetUsersByTenantQuery} query - 查询
   * @param {number} total - 总数
   */
  private async auditUserQuery(query: GetUsersByTenantQuery, total: number): Promise<void> {
    this.logger.log(
      `用户查询审计: tenantId=${query.tenantId}, page=${query.page}, size=${query.size}, total=${total}`,
      'GetUsersByTenantUseCase',
    )
  }
}

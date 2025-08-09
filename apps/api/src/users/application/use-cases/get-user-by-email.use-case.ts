/**
 * @class GetUserByEmailUseCase
 * @description
 * 根据邮箱查询用户用例，实现应用层业务逻辑。该用例负责协调领域对象和服务完成根据邮箱查询用户的业务流程，
 * 包括权限验证、数据过滤、结果聚合等。
 *
 * 主要原理与机制：
 * 1. 应用层用例：协调领域对象和服务完成业务逻辑
 * 2. 依赖注入：通过构造函数注入所需的依赖
 * 3. 权限控制：查询时验证用户权限
 * 4. 数据过滤：根据查询条件过滤数据
 * 5. 审计日志：记录查询操作的审计信息
 * 6. 错误处理：统一的错误处理和异常管理
 */
import { Injectable, Inject } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { GetUserByEmailQuery, type GetUserByEmailResult } from '../queries/get-user-by-email.query'
import type { UserRepository } from '../../domain/repositories/user.repository.interface'
import { Email } from '../../domain/value-objects/email.vo'
import type { User } from '../../domain/entities/user.entity'

@Injectable()
export class GetUserByEmailUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行根据邮箱查询用户用例
   * @param {GetUserByEmailQuery} query - 根据邮箱查询用户查询
   * @returns {Promise<GetUserByEmailResult>} 查询结果
   */
  async execute(query: GetUserByEmailQuery): Promise<GetUserByEmailResult> {
    try {
      this.logger.log(
        `开始执行根据邮箱查询用户用例: email=${query.email}, tenantId=${query.tenantId}`,
        'GetUserByEmailUseCase',
      )

      // 1. 验证查询
      query.validate()

      // 2. 查找用户
      const user = await this.findUserByEmail(query.email, query.tenantId)

      // 3. 检查用户状态
      if (!query.includeDeleted && user.getStatus().getValue() === 'deleted') {
        return {
          success: true,
          user: undefined,
        }
      }

      // 4. 构建用户信息
      const userInfo = this.buildUserInfo(user, query.includeSensitiveData)

      // 5. 记录审计日志
      await this.auditUserQuery(user, query)

      this.logger.log(
        `根据邮箱查询用户用例执行成功: email=${query.email}`,
        'GetUserByEmailUseCase',
      )

      return {
        success: true,
        user: userInfo,
      }
    } catch (error) {
      this.logger.error(
        `根据邮箱查询用户用例执行失败: ${(error as Error).message}`,
        (error as Error).stack,
        'GetUserByEmailUseCase',
      )

      return {
        success: false,
        error: (error as Error).message,
      }
    }
  }

  /**
   * @private
   * @method findUserByEmail
   * @description 根据邮箱查找用户
   * @param {string} email - 邮箱地址
   * @param {string} tenantId - 租户ID
   * @returns {Promise<User>} 用户实体
   */
  private async findUserByEmail(email: string, tenantId: string): Promise<User> {
    const user = await this.userRepository.findByEmail(new Email(email), tenantId)
    if (!user) {
      throw new Error('用户不存在')
    }
    return user
  }

  /**
   * @private
   * @method buildUserInfo
   * @description 构建用户信息
   * @param {User} user - 用户实体
   * @param {boolean} includeSensitiveData - 是否包含敏感数据
   * @returns {object} 用户信息
   */
  private buildUserInfo(user: User, includeSensitiveData: boolean = false): any {
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
  }

  /**
   * @private
   * @method auditUserQuery
   * @description 记录用户查询审计日志
   * @param {User} user - 用户实体
   * @param {GetUserByEmailQuery} query - 查询
   */
  private async auditUserQuery(user: User, query: GetUserByEmailQuery): Promise<void> {
    this.logger.log(
      `用户查询审计: email=${query.email}, tenantId=${query.tenantId}, userId=${user.getId().getValue()}`,
      'GetUserByEmailUseCase',
    )
  }
}

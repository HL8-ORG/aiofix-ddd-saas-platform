/**
 * @class GetUserProfileUseCase
 * @description
 * 获取用户资料用例，实现应用层业务逻辑。该用例负责协调领域对象和服务完成获取用户资料的业务流程，
 * 包括权限验证、数据过滤、敏感信息处理等。
 *
 * 主要原理与机制：
 * 1. 应用层用例：协调领域对象和服务完成业务逻辑
 * 2. 依赖注入：通过构造函数注入所需的依赖
 * 3. 权限控制：查询时验证用户权限
 * 4. 数据过滤：根据权限过滤敏感信息
 * 5. 审计日志：记录查询操作的审计信息
 * 6. 错误处理：统一的错误处理和异常管理
 */
import { Injectable, Inject } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { GetUserProfileQuery, type GetUserProfileResult } from '../queries/get-user-profile.query'
import type { UserRepository } from '../../domain/repositories/user.repository.interface'
import { UserId } from '../../domain/value-objects/user-id.vo'
import type { User } from '../../domain/entities/user.entity'

@Injectable()
export class GetUserProfileUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行获取用户资料用例
   * @param {GetUserProfileQuery} query - 获取用户资料查询
   * @returns {Promise<GetUserProfileResult>} 查询结果
   */
  async execute(query: GetUserProfileQuery): Promise<GetUserProfileResult> {
    try {
      this.logger.log(
        `开始执行获取用户资料用例: userId=${query.userId}, tenantId=${query.tenantId}`,
        'GetUserProfileUseCase',
      )

      // 1. 验证查询
      query.validate()

      // 2. 查找用户
      const user = await this.findUser(query.userId, query.tenantId)

      // 3. 验证用户状态
      await this.validateUserStatus(user)

      // 4. 构建用户资料
      const userProfile = this.buildUserProfile(user, query.includeSensitiveData)

      // 5. 记录审计日志
      await this.auditUserProfileQuery(user, query)

      this.logger.log(
        `获取用户资料用例执行成功: userId=${query.userId}`,
        'GetUserProfileUseCase',
      )

      return {
        success: true,
        userProfile,
      }
    } catch (error) {
      this.logger.error(
        `获取用户资料用例执行失败: ${(error as Error).message}`,
        (error as Error).stack,
        'GetUserProfileUseCase',
      )

      return {
        success: false,
        userProfile: null,
        error: (error as Error).message,
      }
    }
  }

  /**
   * @private
   * @method findUser
   * @description 查找用户
   * @param {string} userId - 用户ID
   * @param {string} tenantId - 租户ID
   * @returns {Promise<User>} 用户实体
   */
  private async findUser(userId: string, tenantId: string): Promise<User> {
    const user = await this.userRepository.findById(new UserId(userId), tenantId)
    if (!user) {
      throw new Error('用户不存在')
    }
    return user
  }

  /**
   * @private
   * @method validateUserStatus
   * @description 验证用户状态
   * @param {User} user - 用户实体
   */
  private async validateUserStatus(user: User): Promise<void> {
    if (user.getStatus().isDeleted()) {
      throw new Error('已删除的用户无法获取资料')
    }
  }

  /**
   * @private
   * @method buildUserProfile
   * @description 构建用户资料
   * @param {User} user - 用户实体
   * @param {boolean} includeSensitiveData - 是否包含敏感数据
   * @returns {any} 用户资料
   */
  private buildUserProfile(user: User, includeSensitiveData: boolean = false): any {
    const userProfile = {
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
      preferences: user.getPreferences(),
    }

    // 根据权限决定是否包含敏感数据
    if (includeSensitiveData) {
      // 添加敏感数据字段
      Object.assign(userProfile, {
        loginAttempts: user.getLoginAttempts(),
        lockedUntil: user.getLockedUntil(),
        passwordChangedAt: user.getPasswordChangedAt(),
        twoFactorSecret: user.getTwoFactorSecret(),
      })
    }

    return userProfile
  }

  /**
   * @private
   * @method auditUserProfileQuery
   * @description 记录用户资料查询审计日志
   * @param {User} user - 用户实体
   * @param {GetUserProfileQuery} query - 查询
   */
  private async auditUserProfileQuery(user: User, query: GetUserProfileQuery): Promise<void> {
    this.logger.log(
      `用户资料查询审计: userId=${user.getId().getValue()}, tenantId=${query.tenantId}, includeSensitiveData=${query.includeSensitiveData}`,
      'GetUserProfileUseCase',
    )
  }
}

/**
 * @class GetUserByIdUseCase
 * @description
 * 根据用户ID获取用户用例，实现认证模块中的用户信息查询业务逻辑。该用例负责
 * 根据用户ID查询用户信息，支持敏感数据过滤，并返回用户基本信息。
 *
 * 主要原理与机制：
 * 1. 用例模式：封装特定的业务逻辑，提供清晰的接口
 * 2. 依赖注入：通过构造函数注入必要的依赖服务
 * 3. 数据过滤：根据权限和配置过滤敏感数据
 * 4. 错误处理：统一的异常处理和错误响应
 * 5. 审计日志：记录用户信息查询操作
 * 6. 缓存策略：优化查询性能，减少数据库访问
 */
import { Injectable } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { GetUserByIdQuery } from '../queries/get-user-by-id.query'
import type { UserRepository } from '../../domain/repositories/user.repository.interface'
import type { AuditService } from '../../domain/services/interfaces/audit.service.interface'

export interface GetUserByIdUseCaseResult {
  success: boolean
  user?: {
    id: string
    email: string
    username: string
    firstName?: string
    lastName?: string
    status: string
    isEmailVerified: boolean
    isPhoneVerified: boolean
    createdAt: Date
    updatedAt: Date
    lastLoginAt?: Date
    twoFactorEnabled: boolean
    twoFactorMethod?: string
  }
  error?: string
}

/**
 * @class GetUserByIdUseCase
 * @description 根据用户ID获取用户用例
 */
@Injectable()
export class GetUserByIdUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly auditService: AuditService,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行根据用户ID获取用户用例
   * @param {GetUserByIdQuery} query - 查询参数
   * @returns {Promise<GetUserByIdUseCaseResult>} 用例执行结果
   */
  async execute(query: GetUserByIdQuery): Promise<GetUserByIdUseCaseResult> {
    try {
      this.logger.log('开始执行根据用户ID获取用户用例', {
        userId: query.userId,
        tenantId: query.tenantId,
        includeSensitiveData: query.includeSensitiveData,
      })

      // 1. 验证查询参数
      this.validateQuery(query)

      // 2. 查询用户信息
      const user = await this.userRepository.findById(query.userId, query.tenantId)

      if (!user) {
        this.logger.warn('用户不存在', {
          userId: query.userId,
          tenantId: query.tenantId,
        })

        return {
          success: false,
          error: '用户不存在',
        }
      }

      // 3. 检查用户状态
      if (user.isDeleted()) {
        this.logger.warn('用户已删除', {
          userId: query.userId,
          tenantId: query.tenantId,
        })

        return {
          success: false,
          error: '用户已删除',
        }
      }

      // 4. 构建用户信息
      const userInfo = this.buildUserInfo(user, query.includeSensitiveData)

      // 5. 记录审计日志
      await this.auditService.log({
        action: 'GET_USER_BY_ID',
        userId: query.userId,
        tenantId: query.tenantId,
        details: {
          requestedBy: query.requesterId,
          includeSensitiveData: query.includeSensitiveData,
        },
      })

      this.logger.log('根据用户ID获取用户用例执行成功', {
        userId: query.userId,
        tenantId: query.tenantId,
        userStatus: user.getStatus().value,
      })

      return {
        success: true,
        user: userInfo,
      }
    } catch (error) {
      this.logger.error('根据用户ID获取用户用例执行失败', {
        error: (error as Error).message,
        userId: query.userId,
        tenantId: query.tenantId,
      })

      return {
        success: false,
        error: (error as Error).message,
      }
    }
  }

  /**
   * @method validateQuery
   * @description 验证查询参数
   * @param {GetUserByIdQuery} query - 查询参数
   */
  private validateQuery(query: GetUserByIdQuery): void {
    if (!query.userId || typeof query.userId !== 'string') {
      throw new Error('用户ID不能为空')
    }

    if (!query.tenantId || typeof query.tenantId !== 'string') {
      throw new Error('租户ID不能为空')
    }

    // UUID v4格式验证
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(query.userId)) {
      throw new Error('用户ID必须是有效的UUID v4格式')
    }

    if (!uuidRegex.test(query.tenantId)) {
      throw new Error('租户ID必须是有效的UUID v4格式')
    }
  }

  /**
   * @method buildUserInfo
   * @description 构建用户信息
   * @param {User} user - 用户实体
   * @param {boolean} includeSensitiveData - 是否包含敏感数据
   * @returns {object} 用户信息
   */
  private buildUserInfo(user: any, includeSensitiveData: boolean): any {
    const userInfo: any = {
      id: user.getId().value,
      email: user.getEmail().value,
      username: user.getUsername().value,
      status: user.getStatus().value,
      isEmailVerified: user.isEmailVerified(),
      isPhoneVerified: user.isPhoneVerified(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
      twoFactorEnabled: user.isTwoFactorEnabled(),
    }

    // 添加可选字段
    if (user.getFirstName()) {
      userInfo.firstName = user.getFirstName().value
    }

    if (user.getLastName()) {
      userInfo.lastName = user.getLastName().value
    }

    if (user.getLastLoginAt()) {
      userInfo.lastLoginAt = user.getLastLoginAt()
    }

    if (user.isTwoFactorEnabled() && includeSensitiveData) {
      userInfo.twoFactorMethod = user.getTwoFactorMethod()
    }

    return userInfo
  }
}

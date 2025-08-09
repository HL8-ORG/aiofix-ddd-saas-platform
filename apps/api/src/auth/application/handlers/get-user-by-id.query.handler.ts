/**
 * @class GetUserByIdQueryHandler
 * @description
 * 根据用户ID获取用户查询处理器，实现CQRS模式中的查询处理逻辑。该处理器负责
 * 接收根据用户ID获取用户查询，协调用例执行，并返回处理结果。
 *
 * 主要原理与机制：
 * 1. CQRS模式：将命令和查询职责分离，查询处理器负责数据检索
 * 2. 查询处理器模式：专门处理特定类型的查询
 * 3. 依赖注入：通过构造函数注入必要的依赖服务
 * 4. 缓存策略：优化查询性能，减少数据库访问
 * 5. 安全策略：集成访问控制和数据保护
 * 6. 审计日志：记录查询操作的审计信息
 */
import { Injectable } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { GetUserByIdQuery } from '../queries/get-user-by-id.query'
import { GetUserByIdUseCase } from '../use-cases/get-user-by-id.use-case'

export interface GetUserByIdQueryResult {
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
 * @class GetUserByIdQueryHandler
 * @description 根据用户ID获取用户查询处理器
 * @implements {IQueryHandler<GetUserByIdQuery, GetUserByIdQueryResult>}
 */
@Injectable()
@QueryHandler(GetUserByIdQuery)
export class GetUserByIdQueryHandler implements IQueryHandler<GetUserByIdQuery, GetUserByIdQueryResult> {
  constructor(
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行根据用户ID获取用户查询
   * @param {GetUserByIdQuery} query - 根据用户ID获取用户查询
   * @returns {Promise<GetUserByIdQueryResult>} 查询执行结果
   */
  async execute(query: GetUserByIdQuery): Promise<GetUserByIdQueryResult> {
    try {
      this.logger.log('开始处理根据用户ID获取用户查询', {
        userId: query.userId,
        tenantId: query.tenantId,
        includeSensitiveData: query.includeSensitiveData,
      })

      // 1. 验证查询
      this.validateQuery(query)

      // 2. 执行用例
      const result = await this.getUserByIdUseCase.execute(query)

      // 3. 记录查询执行结果
      this.logQueryExecution(query, result)

      return result
    } catch (error) {
      this.logger.error('根据用户ID获取用户查询执行失败', {
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
   * @description 验证查询的有效性
   * @param {GetUserByIdQuery} query - 根据用户ID获取用户查询
   */
  private validateQuery(query: GetUserByIdQuery): void {
    // 1. 基础验证
    query.validate()

    // 2. 业务规则验证
    this.validateBusinessRules(query)
  }

  /**
   * @method validateBusinessRules
   * @description 验证业务规则
   * @param {GetUserByIdQuery} query - 根据用户ID获取用户查询
   */
  private validateBusinessRules(query: GetUserByIdQuery): void {
    // 检查用户ID格式
    this.validateUserIdFormat(query.userId)

    // 检查租户ID格式
    this.validateTenantIdFormat(query.tenantId)
  }

  /**
   * @method validateUserIdFormat
   * @description 验证用户ID格式
   * @param {string} userId - 用户ID
   */
  private validateUserIdFormat(userId: string): void {
    if (!userId || typeof userId !== 'string') {
      throw new Error('用户ID不能为空')
    }

    // UUID v4格式验证
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(userId)) {
      throw new Error('用户ID必须是有效的UUID v4格式')
    }
  }

  /**
   * @method validateTenantIdFormat
   * @description 验证租户ID格式
   * @param {string} tenantId - 租户ID
   */
  private validateTenantIdFormat(tenantId: string): void {
    if (!tenantId || typeof tenantId !== 'string') {
      throw new Error('租户ID不能为空')
    }

    // UUID v4格式验证
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(tenantId)) {
      throw new Error('租户ID必须是有效的UUID v4格式')
    }
  }

  /**
   * @method logQueryExecution
   * @description 记录查询执行结果
   * @param {GetUserByIdQuery} query - 根据用户ID获取用户查询
   * @param {GetUserByIdQueryResult} result - 执行结果
   */
  private logQueryExecution(query: GetUserByIdQuery, result: GetUserByIdQueryResult): void {
    if (result.success) {
      this.logger.log('根据用户ID获取用户查询执行成功', {
        userId: query.userId,
        tenantId: query.tenantId,
        includeSensitiveData: query.includeSensitiveData,
        userFound: !!result.user,
      })
    } else {
      this.logger.warn('根据用户ID获取用户查询执行失败', {
        userId: query.userId,
        tenantId: query.tenantId,
        error: result.error,
      })
    }
  }
}

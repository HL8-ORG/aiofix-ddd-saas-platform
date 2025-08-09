/**
 * @class GetUserSessionsQueryHandler
 * @description
 * 获取用户会话查询处理器，实现CQRS模式中的查询处理逻辑。该处理器负责
 * 接收获取用户会话查询，协调用例执行，并返回处理结果。
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
import { GetUserSessionsQuery } from '../queries/get-user-sessions.query'
import { GetUserSessionsUseCase } from '../use-cases/get-user-sessions.use-case'

export interface GetUserSessionsQueryResult {
  success: boolean
  sessions?: Array<{
    id: string
    userId: string
    accessToken: string
    refreshToken: string
    ipAddress: string
    userAgent: string
    deviceInfo?: {
      deviceType: string
      browser: string
      os: string
    }
    createdAt: Date
    expiresAt: Date
    isActive: boolean
    lastActivityAt: Date
  }>
  pagination?: {
    page: number
    size: number
    total: number
    totalPages: number
  }
  statistics?: {
    totalSessions: number
    activeSessions: number
    expiredSessions: number
    uniqueIps: number
    uniqueDevices: number
  }
  error?: string
}

/**
 * @class GetUserSessionsQueryHandler
 * @description 获取用户会话查询处理器
 * @implements {IQueryHandler<GetUserSessionsQuery, GetUserSessionsQueryResult>}
 */
@Injectable()
@QueryHandler(GetUserSessionsQuery)
export class GetUserSessionsQueryHandler implements IQueryHandler<GetUserSessionsQuery, GetUserSessionsQueryResult> {
  constructor(
    private readonly getUserSessionsUseCase: GetUserSessionsUseCase,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行获取用户会话查询
   * @param {GetUserSessionsQuery} query - 获取用户会话查询
   * @returns {Promise<GetUserSessionsQueryResult>} 查询执行结果
   */
  async execute(query: GetUserSessionsQuery): Promise<GetUserSessionsQueryResult> {
    try {
      this.logger.log('开始处理获取用户会话查询', {
        userId: query.userId,
        tenantId: query.tenantId,
        page: query.page,
        size: query.size,
        includeExpired: query.includeExpired,
      })

      // 1. 验证查询
      this.validateQuery(query)

      // 2. 执行用例
      const result = await this.getUserSessionsUseCase.execute(query)

      // 3. 记录查询执行结果
      this.logQueryExecution(query, result)

      return result
    } catch (error) {
      this.logger.error('获取用户会话查询执行失败', {
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
   * @param {GetUserSessionsQuery} query - 获取用户会话查询
   */
  private validateQuery(query: GetUserSessionsQuery): void {
    // 1. 基础验证
    query.validate()

    // 2. 业务规则验证
    this.validateBusinessRules(query)
  }

  /**
   * @method validateBusinessRules
   * @description 验证业务规则
   * @param {GetUserSessionsQuery} query - 获取用户会话查询
   */
  private validateBusinessRules(query: GetUserSessionsQuery): void {
    // 检查用户ID格式
    this.validateUserIdFormat(query.userId)

    // 检查租户ID格式
    this.validateTenantIdFormat(query.tenantId)

    // 检查分页参数
    this.validatePaginationParams(query.page, query.size)

    // 检查时间范围
    if (query.startDate && query.endDate) {
      this.validateDateRange(query.startDate, query.endDate)
    }
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
   * @method validatePaginationParams
   * @description 验证分页参数
   * @param {number} page - 页码
   * @param {number} size - 每页大小
   */
  private validatePaginationParams(page: number, size: number): void {
    if (page < 1) {
      throw new Error('页码必须大于0')
    }

    if (size < 1 || size > 100) {
      throw new Error('每页大小必须在1到100之间')
    }
  }

  /**
   * @method validateDateRange
   * @description 验证日期范围
   * @param {Date} startDate - 开始日期
   * @param {Date} endDate - 结束日期
   */
  private validateDateRange(startDate: Date, endDate: Date): void {
    if (startDate >= endDate) {
      throw new Error('开始日期必须早于结束日期')
    }

    const now = new Date()
    const maxDays = 365 // 最多查询一年的数据

    if (startDate < new Date(now.getTime() - maxDays * 24 * 60 * 60 * 1000)) {
      throw new Error('开始日期不能早于一年前')
    }

    if (endDate > now) {
      throw new Error('结束日期不能晚于当前时间')
    }
  }

  /**
   * @method logQueryExecution
   * @description 记录查询执行结果
   * @param {GetUserSessionsQuery} query - 获取用户会话查询
   * @param {GetUserSessionsQueryResult} result - 执行结果
   */
  private logQueryExecution(query: GetUserSessionsQuery, result: GetUserSessionsQueryResult): void {
    if (result.success) {
      this.logger.log('获取用户会话查询执行成功', {
        userId: query.userId,
        tenantId: query.tenantId,
        sessionsCount: result.sessions?.length || 0,
        pagination: result.pagination,
        statistics: result.statistics,
        includeExpired: query.includeExpired,
      })
    } else {
      this.logger.warn('获取用户会话查询执行失败', {
        userId: query.userId,
        tenantId: query.tenantId,
        error: result.error,
      })
    }
  }
}

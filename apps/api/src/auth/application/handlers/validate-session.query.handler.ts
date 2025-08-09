/**
 * @class ValidateSessionQueryHandler
 * @description
 * 会话验证查询处理器，实现CQRS模式中的查询处理逻辑。该处理器负责
 * 接收会话验证查询，协调用例执行，并返回处理结果。
 *
 * 主要原理与机制：
 * 1. CQRS模式：将命令和查询职责分离，查询处理器负责数据读取
 * 2. 查询处理器模式：专门处理特定类型的查询
 * 3. 依赖注入：通过构造函数注入必要的依赖服务
 * 4. 缓存优化：利用缓存提高查询性能
 * 5. 权限控制：查询时需要考虑用户权限和数据隔离
 * 6. 安全验证：验证会话有效性和用户权限
 */
import { Injectable } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { ValidateSessionQuery } from '../queries/validate-session.query'
import { ValidateSessionUseCase } from '../use-cases/validate-session.use-case'

export interface ValidateSessionQueryResult {
  success: boolean
  isValid: boolean
  user?: {
    id: string
    email: string
    username: string
    firstName?: string
    lastName?: string
    status: string
  }
  session?: {
    id: string
    status: string
    lastActivityAt: Date
    expiresAt: Date
    deviceInfo: any
    locationInfo?: any
  }
  error?: string
  requiresReauth?: boolean
  sessionExpired?: boolean
}

@Injectable()
@QueryHandler(ValidateSessionQuery)
export class ValidateSessionQueryHandler implements IQueryHandler<ValidateSessionQuery, ValidateSessionQueryResult> {
  constructor(
    private readonly validateSessionUseCase: ValidateSessionUseCase,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行会话验证查询
   * @param {ValidateSessionQuery} query - 会话验证查询
   * @returns {Promise<ValidateSessionQueryResult>} 查询执行结果
   */
  async execute(query: ValidateSessionQuery): Promise<ValidateSessionQueryResult> {
    try {
      this.logger.log('开始处理会话验证查询', { sessionId: query.sessionId })

      // 1. 验证查询参数
      this.validateQuery(query)

      // 2. 执行用例
      const result = await this.validateSessionUseCase.execute(query)

      // 3. 记录查询执行结果
      this.logQueryExecution(query, result)

      return result
    } catch (error) {
      this.logger.error('会话验证查询执行失败', {
        error: (error as Error).message,
        sessionId: query.sessionId,
      })

      return {
        success: false,
        isValid: false,
        error: (error as Error).message,
      }
    }
  }

  /**
   * @method validateQuery
   * @description 验证查询参数的有效性
   */
  private validateQuery(query: ValidateSessionQuery): void {
    // 1. 基础验证
    query.validate()

    // 2. 业务规则验证
    this.validateBusinessRules(query)
  }

  /**
   * @method validateBusinessRules
   * @description 验证业务规则
   */
  private validateBusinessRules(query: ValidateSessionQuery): void {
    // 检查会话ID格式
    this.validateSessionIdFormat(query.sessionId)

    // 检查访问令牌格式
    this.validateAccessTokenFormat(query.accessToken)

    // 检查权限控制
    this.validatePermissionControl(query)
  }

  /**
   * @method validateSessionIdFormat
   * @description 验证会话ID格式
   */
  private validateSessionIdFormat(sessionId: string): void {
    if (!sessionId || sessionId.trim().length === 0) {
      throw new Error('会话ID不能为空')
    }

    // 验证会话ID格式（UUID或自定义格式）
    const sessionIdRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    const customSessionIdRegex = /^[A-Za-z0-9]{32,}$/

    if (!sessionIdRegex.test(sessionId) && !customSessionIdRegex.test(sessionId)) {
      throw new Error('会话ID格式不正确')
    }
  }

  /**
   * @method validateAccessTokenFormat
   * @description 验证访问令牌格式
   */
  private validateAccessTokenFormat(accessToken: string): void {
    if (!accessToken || accessToken.trim().length === 0) {
      throw new Error('访问令牌不能为空')
    }

    // 验证JWT令牌格式
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/
    if (!jwtRegex.test(accessToken)) {
      throw new Error('访问令牌格式不正确')
    }
  }

  /**
   * @method validatePermissionControl
   * @description 验证权限控制
   */
  private validatePermissionControl(query: ValidateSessionQuery): void {
    // 如果提供了租户ID和用户ID，验证权限
    if (query.tenantId && query.userId) {
      // 这里可以添加更复杂的权限验证逻辑
      // 例如：检查用户是否有权限访问指定租户的会话
      this.validateTenantUserPermission(query.tenantId, query.userId)
    }
  }

  /**
   * @method validateTenantUserPermission
   * @description 验证租户用户权限
   */
  private validateTenantUserPermission(tenantId: string, userId: string): void {
    // 这里可以添加租户用户权限验证逻辑
    // 例如：检查用户是否属于指定租户
    // 暂时跳过具体实现，实际项目中需要根据业务需求实现
  }

  /**
   * @method logQueryExecution
   * @description 记录查询执行结果
   */
  private logQueryExecution(query: ValidateSessionQuery, result: ValidateSessionQueryResult): void {
    if (result.success) {
      this.logger.log('会话验证查询执行成功', {
        sessionId: query.sessionId,
        isValid: result.isValid,
        userId: result.user?.id,
        requiresReauth: result.requiresReauth,
        sessionExpired: result.sessionExpired,
      })
    } else {
      this.logger.warn('会话验证查询执行失败', {
        sessionId: query.sessionId,
        error: result.error,
        requiresReauth: result.requiresReauth,
        sessionExpired: result.sessionExpired,
      })
    }
  }
}

/**
 * @class GetLoginAttemptsQueryHandler
 * @description
 * 登录尝试查询处理器，实现CQRS模式中的查询处理部分。该处理器负责处理登录尝试查询，
 * 协调领域对象和服务完成具体的查询逻辑。
 *
 * 主要原理与机制：
 * 1. CQRS模式：将命令和查询职责分离，查询处理器不修改状态
 * 2. 查询处理器模式：专门处理特定类型的查询
 * 3. 依赖注入：通过构造函数注入所需的依赖
 * 4. 缓存优化：查询结果可以缓存以提高性能
 * 5. 权限控制：查询时需要考虑用户权限和数据隔离
 * 6. 审计日志：记录查询操作的审计信息
 * 7. 错误处理：统一的错误处理和异常管理
 */
import { Injectable } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { GetLoginAttemptsQuery } from '../queries/get-login-attempts.query'
import type { GetLoginAttemptsUseCase } from '../use-cases/get-login-attempts.use-case'

export interface LoginAttemptRecord {
  id: string
  userId: string
  email: string
  ipAddress: string
  status: string
  type: string
  createdAt: Date
  deviceInfo?: {
    userAgent: string
    deviceType?: string
    browser?: string
    os?: string
  }
  locationInfo?: {
    country?: string
    region?: string
    city?: string
    latitude?: number
    longitude?: number
  }
  failureReason?: string
}

export interface GetLoginAttemptsQueryResult {
  success: boolean
  attempts: LoginAttemptRecord[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
  message?: string
  error?: string
}

@Injectable()
@QueryHandler(GetLoginAttemptsQuery)
export class GetLoginAttemptsQueryHandler
  implements IQueryHandler<GetLoginAttemptsQuery, GetLoginAttemptsQueryResult> {
  constructor(
    private readonly getLoginAttemptsUseCase: GetLoginAttemptsUseCase,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行登录尝试查询
   */
  async execute(query: GetLoginAttemptsQuery): Promise<GetLoginAttemptsQueryResult> {
    try {
      // 记录查询执行开始
      this.logger.log(
        `开始执行登录尝试查询: ${JSON.stringify(query.toJSON())}`,
        'GetLoginAttemptsQueryHandler',
      )

      // 验证查询参数
      this.validateQuery(query)

      // 调用用例执行具体查询逻辑
      const result = await this.getLoginAttemptsUseCase.execute(query)

      // 记录查询执行成功
      this.logger.log(
        `登录尝试查询执行成功: tenantId=${query.tenantId}, total=${result.total}`,
        'GetLoginAttemptsQueryHandler',
      )

      return result
    } catch (error) {
      // 记录查询执行失败
      this.logger.error(
        `登录尝试查询执行失败: ${error.message}`,
        error.stack,
        'GetLoginAttemptsQueryHandler',
      )

      return {
        success: false,
        attempts: [],
        total: 0,
        page: query.page || 1,
        pageSize: query.pageSize || 20,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
        error: error.message,
      }
    }
  }

  /**
   * @method validateQuery
   * @description 验证查询参数
   */
  private validateQuery(query: GetLoginAttemptsQuery): void {
    // 基础验证
    if (!query.tenantId || query.tenantId.trim().length === 0) {
      throw new Error('租户ID不能为空')
    }

    // 验证租户ID格式
    this.validateTenantIdFormat(query.tenantId)

    // 验证用户ID格式（如果提供）
    if (query.userId) {
      this.validateUserIdFormat(query.userId)
    }

    // 验证邮箱格式（如果提供）
    if (query.email) {
      this.validateEmailFormat(query.email)
    }

    // 验证IP地址格式（如果提供）
    if (query.ipAddress) {
      this.validateIpAddressFormat(query.ipAddress)
    }

    // 验证登录尝试状态
    if (query.status) {
      this.validateLoginAttemptStatus(query.status)
    }

    // 验证登录尝试类型
    if (query.type) {
      this.validateLoginAttemptType(query.type)
    }

    // 验证时间格式（如果提供）
    if (query.startTime) {
      this.validateTimeFormat(query.startTime)
    }

    if (query.endTime) {
      this.validateTimeFormat(query.endTime)
    }

    // 验证时间范围
    if (query.startTime && query.endTime) {
      this.validateTimeRange(query.startTime, query.endTime)
    }

    // 验证排序字段
    if (query.sortBy) {
      this.validateSortBy(query.sortBy)
    }

    // 验证排序顺序
    if (query.sortOrder) {
      this.validateSortOrder(query.sortOrder)
    }

    // 验证权限控制
    this.validatePermissionControl(query)
  }

  /**
   * @method validateTenantIdFormat
   * @description 验证租户ID格式
   */
  private validateTenantIdFormat(tenantId: string): void {
    const tenantIdRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!tenantIdRegex.test(tenantId)) {
      throw new Error('租户ID格式不正确')
    }
  }

  /**
   * @method validateUserIdFormat
   * @description 验证用户ID格式
   */
  private validateUserIdFormat(userId: string): void {
    const userIdRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!userIdRegex.test(userId)) {
      throw new Error('用户ID格式不正确')
    }
  }

  /**
   * @method validateEmailFormat
   * @description 验证邮箱格式
   */
  private validateEmailFormat(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error('邮箱格式不正确')
    }
  }

  /**
   * @method validateIpAddressFormat
   * @description 验证IP地址格式
   */
  private validateIpAddressFormat(ipAddress: string): void {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!ipRegex.test(ipAddress)) {
      throw new Error('IP地址格式不正确')
    }
  }

  /**
   * @method validateLoginAttemptStatus
   * @description 验证登录尝试状态
   */
  private validateLoginAttemptStatus(status: string): void {
    const validStatuses = ['success', 'failed', 'blocked', 'suspicious']
    if (!validStatuses.includes(status)) {
      throw new Error('登录尝试状态不正确')
    }
  }

  /**
   * @method validateLoginAttemptType
   * @description 验证登录尝试类型
   */
  private validateLoginAttemptType(type: string): void {
    const validTypes = ['password', 'two_factor', 'sso', 'api_key', 'registration']
    if (!validTypes.includes(type)) {
      throw new Error('登录尝试类型不正确')
    }
  }

  /**
   * @method validateTimeFormat
   * @description 验证时间格式
   */
  private validateTimeFormat(time: string): void {
    const date = new Date(time)
    if (isNaN(date.getTime())) {
      throw new Error('时间格式不正确')
    }
  }

  /**
   * @method validateTimeRange
   * @description 验证时间范围
   */
  private validateTimeRange(startTime: string, endTime: string): void {
    const startDate = new Date(startTime)
    const endDate = new Date(endTime)

    if (startDate >= endDate) {
      throw new Error('开始时间必须早于结束时间')
    }

    // 检查时间范围是否过大（例如超过1年）
    const oneYear = 365 * 24 * 60 * 60 * 1000
    if (endDate.getTime() - startDate.getTime() > oneYear) {
      throw new Error('查询时间范围不能超过1年')
    }
  }

  /**
   * @method validateSortBy
   * @description 验证排序字段
   */
  private validateSortBy(sortBy: string): void {
    const allowedSortFields = [
      'createdAt',
      'status',
      'type',
      'ipAddress',
      'email',
      'userId',
      'deviceType',
      'browser',
      'os',
    ]

    if (!allowedSortFields.includes(sortBy)) {
      throw new Error('排序字段不正确')
    }
  }

  /**
   * @method validateSortOrder
   * @description 验证排序顺序
   */
  private validateSortOrder(sortOrder: string): void {
    const validSortOrders = ['asc', 'desc']
    if (!validSortOrders.includes(sortOrder)) {
      throw new Error('排序顺序不正确')
    }
  }

  /**
   * @method validatePermissionControl
   * @description 验证权限控制
   */
  private validatePermissionControl(query: GetLoginAttemptsQuery): void {
    // 如果提供了请求者ID，验证权限
    if (query.requesterId) {
      // 这里可以添加更复杂的权限验证逻辑
      // 例如：检查请求者是否有权限查看登录尝试记录
      this.validateRequesterPermission(query.requesterId, query.userId)
    }
  }

  /**
   * @method validateRequesterPermission
   * @description 验证请求者权限
   */
  private validateRequesterPermission(requesterId: string, targetUserId?: string): void {
    // 这里可以添加更复杂的权限验证逻辑
    // 例如：检查请求者是否有管理员权限或查看特定用户的权限
    // 暂时跳过具体实现，实际项目中需要根据业务需求实现
  }
}

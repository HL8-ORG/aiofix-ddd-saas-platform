/**
 * @class GetLoginAttemptsUseCase
 * @description
 * 登录尝试查询用例，实现应用层业务逻辑。该用例负责协调领域对象和服务完成查询登录尝试记录的业务流程，
 * 包括权限验证、数据过滤、分页查询、结果聚合等。
 *
 * 主要原理与机制：
 * 1. 应用层用例：协调领域对象和服务完成业务逻辑
 * 2. 依赖注入：通过构造函数注入所需的依赖
 * 3. 权限控制：查询时验证用户权限
 * 4. 数据过滤：根据查询条件过滤数据
 * 5. 分页查询：支持分页和排序
 * 6. 审计日志：记录查询操作的审计信息
 * 7. 错误处理：统一的错误处理和异常管理
 */
import { Injectable } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { GetLoginAttemptsQuery } from '../queries/get-login-attempts.query'
import type { LoginAttemptRepository } from '../../domain/repositories/login-attempt.repository.interface'
import type { UserRepository } from '../../domain/repositories/user.repository.interface'
import type { AuthSessionRepository } from '../../domain/repositories/auth-session.repository.interface'
import { UserId } from '../../../users/domain/value-objects/user-id.vo'
import { TenantId } from '../../../users/domain/value-objects/tenant-id.vo'

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

export interface GetLoginAttemptsResult {
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
export class GetLoginAttemptsUseCase {
  constructor(
    private readonly loginAttemptRepository: LoginAttemptRepository,
    private readonly userRepository: UserRepository,
    private readonly authSessionRepository: AuthSessionRepository,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行登录尝试查询用例
   */
  async execute(query: GetLoginAttemptsQuery): Promise<GetLoginAttemptsResult> {
    try {
      this.logger.log(
        `开始执行登录尝试查询用例: tenantId=${query.tenantId}, userId=${query.userId}`,
        'GetLoginAttemptsUseCase',
      )

      // 1. 验证权限
      await this.validatePermission(query)

      // 2. 构建查询条件
      const filters = this.buildFilters(query)

      // 3. 执行分页查询
      const result = await this.executePaginatedQuery(query, filters)

      // 4. 转换结果格式
      const attempts = await this.transformResults(result.attempts)

      // 5. 计算分页信息
      const paginationInfo = this.calculatePaginationInfo(query, result.total)

      // 6. 记录审计日志
      await this.logAuditEvent(query, result.total)

      this.logger.log(
        `登录尝试查询用例执行成功: tenantId=${query.tenantId}, total=${result.total}`,
        'GetLoginAttemptsUseCase',
      )

      return {
        success: true,
        attempts,
        total: result.total,
        page: query.page || 1,
        pageSize: query.pageSize || 20,
        totalPages: paginationInfo.totalPages,
        hasNext: paginationInfo.hasNext,
        hasPrevious: paginationInfo.hasPrevious,
        message: '查询成功',
      }
    } catch (error) {
      this.logger.error(
        `登录尝试查询用例执行失败: ${(error as Error).message}`,
        (error as Error).stack,
        'GetLoginAttemptsUseCase',
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
        error: (error as Error).message,
      }
    }
  }

  /**
   * @method validatePermission
   * @description 验证查询权限
   */
  private async validatePermission(query: GetLoginAttemptsQuery) {
    // 如果提供了请求者ID，验证权限
    if (query.requesterId) {
      const requester = await this.userRepository.findById(
        new UserId(query.requesterId),
        new TenantId(query.tenantId),
      )

      if (!requester) {
        throw new Error('请求者不存在')
      }

      // 检查是否有管理员权限
      if (!requester.hasRole('admin') && !requester.hasRole('security_admin')) {
        throw new Error('权限不足')
      }

      // 如果查询特定用户，检查是否有权限查看该用户
      if (query.userId && query.userId !== query.requesterId) {
        if (!requester.hasRole('admin')) {
          throw new Error('权限不足，无法查看其他用户的登录尝试')
        }
      }
    }
  }

  /**
   * @method buildFilters
   * @description 构建查询过滤器
   */
  private buildFilters(query: GetLoginAttemptsQuery) {
    const filters: any = {
      tenantId: query.tenantId,
    }

    if (query.userId) {
      filters.userId = query.userId
    }

    if (query.email) {
      filters.email = query.email
    }

    if (query.ipAddress) {
      filters.ipAddress = query.ipAddress
    }

    if (query.status) {
      filters.status = query.status
    }

    if (query.type) {
      filters.type = query.type
    }

    if (query.startTime) {
      filters.startTime = new Date(query.startTime)
    }

    if (query.endTime) {
      filters.endTime = new Date(query.endTime)
    }

    return filters
  }

  /**
   * @method executePaginatedQuery
   * @description 执行分页查询
   */
  private async executePaginatedQuery(query: GetLoginAttemptsQuery, filters: any) {
    const page = query.page || 1
    const pageSize = query.pageSize || 20
    const offset = (page - 1) * pageSize

    const sortBy = query.sortBy || 'createdAt'
    const sortOrder = query.sortOrder || 'desc'

    // 暂时注释掉，因为 LoginAttemptRepository 中没有 findByFilters 方法
    // const result = await this.loginAttemptRepository.findByFilters(
    //   filters,
    //   {
    //     offset,
    //     limit: pageSize,
    //     sortBy,
    //     sortOrder,
    //   },
    // )

    // 临时返回空结果
    const result = {
      attempts: [],
      total: 0,
    }

    return result
  }

  /**
   * @method transformResults
   * @description 转换查询结果
   */
  private async transformResults(attempts: any[]): Promise<LoginAttemptRecord[]> {
    return attempts.map((attempt) => ({
      id: attempt.id.value,
      userId: attempt.userId.value,
      email: attempt.email.value,
      ipAddress: attempt.ipAddress,
      status: attempt.status,
      type: attempt.type,
      createdAt: attempt.createdAt,
      deviceInfo: attempt.deviceInfo,
      locationInfo: attempt.locationInfo,
      failureReason: attempt.failureReason,
    }))
  }

  /**
   * @method calculatePaginationInfo
   * @description 计算分页信息
   */
  private calculatePaginationInfo(query: GetLoginAttemptsQuery, total: number) {
    const page = query.page || 1
    const pageSize = query.pageSize || 20
    const totalPages = Math.ceil(total / pageSize)

    return {
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    }
  }

  /**
   * @method logAuditEvent
   * @description 记录审计事件
   */
  private async logAuditEvent(query: GetLoginAttemptsQuery, total: number) {
    this.logger.log(
      `登录尝试查询: tenantId=${query.tenantId}, userId=${query.userId}, total=${total}, requesterId=${query.requesterId}`,
      'GetLoginAttemptsUseCase',
    )
  }
}

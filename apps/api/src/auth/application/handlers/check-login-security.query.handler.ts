/**
 * @class CheckLoginSecurityQueryHandler
 * @description
 * 检查登录安全查询处理器，实现CQRS模式中的查询处理逻辑。该处理器负责
 * 接收检查登录安全查询，协调用例执行，并返回处理结果。
 *
 * 主要原理与机制：
 * 1. CQRS模式：将命令和查询职责分离，查询处理器负责数据检索
 * 2. 查询处理器模式：专门处理特定类型的查询
 * 3. 依赖注入：通过构造函数注入必要的依赖服务
 * 4. 缓存策略：优化查询性能，减少数据库访问
 * 5. 安全策略：集成安全检查和风险评估
 * 6. 审计日志：记录查询操作的审计信息
 */
import { Injectable } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs'
import { CheckLoginSecurityQuery } from '../queries/check-login-security.query'
import { CheckLoginSecurityUseCase } from '../use-cases/check-login-security.use-case'

export interface CheckLoginSecurityQueryResult {
  success: boolean
  isSecure?: boolean
  riskLevel?: 'low' | 'medium' | 'high'
  securityChecks?: {
    ipWhitelisted: boolean
    deviceTrusted: boolean
    locationSafe: boolean
    timeSafe: boolean
    rateLimitOk: boolean
  }
  recommendations?: string[]
  error?: string
}

/**
 * @class CheckLoginSecurityQueryHandler
 * @description 检查登录安全查询处理器
 * @implements {IQueryHandler<CheckLoginSecurityQuery, CheckLoginSecurityQueryResult>}
 */
@Injectable()
@QueryHandler(CheckLoginSecurityQuery)
export class CheckLoginSecurityQueryHandler implements IQueryHandler<CheckLoginSecurityQuery, CheckLoginSecurityQueryResult> {
  constructor(
    private readonly checkLoginSecurityUseCase: CheckLoginSecurityUseCase,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行检查登录安全查询
   * @param {CheckLoginSecurityQuery} query - 检查登录安全查询
   * @returns {Promise<CheckLoginSecurityQueryResult>} 查询执行结果
   */
  async execute(query: CheckLoginSecurityQuery): Promise<CheckLoginSecurityQueryResult> {
    try {
      this.logger.log('开始处理检查登录安全查询', {
        email: query.email,
        tenantId: query.tenantId,
        ipAddress: query.ipAddress,
      })

      // 1. 验证查询
      this.validateQuery(query)

      // 2. 执行用例
      const result = await this.checkLoginSecurityUseCase.execute(query)

      // 3. 记录查询执行结果
      this.logQueryExecution(query, result)

      return result
    } catch (error) {
      this.logger.error('检查登录安全查询执行失败', {
        error: (error as Error).message,
        email: query.email,
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
   * @param {CheckLoginSecurityQuery} query - 检查登录安全查询
   */
  private validateQuery(query: CheckLoginSecurityQuery): void {
    // 1. 基础验证
    query.validate()

    // 2. 业务规则验证
    this.validateBusinessRules(query)
  }

  /**
   * @method validateBusinessRules
   * @description 验证业务规则
   * @param {CheckLoginSecurityQuery} query - 检查登录安全查询
   */
  private validateBusinessRules(query: CheckLoginSecurityQuery): void {
    // 检查邮箱格式
    this.validateEmailFormat(query.email)

    // 检查租户ID格式
    this.validateTenantIdFormat(query.tenantId)

    // 检查IP地址格式
    this.validateIpAddressFormat(query.ipAddress)

    // 检查设备信息
    if (query.deviceInfo) {
      this.validateDeviceInfo(query.deviceInfo)
    }
  }

  /**
   * @method validateEmailFormat
   * @description 验证邮箱格式
   * @param {string} email - 邮箱地址
   */
  private validateEmailFormat(email: string): void {
    if (!email || typeof email !== 'string') {
      throw new Error('邮箱地址不能为空')
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error('邮箱地址格式无效')
    }

    // 检查邮箱长度
    if (email.length > 254) {
      throw new Error('邮箱地址长度不能超过254个字符')
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
   * @method validateIpAddressFormat
   * @description 验证IP地址格式
   * @param {string} ipAddress - IP地址
   */
  private validateIpAddressFormat(ipAddress: string): void {
    if (!ipAddress || typeof ipAddress !== 'string') {
      throw new Error('IP地址不能为空')
    }

    // IP地址格式验证
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!ipRegex.test(ipAddress)) {
      throw new Error('IP地址格式无效')
    }
  }

  /**
   * @method validateDeviceInfo
   * @description 验证设备信息
   * @param {object} deviceInfo - 设备信息
   */
  private validateDeviceInfo(deviceInfo: {
    userAgent: string
    deviceType?: string
    browser?: string
    os?: string
  }): void {
    if (!deviceInfo.userAgent || typeof deviceInfo.userAgent !== 'string') {
      throw new Error('用户代理不能为空')
    }

    // 检查用户代理长度
    if (deviceInfo.userAgent.length > 500) {
      throw new Error('用户代理长度不能超过500个字符')
    }
  }

  /**
   * @method logQueryExecution
   * @description 记录查询执行结果
   * @param {CheckLoginSecurityQuery} query - 检查登录安全查询
   * @param {CheckLoginSecurityQueryResult} result - 执行结果
   */
  private logQueryExecution(query: CheckLoginSecurityQuery, result: CheckLoginSecurityQueryResult): void {
    if (result.success) {
      this.logger.log('检查登录安全查询执行成功', {
        email: query.email,
        tenantId: query.tenantId,
        isSecure: result.isSecure,
        riskLevel: result.riskLevel,
        securityChecks: result.securityChecks,
      })
    } else {
      this.logger.warn('检查登录安全查询执行失败', {
        email: query.email,
        tenantId: query.tenantId,
        error: result.error,
      })
    }
  }
}

import { Injectable, Inject } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { TenantValidator } from '../validators/tenant-validator'
import { TENANT_SERVICE_TOKEN } from '../services/interfaces/tenant-service.interface'
import type { ITenantService, SuspendTenantCommand, SuspendTenantResult } from '../services/interfaces/tenant-service.interface'

/**
 * @interface SuspendTenantUseCaseResult
 * @description 暂停租户用例的执行结果
 */
export interface SuspendTenantUseCaseResult {
  success: boolean
  tenantId?: string
  message?: string
  error?: string
  warnings?: string[]
}

/**
 * @class SuspendTenantUseCase
 * @description 暂停租户用例
 * 
 * 该用例负责协调暂停租户的完整业务流程，包括：
 * 1. 验证暂停命令数据
 * 2. 检查租户状态和权限
 * 3. 验证暂停原因
 * 4. 执行暂停租户业务逻辑
 * 5. 处理结果和异常
 * 
 * 主要原理与机制：
 * - 遵循单一职责原则，专注于暂停租户的业务逻辑
 * - 通过依赖注入获取所需的服务和验证器
 * - 提供清晰的输入输出接口
 * - 包含完整的错误处理和日志记录
 */
@Injectable()
export class SuspendTenantUseCase {
  constructor(
    @Inject(TENANT_SERVICE_TOKEN)
    private readonly tenantService: ITenantService,
    private readonly tenantValidator: TenantValidator,
    @Inject(Logger)
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行暂停租户用例
   * @param command 暂停租户命令
   * @returns Promise<SuspendTenantUseCaseResult> 执行结果
   */
  async execute(command: SuspendTenantCommand): Promise<SuspendTenantUseCaseResult> {
    try {
      this.logger.log(`开始执行暂停租户用例: ${command.tenantId}`)

      // 1. 验证命令数据
      this.validateSuspendCommand(command)

      // 2. 检查租户是否存在和可访问
      const tenantExists = await this.validateTenantAccess(command.tenantId, command.suspendedBy)
      if (!tenantExists) {
        return {
          success: false,
          error: '租户不存在或无权限访问',
        }
      }

      // 3. 验证暂停原因
      const reasonValidation = this.validateSuspendReason(command.reason)
      if (!reasonValidation.isValid) {
        this.logger.warn(`暂停原因验证失败: ${reasonValidation.errors.join(', ')}`)
        return {
          success: false,
          error: reasonValidation.errors.join('; '),
          warnings: reasonValidation.warnings,
        }
      }

      // 4. 执行暂停租户业务逻辑
      const result: SuspendTenantResult = await this.tenantService.suspendTenant(command)

      // 5. 记录成功日志
      if (result.success) {
        this.logger.log(
          `租户暂停成功: ${result.tenantId}, 暂停者: ${command.suspendedBy}`,
        )
      } else {
        this.logger.error(`租户暂停失败: ${result.error}`)
      }

      return result
    } catch (error) {
      // 6. 异常处理
      this.logger.error('暂停租户用例执行失败', error)
      return {
        success: false,
        error: (error as Error).message,
      }
    }
  }

  /**
   * @method validateSuspendCommand
   * @description 验证暂停命令数据
   * @param command 暂停命令
   */
  private validateSuspendCommand(command: SuspendTenantCommand): void {
    const errors: string[] = []

    if (!command.tenantId || command.tenantId.trim().length === 0) {
      errors.push('租户ID不能为空')
    }

    if (!command.suspendedBy || command.suspendedBy.trim().length === 0) {
      errors.push('暂停者ID不能为空')
    }

    if (errors.length > 0) {
      throw new Error(errors.join('; '))
    }
  }

  /**
   * @method validateTenantAccess
   * @description 验证租户访问权限
   * @param tenantId 租户ID
   * @param suspendedBy 暂停者ID
   * @returns Promise<boolean> 是否有权限
   */
  private async validateTenantAccess(tenantId: string, suspendedBy: string): Promise<boolean> {
    try {
      // 获取租户信息
      const tenantResult = await this.tenantService.getTenantById({ tenantId })

      if (!tenantResult.success || !tenantResult.tenant) {
        return false
      }

      // 检查租户状态
      if (tenantResult.tenant.status === 'DELETED') {
        return false
      }

      if (tenantResult.tenant.status === 'SUSPENDED') {
        return false
      }

      // TODO: 实现具体的权限验证逻辑
      // 这里可以检查用户是否有权限暂停该租户

      return true
    } catch (error) {
      this.logger.error('验证租户访问权限失败', error)
      return false
    }
  }

  /**
   * @method validateSuspendReason
   * @description 验证暂停原因
   * @param reason 暂停原因
   * @returns ValidationResult 验证结果
   */
  private validateSuspendReason(reason?: string): {
    isValid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []

    if (reason) {
      // 检查原因长度
      if (reason.length > 500) {
        errors.push('暂停原因长度不能超过500个字符')
      }

      // 检查敏感词汇
      const sensitiveWords = ['密码', 'password', 'secret', 'key', 'token']
      const lowerReason = reason.toLowerCase()
      for (const word of sensitiveWords) {
        if (lowerReason.includes(word)) {
          warnings.push(`暂停原因可能包含敏感信息: ${word}`)
        }
      }
    } else {
      warnings.push('建议提供暂停原因以便后续追踪')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * @method logUseCaseExecution
   * @description 记录用例执行日志
   * @param command 暂停命令
   * @param result 执行结果
   */
  private logUseCaseExecution(command: SuspendTenantCommand, result: SuspendTenantUseCaseResult): void {
    const logData = {
      tenantId: command.tenantId,
      suspendedBy: command.suspendedBy,
      reason: command.reason,
      success: result.success,
      message: result.message,
      error: result.error,
      timestamp: new Date().toISOString(),
    }

    if (result.success) {
      this.logger.log('暂停租户用例执行成功', logData)
    } else {
      this.logger.error('暂停租户用例执行失败', logData)
    }
  }
}

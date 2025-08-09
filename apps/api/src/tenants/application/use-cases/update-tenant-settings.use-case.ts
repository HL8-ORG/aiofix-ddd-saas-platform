import { Injectable, Inject } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { TenantValidator } from '../validators/tenant-validator'
import { TENANT_SERVICE_TOKEN } from '../services/interfaces/tenant-service.interface'
import type { ITenantService, UpdateTenantSettingsCommand, UpdateTenantSettingsResult } from '../services/interfaces/tenant-service.interface'

/**
 * @interface UpdateTenantSettingsUseCaseResult
 * @description 更新租户设置用例的执行结果
 */
export interface UpdateTenantSettingsUseCaseResult {
  success: boolean
  tenantId?: string
  message?: string
  error?: string
  warnings?: string[]
}

/**
 * @class UpdateTenantSettingsUseCase
 * @description 更新租户设置用例
 * 
 * 该用例负责协调更新租户设置的完整业务流程，包括：
 * 1. 验证更新命令数据
 * 2. 检查租户状态和权限
 * 3. 验证设置数据的有效性
 * 4. 执行更新租户设置业务逻辑
 * 5. 处理结果和异常
 * 
 * 主要原理与机制：
 * - 遵循单一职责原则，专注于更新租户设置的业务逻辑
 * - 通过依赖注入获取所需的服务和验证器
 * - 提供清晰的输入输出接口
 * - 包含完整的错误处理和日志记录
 */
@Injectable()
export class UpdateTenantSettingsUseCase {
  constructor(
    @Inject(TENANT_SERVICE_TOKEN)
    private readonly tenantService: ITenantService,
    private readonly tenantValidator: TenantValidator,
    @Inject(Logger)
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行更新租户设置用例
   * @param command 更新租户设置命令
   * @returns Promise<UpdateTenantSettingsUseCaseResult> 执行结果
   */
  async execute(command: UpdateTenantSettingsCommand): Promise<UpdateTenantSettingsUseCaseResult> {
    try {
      this.logger.log(`开始执行更新租户设置用例: ${command.tenantId}`)

      // 1. 验证命令数据
      this.validateUpdateCommand(command)

      // 2. 检查租户是否存在和可访问
      const tenantExists = await this.validateTenantAccess(command.tenantId, command.updatedBy)
      if (!tenantExists) {
        return {
          success: false,
          error: '租户不存在或无权限访问',
        }
      }

      // 3. 验证设置数据的有效性
      const settingsValidation = this.validateSettingsData(command.settings)
      if (!settingsValidation.isValid) {
        this.logger.warn(`租户设置验证失败: ${settingsValidation.errors.join(', ')}`)
        return {
          success: false,
          error: settingsValidation.errors.join('; '),
          warnings: settingsValidation.warnings,
        }
      }

      // 4. 执行更新租户设置业务逻辑
      const result: UpdateTenantSettingsResult = await this.tenantService.updateTenantSettings(command)

      // 5. 记录成功日志
      if (result.success) {
        this.logger.log(
          `租户设置更新成功: ${result.tenantId}, 更新者: ${command.updatedBy}`,
        )
      } else {
        this.logger.error(`租户设置更新失败: ${result.error}`)
      }

      return result
    } catch (error) {
      // 6. 异常处理
      this.logger.error('更新租户设置用例执行失败', error)
      return {
        success: false,
        error: (error as Error).message,
      }
    }
  }

  /**
   * @method validateUpdateCommand
   * @description 验证更新命令数据
   * @param command 更新命令
   */
  private validateUpdateCommand(command: UpdateTenantSettingsCommand): void {
    const errors: string[] = []

    if (!command.tenantId || command.tenantId.trim().length === 0) {
      errors.push('租户ID不能为空')
    }

    if (!command.updatedBy || command.updatedBy.trim().length === 0) {
      errors.push('更新者ID不能为空')
    }

    if (!command.settings || Object.keys(command.settings).length === 0) {
      errors.push('设置数据不能为空')
    }

    if (errors.length > 0) {
      throw new Error(errors.join('; '))
    }
  }

  /**
   * @method validateTenantAccess
   * @description 验证租户访问权限
   * @param tenantId 租户ID
   * @param updatedBy 更新者ID
   * @returns Promise<boolean> 是否有权限
   */
  private async validateTenantAccess(tenantId: string, updatedBy: string): Promise<boolean> {
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

      // TODO: 实现具体的权限验证逻辑
      // 这里可以检查用户是否有权限更新该租户的设置

      return true
    } catch (error) {
      this.logger.error('验证租户访问权限失败', error)
      return false
    }
  }

  /**
   * @method validateSettingsData
   * @description 验证设置数据的有效性
   * @param settings 设置数据
   * @returns ValidationResult 验证结果
   */
  private validateSettingsData(settings: Record<string, any>): {
    isValid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []

    // 验证设置键名
    for (const key of Object.keys(settings)) {
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(key)) {
        errors.push(`设置键名 "${key}" 格式不正确，必须以字母开头，只能包含字母、数字和下划线`)
      }
    }

    // 验证设置值类型
    for (const [key, value] of Object.entries(settings)) {
      if (value === null || value === undefined) {
        errors.push(`设置值 "${key}" 不能为空`)
      }

      // 检查值的大小限制
      if (typeof value === 'string' && value.length > 1000) {
        errors.push(`设置值 "${key}" 长度不能超过1000个字符`)
      }

      if (typeof value === 'object' && JSON.stringify(value).length > 10000) {
        errors.push(`设置值 "${key}" 数据过大`)
      }
    }

    // 检查敏感设置
    const sensitiveKeys = ['password', 'secret', 'key', 'token']
    for (const key of Object.keys(settings)) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        warnings.push(`设置键名 "${key}" 可能包含敏感信息`)
      }
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
   * @param command 更新命令
   * @param result 执行结果
   */
  private logUseCaseExecution(command: UpdateTenantSettingsCommand, result: UpdateTenantSettingsUseCaseResult): void {
    const logData = {
      tenantId: command.tenantId,
      updatedBy: command.updatedBy,
      settingsCount: Object.keys(command.settings).length,
      success: result.success,
      message: result.message,
      error: result.error,
      timestamp: new Date().toISOString(),
    }

    if (result.success) {
      this.logger.log('更新租户设置用例执行成功', logData)
    } else {
      this.logger.error('更新租户设置用例执行失败', logData)
    }
  }
}

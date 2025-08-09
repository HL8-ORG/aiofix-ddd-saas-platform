import { Injectable, Inject } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { ActivateTenantCommand } from '../commands/activate-tenant.command'
import { TenantValidator } from '../validators/tenant-validator'
import { TENANT_SERVICE_TOKEN } from '../services/interfaces/tenant-service.interface'
import type { ITenantService } from '../services/interfaces/tenant-service.interface'

/**
 * @interface ActivateTenantUseCaseResult
 * @description 激活租户用例的执行结果
 */
export interface ActivateTenantUseCaseResult {
  success: boolean
  tenantId?: string
  message?: string
  error?: string
  warnings?: string[]
}

/**
 * @class ActivateTenantUseCase
 * @description 激活租户用例
 * 
 * 该用例负责协调激活租户的完整业务流程，包括：
 * 1. 验证激活命令数据
 * 2. 检查租户状态和权限
 * 3. 执行激活租户业务逻辑
 * 4. 处理结果和异常
 * 
 * 主要原理与机制：
 * - 遵循单一职责原则，专注于激活租户的业务逻辑
 * - 通过依赖注入获取所需的服务和验证器
 * - 提供清晰的输入输出接口
 * - 包含完整的错误处理和日志记录
 */
@Injectable()
export class ActivateTenantUseCase {
  constructor(
    @Inject(TENANT_SERVICE_TOKEN)
    private readonly tenantService: ITenantService,
    private readonly tenantValidator: TenantValidator,
    @Inject(Logger)
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行激活租户用例
   * @param command 激活租户命令
   * @returns Promise<ActivateTenantUseCaseResult> 执行结果
   */
  async execute(command: ActivateTenantCommand): Promise<ActivateTenantUseCaseResult> {
    try {
      this.logger.log(`开始执行激活租户用例: ${command.commandId}`)

      // 1. 验证命令数据
      command.validate()

      // 2. 验证激活租户的业务规则
      const validationResult = await this.tenantValidator.validateActivateTenant({
        tenantId: command.data.tenantId,
        activatedBy: command.data.activatedBy,
        reason: command.data.reason,
      })

      if (!validationResult.isValid) {
        this.logger.warn(`激活租户验证失败: ${validationResult.errors.join(', ')}`)
        return {
          success: false,
          error: validationResult.errors.join('; '),
          warnings: validationResult.warnings,
        }
      }

      // 3. 执行激活租户业务逻辑
      const result = await this.tenantService.activateTenant({
        tenantId: command.data.tenantId,
        reason: command.data.reason,
        activatedBy: command.data.activatedBy,
      })

      // 4. 记录成功日志
      if (result.success) {
        this.logger.log(
          `租户激活成功: ${result.tenantId}, 激活者: ${command.data.activatedBy}`,
        )
      } else {
        this.logger.error(`租户激活失败: ${result.error}`)
      }

      return result
    } catch (error) {
      // 5. 异常处理
      this.logger.error('激活租户用例执行失败', error)
      return {
        success: false,
        error: (error as Error).message,
      }
    }
  }

  /**
   * @method logUseCaseExecution
   * @description 记录用例执行日志
   * @param command 激活租户命令
   * @param result 执行结果
   */
  private logUseCaseExecution(command: ActivateTenantCommand, result: ActivateTenantUseCaseResult): void {
    const logData = {
      commandId: command.commandId,
      tenantId: command.data.tenantId,
      activatedBy: command.data.activatedBy,
      reason: command.data.reason,
      success: result.success,
      message: result.message,
      error: result.error,
      timestamp: new Date().toISOString(),
    }

    if (result.success) {
      this.logger.log('激活租户用例执行成功', logData)
    } else {
      this.logger.error('激活租户用例执行失败', logData)
    }
  }
}

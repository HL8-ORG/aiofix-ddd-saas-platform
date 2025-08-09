import { Injectable, Inject } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { CreateTenantCommand } from '../commands/create-tenant.command'
import { TenantValidator } from '../validators/tenant-validator'
import type { ITenantService } from '../services/interfaces/tenant-service.interface'
import { TENANT_SERVICE_TOKEN } from '../services/interfaces/tenant-service.interface'

/**
 * @interface CreateTenantUseCaseResult
 * @description 创建租户用例的执行结果
 */
export interface CreateTenantUseCaseResult {
  success: boolean
  tenantId?: string
  adminUserId?: string
  error?: string
  warnings?: string[]
}

/**
 * @class CreateTenantUseCase
 * @description 创建租户用例
 * 
 * 该用例负责协调创建租户的完整业务流程，包括：
 * 1. 验证输入数据
 * 2. 执行业务规则验证
 * 3. 调用领域服务创建租户
 * 4. 处理结果和异常
 * 
 * 主要原理与机制：
 * - 遵循单一职责原则，专注于创建租户的业务逻辑
 * - 通过依赖注入获取所需的服务和验证器
 * - 提供清晰的输入输出接口
 * - 包含完整的错误处理和日志记录
 */
@Injectable()
export class CreateTenantUseCase {
  constructor(
    @Inject(TENANT_SERVICE_TOKEN)
    private readonly tenantService: ITenantService,
    private readonly tenantValidator: TenantValidator,
    @Inject(Logger)
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行创建租户用例
   * @param command 创建租户命令
   * @returns Promise<CreateTenantUseCaseResult> 执行结果
   */
  async execute(command: CreateTenantCommand): Promise<CreateTenantUseCaseResult> {
    try {
      this.logger.log(`开始执行创建租户用例: ${command.commandId}`)

      // 1. 验证命令数据
      command.validate()

      // 2. 验证业务规则
      const validationResult = await this.tenantValidator.validateCreateTenant({
        name: command.data.name,
        code: command.data.code,
        adminUserInfo: command.data.adminUserInfo,
      })

      if (!validationResult.isValid) {
        this.logger.warn(`创建租户验证失败: ${validationResult.errors.join(', ')}`)
        return {
          success: false,
          error: validationResult.errors.join('; '),
          warnings: validationResult.warnings,
        }
      }

      // 3. 执行创建租户业务逻辑
      const result = await this.tenantService.createTenant({
        name: command.data.name,
        code: command.data.code,
        description: command.data.description,
        adminUserInfo: command.data.adminUserInfo,
        settings: command.data.settings,
        metadata: command.data.metadata,
      })

      // 4. 记录成功日志
      if (result.success) {
        this.logger.log(
          `租户创建成功: ${result.tenantId}, 管理员用户: ${result.adminUserId}`,
        )
      } else {
        this.logger.error(`租户创建失败: ${result.error}`)
      }

      return result
    } catch (error) {
      // 5. 异常处理
      this.logger.error('创建租户用例执行失败', error)
      return {
        success: false,
        error: (error as Error).message,
      }
    }
  }

  /**
   * @method logUseCaseExecution
   * @description 记录用例执行日志
   * @param command 创建租户命令
   * @param result 执行结果
   */
  private logUseCaseExecution(command: CreateTenantCommand, result: CreateTenantUseCaseResult): void {
    const logData = {
      commandId: command.commandId,
      tenantName: command.data.name,
      tenantCode: command.data.code,
      success: result.success,
      tenantId: result.tenantId,
      adminUserId: result.adminUserId,
      error: result.error,
      timestamp: new Date().toISOString(),
    }

    if (result.success) {
      this.logger.log('创建租户用例执行成功', logData)
    } else {
      this.logger.error('创建租户用例执行失败', logData)
    }
  }
}

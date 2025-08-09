import { Injectable, Inject } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { ActivateTenantCommand } from '../commands/activate-tenant.command'
import { ActivateTenantUseCase, ActivateTenantUseCaseResult } from '../use-cases/activate-tenant.use-case'

/**
 * @interface ICommandHandler
 * @description 命令处理器接口
 */
export interface ICommandHandler<T> {
  execute(command: T): Promise<any>
}

/**
 * @interface ActivateTenantHandlerDependencies
 * @description 激活租户处理器依赖项
 */
export interface ActivateTenantHandlerDependencies {
  activateTenantUseCase: ActivateTenantUseCase
  logger: Logger
}

/**
 * @class ActivateTenantHandler
 * @description 激活租户命令处理器
 * 
 * 该处理器负责接收和分发激活租户命令，将具体的业务逻辑委托给用例。
 * 
 * 主要原理与机制：
 * - 遵循单一职责原则，专注于命令的接收和分发
 * - 通过依赖注入获取用例实例
 * - 提供统一的命令处理接口
 * - 包含基本的错误处理和日志记录
 */
@Injectable()
export class ActivateTenantHandler implements ICommandHandler<ActivateTenantCommand> {
  constructor(
    private readonly activateTenantUseCase: ActivateTenantUseCase,
    @Inject(Logger)
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行激活租户命令
   * @param command 激活租户命令
   * @returns Promise<ActivateTenantUseCaseResult> 执行结果
   */
  async execute(command: ActivateTenantCommand): Promise<ActivateTenantUseCaseResult> {
    try {
      this.logger.log(`开始处理激活租户命令: ${command.commandId}`)

      // 委托给用例执行具体的业务逻辑
      const result = await this.activateTenantUseCase.execute(command)

      // 记录命令处理结果
      this.logCommandExecution(command, result)

      return result
    } catch (error) {
      this.logger.error('激活租户命令处理失败', error)
      return {
        success: false,
        error: (error as Error).message,
      }
    }
  }

  /**
   * @method logCommandExecution
   * @description 记录命令执行日志
   * @param command 激活租户命令
   * @param result 执行结果
   */
  private logCommandExecution(command: ActivateTenantCommand, result: ActivateTenantUseCaseResult): void {
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
      this.logger.log('激活租户命令处理成功', logData)
    } else {
      this.logger.error('激活租户命令处理失败', logData)
    }
  }
}

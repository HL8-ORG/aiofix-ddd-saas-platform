import { Injectable, Inject } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { SuspendTenantCommand } from '../commands/suspend-tenant.command'
import { SuspendTenantUseCase, SuspendTenantUseCaseResult } from '../use-cases/suspend-tenant.use-case'

/**
 * @class SuspendTenantHandler
 * @description 暂停租户命令处理器
 * 
 * 该处理器负责处理暂停租户命令，主要职责包括：
 * 1. 接收暂停租户命令
 * 2. 委托给SuspendTenantUseCase执行业务逻辑
 * 3. 记录命令处理日志
 * 4. 返回处理结果
 * 
 * 主要原理与机制：
 * - 遵循CQRS模式中的Command Handler模式
 * - 作为适配器层，连接命令和用例
 * - 提供统一的错误处理和日志记录
 * - 保持处理器的简洁性，业务逻辑委托给用例
 */
@Injectable()
export class SuspendTenantHandler {
  constructor(
    private readonly suspendTenantUseCase: SuspendTenantUseCase,
    @Inject(Logger)
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行暂停租户命令
   * @param command 暂停租户命令
   * @returns Promise<SuspendTenantUseCaseResult> 执行结果
   */
  async execute(command: SuspendTenantCommand): Promise<SuspendTenantUseCaseResult> {
    try {
      this.logger.log(`开始处理暂停租户命令: ${command.commandId}`)

      // 验证命令数据
      command.validate()

      // 委托给用例执行业务逻辑
      const result = await this.suspendTenantUseCase.execute(command.data)

      // 记录处理结果
      this.logCommandExecution(command, result)

      return result
    } catch (error) {
      // 处理验证失败或其他异常
      const errorResult: SuspendTenantUseCaseResult = {
        success: false,
        error: (error as Error).message,
      }

      this.logger.error('暂停租户命令处理失败', {
        commandId: command.commandId,
        tenantId: command.data.tenantId,
        suspendedBy: command.data.suspendedBy,
        reason: command.data.reason,
        success: false,
        error: (error as Error).message,
      })

      return errorResult
    }
  }

  /**
   * @method logCommandExecution
   * @description 记录命令执行日志
   * @param command 暂停租户命令
   * @param result 执行结果
   */
  private logCommandExecution(command: SuspendTenantCommand, result: SuspendTenantUseCaseResult): void {
    const logData = {
      commandId: command.commandId,
      tenantId: command.data.tenantId,
      suspendedBy: command.data.suspendedBy,
      reason: command.data.reason,
      success: result.success,
      message: result.message,
      error: result.error,
      warnings: result.warnings,
      timestamp: new Date().toISOString(),
    }

    if (result.success) {
      this.logger.log('暂停租户命令处理成功', logData)
    } else {
      this.logger.error('暂停租户命令处理失败', logData)
    }
  }
}

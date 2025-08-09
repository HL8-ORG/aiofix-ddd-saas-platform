/**
 * @class CreateTenantHandler
 * @description
 * 创建租户命令处理器，实现CQRS模式中的命令处理器。该处理器负责
 * 处理创建租户的命令，协调领域对象完成业务用例。
 * 
 * 主要原理与机制：
 * 1. 命令处理：接收并处理创建租户的命令
 * 2. 业务协调：协调领域对象完成业务逻辑
 * 3. 事务管理：确保操作的原子性和一致性
 * 4. 事件发布：操作完成后发布领域事件
 * 5. 审计日志：记录关键操作的审计信息
 * 6. 异常处理：统一的异常处理机制
 */
import { Injectable, Inject } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { CreateTenantCommand } from '../commands/create-tenant.command'
import { CreateTenantUseCase, CreateTenantUseCaseResult } from '../use-cases/create-tenant.use-case'

/**
 * @interface ICommandHandler
 * @description 命令处理器接口
 */
export interface ICommandHandler<T> {
  execute(command: T): Promise<any>
}

/**
 * @interface CreateTenantHandlerDependencies
 * @description 创建租户处理器依赖项
 */
export interface CreateTenantHandlerDependencies {
  createTenantUseCase: CreateTenantUseCase
  logger: Logger
}

/**
 * @class CreateTenantHandler
 * @description 创建租户命令处理器
 * 
 * 该处理器负责接收和分发创建租户命令，将具体的业务逻辑委托给用例。
 * 
 * 主要原理与机制：
 * - 遵循单一职责原则，专注于命令的接收和分发
 * - 通过依赖注入获取用例实例
 * - 提供统一的命令处理接口
 * - 包含基本的错误处理和日志记录
 */
@Injectable()
export class CreateTenantHandler implements ICommandHandler<CreateTenantCommand> {
  constructor(
    private readonly createTenantUseCase: CreateTenantUseCase,
    @Inject(Logger)
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行创建租户命令
   * @param command 创建租户命令
   * @returns Promise<CreateTenantUseCaseResult> 执行结果
   */
  async execute(command: CreateTenantCommand): Promise<CreateTenantUseCaseResult> {
    try {
      this.logger.log(`开始处理创建租户命令: ${command.commandId}`)

      // 委托给用例执行具体的业务逻辑
      const result = await this.createTenantUseCase.execute(command)

      // 记录命令处理结果
      this.logCommandExecution(command, result)

      return result
    } catch (error) {
      this.logger.error('创建租户命令处理失败', error)
      return {
        success: false,
        error: (error as Error).message,
      }
    }
  }

  /**
   * @method logCommandExecution
   * @description 记录命令执行日志
   * @param command 创建租户命令
   * @param result 执行结果
   */
  private logCommandExecution(command: CreateTenantCommand, result: CreateTenantUseCaseResult): void {
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
      this.logger.log('创建租户命令处理成功', logData)
    } else {
      this.logger.error('创建租户命令处理失败', logData)
    }
  }
}

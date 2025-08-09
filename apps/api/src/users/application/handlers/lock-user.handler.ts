/**
 * @class LockUserHandler
 * @description
 * 锁定用户命令处理器，实现CQRS模式中的命令处理部分。该处理器负责接收锁定用户命令，
 * 并委托给对应的用例执行具体的业务逻辑。
 *
 * 主要原理与机制：
 * 1. CQRS模式：将命令和查询职责分离，命令处理器处理写操作
 * 2. 命令处理器：接收命令并委托给用例执行
 * 3. 依赖注入：通过构造函数注入所需的依赖
 * 4. 错误处理：统一的错误处理和异常管理
 * 5. 审计日志：记录命令处理的审计信息
 * 6. 事务管理：确保业务操作的原子性
 */
import { Injectable } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { LockUserCommand, type LockUserResult } from '../commands/lock-user.command'
import { LockUserUseCase } from '../use-cases/lock-user.use-case'

/**
 * @class LockUserHandler
 * @description 锁定用户命令处理器
 * @implements {ICommandHandler<LockUserCommand>}
 */
@Injectable()
@CommandHandler(LockUserCommand)
export class LockUserHandler implements ICommandHandler<LockUserCommand> {
  constructor(
    private readonly lockUserUseCase: LockUserUseCase,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行锁定用户命令
   * @param {LockUserCommand} command - 锁定用户命令
   * @returns {Promise<LockUserResult>} 锁定结果
   */
  async execute(command: LockUserCommand): Promise<LockUserResult> {
    try {
      this.logger.log(
        `开始处理锁定用户命令: commandId=${command.commandId}, userId=${command.userId}`,
        'LockUserHandler',
      )

      // 1. 验证命令
      command.validate()

      // 2. 委托给用例执行
      const result = await this.lockUserUseCase.execute(command)

      // 3. 记录处理结果
      this.logger.log(
        `锁定用户命令处理完成: commandId=${command.commandId}, success=${result.success}`,
        'LockUserHandler',
      )

      return result
    } catch (error) {
      this.logger.error(
        `锁定用户命令处理失败: commandId=${command.commandId}, error=${(error as Error).message}`,
        (error as Error).stack,
        'LockUserHandler',
      )

      return {
        success: false,
        userId: command.userId,
        error: (error as Error).message,
      }
    }
  }
}

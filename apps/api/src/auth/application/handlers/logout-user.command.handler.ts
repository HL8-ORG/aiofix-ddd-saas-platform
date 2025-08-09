/**
 * @class LogoutUserCommandHandler
 * @description
 * 用户登出命令处理器，实现CQRS模式中的命令处理逻辑。该处理器负责
 * 接收登出命令，协调用例执行，并返回处理结果。
 *
 * 主要原理与机制：
 * 1. CQRS模式：将命令和查询职责分离，命令处理器负责状态变更
 * 2. 命令处理器模式：专门处理特定类型的命令
 * 3. 依赖注入：通过构造函数注入必要的依赖服务
 * 4. 事务管理：确保命令执行的原子性
 * 5. 事件发布：命令执行后发布领域事件
 * 6. 安全策略：集成会话管理和安全清理
 */
import { Injectable } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { LogoutUserCommand } from '../commands/logout-user.command'
import { LogoutUserUseCase } from '../use-cases/logout-user.use-case'

export interface LogoutUserCommandResult {
  success: boolean
  message?: string
  error?: string
  sessionId?: string
  logoutTime?: Date
}

/**
 * @class LogoutUserCommandHandler
 * @description 用户登出命令处理器
 * @implements {ICommandHandler<LogoutUserCommand, LogoutUserCommandResult>}
 */
@Injectable()
@CommandHandler(LogoutUserCommand)
export class LogoutUserCommandHandler implements ICommandHandler<LogoutUserCommand, LogoutUserCommandResult> {
  constructor(
    private readonly logoutUserUseCase: LogoutUserUseCase,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行用户登出命令
   * @param {LogoutUserCommand} command - 登出命令
   * @returns {Promise<LogoutUserCommandResult>} 命令执行结果
   */
  async execute(command: LogoutUserCommand): Promise<LogoutUserCommandResult> {
    try {
      this.logger.log('开始处理用户登出命令', {
        userId: command.userId,
        sessionId: command.sessionId,
        tenantId: command.tenantId,
      })

      // 1. 验证命令
      this.validateCommand(command)

      // 2. 执行用例
      const result = await this.logoutUserUseCase.execute(command)

      // 3. 记录命令执行结果
      this.logCommandExecution(command, result)

      return result
    } catch (error) {
      this.logger.error('用户登出命令执行失败', {
        error: (error as Error).message,
        userId: command.userId,
        sessionId: command.sessionId,
        tenantId: command.tenantId,
      })

      return {
        success: false,
        error: (error as Error).message,
      }
    }
  }

  /**
   * @method validateCommand
   * @description 验证命令的有效性
   * @param {LogoutUserCommand} command - 登出命令
   */
  private validateCommand(command: LogoutUserCommand): void {
    // 1. 基础验证
    command.validate()

    // 2. 业务规则验证
    this.validateBusinessRules(command)
  }

  /**
   * @method validateBusinessRules
   * @description 验证业务规则
   * @param {LogoutUserCommand} command - 登出命令
   */
  private validateBusinessRules(command: LogoutUserCommand): void {
    // 检查用户ID格式
    this.validateUserIdFormat(command.userId)

    // 检查会话ID格式
    this.validateSessionIdFormat(command.sessionId)

    // 检查租户ID格式
    this.validateTenantIdFormat(command.tenantId)

    // 检查设备信息
    if (command.deviceInfo) {
      this.validateDeviceInfo(command.deviceInfo)
    }
  }

  /**
   * @method validateUserIdFormat
   * @description 验证用户ID格式
   * @param {string} userId - 用户ID
   */
  private validateUserIdFormat(userId: string): void {
    if (!userId || typeof userId !== 'string') {
      throw new Error('用户ID不能为空')
    }

    // UUID v4格式验证
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(userId)) {
      throw new Error('用户ID必须是有效的UUID v4格式')
    }
  }

  /**
   * @method validateSessionIdFormat
   * @description 验证会话ID格式
   * @param {string} sessionId - 会话ID
   */
  private validateSessionIdFormat(sessionId: string): void {
    if (!sessionId || typeof sessionId !== 'string') {
      throw new Error('会话ID不能为空')
    }

    // UUID v4格式验证
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(sessionId)) {
      throw new Error('会话ID必须是有效的UUID v4格式')
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
   * @method validateDeviceInfo
   * @description 验证设备信息
   * @param {object} deviceInfo - 设备信息
   */
  private validateDeviceInfo(deviceInfo: {
    userAgent: string
    ipAddress: string
    deviceType?: string
    browser?: string
    os?: string
  }): void {
    if (!deviceInfo.userAgent || typeof deviceInfo.userAgent !== 'string') {
      throw new Error('用户代理不能为空')
    }

    if (!deviceInfo.ipAddress || typeof deviceInfo.ipAddress !== 'string') {
      throw new Error('IP地址不能为空')
    }

    // IP地址格式验证
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!ipRegex.test(deviceInfo.ipAddress)) {
      throw new Error('IP地址格式无效')
    }
  }

  /**
   * @method logCommandExecution
   * @description 记录命令执行结果
   * @param {LogoutUserCommand} command - 登出命令
   * @param {LogoutUserCommandResult} result - 执行结果
   */
  private logCommandExecution(command: LogoutUserCommand, result: LogoutUserCommandResult): void {
    if (result.success) {
      this.logger.log('用户登出命令执行成功', {
        userId: command.userId,
        sessionId: command.sessionId,
        tenantId: command.tenantId,
        logoutTime: result.logoutTime,
      })
    } else {
      this.logger.warn('用户登出命令执行失败', {
        userId: command.userId,
        sessionId: command.sessionId,
        tenantId: command.tenantId,
        error: result.error,
      })
    }
  }
}

/**
 * @class RegisterUserCommandHandler
 * @description
 * 用户注册命令处理器，实现CQRS模式中的命令处理逻辑。该处理器负责
 * 接收注册命令，协调用例执行，并返回处理结果。
 *
 * 主要原理与机制：
 * 1. CQRS模式：将命令和查询职责分离，命令处理器负责状态变更
 * 2. 命令处理器模式：专门处理特定类型的命令
 * 3. 依赖注入：通过构造函数注入必要的依赖服务
 * 4. 事务管理：确保命令执行的原子性
 * 5. 事件发布：命令执行后发布领域事件
 */
import { Injectable } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { RegisterUserCommand } from '../commands/register-user.command'
import { RegisterUserUseCase } from '../use-cases/register-user.use-case'

export interface RegisterUserCommandResult {
  success: boolean
  user?: {
    id: string
    email: string
    username: string
    firstName?: string
    lastName?: string
    status: string
    createdAt: Date
  }
  accessToken?: string
  refreshToken?: string
  sessionId?: string
  error?: string
}

@Injectable()
@CommandHandler(RegisterUserCommand)
export class RegisterUserCommandHandler implements ICommandHandler<RegisterUserCommand, RegisterUserCommandResult> {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行用户注册命令
   * @param {RegisterUserCommand} command - 注册命令
   * @returns {Promise<RegisterUserCommandResult>} 命令执行结果
   */
  async execute(command: RegisterUserCommand): Promise<RegisterUserCommandResult> {
    try {
      this.logger.log('开始处理用户注册命令', { email: command.email, username: command.username })

      // 1. 验证命令
      this.validateCommand(command)

      // 2. 执行用例
      const result = await this.registerUserUseCase.execute(command)

      // 3. 记录命令执行结果
      this.logCommandExecution(command, result)

      return result
    } catch (error) {
      this.logger.error('用户注册命令执行失败', {
        error: (error as Error).message,
        email: command.email,
        username: command.username,
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
   */
  private validateCommand(command: RegisterUserCommand): void {
    // 1. 基础验证
    command.validate()

    // 2. 业务规则验证
    this.validateBusinessRules(command)
  }

  /**
   * @method validateBusinessRules
   * @description 验证业务规则
   */
  private validateBusinessRules(command: RegisterUserCommand): void {
    // 检查邮箱和用户名不能相同
    if (command.email === command.username) {
      throw new Error('邮箱和用户名不能相同')
    }

    // 检查密码强度（这里可以调用密码策略服务）
    this.validatePasswordStrength(command.password)

    // 检查设备信息
    this.validateDeviceInfo(command.deviceInfo)
  }

  /**
   * @method validatePasswordStrength
   * @description 验证密码强度
   */
  private validatePasswordStrength(password: string): void {
    // 这里可以调用密码策略服务进行更详细的验证
    if (password.length < 8) {
      throw new Error('密码长度至少8个字符')
    }

    if (!/(?=.*[a-z])/.test(password)) {
      throw new Error('密码必须包含小写字母')
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      throw new Error('密码必须包含大写字母')
    }

    if (!/(?=.*\d)/.test(password)) {
      throw new Error('密码必须包含数字')
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      throw new Error('密码必须包含特殊字符')
    }
  }

  /**
   * @method validateDeviceInfo
   * @description 验证设备信息
   */
  private validateDeviceInfo(deviceInfo: {
    userAgent: string
    ipAddress: string
    deviceType?: string
    browser?: string
    os?: string
  }): void {
    if (!deviceInfo.userAgent) {
      throw new Error('用户代理信息不能为空')
    }

    if (!deviceInfo.ipAddress) {
      throw new Error('IP地址不能为空')
    }

    // 验证IP地址格式
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!ipRegex.test(deviceInfo.ipAddress)) {
      throw new Error('IP地址格式不正确')
    }
  }

  /**
   * @method logCommandExecution
   * @description 记录命令执行结果
   */
  private logCommandExecution(command: RegisterUserCommand, result: RegisterUserCommandResult): void {
    if (result.success) {
      this.logger.log('用户注册命令执行成功', {
        userId: result.user?.id,
        email: command.email,
        username: command.username,
        tenantId: command.tenantId,
      })
    } else {
      this.logger.warn('用户注册命令执行失败', {
        email: command.email,
        username: command.username,
        error: result.error,
      })
    }
  }
}

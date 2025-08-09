/**
 * @class LoginUserCommandHandler
 * @description
 * 用户登录命令处理器，实现CQRS模式中的命令处理逻辑。该处理器负责
 * 接收登录命令，协调用例执行，并返回处理结果。
 *
 * 主要原理与机制：
 * 1. CQRS模式：将命令和查询职责分离，命令处理器负责状态变更
 * 2. 命令处理器模式：专门处理特定类型的命令
 * 3. 依赖注入：通过构造函数注入必要的依赖服务
 * 4. 事务管理：确保命令执行的原子性
 * 5. 事件发布：命令执行后发布领域事件
 * 6. 安全策略：集成登录安全策略和风险控制
 */
import { Injectable } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { LoginUserCommand } from '../commands/login-user.command'
import { LoginUserUseCase } from '../use-cases/login-user.use-case'

export interface LoginUserCommandResult {
  success: boolean
  user?: {
    id: string
    email: string
    username: string
    firstName?: string
    lastName?: string
    status: string
  }
  accessToken?: string
  refreshToken?: string
  sessionId?: string
  requiresTwoFactor?: boolean
  error?: string
  requiresCaptcha?: boolean
  remainingAttempts?: number
  lockoutEndTime?: Date
}

@Injectable()
@CommandHandler(LoginUserCommand)
export class LoginUserCommandHandler implements ICommandHandler<LoginUserCommand, LoginUserCommandResult> {
  constructor(
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行用户登录命令
   * @param {LoginUserCommand} command - 登录命令
   * @returns {Promise<LoginUserCommandResult>} 命令执行结果
   */
  async execute(command: LoginUserCommand): Promise<LoginUserCommandResult> {
    try {
      this.logger.log('开始处理用户登录命令', { email: command.email, tenantId: command.tenantId })

      // 1. 验证命令
      this.validateCommand(command)

      // 2. 执行用例
      const result = await this.loginUserUseCase.execute(command)

      // 3. 记录命令执行结果
      this.logCommandExecution(command, result)

      return result
    } catch (error) {
      this.logger.error('用户登录命令执行失败', {
        error: (error as Error).message,
        email: command.email,
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
   */
  private validateCommand(command: LoginUserCommand): void {
    // 1. 基础验证
    command.validate()

    // 2. 业务规则验证
    this.validateBusinessRules(command)
  }

  /**
   * @method validateBusinessRules
   * @description 验证业务规则
   */
  private validateBusinessRules(command: LoginUserCommand): void {
    // 检查邮箱格式
    this.validateEmailFormat(command.email)

    // 检查密码强度
    this.validatePasswordFormat(command.password)

    // 检查设备信息
    this.validateDeviceInfo(command.deviceInfo)

    // 检查双因素认证码格式（如果提供）
    if (command.twoFactorCode) {
      this.validateTwoFactorCodeFormat(command.twoFactorCode)
    }
  }

  /**
   * @method validateEmailFormat
   * @description 验证邮箱格式
   */
  private validateEmailFormat(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error('邮箱格式不正确')
    }
  }

  /**
   * @method validatePasswordFormat
   * @description 验证密码格式
   */
  private validatePasswordFormat(password: string): void {
    if (!password || password.trim().length === 0) {
      throw new Error('密码不能为空')
    }

    if (password.length < 1) {
      throw new Error('密码长度不能少于1个字符')
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
    if (!deviceInfo.userAgent || deviceInfo.userAgent.trim().length === 0) {
      throw new Error('用户代理信息不能为空')
    }

    if (!deviceInfo.ipAddress || deviceInfo.ipAddress.trim().length === 0) {
      throw new Error('IP地址不能为空')
    }

    // 验证IP地址格式
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!ipRegex.test(deviceInfo.ipAddress)) {
      throw new Error('IP地址格式不正确')
    }
  }

  /**
   * @method validateTwoFactorCodeFormat
   * @description 验证双因素认证码格式
   */
  private validateTwoFactorCodeFormat(code: string): void {
    if (!code || code.trim().length === 0) {
      throw new Error('双因素认证码不能为空')
    }

    // 验证TOTP格式（6位数字）
    const totpRegex = /^\d{6}$/
    if (!totpRegex.test(code)) {
      throw new Error('双因素认证码格式不正确，应为6位数字')
    }
  }

  /**
   * @method logCommandExecution
   * @description 记录命令执行结果
   */
  private logCommandExecution(command: LoginUserCommand, result: LoginUserCommandResult): void {
    if (result.success) {
      this.logger.log('用户登录命令执行成功', {
        userId: result.user?.id,
        email: command.email,
        tenantId: command.tenantId,
        sessionId: result.sessionId,
      })
    } else {
      this.logger.warn('用户登录命令执行失败', {
        email: command.email,
        tenantId: command.tenantId,
        error: result.error,
        requiresTwoFactor: result.requiresTwoFactor,
        requiresCaptcha: result.requiresCaptcha,
        remainingAttempts: result.remainingAttempts,
      })
    }
  }
}

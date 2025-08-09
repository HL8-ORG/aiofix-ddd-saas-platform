/**
 * @class EnableTwoFactorAuthCommandHandler
 * @description
 * 启用双因素认证命令处理器，实现CQRS模式中的命令处理部分。该处理器负责处理启用双因素认证命令，
 * 协调领域对象和服务完成具体的业务逻辑。
 *
 * 主要原理与机制：
 * 1. CQRS模式：将命令和查询职责分离，命令处理器负责状态变更
 * 2. 命令处理器模式：专门处理特定类型的命令
 * 3. 依赖注入：通过构造函数注入所需的依赖
 * 4. 事务管理：确保命令执行的原子性
 * 5. 事件发布：命令执行后发布相应的领域事件
 * 6. 审计日志：记录命令执行的审计信息
 * 7. 错误处理：统一的错误处理和异常管理
 */
import { Injectable } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { EnableTwoFactorAuthCommand } from '../commands/enable-two-factor-auth.command'
import type { EnableTwoFactorAuthUseCase } from '../use-cases/enable-two-factor-auth.use-case'

export interface EnableTwoFactorAuthCommandResult {
  success: boolean
  userId: string
  tenantId: string
  method: string
  secretKey?: string
  qrCodeUrl?: string
  backupCodes?: string[]
  message?: string
  error?: string
}

@Injectable()
@CommandHandler(EnableTwoFactorAuthCommand)
export class EnableTwoFactorAuthCommandHandler
  implements ICommandHandler<EnableTwoFactorAuthCommand, EnableTwoFactorAuthCommandResult> {
  constructor(
    private readonly enableTwoFactorAuthUseCase: EnableTwoFactorAuthUseCase,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行启用双因素认证命令
   */
  async execute(command: EnableTwoFactorAuthCommand): Promise<EnableTwoFactorAuthCommandResult> {
    try {
      // 记录命令执行开始
      this.logger.log(
        `开始执行启用双因素认证命令: ${JSON.stringify(command.toJSON())}`,
        'EnableTwoFactorAuthCommandHandler',
      )

      // 验证命令参数
      this.validateCommand(command)

      // 调用用例执行具体业务逻辑
      const result = await this.enableTwoFactorAuthUseCase.execute(command)

      // 记录命令执行成功
      this.logger.log(
        `启用双因素认证命令执行成功: userId=${command.userId}, method=${command.method}`,
        'EnableTwoFactorAuthCommandHandler',
      )

      return result
    } catch (error) {
      // 记录命令执行失败
      this.logger.error(
        `启用双因素认证命令执行失败: ${error.message}`,
        error.stack,
        'EnableTwoFactorAuthCommandHandler',
      )

      return {
        success: false,
        userId: command.userId,
        tenantId: command.tenantId,
        method: command.method || 'unknown',
        error: error.message,
      }
    }
  }

  /**
   * @method validateCommand
   * @description 验证命令参数
   */
  private validateCommand(command: EnableTwoFactorAuthCommand): void {
    // 基础验证
    if (!command.userId || command.userId.trim().length === 0) {
      throw new Error('用户ID不能为空')
    }

    if (!command.tenantId || command.tenantId.trim().length === 0) {
      throw new Error('租户ID不能为空')
    }

    if (!command.password || command.password.trim().length === 0) {
      throw new Error('密码不能为空')
    }

    // 验证用户ID格式
    this.validateUserIdFormat(command.userId)

    // 验证租户ID格式
    this.validateTenantIdFormat(command.tenantId)

    // 验证密码格式
    this.validatePasswordFormat(command.password)

    // 验证双因素认证方法
    if (command.method) {
      this.validateTwoFactorMethod(command.method)
    }

    // 验证手机号格式（如果提供）
    if (command.phoneNumber) {
      this.validatePhoneNumberFormat(command.phoneNumber)
    }

    // 验证邮箱格式（如果提供）
    if (command.email) {
      this.validateEmailFormat(command.email)
    }

    // 验证设备信息（如果提供）
    if (command.deviceInfo) {
      this.validateDeviceInfo(command.deviceInfo)
    }
  }

  /**
   * @method validateUserIdFormat
   * @description 验证用户ID格式
   */
  private validateUserIdFormat(userId: string): void {
    const userIdRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!userIdRegex.test(userId)) {
      throw new Error('用户ID格式不正确')
    }
  }

  /**
   * @method validateTenantIdFormat
   * @description 验证租户ID格式
   */
  private validateTenantIdFormat(tenantId: string): void {
    const tenantIdRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!tenantIdRegex.test(tenantId)) {
      throw new Error('租户ID格式不正确')
    }
  }

  /**
   * @method validatePasswordFormat
   * @description 验证密码格式
   */
  private validatePasswordFormat(password: string): void {
    if (password.length < 6) {
      throw new Error('密码长度不能少于6个字符')
    }

    // 可以添加更复杂的密码强度验证
    // 例如：包含大小写字母、数字、特殊字符等
  }

  /**
   * @method validateTwoFactorMethod
   * @description 验证双因素认证方法
   */
  private validateTwoFactorMethod(method: string): void {
    const validMethods = ['totp', 'sms', 'email', 'hardware_token']
    if (!validMethods.includes(method)) {
      throw new Error('双因素认证方法不正确')
    }
  }

  /**
   * @method validatePhoneNumberFormat
   * @description 验证手机号格式
   */
  private validatePhoneNumberFormat(phoneNumber: string): void {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (!phoneRegex.test(phoneNumber)) {
      throw new Error('手机号格式不正确')
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
}

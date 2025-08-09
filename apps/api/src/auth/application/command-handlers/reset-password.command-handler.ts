/**
 * @class ResetPasswordCommandHandler
 * @description
 * 重置密码命令处理器，实现CQRS模式中的命令处理部分。该处理器负责处理重置密码命令，
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
import { ResetPasswordCommand } from '../commands/reset-password.command'
import type { ResetPasswordUseCase } from '../use-cases/reset-password.use-case'

export interface ResetPasswordCommandResult {
  success: boolean
  email: string
  tenantId: string
  resetMethod: string
  resetToken?: string
  expiresAt?: Date
  message?: string
  error?: string
}

@Injectable()
@CommandHandler(ResetPasswordCommand)
export class ResetPasswordCommandHandler
  implements ICommandHandler<ResetPasswordCommand, ResetPasswordCommandResult> {
  constructor(
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行重置密码命令
   */
  async execute(command: ResetPasswordCommand): Promise<ResetPasswordCommandResult> {
    try {
      // 记录命令执行开始
      this.logger.log(
        `开始执行重置密码命令: ${JSON.stringify(command.toJSON())}`,
        'ResetPasswordCommandHandler',
      )

      // 验证命令参数
      this.validateCommand(command)

      // 调用用例执行具体业务逻辑
      const result = await this.resetPasswordUseCase.execute(command)

      // 记录命令执行成功
      this.logger.log(
        `重置密码命令执行成功: email=${command.email}, method=${command.resetMethod}`,
        'ResetPasswordCommandHandler',
      )

      return result
    } catch (error) {
      // 记录命令执行失败
      this.logger.error(
        `重置密码命令执行失败: ${error.message}`,
        error.stack,
        'ResetPasswordCommandHandler',
      )

      return {
        success: false,
        email: command.email,
        tenantId: command.tenantId,
        resetMethod: command.resetMethod || 'unknown',
        error: error.message,
      }
    }
  }

  /**
   * @method validateCommand
   * @description 验证命令参数
   */
  private validateCommand(command: ResetPasswordCommand): void {
    // 基础验证
    if (!command.email || command.email.trim().length === 0) {
      throw new Error('邮箱不能为空')
    }

    if (!command.tenantId || command.tenantId.trim().length === 0) {
      throw new Error('租户ID不能为空')
    }

    // 验证邮箱格式
    this.validateEmailFormat(command.email)

    // 验证租户ID格式
    this.validateTenantIdFormat(command.tenantId)

    // 验证重置方法
    if (command.resetMethod) {
      this.validateResetMethod(command.resetMethod)
    }

    // 验证手机号格式（如果提供）
    if (command.phoneNumber) {
      this.validatePhoneNumberFormat(command.phoneNumber)
    }

    // 验证重置令牌格式（如果提供）
    if (command.resetToken) {
      this.validateResetTokenFormat(command.resetToken)
    }

    // 验证新密码格式（如果提供）
    if (command.newPassword) {
      this.validatePasswordFormat(command.newPassword)
    }

    // 验证设备信息（如果提供）
    if (command.deviceInfo) {
      this.validateDeviceInfo(command.deviceInfo)
    }

    // 验证位置信息（如果提供）
    if (command.locationInfo) {
      this.validateLocationInfo(command.locationInfo)
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
   * @method validateResetMethod
   * @description 验证重置方法
   */
  private validateResetMethod(method: string): void {
    const validMethods = ['email', 'sms', 'security_question', 'admin_reset']
    if (!validMethods.includes(method)) {
      throw new Error('重置方法不正确')
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
   * @method validateResetTokenFormat
   * @description 验证重置令牌格式
   */
  private validateResetTokenFormat(resetToken: string): void {
    // 重置令牌应该是安全的随机字符串
    if (resetToken.length < 32) {
      throw new Error('重置令牌长度不能少于32个字符')
    }

    // 验证令牌格式（字母数字组合）
    const tokenRegex = /^[A-Za-z0-9]{32,}$/
    if (!tokenRegex.test(resetToken)) {
      throw new Error('重置令牌格式不正确')
    }
  }

  /**
   * @method validatePasswordFormat
   * @description 验证密码格式
   */
  private validatePasswordFormat(password: string): void {
    if (password.length < 8) {
      throw new Error('密码长度不能少于8个字符')
    }

    // 检查密码复杂度
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      throw new Error('密码必须包含大小写字母和数字')
    }

    // 可选：检查特殊字符
    if (!hasSpecialChar) {
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
   * @method validateLocationInfo
   * @description 验证位置信息
   */
  private validateLocationInfo(locationInfo: {
    country?: string
    region?: string
    city?: string
    latitude?: number
    longitude?: number
  }): void {
    // 验证纬度范围
    if (locationInfo.latitude !== undefined) {
      if (locationInfo.latitude < -90 || locationInfo.latitude > 90) {
        throw new Error('纬度范围不正确，应在-90到90之间')
      }
    }

    // 验证经度范围
    if (locationInfo.longitude !== undefined) {
      if (locationInfo.longitude < -180 || locationInfo.longitude > 180) {
        throw new Error('经度范围不正确，应在-180到180之间')
      }
    }

    // 验证国家代码格式（如果提供）
    if (locationInfo.country) {
      const countryRegex = /^[A-Z]{2}$/
      if (!countryRegex.test(locationInfo.country)) {
        throw new Error('国家代码格式不正确，应为2位大写字母')
      }
    }
  }
}

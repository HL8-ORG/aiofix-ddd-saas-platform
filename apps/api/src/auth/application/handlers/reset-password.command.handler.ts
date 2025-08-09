/**
 * @class ResetPasswordCommandHandler
 * @description
 * 重置密码命令处理器，实现CQRS模式中的命令处理逻辑。该处理器负责
 * 接收重置密码命令，协调用例执行，并返回处理结果。
 *
 * 主要原理与机制：
 * 1. CQRS模式：将命令和查询职责分离，命令处理器负责状态变更
 * 2. 命令处理器模式：专门处理特定类型的命令
 * 3. 依赖注入：通过构造函数注入必要的依赖服务
 * 4. 事务管理：确保命令执行的原子性
 * 5. 事件发布：命令执行后发布领域事件
 * 6. 安全策略：集成密码重置和安全验证
 */
import { Injectable } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ResetPasswordCommand } from '../commands/reset-password.command'
import { ResetPasswordUseCase } from '../use-cases/reset-password.use-case'

export interface ResetPasswordCommandResult {
  success: boolean
  message?: string
  error?: string
  userId?: string
  resetTime?: Date
  emailSent?: boolean
}

/**
 * @class ResetPasswordCommandHandler
 * @description 重置密码命令处理器
 * @implements {ICommandHandler<ResetPasswordCommand, ResetPasswordCommandResult>}
 */
@Injectable()
@CommandHandler(ResetPasswordCommand)
export class ResetPasswordCommandHandler implements ICommandHandler<ResetPasswordCommand, ResetPasswordCommandResult> {
  constructor(
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行重置密码命令
   * @param {ResetPasswordCommand} command - 重置密码命令
   * @returns {Promise<ResetPasswordCommandResult>} 命令执行结果
   */
  async execute(command: ResetPasswordCommand): Promise<ResetPasswordCommandResult> {
    try {
      this.logger.log('开始处理重置密码命令', {
        email: command.email,
        tenantId: command.tenantId,
        resetType: command.resetType,
      })

      // 1. 验证命令
      this.validateCommand(command)

      // 2. 执行用例
      const result = await this.resetPasswordUseCase.execute(command)

      // 3. 记录命令执行结果
      this.logCommandExecution(command, result)

      return result
    } catch (error) {
      this.logger.error('重置密码命令执行失败', {
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
   * @param {ResetPasswordCommand} command - 重置密码命令
   */
  private validateCommand(command: ResetPasswordCommand): void {
    // 1. 基础验证
    command.validate()

    // 2. 业务规则验证
    this.validateBusinessRules(command)
  }

  /**
   * @method validateBusinessRules
   * @description 验证业务规则
   * @param {ResetPasswordCommand} command - 重置密码命令
   */
  private validateBusinessRules(command: ResetPasswordCommand): void {
    // 检查邮箱格式
    this.validateEmailFormat(command.email)

    // 检查租户ID格式
    this.validateTenantIdFormat(command.tenantId)

    // 检查重置类型
    this.validateResetType(command.resetType)

    // 检查设备信息
    if (command.deviceInfo) {
      this.validateDeviceInfo(command.deviceInfo)
    }

    // 检查验证码（如果提供）
    if (command.verificationCode) {
      this.validateVerificationCodeFormat(command.verificationCode)
    }
  }

  /**
   * @method validateEmailFormat
   * @description 验证邮箱格式
   * @param {string} email - 邮箱地址
   */
  private validateEmailFormat(email: string): void {
    if (!email || typeof email !== 'string') {
      throw new Error('邮箱地址不能为空')
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error('邮箱地址格式无效')
    }

    // 检查邮箱长度
    if (email.length > 254) {
      throw new Error('邮箱地址长度不能超过254个字符')
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
   * @method validateResetType
   * @description 验证重置类型
   * @param {string} resetType - 重置类型
   */
  private validateResetType(resetType: string): void {
    if (!resetType || typeof resetType !== 'string') {
      throw new Error('重置类型不能为空')
    }

    const validTypes = ['forgot', 'admin', 'security']
    if (!validTypes.includes(resetType)) {
      throw new Error('重置类型必须是 forgot、admin 或 security 之一')
    }
  }

  /**
   * @method validateVerificationCodeFormat
   * @description 验证验证码格式
   * @param {string} verificationCode - 验证码
   */
  private validateVerificationCodeFormat(verificationCode: string): void {
    if (!verificationCode || typeof verificationCode !== 'string') {
      throw new Error('验证码不能为空')
    }

    // 验证码格式验证（6位数字）
    const codeRegex = /^\d{6}$/
    if (!codeRegex.test(verificationCode)) {
      throw new Error('验证码必须是6位数字')
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
   * @param {ResetPasswordCommand} command - 重置密码命令
   * @param {ResetPasswordCommandResult} result - 执行结果
   */
  private logCommandExecution(command: ResetPasswordCommand, result: ResetPasswordCommandResult): void {
    if (result.success) {
      this.logger.log('重置密码命令执行成功', {
        email: command.email,
        tenantId: command.tenantId,
        resetType: command.resetType,
        resetTime: result.resetTime,
        emailSent: result.emailSent,
      })
    } else {
      this.logger.warn('重置密码命令执行失败', {
        email: command.email,
        tenantId: command.tenantId,
        resetType: command.resetType,
        error: result.error,
      })
    }
  }
}

/**
 * @class VerifyTwoFactorAuthCommandHandler
 * @description
 * 验证双因素认证命令处理器，实现CQRS模式中的命令处理逻辑。该处理器负责
 * 接收验证双因素认证命令，协调用例执行，并返回处理结果。
 *
 * 主要原理与机制：
 * 1. CQRS模式：将命令和查询职责分离，命令处理器负责状态变更
 * 2. 命令处理器模式：专门处理特定类型的命令
 * 3. 依赖注入：通过构造函数注入必要的依赖服务
 * 4. 事务管理：确保命令执行的原子性
 * 5. 事件发布：命令执行后发布领域事件
 * 6. 安全策略：集成双因素认证验证和安全检查
 */
import { Injectable } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { VerifyTwoFactorAuthCommand } from '../commands/verify-two-factor-auth.command'
import { VerifyTwoFactorAuthUseCase } from '../use-cases/verify-two-factor-auth.use-case'

export interface VerifyTwoFactorAuthCommandResult {
  success: boolean
  message?: string
  error?: string
  userId?: string
  verifiedAt?: Date
  accessToken?: string
  refreshToken?: string
  sessionId?: string
  requiresBackupCode?: boolean
}

/**
 * @class VerifyTwoFactorAuthCommandHandler
 * @description 验证双因素认证命令处理器
 * @implements {ICommandHandler<VerifyTwoFactorAuthCommand, VerifyTwoFactorAuthCommandResult>}
 */
@Injectable()
@CommandHandler(VerifyTwoFactorAuthCommand)
export class VerifyTwoFactorAuthCommandHandler implements ICommandHandler<VerifyTwoFactorAuthCommand, VerifyTwoFactorAuthCommandResult> {
  constructor(
    private readonly verifyTwoFactorAuthUseCase: VerifyTwoFactorAuthUseCase,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行验证双因素认证命令
   * @param {VerifyTwoFactorAuthCommand} command - 验证双因素认证命令
   * @returns {Promise<VerifyTwoFactorAuthCommandResult>} 命令执行结果
   */
  async execute(command: VerifyTwoFactorAuthCommand): Promise<VerifyTwoFactorAuthCommandResult> {
    try {
      this.logger.log('开始处理验证双因素认证命令', {
        userId: command.userId,
        tenantId: command.tenantId,
        method: command.method,
      })

      // 1. 验证命令
      this.validateCommand(command)

      // 2. 执行用例
      const result = await this.verifyTwoFactorAuthUseCase.execute(command)

      // 3. 记录命令执行结果
      this.logCommandExecution(command, result)

      return result
    } catch (error) {
      this.logger.error('验证双因素认证命令执行失败', {
        error: (error as Error).message,
        userId: command.userId,
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
   * @param {VerifyTwoFactorAuthCommand} command - 验证双因素认证命令
   */
  private validateCommand(command: VerifyTwoFactorAuthCommand): void {
    // 1. 基础验证
    command.validate()

    // 2. 业务规则验证
    this.validateBusinessRules(command)
  }

  /**
   * @method validateBusinessRules
   * @description 验证业务规则
   * @param {VerifyTwoFactorAuthCommand} command - 验证双因素认证命令
   */
  private validateBusinessRules(command: VerifyTwoFactorAuthCommand): void {
    // 检查用户ID格式
    this.validateUserIdFormat(command.userId)

    // 检查租户ID格式
    this.validateTenantIdFormat(command.tenantId)

    // 检查认证方法
    this.validateAuthMethod(command.method)

    // 检查验证码格式
    this.validateVerificationCodeFormat(command.verificationCode)

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
   * @method validateAuthMethod
   * @description 验证认证方法
   * @param {string} method - 认证方法
   */
  private validateAuthMethod(method: string): void {
    if (!method || typeof method !== 'string') {
      throw new Error('认证方法不能为空')
    }

    const validMethods = ['totp', 'sms', 'email', 'app', 'backup']
    if (!validMethods.includes(method)) {
      throw new Error('认证方法必须是 totp、sms、email、app 或 backup 之一')
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
   * @param {VerifyTwoFactorAuthCommand} command - 验证双因素认证命令
   * @param {VerifyTwoFactorAuthCommandResult} result - 执行结果
   */
  private logCommandExecution(command: VerifyTwoFactorAuthCommand, result: VerifyTwoFactorAuthCommandResult): void {
    if (result.success) {
      this.logger.log('验证双因素认证命令执行成功', {
        userId: command.userId,
        tenantId: command.tenantId,
        method: command.method,
        verifiedAt: result.verifiedAt,
      })
    } else {
      this.logger.warn('验证双因素认证命令执行失败', {
        userId: command.userId,
        tenantId: command.tenantId,
        method: command.method,
        error: result.error,
      })
    }
  }
}

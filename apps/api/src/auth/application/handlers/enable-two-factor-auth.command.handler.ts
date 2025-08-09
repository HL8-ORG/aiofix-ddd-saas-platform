/**
 * @class EnableTwoFactorAuthCommandHandler
 * @description
 * 启用双因素认证命令处理器，实现CQRS模式中的命令处理逻辑。该处理器负责
 * 接收启用双因素认证命令，协调用例执行，并返回处理结果。
 *
 * 主要原理与机制：
 * 1. CQRS模式：将命令和查询职责分离，命令处理器负责状态变更
 * 2. 命令处理器模式：专门处理特定类型的命令
 * 3. 依赖注入：通过构造函数注入必要的依赖服务
 * 4. 事务管理：确保命令执行的原子性
 * 5. 事件发布：命令执行后发布领域事件
 * 6. 安全策略：集成双因素认证和安全验证
 */
import { Injectable } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { EnableTwoFactorAuthCommand } from '../commands/enable-two-factor-auth.command'
import { EnableTwoFactorAuthUseCase } from '../use-cases/enable-two-factor-auth.use-case'

export interface EnableTwoFactorAuthCommandResult {
  success: boolean
  message?: string
  error?: string
  userId?: string
  qrCode?: string
  secretKey?: string
  backupCodes?: string[]
  enabledAt?: Date
}

/**
 * @class EnableTwoFactorAuthCommandHandler
 * @description 启用双因素认证命令处理器
 * @implements {ICommandHandler<EnableTwoFactorAuthCommand, EnableTwoFactorAuthCommandResult>}
 */
@Injectable()
@CommandHandler(EnableTwoFactorAuthCommand)
export class EnableTwoFactorAuthCommandHandler implements ICommandHandler<EnableTwoFactorAuthCommand, EnableTwoFactorAuthCommandResult> {
  constructor(
    private readonly enableTwoFactorAuthUseCase: EnableTwoFactorAuthUseCase,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行启用双因素认证命令
   * @param {EnableTwoFactorAuthCommand} command - 启用双因素认证命令
   * @returns {Promise<EnableTwoFactorAuthCommandResult>} 命令执行结果
   */
  async execute(command: EnableTwoFactorAuthCommand): Promise<EnableTwoFactorAuthCommandResult> {
    try {
      this.logger.log('开始处理启用双因素认证命令', {
        userId: command.userId,
        tenantId: command.tenantId,
        method: command.method,
      })

      // 1. 验证命令
      this.validateCommand(command)

      // 2. 执行用例
      const result = await this.enableTwoFactorAuthUseCase.execute(command)

      // 3. 记录命令执行结果
      this.logCommandExecution(command, result)

      return result
    } catch (error) {
      this.logger.error('启用双因素认证命令执行失败', {
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
   * @param {EnableTwoFactorAuthCommand} command - 启用双因素认证命令
   */
  private validateCommand(command: EnableTwoFactorAuthCommand): void {
    // 1. 基础验证
    command.validate()

    // 2. 业务规则验证
    this.validateBusinessRules(command)
  }

  /**
   * @method validateBusinessRules
   * @description 验证业务规则
   * @param {EnableTwoFactorAuthCommand} command - 启用双因素认证命令
   */
  private validateBusinessRules(command: EnableTwoFactorAuthCommand): void {
    // 检查用户ID格式
    this.validateUserIdFormat(command.userId)

    // 检查租户ID格式
    this.validateTenantIdFormat(command.tenantId)

    // 检查认证方法
    this.validateAuthMethod(command.method)

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

    const validMethods = ['totp', 'sms', 'email', 'app']
    if (!validMethods.includes(method)) {
      throw new Error('认证方法必须是 totp、sms、email 或 app 之一')
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
   * @param {EnableTwoFactorAuthCommand} command - 启用双因素认证命令
   * @param {EnableTwoFactorAuthCommandResult} result - 执行结果
   */
  private logCommandExecution(command: EnableTwoFactorAuthCommand, result: EnableTwoFactorAuthCommandResult): void {
    if (result.success) {
      this.logger.log('启用双因素认证命令执行成功', {
        userId: command.userId,
        tenantId: command.tenantId,
        method: command.method,
        enabledAt: result.enabledAt,
      })
    } else {
      this.logger.warn('启用双因素认证命令执行失败', {
        userId: command.userId,
        tenantId: command.tenantId,
        method: command.method,
        error: result.error,
      })
    }
  }
}

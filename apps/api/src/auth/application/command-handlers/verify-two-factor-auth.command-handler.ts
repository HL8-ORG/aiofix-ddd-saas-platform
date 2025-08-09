/**
 * @class VerifyTwoFactorAuthCommandHandler
 * @description
 * 验证双因素认证命令处理器，实现CQRS模式中的命令处理部分。该处理器负责处理验证双因素认证命令，
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
import { VerifyTwoFactorAuthCommand } from '../commands/verify-two-factor-auth.command'
import type { VerifyTwoFactorAuthUseCase } from '../use-cases/verify-two-factor-auth.use-case'

export interface VerifyTwoFactorAuthCommandResult {
  success: boolean
  userId: string
  tenantId: string
  codeType: string
  isValid: boolean
  sessionId?: string
  accessToken?: string
  refreshToken?: string
  message?: string
  error?: string
}

@Injectable()
@CommandHandler(VerifyTwoFactorAuthCommand)
export class VerifyTwoFactorAuthCommandHandler
  implements ICommandHandler<VerifyTwoFactorAuthCommand, VerifyTwoFactorAuthCommandResult> {
  constructor(
    private readonly verifyTwoFactorAuthUseCase: VerifyTwoFactorAuthUseCase,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行验证双因素认证命令
   */
  async execute(command: VerifyTwoFactorAuthCommand): Promise<VerifyTwoFactorAuthCommandResult> {
    try {
      // 记录命令执行开始
      this.logger.log(
        `开始执行验证双因素认证命令: ${JSON.stringify(command.toJSON())}`,
        'VerifyTwoFactorAuthCommandHandler',
      )

      // 验证命令参数
      this.validateCommand(command)

      // 调用用例执行具体业务逻辑
      const result = await this.verifyTwoFactorAuthUseCase.execute(command)

      // 记录命令执行成功
      this.logger.log(
        `验证双因素认证命令执行成功: userId=${command.userId}, codeType=${command.codeType}`,
        'VerifyTwoFactorAuthCommandHandler',
      )

      return result
    } catch (error) {
      // 记录命令执行失败
      this.logger.error(
        `验证双因素认证命令执行失败: ${error.message}`,
        error.stack,
        'VerifyTwoFactorAuthCommandHandler',
      )

      return {
        success: false,
        userId: command.userId,
        tenantId: command.tenantId,
        codeType: command.codeType || 'unknown',
        isValid: false,
        error: error.message,
      }
    }
  }

  /**
   * @method validateCommand
   * @description 验证命令参数
   */
  private validateCommand(command: VerifyTwoFactorAuthCommand): void {
    // 基础验证
    if (!command.userId || command.userId.trim().length === 0) {
      throw new Error('用户ID不能为空')
    }

    if (!command.tenantId || command.tenantId.trim().length === 0) {
      throw new Error('租户ID不能为空')
    }

    if (!command.code || command.code.trim().length === 0) {
      throw new Error('认证码不能为空')
    }

    // 验证用户ID格式
    this.validateUserIdFormat(command.userId)

    // 验证租户ID格式
    this.validateTenantIdFormat(command.tenantId)

    // 验证认证码格式
    this.validateCodeFormat(command.code, command.codeType)

    // 验证认证码类型
    if (command.codeType) {
      this.validateCodeType(command.codeType)
    }

    // 验证会话ID格式（如果提供）
    if (command.sessionId) {
      this.validateSessionIdFormat(command.sessionId)
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
   * @method validateCodeFormat
   * @description 验证认证码格式
   */
  private validateCodeFormat(code: string, codeType?: string): void {
    if (!code || code.trim().length === 0) {
      throw new Error('认证码不能为空')
    }

    switch (codeType) {
      case 'totp':
        // TOTP码通常是6位数字
        const totpRegex = /^\d{6}$/
        if (!totpRegex.test(code)) {
          throw new Error('TOTP认证码格式不正确，应为6位数字')
        }
        break

      case 'sms':
        // SMS码通常是4-8位数字
        const smsRegex = /^\d{4,8}$/
        if (!smsRegex.test(code)) {
          throw new Error('SMS认证码格式不正确，应为4-8位数字')
        }
        break

      case 'email':
        // 邮箱验证码通常是6位数字
        const emailRegex = /^\d{6}$/
        if (!emailRegex.test(code)) {
          throw new Error('邮箱认证码格式不正确，应为6位数字')
        }
        break

      case 'backup_code':
        // 备用码通常是8位字母数字组合
        const backupRegex = /^[A-Za-z0-9]{8}$/
        if (!backupRegex.test(code)) {
          throw new Error('备用码格式不正确，应为8位字母数字组合')
        }
        break

      case 'hardware_token':
        // 硬件令牌码通常是6-8位数字
        const hardwareRegex = /^\d{6,8}$/
        if (!hardwareRegex.test(code)) {
          throw new Error('硬件令牌认证码格式不正确，应为6-8位数字')
        }
        break

      default:
        // 默认验证：至少4位数字
        const defaultRegex = /^\d{4,}$/
        if (!defaultRegex.test(code)) {
          throw new Error('认证码格式不正确，至少应为4位数字')
        }
        break
    }
  }

  /**
   * @method validateCodeType
   * @description 验证认证码类型
   */
  private validateCodeType(codeType: string): void {
    const validCodeTypes = ['totp', 'sms', 'email', 'backup_code', 'hardware_token']
    if (!validCodeTypes.includes(codeType)) {
      throw new Error('认证码类型不正确')
    }
  }

  /**
   * @method validateSessionIdFormat
   * @description 验证会话ID格式
   */
  private validateSessionIdFormat(sessionId: string): void {
    const sessionIdRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    const customSessionIdRegex = /^[A-Za-z0-9]{32,}$/

    if (!sessionIdRegex.test(sessionId) && !customSessionIdRegex.test(sessionId)) {
      throw new Error('会话ID格式不正确')
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

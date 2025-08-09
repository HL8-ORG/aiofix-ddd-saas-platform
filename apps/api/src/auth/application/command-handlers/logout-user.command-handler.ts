/**
 * @class LogoutUserCommandHandler
 * @description
 * 登出用户命令处理器，实现CQRS模式中的命令处理部分。该处理器负责处理登出用户命令，
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
import { LogoutUserCommand } from '../commands/logout-user.command'
import type { LogoutUserUseCase } from '../use-cases/logout-user.use-case'

export interface LogoutUserCommandResult {
  success: boolean
  sessionId: string
  userId: string
  tenantId: string
  logoutTime: Date
  reason?: string
  message?: string
  error?: string
}

@Injectable()
@CommandHandler(LogoutUserCommand)
export class LogoutUserCommandHandler
  implements ICommandHandler<LogoutUserCommand, LogoutUserCommandResult> {
  constructor(
    private readonly logoutUserUseCase: LogoutUserUseCase,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行登出用户命令
   */
  async execute(command: LogoutUserCommand): Promise<LogoutUserCommandResult> {
    try {
      // 记录命令执行开始
      this.logger.log(
        `开始执行登出用户命令: ${JSON.stringify(command.toJSON())}`,
        'LogoutUserCommandHandler',
      )

      // 验证命令参数
      this.validateCommand(command)

      // 调用用例执行具体业务逻辑
      const result = await this.logoutUserUseCase.execute(command)

      // 记录命令执行成功
      this.logger.log(
        `登出用户命令执行成功: sessionId=${command.sessionId}, userId=${command.userId}`,
        'LogoutUserCommandHandler',
      )

      return result
    } catch (error) {
      // 记录命令执行失败
      this.logger.error(
        `登出用户命令执行失败: ${error.message}`,
        error.stack,
        'LogoutUserCommandHandler',
      )

      return {
        success: false,
        sessionId: command.sessionId,
        userId: command.userId,
        tenantId: command.tenantId,
        logoutTime: new Date(),
        error: error.message,
      }
    }
  }

  /**
   * @method validateCommand
   * @description 验证命令参数
   */
  private validateCommand(command: LogoutUserCommand): void {
    // 基础验证
    if (!command.sessionId || command.sessionId.trim().length === 0) {
      throw new Error('会话ID不能为空')
    }

    if (!command.userId || command.userId.trim().length === 0) {
      throw new Error('用户ID不能为空')
    }

    if (!command.tenantId || command.tenantId.trim().length === 0) {
      throw new Error('租户ID不能为空')
    }

    // 验证会话ID格式
    this.validateSessionIdFormat(command.sessionId)

    // 验证用户ID格式
    this.validateUserIdFormat(command.userId)

    // 验证租户ID格式
    this.validateTenantIdFormat(command.tenantId)

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

/**
 * @class RefreshTokenCommandHandler
 * @description
 * 刷新令牌命令处理器，实现CQRS模式中的命令处理部分。该处理器负责处理刷新令牌命令，
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
import { RefreshTokenCommand } from '../commands/refresh-token.command'
import type { RefreshTokenUseCase } from '../use-cases/refresh-token.use-case'

export interface RefreshTokenCommandResult {
  success: boolean
  userId: string
  tenantId: string
  newAccessToken: string
  newRefreshToken: string
  expiresIn: number
  tokenType: string
  message?: string
  error?: string
}

@Injectable()
@CommandHandler(RefreshTokenCommand)
export class RefreshTokenCommandHandler
  implements ICommandHandler<RefreshTokenCommand, RefreshTokenCommandResult> {
  constructor(
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行刷新令牌命令
   */
  async execute(command: RefreshTokenCommand): Promise<RefreshTokenCommandResult> {
    try {
      // 记录命令执行开始
      this.logger.log(
        `开始执行刷新令牌命令: ${JSON.stringify(command.toJSON())}`,
        'RefreshTokenCommandHandler',
      )

      // 验证命令参数
      this.validateCommand(command)

      // 调用用例执行具体业务逻辑
      const result = await this.refreshTokenUseCase.execute(command)

      // 记录命令执行成功
      this.logger.log(
        `刷新令牌命令执行成功: userId=${result.userId}`,
        'RefreshTokenCommandHandler',
      )

      return result
    } catch (error) {
      // 记录命令执行失败
      this.logger.error(
        `刷新令牌命令执行失败: ${error.message}`,
        error.stack,
        'RefreshTokenCommandHandler',
      )

      return {
        success: false,
        userId: '',
        tenantId: '',
        newAccessToken: '',
        newRefreshToken: '',
        expiresIn: 0,
        tokenType: 'Bearer',
        error: error.message,
      }
    }
  }

  /**
   * @method validateCommand
   * @description 验证命令参数
   */
  private validateCommand(command: RefreshTokenCommand): void {
    // 基础验证
    if (!command.refreshToken || command.refreshToken.trim().length === 0) {
      throw new Error('刷新令牌不能为空')
    }

    // 验证刷新令牌格式
    this.validateRefreshTokenFormat(command.refreshToken)

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
   * @method validateRefreshTokenFormat
   * @description 验证刷新令牌格式
   */
  private validateRefreshTokenFormat(refreshToken: string): void {
    // 刷新令牌应该是JWT格式或自定义格式
    if (refreshToken.length < 32) {
      throw new Error('刷新令牌长度不能少于32个字符')
    }

    // 检查是否为JWT格式（包含两个点）
    const jwtParts = refreshToken.split('.')
    if (jwtParts.length === 3) {
      // JWT格式验证
      this.validateJWTFormat(refreshToken)
    } else {
      // 自定义格式验证
      this.validateCustomTokenFormat(refreshToken)
    }
  }

  /**
   * @method validateJWTFormat
   * @description 验证JWT格式
   */
  private validateJWTFormat(token: string): void {
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/
    if (!jwtRegex.test(token)) {
      throw new Error('JWT格式不正确')
    }

    // 验证JWT的各个部分
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('JWT应包含三个部分')
    }

    // 验证header和payload是否为有效的base64
    try {
      JSON.parse(Buffer.from(parts[0], 'base64').toString())
      JSON.parse(Buffer.from(parts[1], 'base64').toString())
    } catch (error) {
      throw new Error('JWT的header或payload格式不正确')
    }
  }

  /**
   * @method validateCustomTokenFormat
   * @description 验证自定义令牌格式
   */
  private validateCustomTokenFormat(token: string): void {
    // 自定义令牌应该包含字母、数字和特殊字符的组合
    const customTokenRegex = /^[A-Za-z0-9\-_]{32,}$/
    if (!customTokenRegex.test(token)) {
      throw new Error('自定义令牌格式不正确')
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

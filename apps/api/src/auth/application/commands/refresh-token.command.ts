/**
 * @class RefreshTokenCommand
 * @description
 * 令牌刷新命令，实现CQRS模式中的命令部分。该命令封装了刷新访问令牌所需的所有数据，
 * 并通过命令处理器执行具体的业务逻辑。
 *
 * 主要原理与机制：
 * 1. CQRS模式：将命令和查询职责分离，提高系统性能和可维护性
 * 2. 命令模式：封装请求为对象，支持参数化、队列化、日志化等操作
 * 3. 数据验证：在命令层面进行基础数据验证
 * 4. 令牌管理：验证刷新令牌，生成新的访问令牌
 * 5. 安全策略：检查令牌安全策略和风险控制
 */
import { IsString, IsOptional, MinLength } from 'class-validator'

export class RefreshTokenCommand {
  @IsString({ message: '刷新令牌不能为空' })
  @MinLength(32, { message: '刷新令牌长度不能少于32个字符' })
  readonly refreshToken: string

  readonly deviceInfo: {
    userAgent: string
    ipAddress: string
    deviceType?: string
    browser?: string
    os?: string
  }

  @IsOptional()
  readonly locationInfo?: {
    country?: string
    region?: string
    city?: string
    latitude?: number
    longitude?: number
  }

  @IsOptional()
  readonly forceRefresh?: boolean

  constructor(
    refreshToken: string,
    deviceInfo: {
      userAgent: string
      ipAddress: string
      deviceType?: string
      browser?: string
      os?: string
    },
    locationInfo?: {
      country?: string
      region?: string
      city?: string
      latitude?: number
      longitude?: number
    },
    forceRefresh: boolean = false,
  ) {
    this.refreshToken = refreshToken
    this.deviceInfo = deviceInfo
    this.locationInfo = locationInfo
    this.forceRefresh = forceRefresh
  }

  /**
   * @method validate
   * @description 验证命令数据的业务规则
   */
  validate(): void {
    // 基础验证由class-validator处理
    // 这里可以添加更复杂的业务规则验证
    if (!this.refreshToken.trim()) {
      throw new Error('刷新令牌不能为空')
    }

    if (this.refreshToken.length < 32) {
      throw new Error('刷新令牌长度不能少于32个字符')
    }

    // 验证刷新令牌格式
    this.validateRefreshTokenFormat(this.refreshToken)

    // 验证设备信息
    this.validateDeviceInfo(this.deviceInfo)
  }

  /**
   * @method validateRefreshTokenFormat
   * @description 验证刷新令牌格式
   */
  private validateRefreshTokenFormat(refreshToken: string): void {
    // 支持多种刷新令牌格式
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    const randomTokenRegex = /^[A-Za-z0-9]{32,}$/

    if (!jwtRegex.test(refreshToken) && !uuidRegex.test(refreshToken) && !randomTokenRegex.test(refreshToken)) {
      throw new Error('刷新令牌格式不正确')
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
   * @method toJSON
   * @description 转换为JSON格式，用于日志记录
   */
  toJSON(): Record<string, any> {
    return {
      hasRefreshToken: !!this.refreshToken,
      deviceInfo: this.deviceInfo,
      locationInfo: this.locationInfo,
      forceRefresh: this.forceRefresh,
      // 不包含刷新令牌等敏感信息
    }
  }
}

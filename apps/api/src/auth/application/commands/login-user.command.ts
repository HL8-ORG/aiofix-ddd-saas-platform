/**
 * @class LoginUserCommand
 * @description
 * 用户登录命令，实现CQRS模式中的命令部分。该命令封装了用户登录所需的所有数据，
 * 并通过命令处理器执行具体的业务逻辑。
 *
 * 主要原理与机制：
 * 1. CQRS模式：将命令和查询职责分离，提高系统性能和可维护性
 * 2. 命令模式：封装请求为对象，支持参数化、队列化、日志化等操作
 * 3. 数据验证：在命令层面进行基础数据验证
 * 4. 安全策略：集成登录安全策略检查
 * 5. 多因素认证：支持双因素认证流程
 */
import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator'

export class LoginUserCommand {
  @IsEmail({}, { message: '邮箱格式不正确' })
  readonly email: string

  @IsString({ message: '密码不能为空' })
  @MinLength(1, { message: '密码不能为空' })
  readonly password: string

  @IsString({ message: '租户ID不能为空' })
  readonly tenantId: string

  @IsOptional()
  readonly rememberMe?: boolean

  @IsOptional()
  readonly twoFactorCode?: string

  readonly deviceInfo: {
    userAgent: string
    ipAddress: string
    deviceType?: string
    browser?: string
    os?: string
  }

  readonly locationInfo?: {
    country?: string
    region?: string
    city?: string
    latitude?: number
    longitude?: number
  }

  constructor(
    email: string,
    password: string,
    tenantId: string,
    deviceInfo: {
      userAgent: string
      ipAddress: string
      deviceType?: string
      browser?: string
      os?: string
    },
    rememberMe: boolean = false,
    twoFactorCode?: string,
    locationInfo?: {
      country?: string
      region?: string
      city?: string
      latitude?: number
      longitude?: number
    },
  ) {
    this.email = email
    this.password = password
    this.tenantId = tenantId
    this.deviceInfo = deviceInfo
    this.rememberMe = rememberMe
    this.twoFactorCode = twoFactorCode
    this.locationInfo = locationInfo
  }

  /**
   * @method validate
   * @description 验证命令数据的业务规则
   */
  validate(): void {
    // 基础验证由class-validator处理
    // 这里可以添加更复杂的业务规则验证
    if (!this.deviceInfo.userAgent) {
      throw new Error('用户代理信息不能为空')
    }

    if (!this.deviceInfo.ipAddress) {
      throw new Error('IP地址不能为空')
    }

    // 验证IP地址格式
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!ipRegex.test(this.deviceInfo.ipAddress)) {
      throw new Error('IP地址格式不正确')
    }
  }

  /**
   * @method toJSON
   * @description 转换为JSON格式，用于日志记录
   */
  toJSON(): Record<string, any> {
    return {
      email: this.email,
      tenantId: this.tenantId,
      rememberMe: this.rememberMe,
      hasTwoFactorCode: !!this.twoFactorCode,
      deviceInfo: this.deviceInfo,
      locationInfo: this.locationInfo,
      // 不包含密码等敏感信息
    }
  }
}

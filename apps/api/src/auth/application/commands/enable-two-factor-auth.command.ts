/**
 * @class EnableTwoFactorAuthCommand
 * @description
 * 启用双因素认证命令，实现CQRS模式中的命令部分。该命令封装了启用双因素认证所需的所有数据，
 * 并通过命令处理器执行具体的业务逻辑。
 *
 * 主要原理与机制：
 * 1. CQRS模式：将命令和查询职责分离，提高系统性能和可维护性
 * 2. 命令模式：封装请求为对象，支持参数化、队列化、日志化等操作
 * 3. 数据验证：在命令层面进行基础数据验证
 * 4. 安全策略：验证用户密码和权限
 * 5. TOTP生成：生成TOTP密钥和二维码
 * 6. 审计日志：记录双因素认证启用操作的审计信息
 */
import { IsString, IsUUID, IsOptional, MinLength } from 'class-validator'

export enum TwoFactorMethod {
  TOTP = 'totp',
  SMS = 'sms',
  EMAIL = 'email',
  HARDWARE_TOKEN = 'hardware_token',
}

export class EnableTwoFactorAuthCommand {
  @IsString({ message: '用户ID不能为空' })
  readonly userId: string

  @IsString({ message: '租户ID不能为空' })
  readonly tenantId: string

  @IsString({ message: '密码不能为空' })
  @MinLength(1, { message: '密码不能为空' })
  readonly password: string

  @IsOptional()
  @IsString({ message: '双因素认证方法格式不正确' })
  readonly method?: TwoFactorMethod

  @IsOptional()
  @IsString({ message: '手机号格式不正确' })
  readonly phoneNumber?: string

  @IsOptional()
  @IsString({ message: '邮箱格式不正确' })
  readonly email?: string

  @IsOptional()
  readonly deviceInfo?: {
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
  readonly backupCodes?: boolean

  @IsOptional()
  readonly forceEnable?: boolean

  constructor(
    userId: string,
    tenantId: string,
    password: string,
    method?: TwoFactorMethod,
    phoneNumber?: string,
    email?: string,
    deviceInfo?: {
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
    backupCodes: boolean = true,
    forceEnable: boolean = false,
  ) {
    this.userId = userId
    this.tenantId = tenantId
    this.password = password
    this.method = method
    this.phoneNumber = phoneNumber
    this.email = email
    this.deviceInfo = deviceInfo
    this.locationInfo = locationInfo
    this.backupCodes = backupCodes
    this.forceEnable = forceEnable
  }

  /**
   * @method validate
   * @description 验证命令数据的业务规则
   */
  validate(): void {
    // 基础验证由class-validator处理
    // 这里可以添加更复杂的业务规则验证
    if (!this.userId.trim()) {
      throw new Error('用户ID不能为空')
    }

    if (!this.tenantId.trim()) {
      throw new Error('租户ID不能为空')
    }

    if (!this.password.trim()) {
      throw new Error('密码不能为空')
    }

    // 验证用户ID格式
    const userIdRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!userIdRegex.test(this.userId)) {
      throw new Error('用户ID格式不正确')
    }

    // 验证双因素认证方法
    if (this.method && !Object.values(TwoFactorMethod).includes(this.method)) {
      throw new Error('双因素认证方法不正确')
    }

    // 验证手机号格式（如果提供）
    if (this.phoneNumber) {
      this.validatePhoneNumberFormat(this.phoneNumber)
    }

    // 验证邮箱格式（如果提供）
    if (this.email) {
      this.validateEmailFormat(this.email)
    }

    // 验证设备信息（如果提供）
    if (this.deviceInfo) {
      this.validateDeviceInfo(this.deviceInfo)
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

  /**
   * @method toJSON
   * @description 转换为JSON格式，用于日志记录
   */
  toJSON(): Record<string, any> {
    return {
      userId: this.userId,
      tenantId: this.tenantId,
      hasPassword: !!this.password,
      method: this.method,
      hasPhoneNumber: !!this.phoneNumber,
      hasEmail: !!this.email,
      deviceInfo: this.deviceInfo,
      locationInfo: this.locationInfo,
      backupCodes: this.backupCodes,
      forceEnable: this.forceEnable,
      // 不包含密码等敏感信息
    }
  }
}

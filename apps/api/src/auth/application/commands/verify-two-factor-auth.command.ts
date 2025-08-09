/**
 * @class VerifyTwoFactorAuthCommand
 * @description
 * 验证双因素认证命令，实现CQRS模式中的命令部分。该命令封装了验证双因素认证所需的所有数据，
 * 并通过命令处理器执行具体的业务逻辑。
 *
 * 主要原理与机制：
 * 1. CQRS模式：将命令和查询职责分离，提高系统性能和可维护性
 * 2. 命令模式：封装请求为对象，支持参数化、队列化、日志化等操作
 * 3. 数据验证：在命令层面进行基础数据验证
 * 4. 安全策略：验证认证码和会话状态
 * 5. TOTP验证：验证TOTP认证码
 * 6. 审计日志：记录双因素认证验证操作的审计信息
 */
import { IsString, IsUUID, IsOptional, MinLength } from 'class-validator'

export enum TwoFactorCodeType {
  TOTP = 'totp',
  SMS = 'sms',
  EMAIL = 'email',
  BACKUP_CODE = 'backup_code',
  HARDWARE_TOKEN = 'hardware_token',
}

export class VerifyTwoFactorAuthCommand {
  @IsString({ message: '用户ID不能为空' })
  readonly userId: string

  @IsString({ message: '租户ID不能为空' })
  readonly tenantId: string

  @IsString({ message: '认证码不能为空' })
  @MinLength(1, { message: '认证码不能为空' })
  readonly code: string

  @IsOptional()
  @IsString({ message: '认证码类型格式不正确' })
  readonly codeType?: TwoFactorCodeType

  @IsOptional()
  @IsString({ message: '会话ID不能为空' })
  readonly sessionId?: string

  @IsOptional()
  @IsString({ message: '登录令牌不能为空' })
  readonly loginToken?: string

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
  readonly rememberDevice?: boolean

  @IsOptional()
  readonly skipBackupCode?: boolean

  constructor(
    userId: string,
    tenantId: string,
    code: string,
    codeType?: TwoFactorCodeType,
    sessionId?: string,
    loginToken?: string,
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
    rememberDevice: boolean = false,
    skipBackupCode: boolean = false,
  ) {
    this.userId = userId
    this.tenantId = tenantId
    this.code = code
    this.codeType = codeType
    this.sessionId = sessionId
    this.loginToken = loginToken
    this.deviceInfo = deviceInfo
    this.locationInfo = locationInfo
    this.rememberDevice = rememberDevice
    this.skipBackupCode = skipBackupCode
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

    if (!this.code.trim()) {
      throw new Error('认证码不能为空')
    }

    // 验证用户ID格式
    const userIdRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!userIdRegex.test(this.userId)) {
      throw new Error('用户ID格式不正确')
    }

    // 验证认证码类型
    if (this.codeType && !Object.values(TwoFactorCodeType).includes(this.codeType)) {
      throw new Error('认证码类型不正确')
    }

    // 验证认证码格式
    this.validateCodeFormat(this.code, this.codeType)

    // 验证会话ID格式（如果提供）
    if (this.sessionId) {
      this.validateSessionIdFormat(this.sessionId)
    }

    // 验证设备信息（如果提供）
    if (this.deviceInfo) {
      this.validateDeviceInfo(this.deviceInfo)
    }
  }

  /**
   * @method validateCodeFormat
   * @description 验证认证码格式
   */
  private validateCodeFormat(code: string, codeType?: TwoFactorCodeType): void {
    if (!code || code.trim().length === 0) {
      throw new Error('认证码不能为空')
    }

    switch (codeType) {
      case TwoFactorCodeType.TOTP:
        // TOTP码通常是6位数字
        const totpRegex = /^\d{6}$/
        if (!totpRegex.test(code)) {
          throw new Error('TOTP认证码格式不正确，应为6位数字')
        }
        break

      case TwoFactorCodeType.SMS:
        // SMS码通常是4-8位数字
        const smsRegex = /^\d{4,8}$/
        if (!smsRegex.test(code)) {
          throw new Error('SMS认证码格式不正确，应为4-8位数字')
        }
        break

      case TwoFactorCodeType.EMAIL:
        // 邮箱验证码通常是6位数字
        const emailRegex = /^\d{6}$/
        if (!emailRegex.test(code)) {
          throw new Error('邮箱认证码格式不正确，应为6位数字')
        }
        break

      case TwoFactorCodeType.BACKUP_CODE:
        // 备用码通常是8位字母数字组合
        const backupRegex = /^[A-Za-z0-9]{8}$/
        if (!backupRegex.test(code)) {
          throw new Error('备用码格式不正确，应为8位字母数字组合')
        }
        break

      case TwoFactorCodeType.HARDWARE_TOKEN:
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

  /**
   * @method toJSON
   * @description 转换为JSON格式，用于日志记录
   */
  toJSON(): Record<string, any> {
    return {
      userId: this.userId,
      tenantId: this.tenantId,
      hasCode: !!this.code,
      codeType: this.codeType,
      hasSessionId: !!this.sessionId,
      hasLoginToken: !!this.loginToken,
      deviceInfo: this.deviceInfo,
      locationInfo: this.locationInfo,
      rememberDevice: this.rememberDevice,
      skipBackupCode: this.skipBackupCode,
      // 不包含认证码等敏感信息
    }
  }
}

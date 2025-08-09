/**
 * @class CheckLoginSecurityQuery
 * @description
 * 登录安全检查查询，实现CQRS模式中的查询部分。该查询封装了检查登录安全策略所需的所有参数，
 * 并通过查询处理器执行具体的检查逻辑。
 *
 * 主要原理与机制：
 * 1. CQRS模式：将命令和查询职责分离，查询操作不修改状态
 * 2. 查询模式：封装查询请求为对象，支持缓存、优化等操作
 * 3. 数据验证：在查询层面进行基础参数验证
 * 4. 安全策略：检查账户锁定、IP限制、风险评分等
 * 5. 实时检查：支持实时安全策略检查
 * 6. 风险评估：评估登录风险等级
 */
import { IsEmail, IsString, IsOptional, IsIP } from 'class-validator'

export enum SecurityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum RiskFactor {
  ACCOUNT_LOCKED = 'account_locked',
  IP_BLACKLISTED = 'ip_blacklisted',
  TOO_MANY_ATTEMPTS = 'too_many_attempts',
  SUSPICIOUS_LOCATION = 'suspicious_location',
  UNUSUAL_TIME = 'unusual_time',
  KNOWN_ATTACK_PATTERN = 'known_attack_pattern',
  DEVICE_MISMATCH = 'device_mismatch',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
}

export class CheckLoginSecurityQuery {
  @IsEmail({}, { message: '邮箱格式不正确' })
  readonly email: string

  @IsString({ message: '租户ID不能为空' })
  readonly tenantId: string

  @IsIP('4', { message: 'IP地址格式不正确' })
  readonly ipAddress: string

  @IsOptional()
  @IsString({ message: '用户代理格式不正确' })
  readonly userAgent?: string

  @IsOptional()
  @IsString({ message: '设备指纹格式不正确' })
  readonly deviceFingerprint?: string

  @IsOptional()
  readonly locationInfo?: {
    country?: string
    region?: string
    city?: string
    latitude?: number
    longitude?: number
  }

  @IsOptional()
  readonly deviceInfo?: {
    deviceType?: string
    browser?: string
    os?: string
    screenResolution?: string
    timezone?: string
  }

  @IsOptional()
  readonly sessionInfo?: {
    sessionId?: string
    previousLoginTime?: Date
    lastLoginLocation?: string
  }

  @IsOptional()
  readonly additionalContext?: {
    referrer?: string
    requestOrigin?: string
    requestMethod?: string
    requestHeaders?: Record<string, string>
  }

  constructor(
    email: string,
    tenantId: string,
    ipAddress: string,
    userAgent?: string,
    deviceFingerprint?: string,
    locationInfo?: {
      country?: string
      region?: string
      city?: string
      latitude?: number
      longitude?: number
    },
    deviceInfo?: {
      deviceType?: string
      browser?: string
      os?: string
      screenResolution?: string
      timezone?: string
    },
    sessionInfo?: {
      sessionId?: string
      previousLoginTime?: Date
      lastLoginLocation?: string
    },
    additionalContext?: {
      referrer?: string
      requestOrigin?: string
      requestMethod?: string
      requestHeaders?: Record<string, string>
    },
  ) {
    this.email = email
    this.tenantId = tenantId
    this.ipAddress = ipAddress
    this.userAgent = userAgent
    this.deviceFingerprint = deviceFingerprint
    this.locationInfo = locationInfo
    this.deviceInfo = deviceInfo
    this.sessionInfo = sessionInfo
    this.additionalContext = additionalContext
  }

  /**
   * @method validate
   * @description 验证查询参数的业务规则
   */
  validate(): void {
    // 基础验证由class-validator处理
    // 这里可以添加更复杂的业务规则验证
    if (!this.email.trim()) {
      throw new Error('邮箱不能为空')
    }

    if (!this.tenantId.trim()) {
      throw new Error('租户ID不能为空')
    }

    if (!this.ipAddress.trim()) {
      throw new Error('IP地址不能为空')
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(this.email)) {
      throw new Error('邮箱格式不正确')
    }

    // 验证IP地址格式
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!ipRegex.test(this.ipAddress)) {
      throw new Error('IP地址格式不正确')
    }

    // 验证位置信息（如果提供）
    if (this.locationInfo) {
      this.validateLocationInfo(this.locationInfo)
    }

    // 验证设备指纹格式（如果提供）
    if (this.deviceFingerprint) {
      this.validateDeviceFingerprint(this.deviceFingerprint)
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
    if (locationInfo.latitude !== undefined) {
      if (locationInfo.latitude < -90 || locationInfo.latitude > 90) {
        throw new Error('纬度必须在-90到90之间')
      }
    }

    if (locationInfo.longitude !== undefined) {
      if (locationInfo.longitude < -180 || locationInfo.longitude > 180) {
        throw new Error('经度必须在-180到180之间')
      }
    }
  }

  /**
   * @method validateDeviceFingerprint
   * @description 验证设备指纹格式
   */
  private validateDeviceFingerprint(deviceFingerprint: string): void {
    if (!deviceFingerprint || deviceFingerprint.trim().length === 0) {
      throw new Error('设备指纹不能为空')
    }

    if (deviceFingerprint.length < 32) {
      throw new Error('设备指纹长度不能少于32个字符')
    }

    // 验证设备指纹格式（Base64或哈希格式）
    const base64Regex = /^[A-Za-z0-9+/]{32,}={0,2}$/
    const hashRegex = /^[a-f0-9]{32,}$/i

    if (!base64Regex.test(deviceFingerprint) && !hashRegex.test(deviceFingerprint)) {
      throw new Error('设备指纹格式不正确')
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
      ipAddress: this.ipAddress,
      hasUserAgent: !!this.userAgent,
      hasDeviceFingerprint: !!this.deviceFingerprint,
      locationInfo: this.locationInfo,
      deviceInfo: this.deviceInfo,
      sessionInfo: this.sessionInfo,
      hasAdditionalContext: !!this.additionalContext,
    }
  }
}

/**
 * @class ResetPasswordCommand
 * @description
 * 密码重置命令，实现CQRS模式中的命令部分。该命令封装了重置用户密码所需的所有数据，
 * 并通过命令处理器执行具体的业务逻辑。
 *
 * 主要原理与机制：
 * 1. CQRS模式：将命令和查询职责分离，提高系统性能和可维护性
 * 2. 命令模式：封装请求为对象，支持参数化、队列化、日志化等操作
 * 3. 数据验证：在命令层面进行基础数据验证
 * 4. 安全策略：集成密码重置安全策略
 * 5. 邮件服务：发送密码重置邮件
 * 6. 审计日志：记录密码重置操作的审计信息
 */
import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator'

export enum ResetMethod {
  EMAIL = 'email',
  SMS = 'sms',
  ADMIN_RESET = 'admin_reset',
  SECURITY_QUESTIONS = 'security_questions',
}

export class ResetPasswordCommand {
  @IsEmail({}, { message: '邮箱格式不正确' })
  readonly email: string

  @IsString({ message: '租户ID不能为空' })
  readonly tenantId: string

  @IsOptional()
  @IsEnum(ResetMethod, { message: '重置方法格式不正确' })
  readonly resetMethod?: ResetMethod

  @IsOptional()
  @IsString({ message: '手机号格式不正确' })
  readonly phoneNumber?: string

  @IsOptional()
  @IsString({ message: '重置令牌不能为空' })
  readonly resetToken?: string

  @IsOptional()
  @IsString({ message: '新密码不能为空' })
  readonly newPassword?: string

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
  readonly requestReset?: boolean

  @IsOptional()
  readonly confirmReset?: boolean

  constructor(
    email: string,
    tenantId: string,
    resetMethod?: ResetMethod,
    phoneNumber?: string,
    resetToken?: string,
    newPassword?: string,
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
    requestReset: boolean = false,
    confirmReset: boolean = false,
  ) {
    this.email = email
    this.tenantId = tenantId
    this.resetMethod = resetMethod
    this.phoneNumber = phoneNumber
    this.resetToken = resetToken
    this.newPassword = newPassword
    this.deviceInfo = deviceInfo
    this.locationInfo = locationInfo
    this.requestReset = requestReset
    this.confirmReset = confirmReset
  }

  /**
   * @method validate
   * @description 验证命令数据的业务规则
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

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(this.email)) {
      throw new Error('邮箱格式不正确')
    }

    // 验证重置方法
    if (this.resetMethod && !Object.values(ResetMethod).includes(this.resetMethod)) {
      throw new Error('重置方法不正确')
    }

    // 验证手机号格式（如果提供）
    if (this.phoneNumber) {
      this.validatePhoneNumberFormat(this.phoneNumber)
    }

    // 验证重置令牌格式（如果提供）
    if (this.resetToken) {
      this.validateResetTokenFormat(this.resetToken)
    }

    // 验证新密码强度（如果提供）
    if (this.newPassword) {
      this.validatePasswordStrength(this.newPassword)
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
    // 简单的手机号格式验证，实际项目中可以使用更复杂的验证
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (!phoneRegex.test(phoneNumber)) {
      throw new Error('手机号格式不正确')
    }
  }

  /**
   * @method validateResetTokenFormat
   * @description 验证重置令牌格式
   */
  private validateResetTokenFormat(resetToken: string): void {
    if (!resetToken || resetToken.trim().length === 0) {
      throw new Error('重置令牌不能为空')
    }

    if (resetToken.length < 32) {
      throw new Error('重置令牌长度不能少于32个字符')
    }

    // 验证重置令牌格式（UUID或随机字符串）
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    const randomTokenRegex = /^[A-Za-z0-9]{32,}$/

    if (!uuidRegex.test(resetToken) && !randomTokenRegex.test(resetToken)) {
      throw new Error('重置令牌格式不正确')
    }
  }

  /**
   * @method validatePasswordStrength
   * @description 验证密码强度
   */
  private validatePasswordStrength(password: string): void {
    if (!password || password.trim().length === 0) {
      throw new Error('密码不能为空')
    }

    if (password.length < 8) {
      throw new Error('密码长度至少8个字符')
    }

    if (!/(?=.*[a-z])/.test(password)) {
      throw new Error('密码必须包含小写字母')
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      throw new Error('密码必须包含大写字母')
    }

    if (!/(?=.*\d)/.test(password)) {
      throw new Error('密码必须包含数字')
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      throw new Error('密码必须包含特殊字符')
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
      email: this.email,
      tenantId: this.tenantId,
      resetMethod: this.resetMethod,
      hasPhoneNumber: !!this.phoneNumber,
      hasResetToken: !!this.resetToken,
      hasNewPassword: !!this.newPassword,
      deviceInfo: this.deviceInfo,
      locationInfo: this.locationInfo,
      requestReset: this.requestReset,
      confirmReset: this.confirmReset,
      // 不包含敏感信息
    }
  }
}

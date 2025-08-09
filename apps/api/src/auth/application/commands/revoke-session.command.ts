/**
 * @class RevokeSessionCommand
 * @description
 * 会话撤销命令，实现CQRS模式中的命令部分。该命令封装了撤销用户会话所需的所有数据，
 * 并通过命令处理器执行具体的业务逻辑。
 *
 * 主要原理与机制：
 * 1. CQRS模式：将命令和查询职责分离，提高系统性能和可维护性
 * 2. 命令模式：封装请求为对象，支持参数化、队列化、日志化等操作
 * 3. 数据验证：在命令层面进行基础数据验证
 * 4. 会话管理：撤销指定会话，清理相关资源
 * 5. 安全审计：记录会话撤销操作的审计信息
 * 6. 权限控制：验证操作权限和会话所有权
 */
import { IsString, IsUUID, IsOptional, IsEnum } from 'class-validator'

export enum RevokeReason {
  USER_LOGOUT = 'user_logout',
  ADMIN_REVOKE = 'admin_revoke',
  SECURITY_BREACH = 'security_breach',
  SESSION_EXPIRED = 'session_expired',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  MAINTENANCE = 'maintenance',
  OTHER = 'other',
}

export class RevokeSessionCommand {
  @IsString({ message: '会话ID不能为空' })
  readonly sessionId: string

  @IsString({ message: '用户ID不能为空' })
  readonly userId: string

  @IsString({ message: '租户ID不能为空' })
  readonly tenantId: string

  @IsOptional()
  @IsString({ message: '操作者ID不能为空' })
  readonly revokerId?: string

  @IsOptional()
  @IsEnum(RevokeReason, { message: '撤销原因格式不正确' })
  readonly reason?: RevokeReason

  @IsOptional()
  @IsString({ message: '撤销说明不能为空' })
  readonly description?: string

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
  readonly forceRevoke?: boolean

  constructor(
    sessionId: string,
    userId: string,
    tenantId: string,
    revokerId?: string,
    reason?: RevokeReason,
    description?: string,
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
    forceRevoke: boolean = false,
  ) {
    this.sessionId = sessionId
    this.userId = userId
    this.tenantId = tenantId
    this.revokerId = revokerId
    this.reason = reason
    this.description = description
    this.deviceInfo = deviceInfo
    this.locationInfo = locationInfo
    this.forceRevoke = forceRevoke
  }

  /**
   * @method validate
   * @description 验证命令数据的业务规则
   */
  validate(): void {
    // 基础验证由class-validator处理
    // 这里可以添加更复杂的业务规则验证
    if (!this.sessionId.trim()) {
      throw new Error('会话ID不能为空')
    }

    if (!this.userId.trim()) {
      throw new Error('用户ID不能为空')
    }

    if (!this.tenantId.trim()) {
      throw new Error('租户ID不能为空')
    }

    // 验证会话ID格式
    const sessionIdRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    const customSessionIdRegex = /^[A-Za-z0-9]{32,}$/

    if (!sessionIdRegex.test(this.sessionId) && !customSessionIdRegex.test(this.sessionId)) {
      throw new Error('会话ID格式不正确')
    }

    // 验证用户ID格式
    const userIdRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!userIdRegex.test(this.userId)) {
      throw new Error('用户ID格式不正确')
    }

    // 验证操作者ID格式（如果提供）
    if (this.revokerId) {
      if (!userIdRegex.test(this.revokerId)) {
        throw new Error('操作者ID格式不正确')
      }
    }

    // 验证撤销原因
    if (this.reason && !Object.values(RevokeReason).includes(this.reason)) {
      throw new Error('撤销原因不正确')
    }
  }

  /**
   * @method toJSON
   * @description 转换为JSON格式，用于日志记录
   */
  toJSON(): Record<string, any> {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      tenantId: this.tenantId,
      revokerId: this.revokerId,
      reason: this.reason,
      description: this.description,
      deviceInfo: this.deviceInfo,
      locationInfo: this.locationInfo,
      forceRevoke: this.forceRevoke,
    }
  }
}

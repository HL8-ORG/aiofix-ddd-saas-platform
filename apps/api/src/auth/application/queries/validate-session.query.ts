/**
 * @class ValidateSessionQuery
 * @description
 * 会话验证查询，实现CQRS模式中的查询部分。该查询封装了验证会话有效性所需的所有参数，
 * 并通过查询处理器执行具体的验证逻辑。
 *
 * 主要原理与机制：
 * 1. CQRS模式：将命令和查询职责分离，查询操作不修改状态
 * 2. 查询模式：封装查询请求为对象，支持缓存、优化等操作
 * 3. 数据验证：在查询层面进行基础参数验证
 * 4. 权限控制：查询时需要考虑用户权限和数据隔离
 * 5. 会话管理：验证会话的有效性和权限
 */
import { IsString, IsUUID, IsOptional } from 'class-validator'

export class ValidateSessionQuery {
  @IsString({ message: '会话ID不能为空' })
  readonly sessionId: string

  @IsString({ message: '访问令牌不能为空' })
  readonly accessToken: string

  @IsOptional()
  @IsString({ message: '租户ID不能为空' })
  readonly tenantId?: string

  @IsOptional()
  @IsString({ message: '用户ID不能为空' })
  readonly userId?: string

  @IsOptional()
  readonly includeUserInfo?: boolean

  @IsOptional()
  readonly includeSessionDetails?: boolean

  constructor(
    sessionId: string,
    accessToken: string,
    tenantId?: string,
    userId?: string,
    includeUserInfo: boolean = false,
    includeSessionDetails: boolean = false,
  ) {
    this.sessionId = sessionId
    this.accessToken = accessToken
    this.tenantId = tenantId
    this.userId = userId
    this.includeUserInfo = includeUserInfo
    this.includeSessionDetails = includeSessionDetails
  }

  /**
   * @method validate
   * @description 验证查询参数的业务规则
   */
  validate(): void {
    // 基础验证由class-validator处理
    // 这里可以添加更复杂的业务规则验证
    if (!this.sessionId.trim()) {
      throw new Error('会话ID不能为空')
    }

    if (!this.accessToken.trim()) {
      throw new Error('访问令牌不能为空')
    }

    // 验证会话ID格式（UUID或自定义格式）
    const sessionIdRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    const customSessionIdRegex = /^[A-Za-z0-9]{32,}$/

    if (!sessionIdRegex.test(this.sessionId) && !customSessionIdRegex.test(this.sessionId)) {
      throw new Error('会话ID格式不正确')
    }
  }

  /**
   * @method toJSON
   * @description 转换为JSON格式，用于日志记录
   */
  toJSON(): Record<string, any> {
    return {
      sessionId: this.sessionId,
      hasAccessToken: !!this.accessToken,
      tenantId: this.tenantId,
      userId: this.userId,
      includeUserInfo: this.includeUserInfo,
      includeSessionDetails: this.includeSessionDetails,
    }
  }
}

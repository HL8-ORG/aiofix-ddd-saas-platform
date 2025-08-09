/**
 * @class GetUserProfileQuery
 * @description
 * 获取用户资料查询，实现CQRS模式中的查询部分。该查询封装了获取用户资料所需的所有参数，
 * 并通过查询处理器执行具体的查询逻辑。
 *
 * 主要原理与机制：
 * 1. CQRS模式：将命令和查询职责分离，查询操作不修改状态
 * 2. 查询模式：封装查询请求为对象，支持缓存、优化等操作
 * 3. 数据验证：在查询层面进行基础参数验证
 * 4. 权限控制：查询时需要考虑用户权限和数据隔离
 * 5. 敏感信息处理：根据权限决定是否返回敏感数据
 * 6. 多租户支持：支持多租户数据隔离
 */
import { IsString, IsUUID, IsOptional, IsBoolean } from 'class-validator'
import { generateUuid } from '@/shared/utils/uuid.util'

export interface GetUserProfileQueryDto {
  userId: string
  tenantId: string
  includeSensitiveData?: boolean
}

export interface GetUserProfileResult {
  success: boolean
  userProfile: {
    id: string
    email: string
    username: string
    firstName?: string
    lastName?: string
    displayName?: string
    avatar?: string
    phone?: string
    status: string
    emailVerified: boolean
    phoneVerified: boolean
    twoFactorEnabled: boolean
    lastLoginAt?: Date
    createdAt: Date
    updatedAt: Date
    preferences?: Record<string, unknown>
    loginAttempts?: number
    lockedUntil?: Date
    passwordChangedAt?: Date
    twoFactorSecret?: string
  } | null
  error?: string
}

/**
 * @class GetUserProfileQuery
 * @description 获取用户资料查询
 */
export class GetUserProfileQuery {
  /**
   * @property queryId
   * @description 查询唯一标识符
   */
  readonly queryId: string

  /**
   * @property userId
   * @description 用户ID
   */
  @IsUUID('4', { message: '用户ID必须是有效的UUID v4格式' })
  readonly userId: string

  /**
   * @property tenantId
   * @description 租户ID
   */
  @IsUUID('4', { message: '租户ID必须是有效的UUID v4格式' })
  readonly tenantId: string

  /**
   * @property includeSensitiveData
   * @description 是否包含敏感数据
   */
  @IsOptional()
  @IsBoolean({ message: 'includeSensitiveData必须是布尔值' })
  readonly includeSensitiveData?: boolean

  /**
   * @property createdAt
   * @description 查询创建时间
   */
  readonly createdAt: Date

  /**
   * @constructor
   * @description 创建获取用户资料查询
   * @param {GetUserProfileQueryDto} data - 查询数据
   */
  constructor(data: GetUserProfileQueryDto) {
    this.queryId = generateUuid()
    this.userId = data.userId
    this.tenantId = data.tenantId
    this.includeSensitiveData = data.includeSensitiveData || false
    this.createdAt = new Date()
  }

  /**
   * @method validate
   * @description 验证查询数据的有效性
   * @throws {Error} 当数据无效时抛出异常
   */
  validate(): void {
    // 基础验证由装饰器处理
    // 业务规则验证
    if (!this.userId || this.userId.trim() === '') {
      throw new Error('用户ID不能为空')
    }

    if (!this.tenantId || this.tenantId.trim() === '') {
      throw new Error('租户ID不能为空')
    }
  }

  /**
   * @method toJSON
   * @description 将查询转换为JSON对象
   * @returns {object} JSON对象
   */
  toJSON(): object {
    return {
      queryId: this.queryId,
      userId: this.userId,
      tenantId: this.tenantId,
      includeSensitiveData: this.includeSensitiveData,
      createdAt: this.createdAt,
    }
  }

  /**
   * @method toString
   * @description 将查询转换为字符串
   * @returns {string} 字符串表示
   */
  toString(): string {
    return `GetUserProfileQuery(userId=${this.userId}, tenantId=${this.tenantId}, includeSensitiveData=${this.includeSensitiveData})`
  }
}

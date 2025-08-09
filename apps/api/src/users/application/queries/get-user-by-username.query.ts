/**
 * @class GetUserByUsernameQuery
 * @description
 * 根据用户名查询用户查询，实现CQRS模式中的查询部分。该查询封装了根据用户名查询用户所需的所有参数，
 * 并通过查询处理器执行具体的查询逻辑。
 *
 * 主要原理与机制：
 * 1. CQRS模式：将命令和查询职责分离，查询操作不修改状态
 * 2. 查询模式：封装查询请求为对象，支持缓存、优化等操作
 * 3. 数据验证：在查询层面进行基础参数验证
 * 4. 权限控制：查询时需要考虑用户权限和数据隔离
 * 5. 分页支持：支持分页查询和排序
 * 6. 过滤条件：支持多种过滤条件
 * 7. 安全审计：用于安全审计和风险分析
 */
import { IsString, IsUUID, IsOptional } from 'class-validator'
import { generateUuid } from '@/shared/utils/uuid.util'

export interface GetUserByUsernameQueryDto {
  username: string
  tenantId: string
  includeDeleted?: boolean
  includeSensitiveData?: boolean
}

export interface GetUserByUsernameResult {
  success: boolean
  user?: {
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
  }
  error?: string
}

/**
 * @class GetUserByUsernameQuery
 * @description 根据用户名查询用户查询
 */
export class GetUserByUsernameQuery {
  /**
   * @property queryId
   * @description 查询唯一标识符
   */
  readonly queryId: string

  /**
   * @property username
   * @description 用户名
   */
  @IsString({ message: '用户名必须是字符串' })
  readonly username: string

  /**
   * @property tenantId
   * @description 租户ID
   */
  @IsUUID('4', { message: '租户ID必须是有效的UUID v4格式' })
  readonly tenantId: string

  /**
   * @property includeDeleted
   * @description 是否包含已删除的用户
   */
  @IsOptional()
  readonly includeDeleted?: boolean

  /**
   * @property includeSensitiveData
   * @description 是否包含敏感数据
   */
  @IsOptional()
  readonly includeSensitiveData?: boolean

  /**
   * @property createdAt
   * @description 查询创建时间
   */
  readonly createdAt: Date

  /**
   * @constructor
   * @description 创建根据用户名查询用户查询
   * @param {GetUserByUsernameQueryDto} data - 查询数据
   */
  constructor(data: GetUserByUsernameQueryDto) {
    this.queryId = generateUuid()
    this.username = data.username.toLowerCase().trim()
    this.tenantId = data.tenantId
    this.includeDeleted = data.includeDeleted || false
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
    if (!this.username || this.username.trim() === '') {
      throw new Error('用户名不能为空')
    }

    if (!this.tenantId || this.tenantId.trim() === '') {
      throw new Error('租户ID不能为空')
    }

    // 验证用户名格式
    if (this.username.length < 3) {
      throw new Error('用户名长度不能少于3个字符')
    }

    if (this.username.length > 50) {
      throw new Error('用户名长度不能超过50个字符')
    }

    // 验证用户名只能包含字母、数字、下划线
    if (!/^[a-zA-Z0-9_]+$/.test(this.username)) {
      throw new Error('用户名只能包含字母、数字和下划线')
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
      username: this.username,
      tenantId: this.tenantId,
      includeDeleted: this.includeDeleted,
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
    return `GetUserByUsernameQuery(username=${this.username}, tenantId=${this.tenantId})`
  }
}

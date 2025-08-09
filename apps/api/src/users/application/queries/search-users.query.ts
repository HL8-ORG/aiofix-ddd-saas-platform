/**
 * @class SearchUsersQuery
 * @description
 * 搜索用户查询，实现CQRS模式中的查询部分。该查询封装了搜索用户所需的所有参数，
 * 并通过查询处理器执行具体的查询逻辑。
 *
 * 主要原理与机制：
 * 1. CQRS模式：将命令和查询职责分离，查询操作不修改状态
 * 2. 查询模式：封装查询请求为对象，支持缓存、优化等操作
 * 3. 数据验证：在查询层面进行基础参数验证
 * 4. 权限控制：查询时需要考虑用户权限和数据隔离
 * 5. 分页支持：支持分页查询和排序
 * 6. 过滤条件：支持多种过滤条件
 * 7. 搜索优化：支持全文搜索和模糊匹配
 */
import { IsString, IsUUID, IsOptional, IsNumber, IsIn, Min, Max } from 'class-validator'
import { generateUuid } from '@/shared/utils/uuid.util'

export interface SearchUsersQueryDto {
  tenantId: string
  searchTerm?: string
  page?: number
  size?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  status?: string
  organizationId?: string
  roleId?: string
  includeDeleted?: boolean
}

export interface SearchUsersResult {
  success: boolean
  users: Array<{
    id: string
    email: string
    username: string
    firstName?: string
    lastName?: string
    displayName?: string
    avatar?: string
    status: string
    emailVerified: boolean
    phoneVerified: boolean
    twoFactorEnabled: boolean
    lastLoginAt?: Date
    createdAt: Date
    updatedAt: Date
  }>
  pagination: {
    page: number
    size: number
    total: number
    totalPages: number
  }
  error?: string
}

/**
 * @class SearchUsersQuery
 * @description 搜索用户查询
 */
export class SearchUsersQuery {
  /**
   * @property queryId
   * @description 查询唯一标识符
   */
  readonly queryId: string

  /**
   * @property tenantId
   * @description 租户ID
   */
  @IsUUID('4', { message: '租户ID必须是有效的UUID v4格式' })
  readonly tenantId: string

  /**
   * @property searchTerm
   * @description 搜索关键词
   */
  @IsOptional()
  @IsString({ message: '搜索关键词必须是字符串' })
  readonly searchTerm?: string

  /**
   * @property page
   * @description 页码
   */
  @IsOptional()
  @IsNumber({}, { message: '页码必须是数字' })
  @Min(1, { message: '页码必须大于0' })
  readonly page?: number

  /**
   * @property size
   * @description 每页大小
   */
  @IsOptional()
  @IsNumber({}, { message: '每页大小必须是数字' })
  @Min(1, { message: '每页大小必须大于0' })
  @Max(100, { message: '每页大小不能超过100' })
  readonly size?: number

  /**
   * @property sortBy
   * @description 排序字段
   */
  @IsOptional()
  @IsString({ message: '排序字段必须是字符串' })
  @IsIn(['id', 'email', 'username', 'firstName', 'lastName', 'status', 'createdAt', 'updatedAt', 'lastLoginAt'], {
    message: '排序字段必须是有效的字段名',
  })
  readonly sortBy?: string

  /**
   * @property sortOrder
   * @description 排序方向
   */
  @IsOptional()
  @IsIn(['asc', 'desc'], { message: '排序方向必须是asc或desc' })
  readonly sortOrder?: 'asc' | 'desc'

  /**
   * @property status
   * @description 用户状态过滤
   */
  @IsOptional()
  @IsString({ message: '用户状态必须是字符串' })
  readonly status?: string

  /**
   * @property organizationId
   * @description 组织ID过滤
   */
  @IsOptional()
  @IsUUID('4', { message: '组织ID必须是有效的UUID v4格式' })
  readonly organizationId?: string

  /**
   * @property roleId
   * @description 角色ID过滤
   */
  @IsOptional()
  @IsUUID('4', { message: '角色ID必须是有效的UUID v4格式' })
  readonly roleId?: string

  /**
   * @property includeDeleted
   * @description 是否包含已删除的用户
   */
  @IsOptional()
  readonly includeDeleted?: boolean

  /**
   * @property createdAt
   * @description 查询创建时间
   */
  readonly createdAt: Date

  /**
   * @constructor
   * @description 创建搜索用户查询
   * @param {SearchUsersQueryDto} data - 查询数据
   */
  constructor(data: SearchUsersQueryDto) {
    this.queryId = generateUuid()
    this.tenantId = data.tenantId
    this.searchTerm = data.searchTerm?.trim()
    this.page = data.page || 1
    this.size = data.size || 20
    this.sortBy = data.sortBy || 'createdAt'
    this.sortOrder = data.sortOrder || 'desc'
    this.status = data.status
    this.organizationId = data.organizationId
    this.roleId = data.roleId
    this.includeDeleted = data.includeDeleted || false
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
    if (!this.tenantId || this.tenantId.trim() === '') {
      throw new Error('租户ID不能为空')
    }

    // 验证搜索关键词长度
    if (this.searchTerm && this.searchTerm.length < 2) {
      throw new Error('搜索关键词长度不能少于2个字符')
    }

    // 验证搜索关键词长度上限
    if (this.searchTerm && this.searchTerm.length > 100) {
      throw new Error('搜索关键词长度不能超过100个字符')
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
      tenantId: this.tenantId,
      searchTerm: this.searchTerm,
      page: this.page,
      size: this.size,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
      status: this.status,
      organizationId: this.organizationId,
      roleId: this.roleId,
      includeDeleted: this.includeDeleted,
      createdAt: this.createdAt,
    }
  }

  /**
   * @method toString
   * @description 将查询转换为字符串
   * @returns {string} 字符串表示
   */
  toString(): string {
    return `SearchUsersQuery(tenantId=${this.tenantId}, searchTerm=${this.searchTerm || '无'}, page=${this.page})`
  }
}

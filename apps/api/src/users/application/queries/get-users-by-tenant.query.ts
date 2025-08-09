/**
 * @class GetUsersByTenantQuery
 * @description
 * 获取租户下所有用户查询，实现CQRS模式中的查询部分。该查询封装了获取租户下所有用户所需的所有参数，
 * 并通过查询处理器执行具体的查询逻辑。
 *
 * 主要原理与机制：
 * 1. CQRS模式：将命令和查询职责分离，查询操作不修改状态
 * 2. 查询模式：封装查询请求为对象，支持缓存、优化等操作
 * 3. 数据验证：在查询层面进行基础参数验证
 * 4. 权限控制：查询时需要考虑用户权限和数据隔离
 * 5. 分页支持：支持分页查询和排序
 * 6. 过滤条件：支持多种过滤条件
 * 7. 多租户隔离：确保数据隔离和权限控制
 */
import { IsString, IsUUID, IsOptional, IsNumber, IsIn, Min, Max } from 'class-validator'
import { generateUuid } from '@/shared/utils/uuid.util'

export interface GetUsersByTenantQueryDto {
  tenantId: string
  page?: number
  size?: number
  status?: string
  organizationId?: string
  roleId?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  includeDeleted?: boolean
  includeSensitiveData?: boolean
}

export interface GetUsersByTenantResult {
  success: boolean
  users: Array<{
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
 * @class GetUsersByTenantQuery
 * @description 获取租户下所有用户查询
 */
export class GetUsersByTenantQuery {
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
   * @description 创建获取租户下所有用户查询
   * @param {GetUsersByTenantQueryDto} data - 查询数据
   */
  constructor(data: GetUsersByTenantQueryDto) {
    this.queryId = generateUuid()
    this.tenantId = data.tenantId
    this.page = data.page || 1
    this.size = data.size || 20
    this.status = data.status
    this.organizationId = data.organizationId
    this.roleId = data.roleId
    this.sortBy = data.sortBy || 'createdAt'
    this.sortOrder = data.sortOrder || 'desc'
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
    if (!this.tenantId || this.tenantId.trim() === '') {
      throw new Error('租户ID不能为空')
    }

    // 验证状态过滤条件
    if (this.status && !['active', 'inactive', 'locked', 'pending', 'deleted'].includes(this.status)) {
      throw new Error('无效的用户状态过滤条件')
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
      page: this.page,
      size: this.size,
      status: this.status,
      organizationId: this.organizationId,
      roleId: this.roleId,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
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
    return `GetUsersByTenantQuery(tenantId=${this.tenantId}, page=${this.page}, status=${this.status || 'all'})`
  }
}

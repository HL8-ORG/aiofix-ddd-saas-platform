/**
 * @class GetUserSessionsQuery
 * @description
 * 用户会话查询，实现CQRS模式中的查询部分。该查询封装了获取用户会话列表所需的所有参数，
 * 并通过查询处理器执行具体的查询逻辑。
 *
 * 主要原理与机制：
 * 1. CQRS模式：将命令和查询职责分离，查询操作不修改状态
 * 2. 查询模式：封装查询请求为对象，支持缓存、优化等操作
 * 3. 数据验证：在查询层面进行基础参数验证
 * 4. 权限控制：查询时需要考虑用户权限和数据隔离
 * 5. 分页支持：支持分页查询和排序
 * 6. 过滤条件：支持多种过滤条件
 */
import { IsString, IsUUID, IsOptional, IsBoolean, IsNumber, Min, Max } from 'class-validator'

export enum SessionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  SUSPENDED = 'suspended',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetUserSessionsQuery {
  @IsString({ message: '用户ID不能为空' })
  readonly userId: string

  @IsString({ message: '租户ID不能为空' })
  readonly tenantId: string

  @IsOptional()
  @IsBoolean({ message: '包含过期会话参数格式不正确' })
  readonly includeExpired?: boolean

  @IsOptional()
  @IsString({ message: '会话状态格式不正确' })
  readonly status?: SessionStatus

  @IsOptional()
  @IsNumber({}, { message: '页码格式不正确' })
  @Min(1, { message: '页码最小为1' })
  readonly page?: number

  @IsOptional()
  @IsNumber({}, { message: '页面大小格式不正确' })
  @Min(1, { message: '页面大小最小为1' })
  @Max(100, { message: '页面大小最大为100' })
  readonly pageSize?: number

  @IsOptional()
  @IsString({ message: '排序字段格式不正确' })
  readonly sortBy?: string

  @IsOptional()
  @IsString({ message: '排序顺序格式不正确' })
  readonly sortOrder?: SortOrder

  @IsOptional()
  @IsString({ message: '设备类型格式不正确' })
  readonly deviceType?: string

  @IsOptional()
  @IsString({ message: '浏览器格式不正确' })
  readonly browser?: string

  @IsOptional()
  @IsString({ message: '操作系统格式不正确' })
  readonly os?: string

  @IsOptional()
  @IsString({ message: 'IP地址格式不正确' })
  readonly ipAddress?: string

  @IsOptional()
  @IsString({ message: '请求者ID格式不正确' })
  readonly requesterId?: string

  @IsOptional()
  readonly includeDeviceInfo?: boolean

  @IsOptional()
  readonly includeLocationInfo?: boolean

  constructor(
    userId: string,
    tenantId: string,
    includeExpired: boolean = false,
    status?: SessionStatus,
    page: number = 1,
    pageSize: number = 20,
    sortBy: string = 'createdAt',
    sortOrder: SortOrder = SortOrder.DESC,
    deviceType?: string,
    browser?: string,
    os?: string,
    ipAddress?: string,
    requesterId?: string,
    includeDeviceInfo: boolean = false,
    includeLocationInfo: boolean = false,
  ) {
    this.userId = userId
    this.tenantId = tenantId
    this.includeExpired = includeExpired
    this.status = status
    this.page = page
    this.pageSize = pageSize
    this.sortBy = sortBy
    this.sortOrder = sortOrder
    this.deviceType = deviceType
    this.browser = browser
    this.os = os
    this.ipAddress = ipAddress
    this.requesterId = requesterId
    this.includeDeviceInfo = includeDeviceInfo
    this.includeLocationInfo = includeLocationInfo
  }

  /**
   * @method validate
   * @description 验证查询参数的业务规则
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

    // 验证用户ID格式
    const userIdRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!userIdRegex.test(this.userId)) {
      throw new Error('用户ID格式不正确')
    }

    // 验证会话状态
    if (this.status && !Object.values(SessionStatus).includes(this.status)) {
      throw new Error('会话状态不正确')
    }

    // 验证排序字段
    if (this.sortBy) {
      this.validateSortBy(this.sortBy)
    }

    // 验证排序顺序
    if (this.sortOrder && !Object.values(SortOrder).includes(this.sortOrder)) {
      throw new Error('排序顺序不正确')
    }

    // 验证IP地址格式（如果提供）
    if (this.ipAddress) {
      this.validateIpAddressFormat(this.ipAddress)
    }

    // 验证请求者权限
    if (this.requesterId && this.requesterId !== this.userId) {
      // 检查请求者是否有权限查看其他用户的会话
      this.validateRequesterPermission(this.requesterId, this.userId)
    }
  }

  /**
   * @method validateSortBy
   * @description 验证排序字段
   */
  private validateSortBy(sortBy: string): void {
    const allowedSortFields = [
      'createdAt',
      'lastActivityAt',
      'expiresAt',
      'deviceType',
      'browser',
      'os',
      'ipAddress',
    ]

    if (!allowedSortFields.includes(sortBy)) {
      throw new Error('排序字段不正确')
    }
  }

  /**
   * @method validateIpAddressFormat
   * @description 验证IP地址格式
   */
  private validateIpAddressFormat(ipAddress: string): void {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!ipRegex.test(ipAddress)) {
      throw new Error('IP地址格式不正确')
    }
  }

  /**
   * @method validateRequesterPermission
   * @description 验证请求者权限
   */
  private validateRequesterPermission(requesterId: string, targetUserId: string): void {
    // 这里可以添加更复杂的权限验证逻辑
    // 例如：检查请求者是否有管理员权限
    // 暂时跳过具体实现，实际项目中需要根据业务需求实现
  }

  /**
   * @method toJSON
   * @description 转换为JSON格式，用于日志记录
   */
  toJSON(): Record<string, any> {
    return {
      userId: this.userId,
      tenantId: this.tenantId,
      includeExpired: this.includeExpired,
      status: this.status,
      page: this.page,
      pageSize: this.pageSize,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
      deviceType: this.deviceType,
      browser: this.browser,
      os: this.os,
      hasIpAddress: !!this.ipAddress,
      requesterId: this.requesterId,
      includeDeviceInfo: this.includeDeviceInfo,
      includeLocationInfo: this.includeLocationInfo,
    }
  }
}

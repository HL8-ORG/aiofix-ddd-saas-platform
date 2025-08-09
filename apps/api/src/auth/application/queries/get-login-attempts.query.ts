/**
 * @class GetLoginAttemptsQuery
 * @description
 * 登录尝试查询，实现CQRS模式中的查询部分。该查询封装了获取登录尝试记录所需的所有参数，
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
import { IsString, IsUUID, IsOptional, IsBoolean, IsNumber, Min, Max, IsEnum } from 'class-validator'

export enum LoginAttemptStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  BLOCKED = 'blocked',
  SUSPICIOUS = 'suspicious',
}

export enum LoginAttemptType {
  PASSWORD = 'password',
  TWO_FACTOR = 'two_factor',
  SSO = 'sso',
  API_KEY = 'api_key',
  REGISTRATION = 'registration',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetLoginAttemptsQuery {
  @IsOptional()
  @IsString({ message: '用户ID格式不正确' })
  readonly userId?: string

  @IsString({ message: '租户ID不能为空' })
  readonly tenantId: string

  @IsOptional()
  @IsString({ message: '邮箱格式不正确' })
  readonly email?: string

  @IsOptional()
  @IsString({ message: 'IP地址格式不正确' })
  readonly ipAddress?: string

  @IsOptional()
  @IsEnum(LoginAttemptStatus, { message: '登录尝试状态格式不正确' })
  readonly status?: LoginAttemptStatus

  @IsOptional()
  @IsEnum(LoginAttemptType, { message: '登录尝试类型格式不正确' })
  readonly type?: LoginAttemptType

  @IsOptional()
  @IsString({ message: '开始时间格式不正确' })
  readonly startTime?: string

  @IsOptional()
  @IsString({ message: '结束时间格式不正确' })
  readonly endTime?: string

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
  @IsEnum(SortOrder, { message: '排序顺序格式不正确' })
  readonly sortOrder?: SortOrder

  @IsOptional()
  @IsString({ message: '请求者ID格式不正确' })
  readonly requesterId?: string

  @IsOptional()
  @IsBoolean({ message: '包含设备信息参数格式不正确' })
  readonly includeDeviceInfo?: boolean

  @IsOptional()
  @IsBoolean({ message: '包含位置信息参数格式不正确' })
  readonly includeLocationInfo?: boolean

  @IsOptional()
  @IsBoolean({ message: '包含失败原因参数格式不正确' })
  readonly includeFailureReason?: boolean

  constructor(
    tenantId: string,
    userId?: string,
    email?: string,
    ipAddress?: string,
    status?: LoginAttemptStatus,
    type?: LoginAttemptType,
    startTime?: string,
    endTime?: string,
    page: number = 1,
    pageSize: number = 20,
    sortBy: string = 'createdAt',
    sortOrder: SortOrder = SortOrder.DESC,
    requesterId?: string,
    includeDeviceInfo: boolean = false,
    includeLocationInfo: boolean = false,
    includeFailureReason: boolean = false,
  ) {
    this.tenantId = tenantId
    this.userId = userId
    this.email = email
    this.ipAddress = ipAddress
    this.status = status
    this.type = type
    this.startTime = startTime
    this.endTime = endTime
    this.page = page
    this.pageSize = pageSize
    this.sortBy = sortBy
    this.sortOrder = sortOrder
    this.requesterId = requesterId
    this.includeDeviceInfo = includeDeviceInfo
    this.includeLocationInfo = includeLocationInfo
    this.includeFailureReason = includeFailureReason
  }

  /**
   * @method validate
   * @description 验证查询参数的业务规则
   */
  validate(): void {
    // 基础验证由class-validator处理
    // 这里可以添加更复杂的业务规则验证
    if (!this.tenantId.trim()) {
      throw new Error('租户ID不能为空')
    }

    // 验证用户ID格式（如果提供）
    if (this.userId) {
      const userIdRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!userIdRegex.test(this.userId)) {
        throw new Error('用户ID格式不正确')
      }
    }

    // 验证邮箱格式（如果提供）
    if (this.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.email)) {
        throw new Error('邮箱格式不正确')
      }
    }

    // 验证IP地址格式（如果提供）
    if (this.ipAddress) {
      this.validateIpAddressFormat(this.ipAddress)
    }

    // 验证登录尝试状态
    if (this.status && !Object.values(LoginAttemptStatus).includes(this.status)) {
      throw new Error('登录尝试状态不正确')
    }

    // 验证登录尝试类型
    if (this.type && !Object.values(LoginAttemptType).includes(this.type)) {
      throw new Error('登录尝试类型不正确')
    }

    // 验证时间格式（如果提供）
    if (this.startTime) {
      this.validateTimeFormat(this.startTime)
    }

    if (this.endTime) {
      this.validateTimeFormat(this.endTime)
    }

    // 验证时间范围
    if (this.startTime && this.endTime) {
      this.validateTimeRange(this.startTime, this.endTime)
    }

    // 验证排序字段
    if (this.sortBy) {
      this.validateSortBy(this.sortBy)
    }

    // 验证排序顺序
    if (this.sortOrder && !Object.values(SortOrder).includes(this.sortOrder)) {
      throw new Error('排序顺序不正确')
    }

    // 验证权限控制
    this.validatePermissionControl()
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
   * @method validateTimeFormat
   * @description 验证时间格式
   */
  private validateTimeFormat(time: string): void {
    const date = new Date(time)
    if (isNaN(date.getTime())) {
      throw new Error('时间格式不正确')
    }
  }

  /**
   * @method validateTimeRange
   * @description 验证时间范围
   */
  private validateTimeRange(startTime: string, endTime: string): void {
    const startDate = new Date(startTime)
    const endDate = new Date(endTime)

    if (startDate >= endDate) {
      throw new Error('开始时间必须早于结束时间')
    }

    // 检查时间范围是否过大（例如超过1年）
    const oneYear = 365 * 24 * 60 * 60 * 1000
    if (endDate.getTime() - startDate.getTime() > oneYear) {
      throw new Error('查询时间范围不能超过1年')
    }
  }

  /**
   * @method validateSortBy
   * @description 验证排序字段
   */
  private validateSortBy(sortBy: string): void {
    const allowedSortFields = [
      'createdAt',
      'status',
      'type',
      'ipAddress',
      'email',
      'userId',
      'deviceType',
      'browser',
      'os',
    ]

    if (!allowedSortFields.includes(sortBy)) {
      throw new Error('排序字段不正确')
    }
  }

  /**
   * @method validatePermissionControl
   * @description 验证权限控制
   */
  private validatePermissionControl(): void {
    // 如果提供了请求者ID，验证权限
    if (this.requesterId) {
      // 这里可以添加更复杂的权限验证逻辑
      // 例如：检查请求者是否有权限查看登录尝试记录
      this.validateRequesterPermission(this.requesterId, this.userId)
    }
  }

  /**
   * @method validateRequesterPermission
   * @description 验证请求者权限
   */
  private validateRequesterPermission(requesterId: string, targetUserId?: string): void {
    // 这里可以添加更复杂的权限验证逻辑
    // 例如：检查请求者是否有管理员权限或查看特定用户的权限
    // 暂时跳过具体实现，实际项目中需要根据业务需求实现
  }

  /**
   * @method toJSON
   * @description 转换为JSON格式，用于日志记录
   */
  toJSON(): Record<string, any> {
    return {
      tenantId: this.tenantId,
      hasUserId: !!this.userId,
      hasEmail: !!this.email,
      hasIpAddress: !!this.ipAddress,
      status: this.status,
      type: this.type,
      hasStartTime: !!this.startTime,
      hasEndTime: !!this.endTime,
      page: this.page,
      pageSize: this.pageSize,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
      requesterId: this.requesterId,
      includeDeviceInfo: this.includeDeviceInfo,
      includeLocationInfo: this.includeLocationInfo,
      includeFailureReason: this.includeFailureReason,
    }
  }
}

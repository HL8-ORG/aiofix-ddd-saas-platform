import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { TenantStatus } from '../../domain/value-objects/tenant-status.value-object'

/**
 * @class QueryTenantDto
 * @description
 * 查询租户的数据传输对象，定义查询租户API接口的查询参数数据结构。
 *
 * 主要原理与机制：
 * 1. 使用class-validator进行参数验证
 * 2. 使用class-transformer进行数据转换
 * 3. 使用Swagger装饰器生成API文档
 * 4. 支持分页、过滤、排序等查询功能
 */
export class QueryTenantDto {
  /**
   * @property page
   * @description 页码，从1开始
   * @example 1
   */
  @ApiPropertyOptional({
    description: '页码，从1开始',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码必须大于等于1' })
  page?: number = 1

  /**
   * @property limit
   * @description 每页数量
   * @example 10
   */
  @ApiPropertyOptional({
    description: '每页数量',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量必须大于等于1' })
  @Max(100, { message: '每页数量不能超过100' })
  limit?: number = 10

  /**
   * @property search
   * @description 搜索关键词，支持租户名称和编码的模糊搜索
   * @example "测试"
   */
  @ApiPropertyOptional({
    description: '搜索关键词，支持租户名称和编码的模糊搜索',
    example: '测试',
  })
  @IsOptional()
  @IsString({ message: '搜索关键词必须是字符串' })
  search?: string

  /**
   * @property status
   * @description 租户状态过滤
   * @example "active"
   */
  @ApiPropertyOptional({
    description: '租户状态过滤',
    example: 'active',
    enum: ['pending', 'active', 'suspended', 'deleted'],
  })
  @IsOptional()
  @IsEnum(TenantStatus, { message: '租户状态无效' })
  status?: TenantStatus

  /**
   * @property adminUserId
   * @description 管理员用户ID过滤
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  @ApiPropertyOptional({
    description: '管理员用户ID过滤',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString({ message: '管理员用户ID必须是字符串' })
  adminUserId?: string

  /**
   * @property sortBy
   * @description 排序字段
   * @example "createdAt"
   */
  @ApiPropertyOptional({
    description: '排序字段',
    example: 'createdAt',
    enum: ['name', 'code', 'status', 'createdAt', 'updatedAt'],
  })
  @IsOptional()
  @IsString({ message: '排序字段必须是字符串' })
  sortBy?: 'name' | 'code' | 'status' | 'createdAt' | 'updatedAt' = 'createdAt'

  /**
   * @property sortOrder
   * @description 排序顺序
   * @example "desc"
   */
  @ApiPropertyOptional({
    description: '排序顺序',
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString({ message: '排序顺序必须是字符串' })
  sortOrder?: 'asc' | 'desc' = 'desc'

  /**
   * @property startDate
   * @description 开始日期，用于按创建时间范围过滤
   * @example "2024-01-01"
   */
  @ApiPropertyOptional({
    description: '开始日期，用于按创建时间范围过滤',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsString({ message: '开始日期必须是字符串' })
  startDate?: string

  /**
   * @property endDate
   * @description 结束日期，用于按创建时间范围过滤
   * @example "2024-12-31"
   */
  @ApiPropertyOptional({
    description: '结束日期，用于按创建时间范围过滤',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsString({ message: '结束日期必须是字符串' })
  endDate?: string

  /**
   * @property includeDeleted
   * @description 是否包含已删除的租户
   * @example false
   */
  @ApiPropertyOptional({
    description: '是否包含已删除的租户',
    example: false,
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true
    if (value === 'false') return false
    return value
  })
  includeDeleted?: boolean = false
}

/**
 * @class TenantStatsQueryDto
 * @description
 * 租户统计查询的数据传输对象
 */
export class TenantStatsQueryDto {
  /**
   * @property startDate
   * @description 统计开始日期
   * @example "2024-01-01"
   */
  @ApiPropertyOptional({
    description: '统计开始日期',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsString({ message: '开始日期必须是字符串' })
  startDate?: string

  /**
   * @property endDate
   * @description 统计结束日期
   * @example "2024-12-31"
   */
  @ApiPropertyOptional({
    description: '统计结束日期',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsString({ message: '结束日期必须是字符串' })
  endDate?: string

  /**
   * @property adminUserId
   * @description 管理员用户ID过滤
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  @ApiPropertyOptional({
    description: '管理员用户ID过滤',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString({ message: '管理员用户ID必须是字符串' })
  adminUserId?: string
}

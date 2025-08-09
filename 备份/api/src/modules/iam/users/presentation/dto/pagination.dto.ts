import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator'

/**
 * @class PaginationQueryDto
 * @description
 * 分页查询DTO类，用于接收前端的分页参数。
 * 支持页码、每页数量、排序等参数。
 *
 * 主要原理与机制：
 * 1. 使用class-transformer的@Type装饰器进行类型转换
 * 2. 使用class-validator进行参数验证
 * 3. 提供合理的默认值和限制范围
 * 4. 支持多种排序字段和排序方向
 */
export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: '页码，从1开始',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({
    description: '每页数量',
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10

  @ApiPropertyOptional({
    description: '搜索关键词',
    example: 'john',
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({
    description: '用户状态过滤',
    example: 'ACTIVE',
    enum: ['PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED'],
  })
  @IsOptional()
  @IsEnum(['PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED'])
  status?: string

  @ApiPropertyOptional({
    description: '组织ID过滤',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsOptional()
  @IsString()
  organizationId?: string

  @ApiPropertyOptional({
    description: '角色ID过滤',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @IsOptional()
  @IsString()
  roleId?: string

  @ApiPropertyOptional({
    description: '排序字段',
    example: 'createdAt',
    enum: [
      'username',
      'email',
      'firstName',
      'lastName',
      'status',
      'createdAt',
      'updatedAt',
    ],
  })
  @IsOptional()
  @IsEnum([
    'username',
    'email',
    'firstName',
    'lastName',
    'status',
    'createdAt',
    'updatedAt',
  ])
  sortBy?: string = 'createdAt'

  @ApiPropertyOptional({
    description: '排序方向',
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc'
}

/**
 * @class PaginationResponseDto
 * @description
 * 分页响应DTO类，用于返回分页查询结果。
 *
 * 主要原理与机制：
 * 1. 使用泛型支持不同类型的数据列表
 * 2. 提供完整的分页信息（总数、当前页、总页数等）
 * 3. 支持导航信息（上一页、下一页）
 * 4. 使用Swagger装饰器生成API文档
 */
export class PaginationResponseDto<T> {
  @ApiProperty({
    description: '数据列表',
    isArray: true,
  })
  data: T[]

  @ApiProperty({
    description: '总记录数',
    example: 100,
  })
  total: number

  @ApiProperty({
    description: '当前页码',
    example: 1,
  })
  page: number

  @ApiProperty({
    description: '每页数量',
    example: 10,
  })
  limit: number

  @ApiProperty({
    description: '总页数',
    example: 10,
  })
  totalPages: number

  @ApiProperty({
    description: '是否有上一页',
    example: false,
  })
  hasPrevious: boolean

  @ApiProperty({
    description: '是否有下一页',
    example: true,
  })
  hasNext: boolean

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data
    this.total = total
    this.page = page
    this.limit = limit
    this.totalPages = Math.ceil(total / limit)
    this.hasPrevious = page > 1
    this.hasNext = page < this.totalPages
  }
}

/**
 * @class UserPaginationResponseDto
 * @description
 * 用户分页响应DTO类，专门用于用户列表的分页响应。
 *
 * 主要原理与机制：
 * 1. 继承PaginationResponseDto，复用分页逻辑
 * 2. 使用UserResponseDto作为数据类型
 * 3. 提供用户特定的分页信息
 */
export class UserPaginationResponseDto extends PaginationResponseDto<any> {
  @ApiProperty({
    description: '用户列表',
    type: [Object], // 这里会使用UserResponseDto的类型
    isArray: true,
  })
  declare data: any[]
}

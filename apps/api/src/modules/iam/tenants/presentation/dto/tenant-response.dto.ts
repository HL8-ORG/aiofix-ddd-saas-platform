import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

/**
 * @class TenantResponseDto
 * @description
 * 租户响应的数据传输对象，定义API接口的响应数据结构。
 * 
 * 主要原理与机制：
 * 1. 使用class-transformer进行数据序列化
 * 2. 使用Swagger装饰器生成API文档
 * 3. 定义清晰的响应格式和字段说明
 * 4. 支持数据转换和格式化
 */
export class TenantResponseDto {
  /**
   * @property id
   * @description 租户唯一标识符
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  @ApiProperty({
    description: '租户唯一标识符',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Expose()
  id: string;

  /**
   * @property name
   * @description 租户名称
   * @example "测试租户"
   */
  @ApiProperty({
    description: '租户名称',
    example: '测试租户',
  })
  @Expose()
  name: string;

  /**
   * @property code
   * @description 租户编码
   * @example "test-tenant"
   */
  @ApiProperty({
    description: '租户编码',
    example: 'test-tenant',
  })
  @Expose()
  code: string;

  /**
   * @property status
   * @description 租户状态
   * @example "active"
   */
  @ApiProperty({
    description: '租户状态',
    example: 'active',
    enum: ['pending', 'active', 'suspended', 'deleted'],
  })
  @Expose()
  status: string;

  /**
   * @property statusDisplayName
   * @description 租户状态显示名称
   * @example "激活"
   */
  @ApiProperty({
    description: '租户状态显示名称',
    example: '激活',
  })
  @Expose()
  statusDisplayName: string;

  /**
   * @property adminUserId
   * @description 管理员用户ID
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  @ApiProperty({
    description: '管理员用户ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Expose()
  adminUserId: string;

  /**
   * @property description
   * @description 租户描述
   * @example "这是一个测试租户"
   */
  @ApiPropertyOptional({
    description: '租户描述',
    example: '这是一个测试租户',
  })
  @Expose()
  description?: string;

  /**
   * @property settings
   * @description 租户配置
   * @example { "theme": "dark", "language": "zh-CN" }
   */
  @ApiPropertyOptional({
    description: '租户配置',
    example: { theme: 'dark', language: 'zh-CN' },
    additionalProperties: true,
  })
  @Expose()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return {};
      }
    }
    return value || {};
  })
  settings: Record<string, any>;

  /**
   * @property createdAt
   * @description 创建时间
   * @example "2024-01-01T00:00:00.000Z"
   */
  @ApiProperty({
    description: '创建时间',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Expose()
  @Transform(({ value }) => value?.toISOString())
  createdAt: Date;

  /**
   * @property updatedAt
   * @description 更新时间
   * @example "2024-01-01T00:00:00.000Z"
   */
  @ApiProperty({
    description: '更新时间',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Expose()
  @Transform(({ value }) => value?.toISOString())
  updatedAt: Date;

  /**
   * @property deletedAt
   * @description 删除时间（软删除）
   * @example "2024-01-01T00:00:00.000Z"
   */
  @ApiPropertyOptional({
    description: '删除时间（软删除）',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Expose()
  @Transform(({ value }) => value?.toISOString())
  deletedAt?: Date;
}

/**
 * @class TenantListResponseDto
 * @description
 * 租户列表响应的数据传输对象
 */
export class TenantListResponseDto {
  /**
   * @property success
   * @description 操作是否成功
   * @example true
   */
  @ApiProperty({
    description: '操作是否成功',
    example: true,
  })
  success: boolean;

  /**
   * @property data
   * @description 租户列表数据
   */
  @ApiProperty({
    description: '租户列表数据',
    type: [TenantResponseDto],
  })
  data: TenantResponseDto[];

  /**
   * @property message
   * @description 响应消息
   * @example "获取租户列表成功"
   */
  @ApiProperty({
    description: '响应消息',
    example: '获取租户列表成功',
  })
  message: string;

  /**
   * @property total
   * @description 总数量
   * @example 10
   */
  @ApiProperty({
    description: '总数量',
    example: 10,
  })
  total: number;
}

/**
 * @class TenantDetailResponseDto
 * @description
 * 租户详情响应的数据传输对象
 */
export class TenantDetailResponseDto {
  /**
   * @property success
   * @description 操作是否成功
   * @example true
   */
  @ApiProperty({
    description: '操作是否成功',
    example: true,
  })
  success: boolean;

  /**
   * @property data
   * @description 租户详情数据
   */
  @ApiProperty({
    description: '租户详情数据',
    type: TenantResponseDto,
  })
  data: TenantResponseDto;

  /**
   * @property message
   * @description 响应消息
   * @example "获取租户成功"
   */
  @ApiProperty({
    description: '响应消息',
    example: '获取租户成功',
  })
  message: string;
}

/**
 * @class TenantCreateResponseDto
 * @description
 * 租户创建响应的数据传输对象
 */
export class TenantCreateResponseDto {
  /**
   * @property success
   * @description 操作是否成功
   * @example true
   */
  @ApiProperty({
    description: '操作是否成功',
    example: true,
  })
  success: boolean;

  /**
   * @property data
   * @description 新创建的租户数据
   */
  @ApiProperty({
    description: '新创建的租户数据',
    type: TenantResponseDto,
  })
  data: TenantResponseDto;

  /**
   * @property message
   * @description 响应消息
   * @example "租户创建成功"
   */
  @ApiProperty({
    description: '响应消息',
    example: '租户创建成功',
  })
  message: string;
}

/**
 * @class TenantDeleteResponseDto
 * @description
 * 租户删除响应的数据传输对象
 */
export class TenantDeleteResponseDto {
  /**
   * @property success
   * @description 操作是否成功
   * @example true
   */
  @ApiProperty({
    description: '操作是否成功',
    example: true,
  })
  success: boolean;

  /**
   * @property message
   * @description 响应消息
   * @example "租户删除成功"
   */
  @ApiProperty({
    description: '响应消息',
    example: '租户删除成功',
  })
  message: string;
} 
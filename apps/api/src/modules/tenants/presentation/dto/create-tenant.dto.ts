import { IsString, IsNotEmpty, IsOptional, IsUUID, MaxLength, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * @class CreateTenantDto
 * @description
 * 创建租户的数据传输对象，定义创建租户API接口的请求数据结构。
 * 
 * 主要原理与机制：
 * 1. 使用class-validator进行参数验证
 * 2. 使用class-transformer进行数据转换
 * 3. 使用Swagger装饰器生成API文档
 * 4. 定义清晰的业务规则和约束
 */
export class CreateTenantDto {
  /**
   * @property name
   * @description 租户名称
   * @example "测试租户"
   */
  @ApiProperty({
    description: '租户名称',
    example: '测试租户',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: '租户名称必须是字符串' })
  @IsNotEmpty({ message: '租户名称不能为空' })
  @MaxLength(100, { message: '租户名称不能超过100个字符' })
  name: string;

  /**
   * @property code
   * @description 租户编码，用于唯一标识租户
   * @example "test-tenant"
   */
  @ApiProperty({
    description: '租户编码',
    example: 'test-tenant',
    minLength: 3,
    maxLength: 50,
  })
  @IsString({ message: '租户编码必须是字符串' })
  @IsNotEmpty({ message: '租户编码不能为空' })
  @MaxLength(50, { message: '租户编码不能超过50个字符' })
  code: string;

  /**
   * @property adminUserId
   * @description 管理员用户ID，租户的管理员
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  @ApiProperty({
    description: '管理员用户ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID(undefined, { message: '管理员用户ID格式无效' })
  @IsNotEmpty({ message: '管理员用户ID不能为空' })
  adminUserId: string;

  /**
   * @property description
   * @description 租户描述，可选字段
   * @example "这是一个测试租户"
   */
  @ApiPropertyOptional({
    description: '租户描述',
    example: '这是一个测试租户',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: '租户描述必须是字符串' })
  @MaxLength(500, { message: '租户描述不能超过500个字符' })
  description?: string;

  /**
   * @property settings
   * @description 租户配置，可选字段，用于存储租户特定的配置信息
   * @example { "theme": "dark", "language": "zh-CN" }
   */
  @ApiPropertyOptional({
    description: '租户配置',
    example: { theme: 'dark', language: 'zh-CN' },
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject({ message: '租户配置必须是对象' })
  settings?: Record<string, any>;
} 
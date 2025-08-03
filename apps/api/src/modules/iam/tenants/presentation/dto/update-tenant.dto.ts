import { IsString, IsOptional, IsUUID, MaxLength, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * @class UpdateTenantDto
 * @description
 * 更新租户的数据传输对象，定义更新租户API接口的请求数据结构。
 * 
 * 主要原理与机制：
 * 1. 使用class-validator进行参数验证
 * 2. 使用class-transformer进行数据转换
 * 3. 使用Swagger装饰器生成API文档
 * 4. 所有字段都是可选的，支持部分更新
 */
export class UpdateTenantDto {
  /**
   * @property name
   * @description 租户名称
   * @example "新租户名称"
   */
  @ApiPropertyOptional({
    description: '租户名称',
    example: '新租户名称',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: '租户名称必须是字符串' })
  @MaxLength(100, { message: '租户名称不能超过100个字符' })
  name?: string;

  /**
   * @property code
   * @description 租户编码，用于唯一标识租户
   * @example "new-tenant-code"
   */
  @ApiPropertyOptional({
    description: '租户编码',
    example: 'new-tenant-code',
    minLength: 3,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: '租户编码必须是字符串' })
  @MaxLength(50, { message: '租户编码不能超过50个字符' })
  code?: string;

  /**
   * @property adminUserId
   * @description 管理员用户ID，租户的管理员
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  @ApiPropertyOptional({
    description: '管理员用户ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: '管理员用户ID必须是有效的UUID v4格式' })
  adminUserId?: string;

  /**
   * @property description
   * @description 租户描述，可选字段
   * @example "这是更新后的租户描述"
   */
  @ApiPropertyOptional({
    description: '租户描述',
    example: '这是更新后的租户描述',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: '租户描述必须是字符串' })
  @MaxLength(500, { message: '租户描述不能超过500个字符' })
  description?: string;

  /**
   * @property settings
   * @description 租户配置，可选字段，用于存储租户特定的配置信息
   * @example { "theme": "light", "language": "en-US" }
   */
  @ApiPropertyOptional({
    description: '租户配置',
    example: { theme: 'light', language: 'en-US' },
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject({ message: '租户配置必须是对象' })
  settings?: Record<string, any>;
}

/**
 * @class UpdateTenantSettingsDto
 * @description
 * 更新租户配置的数据传输对象
 */
export class UpdateTenantSettingsDto {
  /**
   * @property settings
   * @description 租户配置，用于更新租户的配置信息
   * @example { "theme": "dark", "language": "zh-CN", "notifications": true }
   */
  @ApiPropertyOptional({
    description: '租户配置',
    example: { theme: 'dark', language: 'zh-CN', notifications: true },
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject({ message: '租户配置必须是对象' })
  settings?: Record<string, any>;
}

/**
 * @class ActivateTenantDto
 * @description
 * 激活租户的数据传输对象
 */
export class ActivateTenantDto {
  /**
   * @property reason
   * @description 激活原因，可选字段
   * @example "管理员审核通过"
   */
  @ApiPropertyOptional({
    description: '激活原因',
    example: '管理员审核通过',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: '激活原因必须是字符串' })
  @MaxLength(200, { message: '激活原因不能超过200个字符' })
  reason?: string;
}

/**
 * @class SuspendTenantDto
 * @description
 * 禁用租户的数据传输对象
 */
export class SuspendTenantDto {
  /**
   * @property reason
   * @description 禁用原因，可选字段
   * @example "违反使用条款"
   */
  @ApiPropertyOptional({
    description: '禁用原因',
    example: '违反使用条款',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: '禁用原因必须是字符串' })
  @MaxLength(200, { message: '禁用原因不能超过200个字符' })
  reason?: string;
} 
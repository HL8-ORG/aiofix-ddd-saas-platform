import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator'

/**
 * @class CreateRoleDto
 * @description
 * 创建角色DTO，用于接收创建角色的请求数据。
 *
 * 主要原理与机制：
 * 1. 使用class-validator进行数据验证
 * 2. 使用class-transformer进行数据转换
 * 3. 使用Swagger装饰器生成API文档
 * 4. 支持多租户隔离
 */
export class CreateRoleDto {
  @ApiProperty({
    description: '角色名称',
    example: '管理员',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: '角色名称必须是字符串' })
  @MaxLength(50, { message: '角色名称不能超过50个字符' })
  name: string

  @ApiProperty({
    description: '角色代码',
    example: 'ADMIN',
    minLength: 3,
    maxLength: 20,
  })
  @IsString({ message: '角色代码必须是字符串' })
  @MaxLength(20, { message: '角色代码不能超过20个字符' })
  code: string

  @ApiPropertyOptional({
    description: '角色描述',
    example: '系统管理员角色，具有最高权限',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: '角色描述必须是字符串' })
  @MaxLength(500, { message: '角色描述不能超过500个字符' })
  description?: string

  @ApiPropertyOptional({
    description: '组织ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: '组织ID必须是有效的UUID v4格式' })
  organizationId?: string

  @ApiPropertyOptional({
    description: '角色优先级',
    example: 10,
    minimum: 1,
    maximum: 1000,
  })
  @IsOptional()
  @IsNumber({}, { message: '角色优先级必须是数字' })
  @Min(1, { message: '角色优先级不能小于1' })
  @Max(1000, { message: '角色优先级不能大于1000' })
  priority?: number

  @ApiPropertyOptional({
    description: '是否为系统角色',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: '系统角色标识必须是布尔值' })
  isSystemRole?: boolean

  @ApiPropertyOptional({
    description: '是否为默认角色',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: '默认角色标识必须是布尔值' })
  isDefaultRole?: boolean

  @ApiPropertyOptional({
    description: '最大用户数',
    example: 100,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: '最大用户数必须是数字' })
  @Min(1, { message: '最大用户数不能小于1' })
  maxUsers?: number

  @ApiPropertyOptional({
    description: '过期时间',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsOptional()
  expiresAt?: Date

  @ApiPropertyOptional({
    description: '父角色ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: '父角色ID必须是有效的UUID v4格式' })
  parentRoleId?: string

  @ApiPropertyOptional({
    description: '权限ID列表',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174001',
    ],
    type: [String],
  })
  @IsOptional()
  permissionIds?: string[]

  @ApiPropertyOptional({
    description: '用户ID列表',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174001',
    ],
    type: [String],
  })
  @IsOptional()
  userIds?: string[]
}

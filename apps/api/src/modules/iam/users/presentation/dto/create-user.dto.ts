import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsArray,
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator'

/**
 * @class CreateUserDto
 * @description
 * 创建用户的DTO类，用于接收前端提交的用户注册数据。
 * 包含用户的基本信息、联系方式和组织角色分配等字段。
 *
 * 主要原理与机制：
 * 1. 使用class-validator进行数据校验，确保数据的完整性和正确性
 * 2. 使用class-transformer进行数据转换，支持类型转换和默认值设置
 * 3. 使用Swagger装饰器生成API文档，便于前端开发人员理解接口
 * 4. 所有字段都基于租户ID进行唯一性验证，确保多租户数据隔离
 */
export class CreateUserDto {
  @ApiProperty({
    description: '用户名，在租户内唯一',
    example: 'john_doe',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z][a-zA-Z0-9_-]*$/, {
    message: '用户名必须以字母开头，只能包含字母、数字、下划线和连字符',
  })
  username: string

  @ApiProperty({
    description: '邮箱地址，在租户内唯一',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string

  @ApiProperty({
    description: '用户密码',
    example: 'StrongPassword123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: '密码必须包含大小写字母、数字和特殊字符',
  })
  password: string

  @ApiProperty({
    description: '用户名字',
    example: 'John',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName: string

  @ApiProperty({
    description: '用户姓氏',
    example: 'Doe',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName: string

  @ApiPropertyOptional({
    description: '手机号码（可选）',
    example: '+86-138-0013-8000',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: '请输入有效的手机号码',
  })
  phone?: string

  @ApiPropertyOptional({
    description: '显示名称（可选，默认firstName + lastName）',
    example: 'John Doe',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string

  @ApiPropertyOptional({
    description: '头像URL（可选）',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsString()
  avatar?: string

  @ApiPropertyOptional({
    description: '所属组织ID列表（可选）',
    example: ['org-123', 'org-456'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true, message: '组织ID必须是有效的UUID v4格式' })
  organizationIds?: string[]

  @ApiPropertyOptional({
    description: '角色ID列表（可选）',
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '550e8400-e29b-41d4-a716-446655440001',
    ],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true, message: '角色ID必须是有效的UUID v4格式' })
  roleIds?: string[]

  @ApiPropertyOptional({
    description: '用户偏好设置（可选）',
    example: { theme: 'dark', language: 'zh-CN' },
  })
  @IsOptional()
  @IsObject()
  preferences?: Record<string, any>
}

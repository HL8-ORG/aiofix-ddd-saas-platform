import { IsString, IsEmail, IsOptional, IsArray, IsObject, MinLength, MaxLength, Matches, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * @class UpdateUserDto
 * @description
 * 更新用户的DTO类，用于接收前端提交的用户信息更新数据。
 * 所有字段都是可选的，只更新提供的字段。
 * 
 * 主要原理与机制：
 * 1. 使用class-validator进行数据校验，确保数据的完整性和正确性
 * 2. 使用class-transformer进行数据转换，支持类型转换和默认值设置
 * 3. 使用Swagger装饰器生成API文档，便于前端开发人员理解接口
 * 4. 所有字段都是可选的，支持部分更新操作
 */
export class UpdateUserDto {
  @ApiPropertyOptional({
    description: '用户名字',
    example: 'John',
    minLength: 1,
    maxLength: 50
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({
    description: '用户姓氏',
    example: 'Doe',
    minLength: 1,
    maxLength: 50
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({
    description: '显示名称（可选）',
    example: 'John Doe',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @ApiPropertyOptional({
    description: '头像URL（可选）',
    example: 'https://example.com/avatar.jpg'
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({
    description: '邮箱地址（可选）',
    example: 'john.doe@example.com'
  })
  @IsOptional()
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email?: string;

  @ApiPropertyOptional({
    description: '手机号码（可选）',
    example: '+86-138-0013-8000'
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: '请输入有效的手机号码'
  })
  phone?: string;

  @ApiPropertyOptional({
    description: '所属组织ID列表（可选）',
    example: ['org-123', 'org-456'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true, message: '组织ID必须是有效的UUID v4格式' })
  organizationIds?: string[];

  @ApiPropertyOptional({
    description: '角色ID列表（可选）',
    example: ['550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true, message: '角色ID必须是有效的UUID v4格式' })
  roleIds?: string[];

  @ApiPropertyOptional({
    description: '用户偏好设置（可选）',
    example: { theme: 'dark', language: 'zh-CN' }
  })
  @IsOptional()
  @IsObject()
  preferences?: Record<string, any>;
} 
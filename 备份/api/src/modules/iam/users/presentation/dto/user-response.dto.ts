import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Exclude, Expose, Transform } from 'class-transformer'

/**
 * @class UserResponseDto
 * @description
 * 用户响应DTO类，用于API返回用户信息。
 * 排除了敏感字段（如密码哈希），只返回安全的用户信息。
 *
 * 主要原理与机制：
 * 1. 使用class-transformer的@Exclude装饰器排除敏感字段
 * 2. 使用@Expose装饰器控制字段的序列化
 * 3. 使用@Transform装饰器进行数据转换和格式化
 * 4. 使用Swagger装饰器生成API文档
 */
export class UserResponseDto {
  @ApiProperty({
    description: '用户唯一标识',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Expose()
  id: string

  @ApiProperty({
    description: '用户名',
    example: 'john_doe',
  })
  @Expose()
  username: string

  @ApiProperty({
    description: '邮箱地址',
    example: 'john.doe@example.com',
  })
  @Expose()
  email: string

  @ApiPropertyOptional({
    description: '手机号码',
    example: '+86-138-0013-8000',
  })
  @Expose()
  phone?: string

  @ApiProperty({
    description: '用户名字',
    example: 'John',
  })
  @Expose()
  firstName: string

  @ApiProperty({
    description: '用户姓氏',
    example: 'Doe',
  })
  @Expose()
  lastName: string

  @ApiPropertyOptional({
    description: '显示名称',
    example: 'John Doe',
  })
  @Expose()
  displayName?: string

  @ApiPropertyOptional({
    description: '头像URL',
    example: 'https://example.com/avatar.jpg',
  })
  @Expose()
  avatar?: string

  @ApiProperty({
    description: '用户状态',
    example: 'ACTIVE',
    enum: ['PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED'],
  })
  @Expose()
  status: string

  @ApiProperty({
    description: '所属租户ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Expose()
  tenantId: string

  @ApiPropertyOptional({
    description: '所属组织ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @Expose()
  organizationId?: string

  @ApiPropertyOptional({
    description: '所属组织ID列表',
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '550e8400-e29b-41d4-a716-446655440001',
    ],
    type: [String],
  })
  @Expose()
  organizationIds?: string[]

  @ApiPropertyOptional({
    description: '角色ID列表',
    example: [
      '550e8400-e29b-41d4-a716-446655440002',
      '550e8400-e29b-41d4-a716-446655440003',
    ],
    type: [String],
  })
  @Expose()
  roleIds?: string[]

  @ApiProperty({
    description: '创建该用户的管理员ID',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @Expose()
  adminUserId: string

  @ApiPropertyOptional({
    description: '最后登录时间',
    example: '2024-01-15T10:30:00.000Z',
  })
  @Expose()
  @Transform(({ value }) => (value ? new Date(value).toISOString() : null))
  lastLoginAt?: Date

  @ApiProperty({
    description: '登录失败次数',
    example: 0,
  })
  @Expose()
  loginAttempts: number

  @ApiPropertyOptional({
    description: '锁定截止时间',
    example: '2024-01-15T11:00:00.000Z',
  })
  @Expose()
  @Transform(({ value }) => (value ? new Date(value).toISOString() : null))
  lockedUntil?: Date

  @ApiProperty({
    description: '邮箱验证状态',
    example: true,
  })
  @Expose()
  emailVerified: boolean

  @ApiProperty({
    description: '手机验证状态',
    example: false,
  })
  @Expose()
  phoneVerified: boolean

  @ApiProperty({
    description: '二步验证启用状态',
    example: false,
  })
  @Expose()
  twoFactorEnabled: boolean

  @ApiPropertyOptional({
    description: '用户偏好设置',
    example: { theme: 'dark', language: 'zh-CN' },
  })
  @Expose()
  preferences?: Record<string, any>

  @ApiProperty({
    description: '创建时间',
    example: '2024-01-15T09:00:00.000Z',
  })
  @Expose()
  @Transform(({ value }) => new Date(value).toISOString())
  createdAt: Date

  @ApiProperty({
    description: '更新时间',
    example: '2024-01-15T10:30:00.000Z',
  })
  @Expose()
  @Transform(({ value }) => new Date(value).toISOString())
  updatedAt: Date

  @ApiPropertyOptional({
    description: '删除时间（软删除）',
    example: '2024-01-15T11:00:00.000Z',
  })
  @Expose()
  @Transform(({ value }) => (value ? new Date(value).toISOString() : null))
  deletedAt?: Date

  // 排除敏感字段
  @Exclude()
  passwordHash: string

  @Exclude()
  twoFactorSecret?: string

  /**
   * @method fromDomain
   * @description 从领域实体创建UserResponseDto实例
   * @param user 用户领域实体
   * @returns UserResponseDto实例
   */
  static fromDomain(user: any): UserResponseDto {
    const dto = new UserResponseDto()

    // 复制基本属性
    dto.id = user.id
    dto.username = user.getUsername()
    dto.email = user.getEmail()
    dto.phone = user.getPhone()
    dto.firstName = user.firstName
    dto.lastName = user.lastName
    dto.displayName = user.displayName
    dto.avatar = user.avatar
    dto.status = user.getStatus()
    dto.tenantId = user.tenantId
    dto.organizationId = user.organizationId
    dto.organizationIds = user.organizationIds
    dto.roleIds = user.roleIds
    dto.adminUserId = user.adminUserId
    dto.lastLoginAt = user.lastLoginAt
    dto.loginAttempts = user.loginAttempts
    dto.lockedUntil = user.lockedUntil
    dto.emailVerified = user.emailVerified
    dto.phoneVerified = user.phoneVerified
    dto.twoFactorEnabled = user.twoFactorEnabled
    dto.preferences = user.preferences
    dto.createdAt = user.createdAt
    dto.updatedAt = user.updatedAt
    dto.deletedAt = user.deletedAt

    return dto
  }
}

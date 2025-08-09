import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator'
import { PermissionAction } from '../../domain/value-objects/permission-action.value-object'
import { PermissionStatus } from '../../domain/value-objects/permission-status.value-object'
import { PermissionType } from '../../domain/value-objects/permission-type.value-object'

/**
 * @class CreatePermissionDto
 * @description
 * 创建权限的DTO，用于接收前端请求数据并验证格式。
 * 
 * 主要原理与机制：
 * 1. 使用class-validator装饰器进行数据验证
 * 2. 确保必填字段不为空，可选字段格式正确
 * 3. 使用枚举验证确保状态、类型、操作值有效
 * 4. 支持多租户架构，包含tenantId字段
 * 5. 提供清晰的字段说明和业务规则
 */
export class CreatePermissionDto {
  /**
   * @property name
   * @description 权限名称，在租户内唯一
   */
  @IsNotEmpty({ message: '权限名称不能为空' })
  @IsString({ message: '权限名称必须是字符串' })
  @MaxLength(100, { message: '权限名称长度不能超过100个字符' })
  name!: string

  /**
   * @property code
   * @description 权限代码，在租户内唯一
   */
  @IsNotEmpty({ message: '权限代码不能为空' })
  @IsString({ message: '权限代码必须是字符串' })
  @MaxLength(50, { message: '权限代码长度不能超过50个字符' })
  code!: string

  /**
   * @property description
   * @description 权限描述
   */
  @IsOptional()
  @IsString({ message: '权限描述必须是字符串' })
  description?: string

  /**
   * @property type
   * @description 权限类型
   */
  @IsNotEmpty({ message: '权限类型不能为空' })
  @IsEnum(PermissionType, { message: '权限类型必须是有效的枚举值' })
  type!: PermissionType

  /**
   * @property action
   * @description 权限操作
   */
  @IsNotEmpty({ message: '权限操作不能为空' })
  @IsEnum(PermissionAction, { message: '权限操作必须是有效的枚举值' })
  action!: PermissionAction

  /**
   * @property status
   * @description 权限状态
   */
  @IsOptional()
  @IsEnum(PermissionStatus, { message: '权限状态必须是有效的枚举值' })
  status?: PermissionStatus = PermissionStatus.ACTIVE

  /**
   * @property tenantId
   * @description 所属租户ID
   */
  @IsNotEmpty({ message: '租户ID不能为空' })
  @IsUUID('4', { message: '租户ID必须是有效的UUID格式' })
  tenantId!: string

  /**
   * @property organizationId
   * @description 所属组织ID
   */
  @IsOptional()
  @IsUUID('4', { message: '组织ID必须是有效的UUID格式' })
  organizationId?: string

  /**
   * @property adminUserId
   * @description 创建该权限的管理员ID
   */
  @IsNotEmpty({ message: '管理员ID不能为空' })
  @IsUUID('4', { message: '管理员ID必须是有效的UUID格式' })
  adminUserId!: string

  /**
   * @property roleIds
   * @description 角色ID列表
   */
  @IsOptional()
  roleIds?: string[]

  /**
   * @property resource
   * @description 权限资源
   */
  @IsOptional()
  @IsString({ message: '权限资源必须是字符串' })
  @MaxLength(100, { message: '权限资源长度不能超过100个字符' })
  resource?: string

  /**
   * @property module
   * @description 权限模块
   */
  @IsOptional()
  @IsString({ message: '权限模块必须是字符串' })
  @MaxLength(50, { message: '权限模块长度不能超过50个字符' })
  module?: string

  /**
   * @property tags
   * @description 权限标签
   */
  @IsOptional()
  @IsString({ message: '权限标签必须是字符串' })
  @MaxLength(500, { message: '权限标签长度不能超过500个字符' })
  tags?: string

  /**
   * @property fields
   * @description 字段权限列表
   */
  @IsOptional()
  fields?: string[]

  /**
   * @property conditions
   * @description 权限条件
   */
  @IsOptional()
  conditions?: any[]

  /**
   * @property expiresAt
   * @description 权限过期时间
   */
  @IsOptional()
  expiresAt?: Date

  /**
   * @property parentPermissionId
   * @description 父权限ID
   */
  @IsOptional()
  @IsUUID('4', { message: '父权限ID必须是有效的UUID格式' })
  parentPermissionId?: string

  /**
   * @property childPermissionIds
   * @description 子权限ID列表
   */
  @IsOptional()
  childPermissionIds?: string[]
} 
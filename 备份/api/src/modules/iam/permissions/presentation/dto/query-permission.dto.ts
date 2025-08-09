import { IsEnum, IsOptional, IsString, IsUUID, IsInt, Min, Max, IsNotEmpty } from 'class-validator'
import { Type } from 'class-transformer'
import { PermissionAction } from '../../domain/value-objects/permission-action.value-object'
import { PermissionStatus } from '../../domain/value-objects/permission-status.value-object'
import { PermissionType } from '../../domain/value-objects/permission-type.value-object'

/**
 * @class QueryPermissionDto
 * @description
 * 权限查询DTO，用于分页、筛选和搜索权限。
 * 
 * 主要原理与机制：
 * 1. 支持多种查询条件组合
 * 2. 提供分页参数验证
 * 3. 支持按类型、状态、操作等筛选
 * 4. 支持关键词搜索
 * 5. 确保查询参数的安全性和有效性
 */
export class QueryPermissionDto {
  /**
   * @property page
   * @description 页码，从1开始
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码必须大于等于1' })
  page?: number = 1

  /**
   * @property limit
   * @description 每页数量
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量必须大于等于1' })
  @Max(100, { message: '每页数量不能超过100' })
  limit?: number = 10

  /**
   * @property tenantId
   * @description 租户ID
   */
  @IsNotEmpty({ message: '租户ID不能为空' })
  @IsUUID('4', { message: '租户ID必须是有效的UUID格式' })
  tenantId!: string

  /**
   * @property organizationId
   * @description 组织ID
   */
  @IsOptional()
  @IsUUID('4', { message: '组织ID必须是有效的UUID格式' })
  organizationId?: string

  /**
   * @property type
   * @description 权限类型筛选
   */
  @IsOptional()
  @IsEnum(PermissionType, { message: '权限类型必须是有效的枚举值' })
  type?: PermissionType

  /**
   * @property status
   * @description 权限状态筛选
   */
  @IsOptional()
  @IsEnum(PermissionStatus, { message: '权限状态必须是有效的枚举值' })
  status?: PermissionStatus

  /**
   * @property action
   * @description 权限操作筛选
   */
  @IsOptional()
  @IsEnum(PermissionAction, { message: '权限操作必须是有效的枚举值' })
  action?: PermissionAction

  /**
   * @property resource
   * @description 权限资源筛选
   */
  @IsOptional()
  @IsString({ message: '权限资源必须是字符串' })
  resource?: string

  /**
   * @property module
   * @description 权限模块筛选
   */
  @IsOptional()
  @IsString({ message: '权限模块必须是字符串' })
  module?: string

  /**
   * @property search
   * @description 关键词搜索
   */
  @IsOptional()
  @IsString({ message: '搜索关键词必须是字符串' })
  search?: string

  /**
   * @property tags
   * @description 标签筛选
   */
  @IsOptional()
  @IsString({ message: '标签必须是字符串' })
  tags?: string

  /**
   * @property adminUserId
   * @description 管理员ID筛选
   */
  @IsOptional()
  @IsUUID('4', { message: '管理员ID必须是有效的UUID格式' })
  adminUserId?: string

  /**
   * @property parentPermissionId
   * @description 父权限ID筛选
   */
  @IsOptional()
  @IsUUID('4', { message: '父权限ID必须是有效的UUID格式' })
  parentPermissionId?: string

  /**
   * @property isSystemPermission
   * @description 是否系统权限筛选
   */
  @IsOptional()
  isSystemPermission?: boolean

  /**
   * @property isDefaultPermission
   * @description 是否默认权限筛选
   */
  @IsOptional()
  isDefaultPermission?: boolean
} 
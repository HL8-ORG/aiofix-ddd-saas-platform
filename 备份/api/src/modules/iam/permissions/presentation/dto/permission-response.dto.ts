import { PermissionAction } from '../../domain/value-objects/permission-action.value-object'
import { PermissionStatus } from '../../domain/value-objects/permission-status.value-object'
import { PermissionType } from '../../domain/value-objects/permission-type.value-object'

/**
 * @class PermissionResponseDto
 * @description
 * 权限响应DTO，用于返回权限数据给前端。
 * 
 * 主要原理与机制：
 * 1. 定义标准化的API响应格式
 * 2. 包含权限的所有必要信息
 * 3. 支持嵌套的权限关系
 * 4. 提供友好的显示信息
 * 5. 确保数据安全，不暴露敏感信息
 */
export class PermissionResponseDto {
  /**
   * @property id
   * @description 权限唯一标识符
   */
  id!: string

  /**
   * @property name
   * @description 权限名称
   */
  name!: string

  /**
   * @property code
   * @description 权限代码
   */
  code!: string

  /**
   * @property description
   * @description 权限描述
   */
  description?: string

  /**
   * @property type
   * @description 权限类型
   */
  type!: PermissionType

  /**
   * @property typeDisplayName
   * @description 权限类型显示名称
   */
  typeDisplayName!: string

  /**
   * @property action
   * @description 权限操作
   */
  action!: PermissionAction

  /**
   * @property actionDisplayName
   * @description 权限操作显示名称
   */
  actionDisplayName!: string

  /**
   * @property status
   * @description 权限状态
   */
  status!: PermissionStatus

  /**
   * @property statusDisplayName
   * @description 权限状态显示名称
   */
  statusDisplayName!: string

  /**
   * @property tenantId
   * @description 所属租户ID
   */
  tenantId!: string

  /**
   * @property organizationId
   * @description 所属组织ID
   */
  organizationId?: string

  /**
   * @property adminUserId
   * @description 创建该权限的管理员ID
   */
  adminUserId!: string

  /**
   * @property roleIds
   * @description 角色ID列表
   */
  roleIds?: string[]

  /**
   * @property isSystemPermission
   * @description 是否为系统权限
   */
  isSystemPermission!: boolean

  /**
   * @property isDefaultPermission
   * @description 是否为默认权限
   */
  isDefaultPermission!: boolean

  /**
   * @property resource
   * @description 权限资源
   */
  resource?: string

  /**
   * @property module
   * @description 权限模块
   */
  module?: string

  /**
   * @property tags
   * @description 权限标签
   */
  tags?: string

  /**
   * @property fields
   * @description 字段权限列表
   */
  fields?: string[]

  /**
   * @property conditions
   * @description 权限条件
   */
  conditions?: any[]

  /**
   * @property expiresAt
   * @description 权限过期时间
   */
  expiresAt?: Date

  /**
   * @property parentPermissionId
   * @description 父权限ID
   */
  parentPermissionId?: string

  /**
   * @property childPermissionIds
   * @description 子权限ID列表
   */
  childPermissionIds?: string[]

  /**
   * @property createdAt
   * @description 创建时间
   */
  createdAt!: Date

  /**
   * @property updatedAt
   * @description 更新时间
   */
  updatedAt!: Date

  /**
   * @property deletedAt
   * @description 删除时间
   */
  deletedAt?: Date
}

/**
 * @class PermissionListResponseDto
 * @description
 * 权限列表响应DTO，包含分页信息。
 */
export class PermissionListResponseDto {
  /**
   * @property permissions
   * @description 权限列表
   */
  permissions!: PermissionResponseDto[]

  /**
   * @property total
   * @description 总数量
   */
  total!: number

  /**
   * @property page
   * @description 当前页码
   */
  page!: number

  /**
   * @property limit
   * @description 每页数量
   */
  limit!: number

  /**
   * @property totalPages
   * @description 总页数
   */
  totalPages!: number

  /**
   * @property hasNext
   * @description 是否有下一页
   */
  hasNext!: boolean

  /**
   * @property hasPrev
   * @description 是否有上一页
   */
  hasPrev!: boolean
} 
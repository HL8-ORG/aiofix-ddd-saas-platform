import { Entity, Index, PrimaryKey, Property, Unique } from '@mikro-orm/core'
import type { PermissionConditionData } from '../../domain/value-objects/permission-condition.value-object'

/**
 * @entity PermissionOrmEntity
 * @description
 * 权限数据库实体，使用MikroORM进行ORM映射。
 * 专注于数据库表结构与字段映射，支持CASL权限管理。
 *
 * 主要原理与机制：
 * 1. 使用MikroORM装饰器定义数据库表结构
 * 2. 定义数据库索引和约束，支持多租户查询优化
 * 3. 处理数据库字段类型映射
 * 4. 遵循单一职责原则，只负责数据库映射
 * 5. 映射逻辑由PermissionMapper专门处理
 * 6. 支持多租户数据隔离
 * 7. 支持条件权限和字段级权限的存储
 */
@Entity({ tableName: 'permissions' })
@Index({ name: 'idx_permissions_tenant_id', properties: ['tenantId'] })
@Index({ name: 'idx_permissions_status', properties: ['status'] })
@Index({ name: 'idx_permissions_type', properties: ['type'] })
@Index({ name: 'idx_permissions_action', properties: ['action'] })
@Index({ name: 'idx_permissions_code', properties: ['code'] })
@Index({ name: 'idx_permissions_name', properties: ['name'] })
@Index({ name: 'idx_permissions_admin_user_id', properties: ['adminUserId'] })
@Index({ name: 'idx_permissions_organization_id', properties: ['organizationId'] })
@Index({ name: 'idx_permissions_parent_permission_id', properties: ['parentPermissionId'] })
@Index({ name: 'idx_permissions_created_at', properties: ['createdAt'] })
@Index({ name: 'idx_permissions_updated_at', properties: ['updatedAt'] })
@Unique({
  name: 'uk_permissions_tenant_code',
  properties: ['tenantId', 'code'],
})
@Unique({
  name: 'uk_permissions_tenant_name',
  properties: ['tenantId', 'name'],
})
export class PermissionOrmEntity {
  /**
   * @property id
   * @description 权限唯一标识符
   */
  @PrimaryKey({ type: 'uuid' })
  id!: string

  /**
   * @property name
   * @description 权限名称，在租户内唯一
   */
  @Property({ type: 'varchar', length: 100 })
  name!: string

  /**
   * @property code
   * @description 权限代码，在租户内唯一
   */
  @Property({ type: 'varchar', length: 50 })
  code!: string

  /**
   * @property description
   * @description 权限描述
   */
  @Property({ type: 'text', nullable: true })
  description?: string

  /**
   * @property type
   * @description 权限类型
   */
  @Property({ type: 'varchar', length: 20 })
  type!: string

  /**
   * @property status
   * @description 权限状态
   */
  @Property({ type: 'varchar', length: 20 })
  status!: string

  /**
   * @property action
   * @description 权限操作
   */
  @Property({ type: 'varchar', length: 20 })
  action!: string

  /**
   * @property tenantId
   * @description 所属租户ID，实现数据隔离
   */
  @Property({ type: 'uuid' })
  tenantId!: string

  /**
   * @property organizationId
   * @description 所属组织ID
   */
  @Property({ type: 'uuid', nullable: true })
  organizationId?: string

  /**
   * @property adminUserId
   * @description 创建该权限的管理员ID
   */
  @Property({ type: 'uuid' })
  adminUserId!: string

  /**
   * @property roleIds
   * @description 角色ID列表
   */
  @Property({ type: 'json', nullable: true })
  roleIds?: string[]

  /**
   * @property isSystemPermission
   * @description 是否为系统权限
   */
  @Property({ type: 'boolean', default: false })
  isSystemPermission!: boolean

  /**
   * @property isDefaultPermission
   * @description 是否为默认权限
   */
  @Property({ type: 'boolean', default: false })
  isDefaultPermission!: boolean

  /**
   * @property conditions
   * @description 权限条件，CASL条件表达式
   */
  @Property({ type: 'json', nullable: true })
  conditions?: PermissionConditionData[]

  /**
   * @property fields
   * @description 字段权限列表
   */
  @Property({ type: 'json', nullable: true })
  fields?: string[]

  /**
   * @property expiresAt
   * @description 权限过期时间
   */
  @Property({ type: 'datetime', nullable: true })
  expiresAt?: Date

  /**
   * @property parentPermissionId
   * @description 父权限ID
   */
  @Property({ type: 'uuid', nullable: true })
  parentPermissionId?: string

  /**
   * @property childPermissionIds
   * @description 子权限ID列表
   */
  @Property({ type: 'json', nullable: true })
  childPermissionIds?: string[]

  /**
   * @property resource
   * @description 权限资源
   */
  @Property({ type: 'varchar', length: 100, nullable: true })
  resource?: string

  /**
   * @property module
   * @description 权限模块
   */
  @Property({ type: 'varchar', length: 50, nullable: true })
  module?: string

  /**
   * @property tags
   * @description 权限标签
   */
  @Property({ type: 'varchar', length: 500, nullable: true })
  tags?: string

  /**
   * @property createdAt
   * @description 创建时间
   */
  @Property({ type: 'datetime' })
  createdAt!: Date

  /**
   * @property updatedAt
   * @description 更新时间
   */
  @Property({ type: 'datetime' })
  updatedAt!: Date

  /**
   * @property deletedAt
   * @description 删除时间，软删除
   */
  @Property({ type: 'datetime', nullable: true })
  deletedAt?: Date
} 
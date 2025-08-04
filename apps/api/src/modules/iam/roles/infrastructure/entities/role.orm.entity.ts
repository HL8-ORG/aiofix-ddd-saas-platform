import { Entity, Index, PrimaryKey, Property, Unique } from '@mikro-orm/core'

/**
 * @entity RoleOrmEntity
 * @description
 * 角色数据库实体，使用MikroORM进行ORM映射。
 * 专注于数据库表结构与字段映射。
 *
 * 主要原理与机制：
 * 1. 使用MikroORM装饰器定义数据库表结构
 * 2. 定义数据库索引和约束，支持多租户查询优化
 * 3. 处理数据库字段类型映射
 * 4. 遵循单一职责原则，只负责数据库映射
 * 5. 映射逻辑由RoleMapper专门处理
 * 6. 支持多租户数据隔离
 */
@Entity({ tableName: 'roles' })
@Index({ name: 'idx_roles_tenant_id', properties: ['tenantId'] })
@Index({ name: 'idx_roles_status', properties: ['status'] })
@Index({ name: 'idx_roles_code', properties: ['code'] })
@Index({ name: 'idx_roles_name', properties: ['name'] })
@Index({ name: 'idx_roles_organization_id', properties: ['organizationId'] })
@Index({ name: 'idx_roles_admin_user_id', properties: ['adminUserId'] })
@Index({ name: 'idx_roles_parent_role_id', properties: ['parentRoleId'] })
@Index({ name: 'idx_roles_priority', properties: ['priority'] })
@Index({ name: 'idx_roles_is_system_role', properties: ['isSystemRole'] })
@Index({ name: 'idx_roles_is_default_role', properties: ['isDefaultRole'] })
@Index({ name: 'idx_roles_expires_at', properties: ['expiresAt'] })
@Index({ name: 'idx_roles_created_at', properties: ['createdAt'] })
@Index({ name: 'idx_roles_updated_at', properties: ['updatedAt'] })
@Unique({ name: 'uk_roles_tenant_code', properties: ['tenantId', 'code'] })
@Unique({ name: 'uk_roles_tenant_name', properties: ['tenantId', 'name'] })
export class RoleOrmEntity {
  /**
   * @property id
   * @description 角色唯一标识符
   */
  @PrimaryKey({ type: 'uuid' })
  id!: string

  /**
   * @property name
   * @description 角色名称，在租户内唯一
   */
  @Property({ type: 'varchar', length: 100 })
  name!: string

  /**
   * @property code
   * @description 角色代码，在租户内唯一
   */
  @Property({ type: 'varchar', length: 50 })
  code!: string

  /**
   * @property description
   * @description 角色描述，可选
   */
  @Property({ type: 'text', nullable: true })
  description?: string

  /**
   * @property status
   * @description 角色状态
   */
  @Property({ type: 'varchar', length: 20 })
  status!: string

  /**
   * @property tenantId
   * @description 所属租户ID，实现数据隔离
   */
  @Property({ type: 'uuid' })
  tenantId!: string

  /**
   * @property organizationId
   * @description 所属组织ID，可选，支持组织级角色
   */
  @Property({ type: 'uuid', nullable: true })
  organizationId?: string

  /**
   * @property adminUserId
   * @description 创建该角色的管理员ID
   */
  @Property({ type: 'uuid' })
  adminUserId!: string

  /**
   * @property permissionIds
   * @description 权限ID列表，支持多权限
   */
  @Property({ type: 'json', nullable: true })
  permissionIds?: string[]

  /**
   * @property userIds
   * @description 用户ID列表，支持多用户，N:N关系
   */
  @Property({ type: 'json', nullable: true })
  userIds?: string[]

  /**
   * @property isSystemRole
   * @description 是否为系统角色，系统角色不可删除
   */
  @Property({ type: 'boolean', default: false })
  isSystemRole!: boolean

  /**
   * @property isDefaultRole
   * @description 是否为默认角色，新用户自动分配
   */
  @Property({ type: 'boolean', default: false })
  isDefaultRole!: boolean

  /**
   * @property priority
   * @description 角色优先级，用于权限冲突解决
   */
  @Property({ type: 'int' })
  priority!: number

  /**
   * @property maxUsers
   * @description 最大用户数，可选，限制角色分配数量
   */
  @Property({ type: 'int', nullable: true })
  maxUsers?: number

  /**
   * @property expiresAt
   * @description 角色过期时间，可选，支持临时角色
   */
  @Property({ type: 'datetime', nullable: true })
  expiresAt?: Date

  /**
   * @property parentRoleId
   * @description 父角色ID，支持角色继承
   */
  @Property({ type: 'uuid', nullable: true })
  parentRoleId?: string

  /**
   * @property childRoleIds
   * @description 子角色ID列表，支持角色继承
   */
  @Property({ type: 'json', nullable: true })
  childRoleIds?: string[]

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

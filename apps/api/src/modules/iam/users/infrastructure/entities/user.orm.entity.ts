import { Entity, PrimaryKey, Property, Index, Unique } from '@mikro-orm/core';

/**
 * @entity UserOrmEntity
 * @description
 * 用户数据库实体，使用MikroORM进行ORM映射。
 * 专注于数据库表结构与字段映射。
 * 
 * 主要原理与机制：
 * 1. 使用MikroORM装饰器定义数据库表结构
 * 2. 定义数据库索引和约束，支持多租户查询优化
 * 3. 处理数据库字段类型映射
 * 4. 遵循单一职责原则，只负责数据库映射
 * 5. 映射逻辑由UserMapper专门处理
 * 6. 支持多租户数据隔离
 */
@Entity({ tableName: 'users' })
@Index({ name: 'idx_users_tenant_id', properties: ['tenantId'] })
@Index({ name: 'idx_users_status', properties: ['status'] })
@Index({ name: 'idx_users_username', properties: ['username'] })
@Index({ name: 'idx_users_email', properties: ['email'] })
@Index({ name: 'idx_users_phone', properties: ['phone'] })
@Index({ name: 'idx_users_admin_user_id', properties: ['adminUserId'] })
@Index({ name: 'idx_users_organization_id', properties: ['organizationIds'] })
@Index({ name: 'idx_users_created_at', properties: ['createdAt'] })
@Index({ name: 'idx_users_updated_at', properties: ['updatedAt'] })
@Unique({ name: 'uk_users_tenant_username', properties: ['tenantId', 'username'] })
@Unique({ name: 'uk_users_tenant_email', properties: ['tenantId', 'email'] })
@Unique({ name: 'uk_users_tenant_phone', properties: ['tenantId', 'phone'] })
export class UserOrmEntity {
  /**
   * @property id
   * @description 用户唯一标识符
   */
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  /**
   * @property username
   * @description 用户名，在租户内唯一
   */
  @Property({ type: 'varchar', length: 50 })
  username!: string;

  /**
   * @property email
   * @description 邮箱地址，在租户内唯一
   */
  @Property({ type: 'varchar', length: 254 })
  email!: string;

  /**
   * @property phone
   * @description 手机号码，在租户内唯一
   */
  @Property({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  /**
   * @property firstName
   * @description 用户名字
   */
  @Property({ type: 'varchar', length: 50 })
  firstName!: string;

  /**
   * @property lastName
   * @description 用户姓氏
   */
  @Property({ type: 'varchar', length: 50 })
  lastName!: string;

  /**
   * @property displayName
   * @description 显示名称
   */
  @Property({ type: 'varchar', length: 100, nullable: true })
  displayName?: string;

  /**
   * @property avatar
   * @description 头像URL
   */
  @Property({ type: 'varchar', length: 500, nullable: true })
  avatar?: string;

  /**
   * @property status
   * @description 用户状态
   */
  @Property({ type: 'varchar', length: 20 })
  status!: string;

  /**
   * @property tenantId
   * @description 所属租户ID，实现数据隔离
   */
  @Property({ type: 'uuid' })
  tenantId!: string;

  /**
   * @property organizationId
   * @description 所属组织ID
   */
  @Property({ type: 'uuid', nullable: true })
  organizationId?: string;

  /**
   * @property organizationIds
   * @description 所属组织ID列表
   */
  @Property({ type: 'json', nullable: true })
  organizationIds?: string[];

  /**
   * @property roleIds
   * @description 角色ID列表
   */
  @Property({ type: 'json', nullable: true })
  roleIds?: string[];

  /**
   * @property adminUserId
   * @description 创建该用户的管理员ID
   */
  @Property({ type: 'uuid' })
  adminUserId!: string;

  /**
   * @property passwordHash
   * @description 密码哈希，加密存储
   */
  @Property({ type: 'varchar', length: 255 })
  passwordHash!: string;

  /**
   * @property lastLoginAt
   * @description 最后登录时间
   */
  @Property({ type: 'datetime', nullable: true })
  lastLoginAt?: Date;

  /**
   * @property loginAttempts
   * @description 登录失败次数
   */
  @Property({ type: 'int', default: 0 })
  loginAttempts!: number;

  /**
   * @property lockedUntil
   * @description 锁定截止时间
   */
  @Property({ type: 'datetime', nullable: true })
  lockedUntil?: Date;

  /**
   * @property emailVerified
   * @description 邮箱验证状态
   */
  @Property({ type: 'boolean', default: false })
  emailVerified!: boolean;

  /**
   * @property phoneVerified
   * @description 手机验证状态
   */
  @Property({ type: 'boolean', default: false })
  phoneVerified!: boolean;

  /**
   * @property twoFactorEnabled
   * @description 二步验证启用状态
   */
  @Property({ type: 'boolean', default: false })
  twoFactorEnabled!: boolean;

  /**
   * @property twoFactorSecret
   * @description 二步验证密钥，加密存储
   */
  @Property({ type: 'varchar', length: 255, nullable: true })
  twoFactorSecret?: string;

  /**
   * @property preferences
   * @description 用户偏好设置，JSON格式
   */
  @Property({ type: 'json', nullable: true })
  preferences?: Record<string, any>;

  /**
   * @property createdAt
   * @description 创建时间
   */
  @Property({ type: 'datetime' })
  createdAt!: Date;

  /**
   * @property updatedAt
   * @description 更新时间
   */
  @Property({ type: 'datetime' })
  updatedAt!: Date;

  /**
   * @property deletedAt
   * @description 删除时间，软删除
   */
  @Property({ type: 'datetime', nullable: true })
  deletedAt?: Date;
} 
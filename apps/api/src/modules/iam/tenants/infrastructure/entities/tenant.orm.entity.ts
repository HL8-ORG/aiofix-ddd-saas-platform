import { Entity, PrimaryKey, Property, Index, Unique } from '@mikro-orm/core';

/**
 * @entity TenantOrmEntity
 * @description
 * 租户数据库实体，使用MikroORM进行ORM映射。
 * 专注于数据库表结构与字段映射。
 * 
 * 主要原理与机制：
 * 1. 使用MikroORM装饰器定义数据库表结构
 * 2. 定义数据库索引和约束
 * 3. 处理数据库字段类型映射
 * 4. 遵循单一职责原则，只负责数据库映射
 * 5. 映射逻辑由TenantMapper专门处理
 */
@Entity({ tableName: 'tenants' })
@Index({ name: 'idx_tenants_status', properties: ['status'] })
@Index({ name: 'idx_tenants_admin_user_id', properties: ['adminUserId'] })
@Index({ name: 'idx_tenants_created_at', properties: ['createdAt'] })
@Index({ name: 'idx_tenants_updated_at', properties: ['updatedAt'] })
@Unique({ name: 'uk_tenants_code', properties: ['code'] })
export class TenantOrmEntity {
  /**
   * @property id
   * @description 租户唯一标识符
   */
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  /**
   * @property name
   * @description 租户名称
   */
  @Property({ type: 'varchar', length: 100 })
  name!: string;

  /**
   * @property code
   * @description 租户编码，唯一
   */
  @Property({ type: 'varchar', length: 50 })
  code!: string;

  /**
   * @property status
   * @description 租户状态
   */
  @Property({ type: 'varchar', length: 20 })
  status!: string;

  /**
   * @property adminUserId
   * @description 管理员用户ID
   */
  @Property({ type: 'uuid' })
  adminUserId!: string;

  /**
   * @property description
   * @description 租户描述
   */
  @Property({ type: 'text', nullable: true })
  description?: string;

  /**
   * @property settings
   * @description 租户配置，JSON格式
   */
  @Property({ type: 'json', nullable: true })
  settings?: Record<string, any>;

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
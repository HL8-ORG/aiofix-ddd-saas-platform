import { Entity, PrimaryKey, Property, Index, Unique } from '@mikro-orm/core'

/**
 * @class TenantEntity
 * @description
 * 租户数据库实体，负责将领域实体映射到数据库表结构。
 * 该实体使用MikroORM的装饰器来定义表结构、索引和约束。
 * 
 * 主要原理与机制：
 * 1. 使用@Entity装饰器定义数据库表，表名为'tenants'
 * 2. 使用@PrimaryKey定义主键，使用UUID类型
 * 3. 使用@Property定义普通字段，包括字符串、JSON、日期等类型
 * 4. 使用@Index创建索引，提升查询性能
 * 5. 使用@Unique创建唯一约束，确保业务键的唯一性
 * 6. 职责单一：只负责数据库表结构映射，不包含业务逻辑
 */
@Entity({ tableName: 'tenants' })
@Index({ name: 'idx_tenant_status', properties: ['status'] })
@Index({ name: 'idx_tenant_created_at', properties: ['createdAt'] })
@Index({ name: 'idx_tenant_updated_at', properties: ['updatedAt'] })
@Unique({ name: 'uk_tenant_name', properties: ['name'] })
@Unique({ name: 'uk_tenant_code', properties: ['code'] })
export class TenantEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string

  @Property({ type: 'varchar', length: 100 })
  name!: string

  @Property({ type: 'varchar', length: 20 })
  code!: string

  @Property({ type: 'text', nullable: true })
  description?: string

  @Property({ type: 'uuid' })
  adminUserId!: string

  @Property({ type: 'varchar', length: 20, default: 'PENDING' })
  status: string = 'PENDING'

  @Property({ type: 'json', nullable: true })
  settings?: Record<string, any>

  @Property({ type: 'uuid', nullable: true })
  suspendedBy?: string

  @Property({ type: 'timestamp', nullable: true })
  suspendedAt?: Date

  @Property({ type: 'text', nullable: true })
  suspendReason?: string

  @Property({ type: 'uuid', nullable: true })
  deletedBy?: string

  @Property({ type: 'timestamp', nullable: true })
  deletedAt?: Date

  @Property({ type: 'text', nullable: true })
  deleteReason?: string

  @Property({ type: 'int', nullable: true })
  dataRetentionDays?: number

  @Property({ type: 'timestamp', defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @Property({ type: 'timestamp', defaultRaw: 'CURRENT_TIMESTAMP', onUpdate: () => new Date() })
  updatedAt!: Date

  @Property({ type: 'uuid', nullable: true })
  createdBy?: string

  @Property({ type: 'uuid', nullable: true })
  updatedBy?: string

  @Property({ type: 'int', default: 1 })
  version: number = 1
}

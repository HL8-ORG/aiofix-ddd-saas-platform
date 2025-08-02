import { Entity, PrimaryKey, Property, Index, Unique } from '@mikro-orm/core';
import { Tenant } from '../../domain/entities/tenant.entity';
import { TenantName } from '../../domain/value-objects/tenant-name.value-object';
import { TenantCode } from '../../domain/value-objects/tenant-code.value-object';
import { TenantStatusValue, TenantStatus } from '../../domain/value-objects/tenant-status.value-object';

/**
 * @entity TenantOrmEntity
 * @description
 * 租户数据库实体，使用MikroORM进行ORM映射。
 * 负责领域实体与数据库表之间的转换。
 * 
 * 主要原理与机制：
 * 1. 使用MikroORM装饰器定义数据库表结构
 * 2. 提供领域实体与数据库实体的转换方法
 * 3. 定义数据库索引和约束
 * 4. 处理值对象的序列化和反序列化
 * 5. 遵循DDD原则，保持领域实体的纯净性
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

  /**
   * @method toDomain
   * @description 将数据库实体转换为领域实体
   * @returns {Tenant} 领域实体
   */
  toDomain(): Tenant {
    const tenant = new Tenant(
      this.id,
      this.name,
      this.code,
      this.adminUserId,
      this.description,
      this.settings
    );

    // 设置状态
    tenant.status = new TenantStatusValue(this.status as TenantStatus);

    // 设置时间戳
    tenant.createdAt = this.createdAt;
    tenant.updatedAt = this.updatedAt;
    if (this.deletedAt) {
      tenant.deletedAt = this.deletedAt;
    }

    return tenant;
  }

  /**
   * @method fromDomain
   * @description 从领域实体创建数据库实体
   * @param tenant 领域实体
   * @returns {TenantOrmEntity} 数据库实体
   */
  static fromDomain(tenant: Tenant): TenantOrmEntity {
    const ormEntity = new TenantOrmEntity();

    ormEntity.id = tenant.id;
    ormEntity.name = tenant.getName();
    ormEntity.code = tenant.getCode();
    ormEntity.status = tenant.getStatus();
    ormEntity.adminUserId = tenant.adminUserId;
    ormEntity.description = tenant.description;
    ormEntity.settings = tenant.settings;
    ormEntity.createdAt = tenant.createdAt;
    ormEntity.updatedAt = tenant.updatedAt;
    ormEntity.deletedAt = tenant.deletedAt;

    return ormEntity;
  }

  /**
   * @method updateFromDomain
   * @description 从领域实体更新数据库实体
   * @param tenant 领域实体
   */
  updateFromDomain(tenant: Tenant): void {
    this.name = tenant.getName();
    this.code = tenant.getCode();
    this.status = tenant.getStatus();
    this.adminUserId = tenant.adminUserId;
    this.description = tenant.description;
    this.settings = tenant.settings;
    this.updatedAt = tenant.updatedAt;
    this.deletedAt = tenant.deletedAt;
  }
} 
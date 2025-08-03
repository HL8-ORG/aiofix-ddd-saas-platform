import { Tenant } from '../../domain/entities/tenant.entity';
import { TenantOrmEntity } from '../entities/tenant.orm.entity';
import { TenantStatusValue, TenantStatus } from '../../domain/value-objects/tenant-status.value-object';

/**
 * @class TenantMapper
 * @description
 * 租户映射器，专门负责领域实体与数据库实体之间的转换。
 * 
 * 主要原理与机制：
 * 1. 遵循单一职责原则，只负责映射转换
 * 2. 处理值对象的序列化和反序列化
 * 3. 确保领域实体的纯净性
 * 4. 提供类型安全的映射方法
 * 5. 支持批量映射操作
 */
export class TenantMapper {
  /**
   * @method toDomain
   * @description 将数据库实体转换为领域实体
   * @param ormEntity 数据库实体
   * @returns {Tenant} 领域实体
   */
  static toDomain(ormEntity: TenantOrmEntity): Tenant {
    const tenant = new Tenant(
      ormEntity.id,
      ormEntity.name,
      ormEntity.code,
      ormEntity.adminUserId,
      ormEntity.description,
      ormEntity.settings
    );

    // 设置状态
    tenant.status = new TenantStatusValue(ormEntity.status as TenantStatus);

    // 设置时间戳
    tenant.createdAt = ormEntity.createdAt;
    tenant.updatedAt = ormEntity.updatedAt;
    if (ormEntity.deletedAt) {
      tenant.deletedAt = ormEntity.deletedAt;
    }

    return tenant;
  }

  /**
   * @method toOrm
   * @description 将领域实体转换为数据库实体
   * @param tenant 领域实体
   * @returns {TenantOrmEntity} 数据库实体
   */
  static toOrm(tenant: Tenant): TenantOrmEntity {
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
   * @method updateOrm
   * @description 从领域实体更新数据库实体
   * @param ormEntity 数据库实体
   * @param tenant 领域实体
   */
  static updateOrm(ormEntity: TenantOrmEntity, tenant: Tenant): void {
    ormEntity.name = tenant.getName();
    ormEntity.code = tenant.getCode();
    ormEntity.status = tenant.getStatus();
    ormEntity.adminUserId = tenant.adminUserId;
    ormEntity.description = tenant.description;
    ormEntity.settings = tenant.settings;
    ormEntity.updatedAt = tenant.updatedAt;
    ormEntity.deletedAt = tenant.deletedAt;
  }

  /**
   * @method toDomainList
   * @description 批量将数据库实体列表转换为领域实体列表
   * @param ormEntities 数据库实体列表
   * @returns {Tenant[]} 领域实体列表
   */
  static toDomainList(ormEntities: TenantOrmEntity[]): Tenant[] {
    return ormEntities.map(ormEntity => this.toDomain(ormEntity));
  }

  /**
   * @method toOrmList
   * @description 批量将领域实体列表转换为数据库实体列表
   * @param tenants 领域实体列表
   * @returns {TenantOrmEntity[]} 数据库实体列表
   */
  static toOrmList(tenants: Tenant[]): TenantOrmEntity[] {
    return tenants.map(tenant => this.toOrm(tenant));
  }

  /**
   * @method toPartialOrm
   * @description 将领域实体转换为部分数据库实体（用于更新操作）
   * @param tenant 领域实体
   * @returns {Partial<TenantOrmEntity>} 部分数据库实体
   */
  static toPartialOrm(tenant: Tenant): Partial<TenantOrmEntity> {
    return {
      name: tenant.getName(),
      code: tenant.getCode(),
      status: tenant.getStatus(),
      adminUserId: tenant.adminUserId,
      description: tenant.description,
      settings: tenant.settings,
      updatedAt: tenant.updatedAt,
      deletedAt: tenant.deletedAt,
    };
  }

  /**
   * @method validateOrmEntity
   * @description 验证数据库实体的完整性
   * @param ormEntity 数据库实体
   * @returns {boolean} 是否有效
   */
  static validateOrmEntity(ormEntity: TenantOrmEntity): boolean {
    return !!(
      ormEntity.id &&
      ormEntity.name &&
      ormEntity.code &&
      ormEntity.status &&
      ormEntity.adminUserId &&
      ormEntity.createdAt &&
      ormEntity.updatedAt
    );
  }

  /**
   * @method validateDomainEntity
   * @description 验证领域实体的完整性
   * @param tenant 领域实体
   * @returns {boolean} 是否有效
   */
  static validateDomainEntity(tenant: Tenant): boolean {
    try {
      return !!(
        tenant.id &&
        tenant.getName() &&
        tenant.getCode() &&
        tenant.getStatus() &&
        tenant.adminUserId &&
        tenant.createdAt &&
        tenant.updatedAt
      );
    } catch (error) {
      // 如果验证过程中抛出异常，说明实体无效
      return false;
    }
  }
} 
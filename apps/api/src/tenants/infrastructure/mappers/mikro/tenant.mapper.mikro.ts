import { Tenant as TenantDomain, TenantStatus } from '@/tenants/domain/entities/tenant.entity'
import { TenantEntity } from '../../entities/mikro/tenant.entity.mikro'
import { TenantName } from '@/tenants/domain/value-objects/tenant-name.vo'
import { TenantCode } from '@/tenants/domain/value-objects/tenant-code.vo'
import { ITenantMapper } from '../interfaces/tenant-mapper.interface'

/**
 * @class TenantMapper
 * @description
 * MikroORM租户映射器，负责数据库实体和领域实体之间的转换。
 * 该映射器遵循单一职责原则，专门处理MikroORM的数据转换逻辑。
 * 
 * 主要原理与机制：
 * 1. 实现ITenantMapper接口，提供标准的映射方法
 * 2. 处理MikroORM特有的实体属性和关系
 * 3. 确保数据完整性和类型安全
 * 4. 支持批量转换操作
 * 5. 处理MikroORM的实体生命周期管理
 */
export class TenantMapper implements ITenantMapper<TenantEntity> {
  /**
   * @method toDomain
   * @description
   * 将数据库实体转换为领域实体。
   * 
   * @param {TenantEntity} entity - 数据库实体
   * @returns {TenantDomain} 领域实体
   */
  toDomain(entity: TenantEntity): TenantDomain {
    const tenant = new TenantDomain(
      entity.id,
      new TenantName(entity.name),
      new TenantCode(entity.code),
      entity.adminUserId,
      entity.description,
      entity.settings,
    )

    // 设置状态
    tenant.status = entity.status as TenantStatus

    // 设置BaseEntity的属性
    if (entity.createdBy) {
      tenant.createdBy = entity.createdBy
    }
    if (entity.updatedBy) {
      tenant.updatedBy = entity.updatedBy
    }
    if (entity.createdAt) {
      tenant.createdAt = entity.createdAt
    }
    if (entity.updatedAt) {
      tenant.updatedAt = entity.updatedAt
    }
    if (entity.deletedAt) {
      tenant.deletedAt = entity.deletedAt
    }
    if (entity.version) {
      tenant.version = entity.version
    }

    return tenant
  }

  /**
   * @method toEntity
   * @description
   * 将领域实体转换为数据库实体。
   * 
   * @param {TenantDomain} domain - 领域实体
   * @returns {TenantEntity} 数据库实体
   */
  toEntity(domain: TenantDomain): TenantEntity {
    const entity = new TenantEntity()
    entity.id = domain.id
    entity.name = domain.name.getValue()
    entity.code = domain.code.getValue()
    entity.description = domain.description
    entity.adminUserId = domain.adminUserId
    entity.status = domain.status
    entity.settings = domain.settings
    entity.deletedBy = domain.updatedBy
    entity.deletedAt = domain.deletedAt
    entity.createdBy = domain.createdBy
    entity.updatedBy = domain.updatedBy
    entity.createdAt = domain.createdAt
    entity.updatedAt = domain.updatedAt
    entity.version = domain.version

    return entity
  }

  /**
   * @method toDomainList
   * @description
   * 批量将数据库实体列表转换为领域实体列表。
   * 
   * @param {TenantEntity[]} entities - 数据库实体列表
   * @returns {TenantDomain[]} 领域实体列表
   */
  toDomainList(entities: TenantEntity[]): TenantDomain[] {
    return entities.map(entity => this.toDomain(entity))
  }

  /**
   * @method toEntityList
   * @description
   * 批量将领域实体列表转换为数据库实体列表。
   * 
   * @param {TenantDomain[]} domains - 领域实体列表
   * @returns {TenantEntity[]} 数据库实体列表
   */
  toEntityList(domains: TenantDomain[]): TenantEntity[] {
    return domains.map(domain => this.toEntity(domain))
  }
}

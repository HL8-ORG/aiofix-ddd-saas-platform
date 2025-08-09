import { Tenant as TenantDomain } from '@/tenants/domain/entities/tenant.entity'

/**
 * @interface ITenantMapper
 * @description
 * 租户映射器接口，定义数据库实体和领域实体之间的转换契约。
 * 该接口支持多种ORM实现，确保数据转换的一致性。
 * 
 * 主要原理与机制：
 * 1. 定义标准的映射方法接口
 * 2. 支持单个实体和批量实体的转换
 * 3. 确保类型安全和数据完整性
 * 4. 支持不同ORM的特定实现
 */
export interface ITenantMapper<TEntity = any> {
  /**
   * @method toDomain
   * @description 将数据库实体转换为领域实体
   * @param entity 数据库实体
   * @returns 领域实体
   */
  toDomain(entity: TEntity): TenantDomain

  /**
   * @method toEntity
   * @description 将领域实体转换为数据库实体
   * @param domain 领域实体
   * @returns 数据库实体
   */
  toEntity(domain: TenantDomain): TEntity

  /**
   * @method toDomainList
   * @description 批量将数据库实体列表转换为领域实体列表
   * @param entities 数据库实体列表
   * @returns 领域实体列表
   */
  toDomainList(entities: TEntity[]): TenantDomain[]

  /**
   * @method toEntityList
   * @description 批量将领域实体列表转换为数据库实体列表
   * @param domains 领域实体列表
   * @returns 数据库实体列表
   */
  toEntityList(domains: TenantDomain[]): TEntity[]
}

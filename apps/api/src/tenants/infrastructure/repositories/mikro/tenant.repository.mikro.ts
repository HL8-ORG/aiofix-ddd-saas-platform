import { Injectable } from '@nestjs/common'
import { EntityRepository, EntityManager } from '@mikro-orm/core'
import { TenantEntity } from '../../entities/mikro/tenant.entity.mikro'
import { TenantMapper } from '../../mappers/mikro/tenant.mapper.mikro'
import { Tenant as TenantDomain } from '@/tenants/domain/entities/tenant.entity'
import { ITenantRepository } from '@/tenants/domain/repositories/tenant.repository.interface'
import { TenantName } from '@/tenants/domain/value-objects/tenant-name.vo'
import { TenantCode } from '@/tenants/domain/value-objects/tenant-code.vo'

/**
 * @class TenantRepository
 * @description
 * MikroORM租户仓储实现，负责租户实体的持久化操作。
 * 该仓储使用MikroORM进行数据库操作，并通过映射器进行实体转换。
 * 
 * 主要原理与机制：
 * 1. 实现ITenantRepository接口，提供标准的仓储操作
 * 2. 使用MikroORM的EntityManager进行数据库操作
 * 3. 通过TenantMapper进行数据库实体和领域实体的转换
 * 4. 提供CRUD操作和业务查询方法
 * 5. 支持事务操作和批量操作
 */
@Injectable()
export class TenantRepository implements ITenantRepository {
  private readonly mapper: TenantMapper

  constructor(private readonly em: EntityManager) {
    this.mapper = new TenantMapper()
  }

  /**
   * @method findById
   * @description 根据ID查找租户
   * @param id {string} 租户ID
   * @returns {Promise<TenantDomain | null>} 租户实体或null
   */
  async findById(id: string): Promise<TenantDomain | null> {
    const entity = await this.em.findOne(TenantEntity, { id })
    return entity ? this.mapper.toDomain(entity) : null
  }

  /**
   * @method findByCode
   * @description 根据编码查找租户
   * @param code {string} 租户编码
   * @returns {Promise<TenantDomain | null>} 租户实体或null
   */
  async findByCode(code: TenantCode): Promise<TenantDomain | null> {
    const entity = await this.em.findOne(TenantEntity, { code: code.getValue() })
    return entity ? this.mapper.toDomain(entity) : null
  }

  /**
   * @method findByName
   * @description 根据名称查找租户
   * @param name {string} 租户名称
   * @returns {Promise<TenantDomain | null>} 租户实体或null
   */
  async findByName(name: TenantName): Promise<TenantDomain | null> {
    const entity = await this.em.findOne(TenantEntity, { name: name.getValue() })
    return entity ? this.mapper.toDomain(entity) : null
  }

  /**
   * @method findByAdminUserId
   * @description 根据管理员用户ID查找租户
   * @param adminUserId {string} 管理员用户ID
   * @returns {Promise<TenantDomain[]>} 租户实体列表
   */
  async findByAdminUserId(adminUserId: string): Promise<TenantDomain[]> {
    const entities = await this.em.find(TenantEntity, { adminUserId })
    return this.mapper.toDomainList(entities)
  }

  /**
   * @method findByStatus
   * @description 根据状态查找租户
   * @param status {string} 租户状态
   * @returns {Promise<TenantDomain[]>} 租户实体列表
   */
  async findByStatus(status: string): Promise<TenantDomain[]> {
    const entities = await this.em.find(TenantEntity, { status })
    return this.mapper.toDomainList(entities)
  }

  /**
   * @method findAll
   * @description 查找所有租户
   * @returns {Promise<TenantDomain[]>} 租户实体列表
   */
  async findAll(): Promise<TenantDomain[]> {
    const entities = await this.em.find(TenantEntity, {})
    return this.mapper.toDomainList(entities)
  }

  /**
   * @method save
   * @description 保存租户实体
   * @param tenant {TenantDomain} 租户实体
   * @returns {Promise<TenantDomain>} 保存后的租户实体
   */
  async save(tenant: TenantDomain): Promise<TenantDomain> {
    const entity = this.mapper.toEntity(tenant)
    await this.em.persistAndFlush(entity)
    return this.mapper.toDomain(entity)
  }

  /**
   * @method update
   * @description 更新租户实体
   * @param tenant {TenantDomain} 租户实体
   * @returns {Promise<TenantDomain>} 更新后的租户实体
   */
  async update(tenant: TenantDomain): Promise<TenantDomain> {
    const existingEntity = await this.em.findOne(TenantEntity, { id: tenant.id })
    if (!existingEntity) {
      throw new Error(`Tenant with id ${tenant.id} not found`)
    }

    // 更新实体属性
    const updatedEntity = this.mapper.toEntity(tenant)
    this.em.assign(existingEntity, updatedEntity)
    await this.em.flush()

    return this.mapper.toDomain(existingEntity)
  }

  /**
   * @method delete
   * @description 删除租户实体
   * @param id {string} 租户ID
   * @returns {Promise<void>}
   */
  async delete(id: string): Promise<void> {
    await this.em.nativeDelete(TenantEntity, { id })
  }

  /**
   * @method exists
   * @description 检查租户是否存在
   * @param id {string} 租户ID
   * @returns {Promise<boolean>} 是否存在
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.em.count(TenantEntity, { id })
    return count > 0
  }

  /**
   * @method existsByCode
   * @description 检查租户编码是否存在
   * @param code {string} 租户编码
   * @returns {Promise<boolean>} 是否存在
   */
  async existsByCode(code: TenantCode): Promise<boolean> {
    const count = await this.em.count(TenantEntity, { code: code.getValue() })
    return count > 0
  }

  /**
   * @method existsByName
   * @description 检查租户名称是否存在
   * @param name {string} 租户名称
   * @returns {Promise<boolean>} 是否存在
   */
  async existsByName(name: TenantName): Promise<boolean> {
    const count = await this.em.count(TenantEntity, { name: name.getValue() })
    return count > 0
  }

  /**
   * @method count
   * @description 统计租户数量
   * @returns {Promise<number>} 租户数量
   */
  async count(): Promise<number> {
    return await this.em.count(TenantEntity, {})
  }

  /**
   * @method countByStatus
   * @description 根据状态统计租户数量
   * @param status {string} 租户状态
   * @returns {Promise<number>} 租户数量
   */
  async countByStatus(status: string): Promise<number> {
    return await this.em.count(TenantEntity, { status })
  }

  /**
   * @method findWithPagination
   * @description 分页查找租户
   * @param page {number} 页码
   * @param size {number} 页大小
   * @param filters {object} 过滤条件
   * @returns {Promise<{tenants: TenantDomain[], total: number}>} 分页结果
   */
  async findWithPagination(
    page: number,
    size: number,
    filters?: {
      status?: string
      search?: string
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    },
  ): Promise<{ tenants: TenantDomain[]; total: number }> {
    const where: any = {}

    if (filters?.status) {
      where.status = filters.status
    }

    // 实现搜索功能
    if (filters?.search) {
      where.$or = [
        { name: { $ilike: `%${filters.search}%` } },
        { code: { $ilike: `%${filters.search}%` } },
      ]
    }

    const [entities, total] = await this.em.findAndCount(TenantEntity, where, {
      limit: size,
      offset: (page - 1) * size,
      orderBy: filters?.sortBy ? { [filters.sortBy]: filters.sortOrder || 'asc' } : undefined,
    })

    return {
      tenants: this.mapper.toDomainList(entities),
      total,
    }
  }

  /**
   * @method findActiveTenants
   * @description 查找活跃租户
   * @returns {Promise<TenantDomain[]>} 活跃租户列表
   */
  async findActiveTenants(): Promise<TenantDomain[]> {
    const entities = await this.em.find(TenantEntity, { status: 'ACTIVE' })
    return this.mapper.toDomainList(entities)
  }

  /**
   * @method findPendingTenants
   * @description 查找待激活租户
   * @returns {Promise<TenantDomain[]>} 待激活租户列表
   */
  async findPendingTenants(): Promise<TenantDomain[]> {
    const entities = await this.em.find(TenantEntity, { status: 'PENDING' })
    return this.mapper.toDomainList(entities)
  }

  /**
   * @method findSuspendedTenants
   * @description 查找已禁用租户
   * @returns {Promise<TenantDomain[]>} 已禁用租户列表
   */
  async findSuspendedTenants(): Promise<TenantDomain[]> {
    const entities = await this.em.find(TenantEntity, { status: 'SUSPENDED' })
    return this.mapper.toDomainList(entities)
  }

  /**
   * @method findDeletedTenants
   * @description 查找已删除租户
   * @returns {Promise<TenantDomain[]>} 已删除租户列表
   */
  async findDeletedTenants(): Promise<TenantDomain[]> {
    const entities = await this.em.find(TenantEntity, { status: 'DELETED' })
    return this.mapper.toDomainList(entities)
  }
}

import { Injectable } from '@nestjs/common'
import { Tenant as TenantDomain } from '@/tenants/domain/entities/tenant.entity'
import { ITenantRepository } from '@/tenants/domain/repositories/tenant.repository.interface'
import { TenantName } from '@/tenants/domain/value-objects/tenant-name.vo'
import { TenantCode } from '@/tenants/domain/value-objects/tenant-code.vo'
import { TenantMapper } from '../../mappers/mikro/tenant.mapper.mikro'
import { TenantEntity } from '../../entities/mikro/tenant.entity.mikro'

/**
 * @class TenantRepositoryMemory
 * @description
 * 内存租户仓储实现，用于测试和开发环境。
 * 该仓储将数据存储在内存中，不依赖外部数据库。
 * 
 * 主要原理与机制：
 * 1. 实现ITenantRepository接口，提供标准的仓储操作
 * 2. 使用Map数据结构在内存中存储实体
 * 3. 通过TenantMapper进行实体转换
 * 4. 支持CRUD操作和业务查询方法
 * 5. 提供快速的数据访问，适合测试场景
 */
@Injectable()
export class TenantRepositoryMemory implements ITenantRepository {
  private readonly mapper: TenantMapper
  private readonly tenants: Map<string, TenantEntity> = new Map()

  constructor() {
    this.mapper = new TenantMapper()
  }

  /**
   * @method findById
   * @description 根据ID查找租户
   * @param id {string} 租户ID
   * @returns {Promise<TenantDomain | null>} 租户实体或null
   */
  async findById(id: string): Promise<TenantDomain | null> {
    const entity = this.tenants.get(id)
    return entity ? this.mapper.toDomain(entity) : null
  }

  /**
   * @method findByCode
   * @description 根据编码查找租户
   * @param code {TenantCode} 租户编码
   * @returns {Promise<TenantDomain | null>} 租户实体或null
   */
  async findByCode(code: TenantCode): Promise<TenantDomain | null> {
    const entity = Array.from(this.tenants.values()).find(
      tenant => tenant.code === code.getValue()
    )
    return entity ? this.mapper.toDomain(entity) : null
  }

  /**
   * @method findByName
   * @description 根据名称查找租户
   * @param name {TenantName} 租户名称
   * @returns {Promise<TenantDomain | null>} 租户实体或null
   */
  async findByName(name: TenantName): Promise<TenantDomain | null> {
    const entity = Array.from(this.tenants.values()).find(
      tenant => tenant.name === name.getValue()
    )
    return entity ? this.mapper.toDomain(entity) : null
  }

  /**
   * @method findByAdminUserId
   * @description 根据管理员用户ID查找租户
   * @param adminUserId {string} 管理员用户ID
   * @returns {Promise<TenantDomain[]>} 租户实体列表
   */
  async findByAdminUserId(adminUserId: string): Promise<TenantDomain[]> {
    const entities = Array.from(this.tenants.values()).filter(
      tenant => tenant.adminUserId === adminUserId
    )
    return this.mapper.toDomainList(entities)
  }

  /**
   * @method findByStatus
   * @description 根据状态查找租户
   * @param status {string} 租户状态
   * @returns {Promise<TenantDomain[]>} 租户实体列表
   */
  async findByStatus(status: string): Promise<TenantDomain[]> {
    const entities = Array.from(this.tenants.values()).filter(
      tenant => tenant.status === status
    )
    return this.mapper.toDomainList(entities)
  }

  /**
   * @method findAll
   * @description 查找所有租户
   * @returns {Promise<TenantDomain[]>} 租户实体列表
   */
  async findAll(): Promise<TenantDomain[]> {
    const entities = Array.from(this.tenants.values())
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
    this.tenants.set(entity.id, entity)
    return this.mapper.toDomain(entity)
  }

  /**
   * @method update
   * @description 更新租户实体
   * @param tenant {TenantDomain} 租户实体
   * @returns {Promise<TenantDomain>} 更新后的租户实体
   */
  async update(tenant: TenantDomain): Promise<TenantDomain> {
    const entity = this.mapper.toEntity(tenant)
    this.tenants.set(entity.id, entity)
    return this.mapper.toDomain(entity)
  }

  /**
   * @method delete
   * @description 删除租户实体
   * @param id {string} 租户ID
   * @returns {Promise<void>}
   */
  async delete(id: string): Promise<void> {
    this.tenants.delete(id)
  }

  /**
   * @method exists
   * @description 检查租户是否存在
   * @param id {string} 租户ID
   * @returns {Promise<boolean>} 是否存在
   */
  async exists(id: string): Promise<boolean> {
    return this.tenants.has(id)
  }

  /**
   * @method existsByCode
   * @description 检查租户编码是否存在
   * @param code {TenantCode} 租户编码
   * @returns {Promise<boolean>} 是否存在
   */
  async existsByCode(code: TenantCode): Promise<boolean> {
    return Array.from(this.tenants.values()).some(
      tenant => tenant.code === code.getValue()
    )
  }

  /**
   * @method existsByName
   * @description 检查租户名称是否存在
   * @param name {TenantName} 租户名称
   * @returns {Promise<boolean>} 是否存在
   */
  async existsByName(name: TenantName): Promise<boolean> {
    return Array.from(this.tenants.values()).some(
      tenant => tenant.name === name.getValue()
    )
  }

  /**
   * @method count
   * @description 统计租户数量
   * @returns {Promise<number>} 租户数量
   */
  async count(): Promise<number> {
    return this.tenants.size
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
    let entities = Array.from(this.tenants.values())

    // 应用过滤条件
    if (filters?.status) {
      entities = entities.filter(tenant => tenant.status === filters.status)
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      entities = entities.filter(
        tenant =>
          tenant.name.toLowerCase().includes(searchLower) ||
          tenant.code.toLowerCase().includes(searchLower) ||
          tenant.description?.toLowerCase().includes(searchLower)
      )
    }

    // 应用排序
    if (filters?.sortBy) {
      entities.sort((a, b) => {
        const aValue = a[filters.sortBy as keyof TenantEntity]
        const bValue = b[filters.sortBy as keyof TenantEntity]

        if (filters.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1
        }
        return aValue > bValue ? 1 : -1
      })
    }

    const total = entities.length
    const startIndex = (page - 1) * size
    const endIndex = startIndex + size
    const paginatedEntities = entities.slice(startIndex, endIndex)

    return {
      tenants: this.mapper.toDomainList(paginatedEntities),
      total,
    }
  }

  /**
   * @method findActiveTenants
   * @description 查找活跃租户
   * @returns {Promise<TenantDomain[]>} 活跃租户列表
   */
  async findActiveTenants(): Promise<TenantDomain[]> {
    const entities = Array.from(this.tenants.values()).filter(
      tenant => tenant.status === 'ACTIVE'
    )
    return this.mapper.toDomainList(entities)
  }

  /**
   * @method findPendingTenants
   * @description 查找待激活租户
   * @returns {Promise<TenantDomain[]>} 待激活租户列表
   */
  async findPendingTenants(): Promise<TenantDomain[]> {
    const entities = Array.from(this.tenants.values()).filter(
      tenant => tenant.status === 'PENDING'
    )
    return this.mapper.toDomainList(entities)
  }

  /**
   * @method findSuspendedTenants
   * @description 查找已禁用租户
   * @returns {Promise<TenantDomain[]>} 已禁用租户列表
   */
  async findSuspendedTenants(): Promise<TenantDomain[]> {
    const entities = Array.from(this.tenants.values()).filter(
      tenant => tenant.status === 'SUSPENDED'
    )
    return this.mapper.toDomainList(entities)
  }

  /**
   * @method findDeletedTenants
   * @description 查找已删除租户
   * @returns {Promise<TenantDomain[]>} 已删除租户列表
   */
  async findDeletedTenants(): Promise<TenantDomain[]> {
    const entities = Array.from(this.tenants.values()).filter(
      tenant => tenant.status === 'DELETED'
    )
    return this.mapper.toDomainList(entities)
  }

  /**
   * @method clear
   * @description 清空内存中的所有数据（仅用于测试）
   */
  clear(): void {
    this.tenants.clear()
  }

  /**
   * @method seed
   * @description 添加测试数据（仅用于测试）
   * @param tenants 租户实体列表
   */
  seed(tenants: TenantEntity[]): void {
    tenants.forEach(tenant => {
      this.tenants.set(tenant.id, tenant)
    })
  }
}

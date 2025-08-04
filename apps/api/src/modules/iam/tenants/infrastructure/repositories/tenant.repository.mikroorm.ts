import { EntityManager } from '@mikro-orm/core'
import { Injectable } from '@nestjs/common'
import type { Tenant } from '../../domain/entities/tenant.entity'
import { TenantRepository } from '../../domain/repositories/tenant.repository'
import type { TenantCode } from '../../domain/value-objects/tenant-code.value-object'
import { TenantStatus } from '../../domain/value-objects/tenant-status.value-object'
import { TenantOrmEntity } from '../entities/tenant.orm.entity'
import { TenantMapper } from '../mappers/tenant.mapper'

/**
 * @class TenantRepositoryMikroOrm
 * @description
 * 基于MikroORM的租户仓储实现，属于基础设施层。
 * 负责具体的数据库操作和查询优化。
 */
@Injectable()
export class TenantRepositoryMikroOrm extends TenantRepository {
  constructor(private readonly em: EntityManager) {
    super()
  }

  /**
   * @method save
   * @description 保存租户实体
   */
  async save(tenant: Tenant): Promise<Tenant> {
    const ormEntity = TenantMapper.toOrm(tenant)
    await this.em.persistAndFlush(ormEntity)
    return TenantMapper.toDomain(ormEntity)
  }

  /**
   * @method findById
   * @description 根据ID查找租户
   */
  async findById(id: string): Promise<Tenant | null> {
    const ormEntity = await this.em.findOne(TenantOrmEntity, { id })
    return ormEntity ? TenantMapper.toDomain(ormEntity) : null
  }

  async findByCode(code: TenantCode): Promise<Tenant | null> {
    const ormEntity = await this.em.findOne(TenantOrmEntity, {
      code: code.value,
    })
    return ormEntity ? TenantMapper.toDomain(ormEntity) : null
  }

  async findByCodeString(code: string): Promise<Tenant | null> {
    const ormEntity = await this.em.findOne(TenantOrmEntity, { code })
    return ormEntity ? TenantMapper.toDomain(ormEntity) : null
  }

  async findByName(name: string): Promise<Tenant[]> {
    const ormEntities = await this.em.find(TenantOrmEntity, {
      name: { $ilike: `%${name}%` },
    })
    return TenantMapper.toDomainList(ormEntities)
  }

  async findByStatus(status: TenantStatus): Promise<Tenant[]> {
    const ormEntities = await this.em.find(TenantOrmEntity, { status })
    return TenantMapper.toDomainList(ormEntities)
  }

  async findByAdminUserId(adminUserId: string): Promise<Tenant[]> {
    const ormEntities = await this.em.find(TenantOrmEntity, { adminUserId })
    return TenantMapper.toDomainList(ormEntities)
  }

  async findActive(): Promise<Tenant[]> {
    const ormEntities = await this.em.find(TenantOrmEntity, {
      status: TenantStatus.ACTIVE,
    })
    return TenantMapper.toDomainList(ormEntities)
  }

  async findPending(): Promise<Tenant[]> {
    const ormEntities = await this.em.find(TenantOrmEntity, {
      status: TenantStatus.PENDING,
    })
    return TenantMapper.toDomainList(ormEntities)
  }

  async findSuspended(): Promise<Tenant[]> {
    const ormEntities = await this.em.find(TenantOrmEntity, {
      status: TenantStatus.SUSPENDED,
    })
    return TenantMapper.toDomainList(ormEntities)
  }

  async findDeleted(): Promise<Tenant[]> {
    const ormEntities = await this.em.find(TenantOrmEntity, {
      status: TenantStatus.DELETED,
    })
    return TenantMapper.toDomainList(ormEntities)
  }

  async findAll(): Promise<Tenant[]> {
    const ormEntities = await this.em.find(TenantOrmEntity, {
      status: { $ne: TenantStatus.DELETED },
    })
    return TenantMapper.toDomainList(ormEntities)
  }

  async findAllWithDeleted(): Promise<Tenant[]> {
    const ormEntities = await this.em.find(TenantOrmEntity, {})
    return TenantMapper.toDomainList(ormEntities)
  }

  /**
   * @method exists
   * @description 检查租户是否存在
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.em.count(TenantOrmEntity, { id })
    return count > 0
  }

  /**
   * @method existsByCode
   * @description 检查租户编码是否存在
   */
  async existsByCode(code: TenantCode): Promise<boolean> {
    const count = await this.em.count(TenantOrmEntity, { code: code.value })
    return count > 0
  }

  /**
   * @method existsByCodeString
   * @description 检查租户编码字符串是否存在
   */
  async existsByCodeString(code: string): Promise<boolean> {
    const count = await this.em.count(TenantOrmEntity, { code })
    return count > 0
  }

  /**
   * @method count
   * @description 统计租户总数（不包括已删除的）
   */
  async count(): Promise<number> {
    return await this.em.count(TenantOrmEntity, {
      status: { $ne: TenantStatus.DELETED },
    })
  }

  /**
   * @method countByStatus
   * @description 根据状态统计租户数量
   */
  async countByStatus(status: TenantStatus): Promise<number> {
    return await this.em.count(TenantOrmEntity, { status })
  }

  /**
   * @method delete
   * @description 软删除租户
   */
  async delete(id: string): Promise<boolean> {
    const ormEntity = await this.em.findOne(TenantOrmEntity, { id })
    if (!ormEntity) {
      return false
    }

    ormEntity.status = TenantStatus.DELETED
    ormEntity.deletedAt = new Date()
    ormEntity.updatedAt = new Date()

    await this.em.flush()
    return true
  }

  /**
   * @method hardDelete
   * @description 硬删除租户
   */
  async hardDelete(id: string): Promise<boolean> {
    const ormEntity = await this.em.findOne(TenantOrmEntity, { id })
    if (!ormEntity) {
      return false
    }

    await this.em.removeAndFlush(ormEntity)
    return true
  }

  /**
   * @method restore
   * @description 恢复已删除的租户
   */
  async restore(id: string): Promise<boolean> {
    const ormEntity = await this.em.findOne(TenantOrmEntity, { id })
    if (!ormEntity || ormEntity.status !== TenantStatus.DELETED) {
      return false
    }

    ormEntity.status = TenantStatus.PENDING
    ormEntity.deletedAt = undefined
    ormEntity.updatedAt = new Date()

    await this.em.flush()
    return true
  }

  /**
   * @method updateStatus
   * @description 更新租户状态
   */
  async updateStatus(id: string, status: TenantStatus): Promise<boolean> {
    const ormEntity = await this.em.findOne(TenantOrmEntity, { id })
    if (!ormEntity) {
      return false
    }

    ormEntity.status = status
    ormEntity.updatedAt = new Date()

    await this.em.flush()
    return true
  }

  /**
   * @method updateSettings
   * @description 更新租户配置
   */
  async updateSettings(
    id: string,
    settings: Record<string, any>,
  ): Promise<boolean> {
    const ormEntity = await this.em.findOne(TenantOrmEntity, { id })
    if (!ormEntity) {
      return false
    }

    ormEntity.settings = { ...ormEntity.settings, ...settings }
    ormEntity.updatedAt = new Date()

    await this.em.flush()
    return true
  }

  /**
   * @method findWithPagination
   * @description 分页查询租户
   */
  async findWithPagination(
    page: number,
    limit: number,
    filters?: { status?: TenantStatus; adminUserId?: string; search?: string },
    sort?: {
      field: 'name' | 'code' | 'status' | 'createdAt' | 'updatedAt'
      order: 'asc' | 'desc'
    },
  ): Promise<{
    tenants: Tenant[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const offset = (page - 1) * limit

    // 构建查询条件
    const where: any = {}
    if (filters?.status) {
      where.status = filters.status
    }
    if (filters?.adminUserId) {
      where.adminUserId = filters.adminUserId
    }
    if (filters?.search) {
      where.$or = [
        { name: { $ilike: `%${filters.search}%` } },
        { code: { $ilike: `%${filters.search}%` } },
        { description: { $ilike: `%${filters.search}%` } },
      ]
    }

    // 构建排序条件
    const orderBy: any = {}
    if (sort) {
      orderBy[sort.field] = sort.order
    } else {
      orderBy.createdAt = 'desc'
    }

    // 执行查询
    const ormEntities = await this.em.find(TenantOrmEntity, where, {
      offset,
      limit,
      orderBy,
    })
    const total = await this.em.count(TenantOrmEntity, where)

    const tenants = TenantMapper.toDomainList(ormEntities)
    const totalPages = Math.ceil(total / limit)

    return {
      tenants,
      total,
      page,
      limit,
      totalPages,
    }
  }

  /**
   * @method findBySearch
   * @description 根据搜索条件查找租户
   */
  async findBySearch(search: string, limit?: number): Promise<Tenant[]> {
    const where = {
      $or: [
        { name: { $ilike: `%${search}%` } },
        { code: { $ilike: `%${search}%` } },
        { description: { $ilike: `%${search}%` } },
      ],
    }

    const ormEntities = await this.em.find(TenantOrmEntity, where, {
      limit,
      orderBy: { createdAt: 'desc' },
    })

    return TenantMapper.toDomainList(ormEntities)
  }

  /**
   * @method findRecent
   * @description 查找最近创建的租户
   */
  async findRecent(limit?: number): Promise<Tenant[]> {
    const ormEntities = await this.em.find(
      TenantOrmEntity,
      {},
      {
        limit,
        orderBy: { createdAt: 'desc' },
      },
    )

    return TenantMapper.toDomainList(ormEntities)
  }

  /**
   * @method findByDateRange
   * @description 根据日期范围查找租户
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<Tenant[]> {
    const ormEntities = await this.em.find(TenantOrmEntity, {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    })

    return TenantMapper.toDomainList(ormEntities)
  }
}

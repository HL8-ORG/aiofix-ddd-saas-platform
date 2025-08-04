import { EntityManager } from '@mikro-orm/core'
import { Injectable } from '@nestjs/common'
import type { Permission } from '../../domain/entities/permission.entity'
import { PermissionRepository } from '../../domain/repositories/permission.repository'
import type { PermissionAction } from '../../domain/value-objects/permission-action.value-object'
import type { PermissionStatus } from '../../domain/value-objects/permission-status.value-object'
import type { PermissionType } from '../../domain/value-objects/permission-type.value-object'
import { PermissionOrmEntity } from '../entities/permission.orm.entity'
import { PermissionMapper } from '../mappers/permission.mapper'

/**
 * @class PermissionRepositoryMikroOrm
 * @description
 * 基于MikroORM的权限仓储实现，属于基础设施层。
 * 负责具体的数据库操作和查询优化，支持多租户数据隔离。
 */
@Injectable()
export class PermissionRepositoryMikroOrm extends PermissionRepository {
  constructor(private readonly em: EntityManager) {
    super()
  }

  async save(permission: Permission): Promise<Permission> {
    const ormEntity = PermissionMapper.toOrm(permission)

    // 检查是否已存在，如果存在则更新，否则插入
    const existingEntity = await this.em.findOne(PermissionOrmEntity, {
      id: ormEntity.id,
      tenantId: ormEntity.tenantId
    })

    if (existingEntity) {
      // 更新现有实体
      Object.assign(existingEntity, ormEntity)
      await this.em.flush()
      return PermissionMapper.toDomain(existingEntity)
    } else {
      // 插入新实体
      await this.em.persistAndFlush(ormEntity)
      return PermissionMapper.toDomain(ormEntity)
    }
  }

  async findById(id: string, tenantId: string): Promise<Permission | null> {
    const ormEntity = await this.em.findOne(PermissionOrmEntity, { id, tenantId })
    return ormEntity ? PermissionMapper.toDomain(ormEntity) : null
  }

  async findByCode(code: string, tenantId: string): Promise<Permission | null> {
    const ormEntity = await this.em.findOne(PermissionOrmEntity, { code, tenantId })
    return ormEntity ? PermissionMapper.toDomain(ormEntity) : null
  }

  async findByName(name: string, tenantId: string): Promise<Permission | null> {
    const ormEntity = await this.em.findOne(PermissionOrmEntity, { name, tenantId })
    return ormEntity ? PermissionMapper.toDomain(ormEntity) : null
  }

  async findByType(
    type: PermissionType,
    tenantId: string,
    organizationId?: string,
  ): Promise<Permission[]> {
    const where: any = { type, tenantId }
    if (organizationId) {
      where.organizationId = organizationId
    }
    const ormEntities = await this.em.find(PermissionOrmEntity, where)
    return PermissionMapper.toDomainList(ormEntities)
  }

  async findByStatus(
    status: PermissionStatus,
    tenantId: string,
    organizationId?: string,
  ): Promise<Permission[]> {
    const where: any = { status, tenantId }
    if (organizationId) {
      where.organizationId = organizationId
    }
    const ormEntities = await this.em.find(PermissionOrmEntity, where)
    return PermissionMapper.toDomainList(ormEntities)
  }

  async findByAction(
    action: PermissionAction,
    tenantId: string,
    organizationId?: string,
  ): Promise<Permission[]> {
    const where: any = { action, tenantId }
    if (organizationId) {
      where.organizationId = organizationId
    }
    const ormEntities = await this.em.find(PermissionOrmEntity, where)
    return PermissionMapper.toDomainList(ormEntities)
  }

  async findByResource(
    resource: string,
    tenantId: string,
    organizationId?: string,
  ): Promise<Permission[]> {
    const where: any = { resource, tenantId }
    if (organizationId) {
      where.organizationId = organizationId
    }
    const ormEntities = await this.em.find(PermissionOrmEntity, where)
    return PermissionMapper.toDomainList(ormEntities)
  }

  async findByModule(
    module: string,
    tenantId: string,
    organizationId?: string,
  ): Promise<Permission[]> {
    const where: any = { module, tenantId }
    if (organizationId) {
      where.organizationId = organizationId
    }
    const ormEntities = await this.em.find(PermissionOrmEntity, where)
    return PermissionMapper.toDomainList(ormEntities)
  }

  async findByRoleId(roleId: string, tenantId: string): Promise<Permission[]> {
    const ormEntities = await this.em.find(PermissionOrmEntity, {
      roleIds: { $like: `%${roleId}%` },
      tenantId,
    })
    return PermissionMapper.toDomainList(ormEntities)
  }

  async findByParentPermissionId(
    parentPermissionId: string,
    tenantId: string,
  ): Promise<Permission[]> {
    const ormEntities = await this.em.find(PermissionOrmEntity, {
      parentPermissionId,
      tenantId,
    })
    return PermissionMapper.toDomainList(ormEntities)
  }

  async findSystemPermissions(tenantId: string): Promise<Permission[]> {
    const ormEntities = await this.em.find(PermissionOrmEntity, {
      isSystemPermission: true,
      tenantId,
    })
    return PermissionMapper.toDomainList(ormEntities)
  }

  async findDefaultPermissions(tenantId: string): Promise<Permission[]> {
    const ormEntities = await this.em.find(PermissionOrmEntity, {
      isDefaultPermission: true,
      tenantId,
    })
    return PermissionMapper.toDomainList(ormEntities)
  }

  async findExpiredPermissions(tenantId: string): Promise<Permission[]> {
    const ormEntities = await this.em.find(PermissionOrmEntity, {
      expiresAt: { $lt: new Date() },
      tenantId,
    })
    return PermissionMapper.toDomainList(ormEntities)
  }

  async findActivePermissions(
    tenantId: string,
    organizationId?: string,
  ): Promise<Permission[]> {
    const where: any = { status: 'active', tenantId }
    if (organizationId) {
      where.organizationId = organizationId
    }
    const ormEntities = await this.em.find(PermissionOrmEntity, where)
    return PermissionMapper.toDomainList(ormEntities)
  }

  async findAll(
    tenantId: string,
    organizationId?: string,
    page?: number,
    limit?: number,
  ): Promise<{ permissions: Permission[]; total: number }> {
    const where: any = { tenantId }
    if (organizationId) {
      where.organizationId = organizationId
    }

    const [ormEntities, total] = await this.em.findAndCount(
      PermissionOrmEntity,
      where,
      {
        limit: limit || 10,
        offset: page ? (page - 1) * (limit || 10) : 0,
        orderBy: { createdAt: 'DESC' },
      },
    )

    return {
      permissions: PermissionMapper.toDomainList(ormEntities),
      total,
    }
  }

  async search(
    query: string,
    tenantId: string,
    organizationId?: string,
    page?: number,
    limit?: number,
  ): Promise<{ permissions: Permission[]; total: number }> {
    const where: any = {
      tenantId,
      $or: [
        { name: { $ilike: `%${query}%` } },
        { code: { $ilike: `%${query}%` } },
        { description: { $ilike: `%${query}%` } },
      ],
    }
    if (organizationId) {
      where.organizationId = organizationId
    }

    const [ormEntities, total] = await this.em.findAndCount(
      PermissionOrmEntity,
      where,
      {
        limit: limit || 10,
        offset: page ? (page - 1) * (limit || 10) : 0,
        orderBy: { createdAt: 'DESC' },
      },
    )

    return {
      permissions: PermissionMapper.toDomainList(ormEntities),
      total,
    }
  }

  async countByTenant(tenantId: string, organizationId?: string): Promise<number> {
    const where: any = { tenantId }
    if (organizationId) {
      where.organizationId = organizationId
    }
    return await this.em.count(PermissionOrmEntity, where)
  }

  async countByType(
    type: PermissionType,
    tenantId: string,
    organizationId?: string,
  ): Promise<number> {
    const where: any = { type, tenantId }
    if (organizationId) {
      where.organizationId = organizationId
    }
    return await this.em.count(PermissionOrmEntity, where)
  }

  async countByStatus(
    status: PermissionStatus,
    tenantId: string,
    organizationId?: string,
  ): Promise<number> {
    const where: any = { status, tenantId }
    if (organizationId) {
      where.organizationId = organizationId
    }
    return await this.em.count(PermissionOrmEntity, where)
  }

  async exists(id: string, tenantId: string): Promise<boolean> {
    const count = await this.em.count(PermissionOrmEntity, { id, tenantId })
    return count > 0
  }

  async existsByCode(
    code: string,
    tenantId: string,
    excludeId?: string,
  ): Promise<boolean> {
    const where: any = { code, tenantId }
    if (excludeId) {
      where.id = { $ne: excludeId }
    }
    const count = await this.em.count(PermissionOrmEntity, where)
    return count > 0
  }

  async existsByName(
    name: string,
    tenantId: string,
    excludeId?: string,
  ): Promise<boolean> {
    const where: any = { name, tenantId }
    if (excludeId) {
      where.id = { $ne: excludeId }
    }
    const count = await this.em.count(PermissionOrmEntity, where)
    return count > 0
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const ormEntity = await this.em.findOne(PermissionOrmEntity, { id, tenantId })
    if (!ormEntity) {
      return false
    }
    ormEntity.deletedAt = new Date()
    ormEntity.status = 'inactive' // 使用正确的状态值
    await this.em.flush()
    return true
  }

  async deleteByTenant(tenantId: string): Promise<number> {
    const ormEntities = await this.em.find(PermissionOrmEntity, { tenantId })
    for (const entity of ormEntities) {
      entity.deletedAt = new Date()
      entity.status = 'inactive' // 使用正确的状态值
    }
    await this.em.flush()
    return ormEntities.length
  }

  async deleteByOrganization(
    organizationId: string,
    tenantId: string,
  ): Promise<number> {
    const ormEntities = await this.em.find(PermissionOrmEntity, {
      organizationId,
      tenantId,
    })
    for (const entity of ormEntities) {
      entity.deletedAt = new Date()
      entity.status = 'inactive' // 使用正确的状态值
    }
    await this.em.flush()
    return ormEntities.length
  }

  async bulkSave(permissions: Permission[]): Promise<Permission[]> {
    const ormEntities = PermissionMapper.toOrmList(permissions)
    await this.em.persistAndFlush(ormEntities)
    return PermissionMapper.toDomainList(ormEntities)
  }

  async bulkDelete(ids: string[], tenantId: string): Promise<number> {
    const ormEntities = await this.em.find(PermissionOrmEntity, {
      id: { $in: ids },
      tenantId,
    })
    for (const entity of ormEntities) {
      entity.deletedAt = new Date()
      entity.status = 'inactive' // 使用正确的状态值
    }
    await this.em.flush()
    return ormEntities.length
  }

  async findWithConditions(
    tenantId: string,
    organizationId?: string,
  ): Promise<Permission[]> {
    const where: any = { tenantId, conditions: { $ne: null } }
    if (organizationId) {
      where.organizationId = organizationId
    }
    const ormEntities = await this.em.find(PermissionOrmEntity, where)
    return PermissionMapper.toDomainList(ormEntities)
  }

  async findWithFields(
    tenantId: string,
    organizationId?: string,
  ): Promise<Permission[]> {
    const where: any = { tenantId, fields: { $ne: null } }
    if (organizationId) {
      where.organizationId = organizationId
    }
    const ormEntities = await this.em.find(PermissionOrmEntity, where)
    return PermissionMapper.toDomainList(ormEntities)
  }

  async findByTags(
    tags: string[],
    tenantId: string,
    organizationId?: string,
  ): Promise<Permission[]> {
    const where: any = { tenantId }
    if (organizationId) {
      where.organizationId = organizationId
    }
    const ormEntities = await this.em.find(PermissionOrmEntity, where)
    return PermissionMapper.toDomainList(ormEntities).filter(permission =>
      tags.some(tag => permission.tags?.includes(tag))
    )
  }
} 
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { RoleRepository } from '@/modules/iam/roles/domain/repositories/role.repository';
import { Role } from '@/modules/iam/roles/domain/entities/role.entity';
import { RoleOrmEntity } from '../entities/role.orm.entity';
import { RoleMapper } from '../mappers/role.mapper';

/**
 * @class RoleRepositoryMikroOrm
 * @description
 * 角色仓储的MikroORM实现，负责角色数据的持久化操作。
 * 
 * 主要原理与机制：
 * 1. 实现领域仓储接口，提供数据访问抽象
 * 2. 使用MikroORM进行数据库操作
 * 3. 通过映射器转换领域实体和ORM实体
 * 4. 支持多租户数据隔离
 * 5. 实现软删除和审计功能
 * 6. 提供高效的查询和索引优化
 */
@Injectable()
export class RoleRepositoryMikroOrm implements RoleRepository {
  constructor(
    private readonly em: EntityManager,
    private readonly mapper: RoleMapper
  ) { }

  /**
 * @method save
 * @description 保存角色
 * 
 * @param role - 角色实体
 */
  async save(role: Role): Promise<void> {
    const ormEntity = this.mapper.toOrm(role);

    if (role.id) {
      // 更新现有角色
      await this.em.nativeUpdate(RoleOrmEntity, { id: role.id }, ormEntity);
    } else {
      // 创建新角色
      const savedEntity = await this.em.create(RoleOrmEntity, ormEntity);
      await this.em.persistAndFlush(savedEntity);
    }
  }

  /**
   * @method findById
   * @description 根据ID查找角色
   * 
   * @param id - 角色ID
   * @param tenantId - 租户ID
   * @returns 角色实体或null
   */
  async findById(id: string, tenantId: string): Promise<Role | null> {
    const ormEntity = await this.em.findOne(RoleOrmEntity, {
      id,
      tenantId,
      deletedAt: null
    });

    return ormEntity ? this.mapper.toDomain(ormEntity) : null;
  }

  /**
   * @method findByCode
   * @description 根据代码查找角色
   * 
   * @param code - 角色代码
   * @param tenantId - 租户ID
   * @returns 角色实体或null
   */
  async findByCode(code: string, tenantId: string): Promise<Role | null> {
    const ormEntity = await this.em.findOne(RoleOrmEntity, {
      code,
      tenantId,
      deletedAt: null
    });

    return ormEntity ? this.mapper.toDomain(ormEntity) : null;
  }

  /**
   * @method findByName
   * @description 根据名称查找角色
   * 
   * @param name - 角色名称
   * @param tenantId - 租户ID
   * @returns 角色实体或null
   */
  async findByName(name: string, tenantId: string): Promise<Role | null> {
    const ormEntity = await this.em.findOne(RoleOrmEntity, {
      name,
      tenantId,
      deletedAt: null
    });

    return ormEntity ? this.mapper.toDomain(ormEntity) : null;
  }

  /**
   * @method findByTenant
   * @description 查找租户下的所有角色
   * 
   * @param tenantId - 租户ID
   * @returns 角色列表
   */
  async findByTenant(tenantId: string): Promise<Role[]> {
    const ormEntities = await this.em.find(RoleOrmEntity, {
      tenantId,
      deletedAt: null
    });

    return this.mapper.toDomainList(ormEntities);
  }

  /**
   * @method findByOrganization
   * @description 查找组织下的角色
   * 
   * @param organizationId - 组织ID
   * @param tenantId - 租户ID
   * @returns 角色列表
   */
  async findByOrganization(organizationId: string, tenantId: string): Promise<Role[]> {
    const ormEntities = await this.em.find(RoleOrmEntity, {
      organizationId,
      tenantId,
      deletedAt: null
    });

    return this.mapper.toDomainList(ormEntities);
  }

  /**
   * @method findByUser
   * @description 查找用户的所有角色
   * 
   * @param userId - 用户ID
   * @param tenantId - 租户ID
   * @returns 角色列表
   */
  async findByUser(userId: string, tenantId: string): Promise<Role[]> {
    const ormEntities = await this.em.find(RoleOrmEntity, {
      userIds: { $contains: userId },
      tenantId,
      deletedAt: null
    });

    return this.mapper.toDomainList(ormEntities);
  }

  /**
   * @method findByPermission
   * @description 查找拥有指定权限的所有角色
   * 
   * @param permissionId - 权限ID
   * @param tenantId - 租户ID
   * @returns 角色列表
   */
  async findByPermission(permissionId: string, tenantId: string): Promise<Role[]> {
    const ormEntities = await this.em.find(RoleOrmEntity, {
      permissionIds: { $contains: permissionId },
      tenantId,
      deletedAt: null
    });

    return this.mapper.toDomainList(ormEntities);
  }

  /**
   * @method findSystemRoles
   * @description 查找系统角色
   * 
   * @param tenantId - 租户ID
   * @returns 系统角色列表
   */
  async findSystemRoles(tenantId: string): Promise<Role[]> {
    const ormEntities = await this.em.find(RoleOrmEntity, {
      isSystemRole: true,
      tenantId,
      deletedAt: null
    });

    return this.mapper.toDomainList(ormEntities);
  }

  /**
   * @method findDefaultRoles
   * @description 查找默认角色
   * 
   * @param tenantId - 租户ID
   * @returns 默认角色列表
   */
  async findDefaultRoles(tenantId: string): Promise<Role[]> {
    const ormEntities = await this.em.find(RoleOrmEntity, {
      isDefaultRole: true,
      tenantId,
      deletedAt: null
    });

    return this.mapper.toDomainList(ormEntities);
  }

  /**
   * @method findActiveRoles
   * @description 查找激活状态的角色
   * 
   * @param tenantId - 租户ID
   * @returns 激活角色列表
   */
  async findActiveRoles(tenantId: string): Promise<Role[]> {
    const ormEntities = await this.em.find(RoleOrmEntity, {
      status: 'ACTIVE',
      tenantId,
      deletedAt: null
    });

    return this.mapper.toDomainList(ormEntities);
  }

  /**
   * @method findSuspendedRoles
   * @description 查找禁用状态的角色
   * 
   * @param tenantId - 租户ID
   * @returns 禁用角色列表
   */
  async findSuspendedRoles(tenantId: string): Promise<Role[]> {
    const ormEntities = await this.em.find(RoleOrmEntity, {
      status: 'SUSPENDED',
      tenantId,
      deletedAt: null
    });

    return this.mapper.toDomainList(ormEntities);
  }

  /**
   * @method findDeletedRoles
   * @description 查找已删除的角色
   * 
   * @param tenantId - 租户ID
   * @returns 已删除角色列表
   */
  async findDeletedRoles(tenantId: string): Promise<Role[]> {
    const ormEntities = await this.em.find(RoleOrmEntity, {
      tenantId,
      deletedAt: { $ne: null }
    });

    return this.mapper.toDomainList(ormEntities);
  }

  /**
   * @method findExpiredRoles
   * @description 查找已过期的角色
   * 
   * @param tenantId - 租户ID
   * @returns 已过期角色列表
   */
  async findExpiredRoles(tenantId: string): Promise<Role[]> {
    const now = new Date();
    const ormEntities = await this.em.find(RoleOrmEntity, {
      expiresAt: { $lt: now },
      tenantId,
      deletedAt: null
    });

    return this.mapper.toDomainList(ormEntities);
  }

  /**
   * @method findParentRoles
   * @description 查找父角色
   * 
   * @param roleId - 角色ID
   * @param tenantId - 租户ID
   * @returns 父角色列表
   */
  async findParentRoles(roleId: string, tenantId: string): Promise<Role[]> {
    const ormEntities = await this.em.find(RoleOrmEntity, {
      childRoleIds: { $contains: roleId },
      tenantId,
      deletedAt: null
    });

    return this.mapper.toDomainList(ormEntities);
  }

  /**
   * @method findChildRoles
   * @description 查找子角色
   * 
   * @param roleId - 角色ID
   * @param tenantId - 租户ID
   * @returns 子角色列表
   */
  async findChildRoles(roleId: string, tenantId: string): Promise<Role[]> {
    const role = await this.findById(roleId, tenantId);
    if (!role || !role.childRoleIds.length) {
      return [];
    }

    const ormEntities = await this.em.find(RoleOrmEntity, {
      id: { $in: role.childRoleIds },
      tenantId,
      deletedAt: null
    });

    return this.mapper.toDomainList(ormEntities);
  }

  /**
   * @method findRolesByPriority
   * @description 根据优先级范围查找角色
   * 
   * @param minPriority - 最小优先级
   * @param maxPriority - 最大优先级
   * @param tenantId - 租户ID
   * @returns 角色列表
   */
  async findRolesByPriority(minPriority: number, maxPriority: number, tenantId: string): Promise<Role[]> {
    const ormEntities = await this.em.find(RoleOrmEntity, {
      priority: { $gte: minPriority, $lte: maxPriority },
      tenantId,
      deletedAt: null
    });

    return this.mapper.toDomainList(ormEntities);
  }

  /**
   * @method findRolesWithUserCount
   * @description 查找角色及其用户数量
   * 
   * @param tenantId - 租户ID
   * @returns 角色和用户数量列表
   */
  async findRolesWithUserCount(tenantId: string): Promise<Array<{ role: Role; userCount: number }>> {
    const ormEntities = await this.em.find(RoleOrmEntity, {
      tenantId,
      deletedAt: null
    });

    return ormEntities.map(ormEntity => {
      const role = this.mapper.toDomain(ormEntity);
      const userCount = ormEntity.userIds?.length || 0;
      return { role, userCount };
    });
  }

  /**
   * @method findRolesWithPermissionCount
   * @description 查找角色及其权限数量
   * 
   * @param tenantId - 租户ID
   * @returns 角色和权限数量列表
   */
  async findRolesWithPermissionCount(tenantId: string): Promise<Array<{ role: Role; permissionCount: number }>> {
    const ormEntities = await this.em.find(RoleOrmEntity, {
      tenantId,
      deletedAt: null
    });

    return ormEntities.map(ormEntity => {
      const role = this.mapper.toDomain(ormEntity);
      const permissionCount = ormEntity.permissionIds?.length || 0;
      return { role, permissionCount };
    });
  }

  /**
   * @method saveMany
   * @description 批量保存角色
   * 
   * @param roles - 角色实体列表
   */
  async saveMany(roles: Role[]): Promise<void> {
    const ormEntities = this.mapper.toOrmList(roles);
    await this.em.persistAndFlush(ormEntities);
  }

  /**
   * @method deleteMany
   * @description 批量删除角色
   * 
   * @param ids - 角色ID列表
   * @param tenantId - 租户ID
   */
  async deleteMany(ids: string[], tenantId: string): Promise<void> {
    await this.em.nativeUpdate(RoleOrmEntity,
      { id: { $in: ids }, tenantId },
      {
        status: 'DELETED',
        deletedAt: new Date(),
        updatedAt: new Date()
      }
    );
  }

  /**
   * @method existsByCode
   * @description 检查角色代码是否存在
   * 
   * @param code - 角色代码
   * @param tenantId - 租户ID
   * @param excludeId - 排除的角色ID，可选
   * @returns 是否存在
   */
  async existsByCode(code: string, tenantId: string, excludeId?: string): Promise<boolean> {
    const query: any = { code, tenantId, deletedAt: null };
    if (excludeId) {
      query.id = { $ne: excludeId };
    }
    const count = await this.em.count(RoleOrmEntity, query);
    return count > 0;
  }

  /**
   * @method existsByName
   * @description 检查角色名称是否存在
   * 
   * @param name - 角色名称
   * @param tenantId - 租户ID
   * @param excludeId - 排除的角色ID，可选
   * @returns 是否存在
   */
  async existsByName(name: string, tenantId: string, excludeId?: string): Promise<boolean> {
    const query: any = { name, tenantId, deletedAt: null };
    if (excludeId) {
      query.id = { $ne: excludeId };
    }
    const count = await this.em.count(RoleOrmEntity, query);
    return count > 0;
  }

  /**
   * @method countByOrganization
   * @description 统计组织下的角色数量
   * 
   * @param organizationId - 组织ID
   * @param tenantId - 租户ID
   * @returns 角色数量
   */
  async countByOrganization(organizationId: string, tenantId: string): Promise<number> {
    return await this.em.count(RoleOrmEntity, {
      organizationId,
      tenantId,
      deletedAt: null
    });
  }

  /**
   * @method countByUser
   * @description 统计用户拥有的角色数量
   * 
   * @param userId - 用户ID
   * @param tenantId - 租户ID
   * @returns 角色数量
   */
  async countByUser(userId: string, tenantId: string): Promise<number> {
    return await this.em.count(RoleOrmEntity, {
      userIds: { $contains: userId },
      tenantId,
      deletedAt: null
    });
  }

  /**
   * @method countByPermission
   * @description 统计拥有指定权限的角色数量
   * 
   * @param permissionId - 权限ID
   * @param tenantId - 租户ID
   * @returns 角色数量
   */
  async countByPermission(permissionId: string, tenantId: string): Promise<number> {
    return await this.em.count(RoleOrmEntity, {
      permissionIds: { $contains: permissionId },
      tenantId,
      deletedAt: null
    });
  }

  /**
   * @method countSystemRoles
   * @description 统计系统角色数量
   * 
   * @param tenantId - 租户ID
   * @returns 系统角色数量
   */
  async countSystemRoles(tenantId: string): Promise<number> {
    return await this.em.count(RoleOrmEntity, {
      isSystemRole: true,
      tenantId,
      deletedAt: null
    });
  }

  /**
   * @method countDefaultRoles
   * @description 统计默认角色数量
   * 
   * @param tenantId - 租户ID
   * @returns 默认角色数量
   */
  async countDefaultRoles(tenantId: string): Promise<number> {
    return await this.em.count(RoleOrmEntity, {
      isDefaultRole: true,
      tenantId,
      deletedAt: null
    });
  }

  /**
   * @method countActiveRoles
   * @description 统计激活角色数量
   * 
   * @param tenantId - 租户ID
   * @returns 激活角色数量
   */
  async countActiveRoles(tenantId: string): Promise<number> {
    return await this.em.count(RoleOrmEntity, {
      status: 'ACTIVE',
      tenantId,
      deletedAt: null
    });
  }

  /**
   * @method countSuspendedRoles
   * @description 统计禁用角色数量
   * 
   * @param tenantId - 租户ID
   * @returns 禁用角色数量
   */
  async countSuspendedRoles(tenantId: string): Promise<number> {
    return await this.em.count(RoleOrmEntity, {
      status: 'SUSPENDED',
      tenantId,
      deletedAt: null
    });
  }

  /**
   * @method countDeletedRoles
   * @description 统计已删除角色数量
   * 
   * @param tenantId - 租户ID
   * @returns 已删除角色数量
   */
  async countDeletedRoles(tenantId: string): Promise<number> {
    return await this.em.count(RoleOrmEntity, {
      tenantId,
      deletedAt: { $ne: null }
    });
  }

  /**
   * @method countExpiredRoles
   * @description 统计已过期角色数量
   * 
   * @param tenantId - 租户ID
   * @returns 已过期角色数量
   */
  async countExpiredRoles(tenantId: string): Promise<number> {
    const now = new Date();
    return await this.em.count(RoleOrmEntity, {
      expiresAt: { $lt: now },
      tenantId,
      deletedAt: null
    });
  }

  /**
   * @method updateStatus
   * @description 更新角色状态
   * 
   * @param id - 角色ID
   * @param status - 新状态
   * @param tenantId - 租户ID
   */
  async updateStatus(id: string, status: string, tenantId: string): Promise<void> {
    await this.em.nativeUpdate(RoleOrmEntity,
      { id, tenantId },
      { status, updatedAt: new Date() }
    );
  }

  /**
   * @method delete
   * @description 删除角色（软删除）
   * 
   * @param id - 角色ID
   * @param tenantId - 租户ID
   */
  async delete(id: string, tenantId: string): Promise<void> {
    await this.em.nativeUpdate(RoleOrmEntity,
      { id, tenantId },
      {
        status: 'DELETED',
        deletedAt: new Date(),
        updatedAt: new Date()
      }
    );
  }

  /**
   * @method countByTenant
   * @description 统计租户下的角色数量
   * 
   * @param tenantId - 租户ID
   * @returns 角色数量
   */
  async countByTenant(tenantId: string): Promise<number> {
    return await this.em.count(RoleOrmEntity, {
      tenantId,
      deletedAt: null
    });
  }

  /**
   * @method exists
   * @description 检查角色是否存在
   * 
   * @param id - 角色ID
   * @param tenantId - 租户ID
   * @returns 是否存在
   */
  async exists(id: string, tenantId: string): Promise<boolean> {
    const count = await this.em.count(RoleOrmEntity, {
      id,
      tenantId,
      deletedAt: null
    });
    return count > 0;
  }
} 
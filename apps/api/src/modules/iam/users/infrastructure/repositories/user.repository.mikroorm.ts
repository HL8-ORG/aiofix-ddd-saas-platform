import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../../domain/entities/user.entity';
import { UserStatusValue, UserStatus } from '../../domain/value-objects/user-status.value-object';
import { Username } from '../../domain/value-objects/username.value-object';
import { Email } from '../../domain/value-objects/email.value-object';
import { Phone } from '../../domain/value-objects/phone.value-object';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserOrmEntity } from '../entities/user.orm.entity';
import { UserMapper } from '../mappers/user.mapper';

/**
 * @class UserRepositoryMikroOrm
 * @description
 * 基于MikroORM的用户仓储实现，属于基础设施层。
 * 负责具体的数据库操作和查询优化，支持多租户数据隔离。
 * 
 * 主要原理与机制：
 * 1. 继承领域层的仓储接口，实现具体的数据库操作
 * 2. 使用UserMapper进行领域实体与数据库实体的转换
 * 3. 所有查询都基于租户ID进行过滤，确保数据隔离
 * 4. 支持分页、搜索、排序等高级查询功能
 * 5. 使用MikroORM的EntityManager进行数据库操作
 */
@Injectable()
export class UserRepositoryMikroOrm extends UserRepository {
  constructor(private readonly em: EntityManager) {
    super();
  }

  /**
   * @method save
   * @description 保存用户实体
   */
  async save(user: User): Promise<User> {
    const ormEntity = UserMapper.toOrm(user);
    await this.em.persistAndFlush(ormEntity);
    return UserMapper.toDomain(ormEntity);
  }

  /**
   * @method findById
   * @description 根据ID查找用户（基于租户ID）
   */
  async findById(id: string, tenantId: string): Promise<User | null> {
    const ormEntity = await this.em.findOne(UserOrmEntity, { id, tenantId });
    return ormEntity ? UserMapper.toDomain(ormEntity) : null;
  }

  /**
   * @method findByUsernameString
   * @description 根据用户名查找用户（基于租户ID）
   */
  async findByUsernameString(username: string, tenantId: string): Promise<User | null> {
    const ormEntity = await this.em.findOne(UserOrmEntity, { username, tenantId });
    return ormEntity ? UserMapper.toDomain(ormEntity) : null;
  }

  /**
   * @method findByEmailString
   * @description 根据邮箱查找用户（基于租户ID）
   */
  async findByEmailString(email: string, tenantId: string): Promise<User | null> {
    const ormEntity = await this.em.findOne(UserOrmEntity, { email, tenantId });
    return ormEntity ? UserMapper.toDomain(ormEntity) : null;
  }

  /**
   * @method findByPhoneString
   * @description 根据手机号查找用户（基于租户ID）
   */
  async findByPhoneString(phone: string, tenantId: string): Promise<User | null> {
    const ormEntity = await this.em.findOne(UserOrmEntity, { phone, tenantId });
    return ormEntity ? UserMapper.toDomain(ormEntity) : null;
  }

  /**
   * @method findByAdminUserId
   * @description 根据管理员ID查找用户
   */
  async findByAdminUserId(adminUserId: string, tenantId: string): Promise<User[]> {
    const ormEntities = await this.em.find(UserOrmEntity, { adminUserId, tenantId });
    return UserMapper.toDomainList(ormEntities);
  }

  /**
   * @method findByOrganizationId
   * @description 根据组织ID查找用户
   */
  async findByOrganizationId(organizationId: string, tenantId: string): Promise<User[]> {
    const ormEntities = await this.em.find(UserOrmEntity, {
      organizationIds: { $contains: [organizationId] },
      tenantId
    });
    return UserMapper.toDomainList(ormEntities);
  }

  /**
   * @method findByRoleId
   * @description 根据角色ID查找用户
   */
  async findByRoleId(roleId: string, tenantId: string): Promise<User[]> {
    const ormEntities = await this.em.find(UserOrmEntity, {
      roleIds: { $contains: [roleId] },
      tenantId
    });
    return UserMapper.toDomainList(ormEntities);
  }

  /**
   * @method findByUsername
   * @description 根据用户名值对象查找用户
   */
  async findByUsername(username: Username, tenantId: string): Promise<User | null> {
    const ormEntity = await this.em.findOne(UserOrmEntity, { username: username.toString(), tenantId });
    return ormEntity ? UserMapper.toDomain(ormEntity) : null;
  }

  /**
   * @method findByEmail
   * @description 根据邮箱值对象查找用户
   */
  async findByEmail(email: Email, tenantId: string): Promise<User | null> {
    const ormEntity = await this.em.findOne(UserOrmEntity, { email: email.toString(), tenantId });
    return ormEntity ? UserMapper.toDomain(ormEntity) : null;
  }

  /**
   * @method findByPhone
   * @description 根据手机号值对象查找用户
   */
  async findByPhone(phone: Phone, tenantId: string): Promise<User | null> {
    const ormEntity = await this.em.findOne(UserOrmEntity, { phone: phone.toString(), tenantId });
    return ormEntity ? UserMapper.toDomain(ormEntity) : null;
  }

  /**
   * @method findByIds
   * @description 根据ID列表批量查找用户
   */
  async findByIds(ids: string[], tenantId: string): Promise<User[]> {
    const ormEntities = await this.em.find(UserOrmEntity, { id: { $in: ids }, tenantId });
    return UserMapper.toDomainList(ormEntities);
  }

  /**
   * @method findByStatus
   * @description 根据状态查找用户
   */
  async findByStatus(status: UserStatusValue, tenantId: string): Promise<User[]> {
    const ormEntities = await this.em.find(UserOrmEntity, { status: status.toString(), tenantId });
    return UserMapper.toDomainList(ormEntities);
  }

  /**
   * @method findActive
   * @description 查找激活状态的用户
   */
  async findActive(tenantId: string): Promise<User[]> {
    const ormEntities = await this.em.find(UserOrmEntity, {
      status: UserStatus.ACTIVE,
      tenantId
    });
    return UserMapper.toDomainList(ormEntities);
  }

  /**
   * @method findPending
   * @description 查找待激活状态的用户
   */
  async findPending(tenantId: string): Promise<User[]> {
    const ormEntities = await this.em.find(UserOrmEntity, {
      status: UserStatus.PENDING,
      tenantId
    });
    return UserMapper.toDomainList(ormEntities);
  }

  /**
   * @method findSuspended
   * @description 查找禁用状态的用户
   */
  async findSuspended(tenantId: string): Promise<User[]> {
    const ormEntities = await this.em.find(UserOrmEntity, {
      status: UserStatus.SUSPENDED,
      tenantId
    });
    return UserMapper.toDomainList(ormEntities);
  }

  /**
   * @method findDeleted
   * @description 查找已删除状态的用户
   */
  async findDeleted(tenantId: string): Promise<User[]> {
    const ormEntities = await this.em.find(UserOrmEntity, {
      status: UserStatus.DELETED,
      tenantId
    });
    return UserMapper.toDomainList(ormEntities);
  }

  /**
   * @method findAll
   * @description 查找所有用户（排除已删除）
   */
  async findAll(tenantId: string): Promise<User[]> {
    const ormEntities = await this.em.find(UserOrmEntity, {
      status: { $ne: UserStatus.DELETED },
      tenantId
    });
    return UserMapper.toDomainList(ormEntities);
  }

  /**
   * @method findAllWithDeleted
   * @description 查找所有用户（包括已删除）
   */
  async findAllWithDeleted(tenantId: string): Promise<User[]> {
    const ormEntities = await this.em.find(UserOrmEntity, { tenantId });
    return UserMapper.toDomainList(ormEntities);
  }

  /**
   * @method exists
   * @description 检查用户是否存在
   */
  async exists(id: string, tenantId: string): Promise<boolean> {
    const count = await this.em.count(UserOrmEntity, { id, tenantId });
    return count > 0;
  }

  /**
   * @method existsByUsername
   * @description 检查用户名值对象是否存在
   */
  async existsByUsername(username: Username, tenantId: string, excludeId?: string): Promise<boolean> {
    const where: any = { username: username.toString(), tenantId };
    if (excludeId) {
      where.id = { $ne: excludeId };
    }
    const count = await this.em.count(UserOrmEntity, where);
    return count > 0;
  }

  /**
   * @method existsByUsernameString
   * @description 检查用户名字符串是否存在
   */
  async existsByUsernameString(username: string, tenantId: string, excludeId?: string): Promise<boolean> {
    const where: any = { username, tenantId };
    if (excludeId) {
      where.id = { $ne: excludeId };
    }
    const count = await this.em.count(UserOrmEntity, where);
    return count > 0;
  }

  /**
   * @method existsByEmail
   * @description 检查邮箱值对象是否存在
   */
  async existsByEmail(email: Email, tenantId: string, excludeId?: string): Promise<boolean> {
    const where: any = { email: email.toString(), tenantId };
    if (excludeId) {
      where.id = { $ne: excludeId };
    }
    const count = await this.em.count(UserOrmEntity, where);
    return count > 0;
  }

  /**
   * @method existsByEmailString
   * @description 检查邮箱字符串是否存在
   */
  async existsByEmailString(email: string, tenantId: string, excludeId?: string): Promise<boolean> {
    const where: any = { email, tenantId };
    if (excludeId) {
      where.id = { $ne: excludeId };
    }
    const count = await this.em.count(UserOrmEntity, where);
    return count > 0;
  }

  /**
   * @method existsByPhone
   * @description 检查手机号值对象是否存在
   */
  async existsByPhone(phone: Phone, tenantId: string, excludeId?: string): Promise<boolean> {
    const where: any = { phone: phone.toString(), tenantId };
    if (excludeId) {
      where.id = { $ne: excludeId };
    }
    const count = await this.em.count(UserOrmEntity, where);
    return count > 0;
  }

  /**
   * @method existsByPhoneString
   * @description 检查手机号字符串是否存在
   */
  async existsByPhoneString(phone: string, tenantId: string, excludeId?: string): Promise<boolean> {
    const where: any = { phone, tenantId };
    if (excludeId) {
      where.id = { $ne: excludeId };
    }
    const count = await this.em.count(UserOrmEntity, where);
    return count > 0;
  }

  /**
   * @method count
   * @description 统计用户总数
   */
  async count(tenantId: string): Promise<number> {
    return await this.em.count(UserOrmEntity, {
      status: { $ne: UserStatus.DELETED },
      tenantId
    });
  }

  /**
   * @method countByStatus
   * @description 根据状态统计用户数量
   */
  async countByStatus(status: UserStatusValue, tenantId: string): Promise<number> {
    return await this.em.count(UserOrmEntity, { status: status.toString(), tenantId });
  }

  /**
   * @method delete
   * @description 软删除用户
   */
  async delete(id: string, tenantId: string): Promise<boolean> {
    const ormEntity = await this.em.findOne(UserOrmEntity, { id, tenantId });
    if (!ormEntity) {
      return false;
    }
    ormEntity.status = UserStatus.DELETED;
    ormEntity.deletedAt = new Date();
    await this.em.flush();
    return true;
  }

  /**
   * @method hardDelete
   * @description 硬删除用户
   */
  async hardDelete(id: string, tenantId: string): Promise<boolean> {
    const ormEntity = await this.em.findOne(UserOrmEntity, { id, tenantId });
    if (!ormEntity) {
      return false;
    }
    await this.em.removeAndFlush(ormEntity);
    return true;
  }

  /**
   * @method restore
   * @description 恢复已删除的用户
   */
  async restore(id: string, tenantId: string): Promise<boolean> {
    const ormEntity = await this.em.findOne(UserOrmEntity, { id, tenantId });
    if (!ormEntity) {
      return false;
    }
    ormEntity.status = UserStatus.SUSPENDED;
    ormEntity.deletedAt = null;
    await this.em.flush();
    return true;
  }

  /**
   * @method updateStatus
   * @description 更新用户状态
   */
  async updateStatus(id: string, status: UserStatusValue, tenantId: string): Promise<boolean> {
    const ormEntity = await this.em.findOne(UserOrmEntity, { id, tenantId });
    if (!ormEntity) {
      return false;
    }
    ormEntity.status = status.toString();
    ormEntity.updatedAt = new Date();
    await this.em.flush();
    return true;
  }

  /**
   * @method findWithPagination
   * @description 分页查询用户
   */
  async findWithPagination(
    page: number,
    limit: number,
    tenantId: string,
    filters?: {
      status?: UserStatusValue;
      organizationId?: string;
      roleId?: string;
      adminUserId?: string;
      search?: string;
    },
    sort?: {
      field: 'username' | 'email' | 'firstName' | 'lastName' | 'status' | 'createdAt' | 'updatedAt';
      order: 'asc' | 'desc';
    }
  ): Promise<{ users: User[]; total: number; page: number; limit: number; totalPages: number }> {
    const where: any = { tenantId };

    // 应用过滤器
    if (filters?.status) {
      where.status = filters.status.toString();
    }
    if (filters?.organizationId) {
      where.organizationIds = { $contains: [filters.organizationId] };
    }
    if (filters?.roleId) {
      where.roleIds = { $contains: [filters.roleId] };
    }
    if (filters?.adminUserId) {
      where.adminUserId = filters.adminUserId;
    }
    if (filters?.search) {
      where.$or = [
        { username: { $ilike: `%${filters.search}%` } },
        { email: { $ilike: `%${filters.search}%` } },
        { firstName: { $ilike: `%${filters.search}%` } },
        { lastName: { $ilike: `%${filters.search}%` } }
      ];
    }

    // 排除已删除的用户
    where.status = { $ne: UserStatus.DELETED };

    // 计算总数
    const total = await this.em.count(UserOrmEntity, where);

    // 应用排序
    const orderBy: any = {};
    if (sort) {
      orderBy[sort.field] = sort.order;
    } else {
      orderBy.createdAt = 'desc';
    }

    // 分页查询
    const ormEntities = await this.em.find(UserOrmEntity, where, {
      orderBy,
      limit,
      offset: (page - 1) * limit
    });

    const users = UserMapper.toDomainList(ormEntities);
    const totalPages = Math.ceil(total / limit);

    return {
      users,
      total,
      page,
      limit,
      totalPages
    };
  }

  /**
   * @method findBySearch
   * @description 搜索用户
   */
  async findBySearch(search: string, tenantId: string, limit?: number): Promise<User[]> {
    const where = {
      tenantId,
      status: { $ne: UserStatus.DELETED },
      $or: [
        { username: { $ilike: `%${search}%` } },
        { email: { $ilike: `%${search}%` } },
        { firstName: { $ilike: `%${search}%` } },
        { lastName: { $ilike: `%${search}%` } }
      ]
    };

    const ormEntities = await this.em.find(UserOrmEntity, where, {
      orderBy: { createdAt: 'desc' },
      limit
    });

    return UserMapper.toDomainList(ormEntities);
  }

  /**
   * @method findRecent
   * @description 查找最近创建的用户
   */
  async findRecent(tenantId: string, limit?: number): Promise<User[]> {
    const ormEntities = await this.em.find(UserOrmEntity, {
      tenantId,
      status: { $ne: UserStatus.DELETED }
    }, {
      orderBy: { createdAt: 'desc' },
      limit
    });

    return UserMapper.toDomainList(ormEntities);
  }

  /**
   * @method findByDateRange
   * @description 根据日期范围查找用户
   */
  async findByDateRange(startDate: Date, endDate: Date, tenantId: string): Promise<User[]> {
    const ormEntities = await this.em.find(UserOrmEntity, {
      tenantId,
      createdAt: { $gte: startDate, $lte: endDate },
      status: { $ne: UserStatus.DELETED }
    }, {
      orderBy: { createdAt: 'desc' }
    });

    return UserMapper.toDomainList(ormEntities);
  }

  /**
   * @method findLocked
   * @description 查找被锁定的用户
   */
  async findLocked(tenantId: string): Promise<User[]> {
    const ormEntities = await this.em.find(UserOrmEntity, {
      tenantId,
      lockedUntil: { $ne: null },
      status: { $ne: UserStatus.DELETED }
    });

    return UserMapper.toDomainList(ormEntities);
  }

  /**
   * @method findWithFailedLoginAttempts
   * @description 查找登录失败次数超过阈值的用户
   */
  async findWithFailedLoginAttempts(threshold: number, tenantId: string): Promise<User[]> {
    const ormEntities = await this.em.find(UserOrmEntity, {
      tenantId,
      loginAttempts: { $gte: threshold },
      status: { $ne: UserStatus.DELETED }
    });

    return UserMapper.toDomainList(ormEntities);
  }
} 
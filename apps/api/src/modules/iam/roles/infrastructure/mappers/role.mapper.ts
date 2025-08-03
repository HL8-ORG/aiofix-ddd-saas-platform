import { Injectable } from '@nestjs/common';
import { Role } from '@/modules/iam/roles/domain/entities/role.entity';
import { RoleOrmEntity } from '../entities/role.orm.entity';
import { RoleStatusValue } from '@/modules/iam/roles/domain/value-objects/role-status.value-object';

/**
 * @class RoleMapper
 * @description
 * 角色映射器，负责领域实体与ORM实体之间的转换。
 * 
 * 主要原理与机制：
 * 1. 遵循单一职责原则，只负责数据转换
 * 2. 处理值对象的序列化和反序列化
 * 3. 确保数据完整性和一致性
 * 4. 支持双向转换（领域实体 ↔ ORM实体）
 * 5. 处理可选字段和默认值
 * 6. 维护领域对象的业务规则
 */
@Injectable()
export class RoleMapper {
  /**
   * @method toDomain
   * @description 将ORM实体转换为领域实体
   * 
   * @param ormEntity - ORM实体
   * @returns 领域实体
   */
  toDomain(ormEntity: RoleOrmEntity): Role {
    if (!ormEntity) {
      throw new Error('ORM实体不能为空');
    }

    const role = new Role(
      ormEntity.id,
      ormEntity.name,
      ormEntity.code,
      ormEntity.tenantId,
      ormEntity.adminUserId,
      ormEntity.description,
      ormEntity.organizationId,
      ormEntity.priority,
      ormEntity.isSystemRole,
      ormEntity.isDefaultRole,
      ormEntity.maxUsers,
      ormEntity.expiresAt,
      ormEntity.parentRoleId
    );

    // 设置基础属性
    role.createdAt = ormEntity.createdAt;
    role.updatedAt = ormEntity.updatedAt;
    role.deletedAt = ormEntity.deletedAt;

    // 设置数组属性
    if (ormEntity.permissionIds) {
      role.permissionIds = [...ormEntity.permissionIds];
    }
    if (ormEntity.userIds) {
      role.userIds = [...ormEntity.userIds];
    }
    if (ormEntity.childRoleIds) {
      role.childRoleIds = [...ormEntity.childRoleIds];
    }

    // 设置状态
    if (ormEntity.status) {
      role.status = this.createStatusFromString(ormEntity.status);
    }

    return role;
  }

  /**
   * @method toOrm
   * @description 将领域实体转换为ORM实体
   * 
   * @param domainEntity - 领域实体
   * @returns ORM实体
   */
  toOrm(domainEntity: Role): RoleOrmEntity {
    if (!domainEntity) {
      throw new Error('领域实体不能为空');
    }

    const ormEntity = new RoleOrmEntity();
    ormEntity.id = domainEntity.id;
    ormEntity.name = domainEntity.getName();
    ormEntity.code = domainEntity.getCode();
    ormEntity.description = domainEntity.description;
    ormEntity.status = domainEntity.getStatus();
    ormEntity.tenantId = domainEntity.tenantId;
    ormEntity.organizationId = domainEntity.organizationId;
    ormEntity.adminUserId = domainEntity.adminUserId;
    ormEntity.permissionIds = domainEntity.permissionIds.length > 0 ? [...domainEntity.permissionIds] : undefined;
    ormEntity.userIds = domainEntity.userIds.length > 0 ? [...domainEntity.userIds] : undefined;
    ormEntity.isSystemRole = domainEntity.getIsSystemRole();
    ormEntity.isDefaultRole = domainEntity.getIsDefaultRole();
    ormEntity.priority = domainEntity.getPriority();
    ormEntity.maxUsers = domainEntity.maxUsers;
    ormEntity.expiresAt = domainEntity.expiresAt;
    ormEntity.parentRoleId = domainEntity.parentRoleId;
    ormEntity.childRoleIds = domainEntity.childRoleIds.length > 0 ? [...domainEntity.childRoleIds] : undefined;
    ormEntity.createdAt = domainEntity.createdAt;
    ormEntity.updatedAt = domainEntity.updatedAt;
    ormEntity.deletedAt = domainEntity.deletedAt;

    return ormEntity;
  }

  /**
   * @method toDomainList
   * @description 将ORM实体列表转换为领域实体列表
   * 
   * @param ormEntities - ORM实体列表
   * @returns 领域实体列表
   */
  toDomainList(ormEntities: RoleOrmEntity[]): Role[] {
    if (!ormEntities) {
      return [];
    }

    return ormEntities.map(ormEntity => this.toDomain(ormEntity));
  }

  /**
   * @method toOrmList
   * @description 将领域实体列表转换为ORM实体列表
   * 
   * @param domainEntities - 领域实体列表
   * @returns ORM实体列表
   */
  toOrmList(domainEntities: Role[]): RoleOrmEntity[] {
    if (!domainEntities) {
      return [];
    }

    return domainEntities.map(domainEntity => this.toOrm(domainEntity));
  }

  /**
   * @method createStatusFromString
   * @description 从字符串创建状态值对象
   * 
   * @param statusString - 状态字符串
   * @returns 状态值对象
   */
  private createStatusFromString(statusString: string): RoleStatusValue {
    switch (statusString) {
      case 'ACTIVE':
        return RoleStatusValue.active();
      case 'SUSPENDED':
        return RoleStatusValue.suspended();
      case 'DELETED':
        return RoleStatusValue.deleted();
      default:
        throw new Error(`无效的角色状态: ${statusString}`);
    }
  }
} 
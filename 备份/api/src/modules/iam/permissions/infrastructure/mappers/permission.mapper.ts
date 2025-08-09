import { Permission } from '../../domain/entities/permission.entity'
import type { PermissionAction } from '../../domain/value-objects/permission-action.value-object'
import { PermissionStatus, PermissionStatusValue } from '../../domain/value-objects/permission-status.value-object'
import type { PermissionType } from '../../domain/value-objects/permission-type.value-object'
import type { PermissionConditionData } from '../../domain/value-objects/permission-condition.value-object'
import { PermissionOrmEntity } from '../entities/permission.orm.entity'

/**
 * @class PermissionMapper
 * @description
 * 权限映射器，专门负责领域实体与数据库实体之间的转换。
 *
 * 主要原理与机制：
 * 1. 遵循单一职责原则，只负责映射转换
 * 2. 处理值对象的序列化和反序列化
 * 3. 确保领域实体的纯净性
 * 4. 提供类型安全的映射方法
 * 5. 支持批量映射操作
 * 6. 处理多租户数据隔离
 * 7. 支持CASL条件权限的转换
 */
export class PermissionMapper {
  /**
   * @method toDomain
   * @description 将数据库实体转换为领域实体
   * @param ormEntity 数据库实体
   * @returns {Permission} 领域实体
   */
  static toDomain(ormEntity: PermissionOrmEntity): Permission {
    // 解析conditions字段
    let conditions: PermissionConditionData[] | undefined
    if (ormEntity.conditions) {
      if (typeof ormEntity.conditions === 'string') {
        conditions = JSON.parse(ormEntity.conditions)
      } else {
        conditions = ormEntity.conditions as PermissionConditionData[]
      }
    }

    const permission = new Permission(
      ormEntity.id,
      ormEntity.name,
      ormEntity.code,
      ormEntity.type as PermissionType,
      ormEntity.action as PermissionAction,
      ormEntity.tenantId,
      ormEntity.adminUserId,
      ormEntity.description,
      ormEntity.organizationId,
      ormEntity.resource,
      ormEntity.module,
      ormEntity.isSystemPermission,
      ormEntity.isDefaultPermission,
      conditions,
      ormEntity.fields,
      ormEntity.expiresAt,
      ormEntity.parentPermissionId,
    )

    // 设置状态
    permission.status = new PermissionStatusValue(ormEntity.status as PermissionStatus)

    // 设置时间戳
    permission.createdAt = ormEntity.createdAt
    permission.updatedAt = ormEntity.updatedAt
    if (ormEntity.deletedAt) {
      permission.deletedAt = ormEntity.deletedAt
    }

    // 设置其他字段
    if (ormEntity.roleIds) {
      permission.roleIds = ormEntity.roleIds
    }
    if (ormEntity.childPermissionIds) {
      permission.childPermissionIds = ormEntity.childPermissionIds
    }
    if (ormEntity.tags) {
      permission.tags = ormEntity.tags
    }

    return permission
  }

  /**
   * @method toOrm
   * @description 将领域实体转换为数据库实体
   * @param permission 领域实体
   * @returns {PermissionOrmEntity} 数据库实体
   */
  static toOrm(permission: Permission): PermissionOrmEntity {
    const ormEntity = new PermissionOrmEntity()

    ormEntity.id = permission.id
    ormEntity.name = permission.getName()
    ormEntity.code = permission.getCode()
    ormEntity.description = permission.description
    ormEntity.type = permission.getType()
    ormEntity.status = permission.getStatus()
    ormEntity.action = permission.getAction()
    ormEntity.tenantId = permission.tenantId
    ormEntity.organizationId = permission.organizationId
    ormEntity.adminUserId = permission.adminUserId
    ormEntity.roleIds = permission.roleIds
    ormEntity.isSystemPermission = permission.getIsSystemPermission()
    ormEntity.isDefaultPermission = permission.getIsDefaultPermission()
    ormEntity.conditions = permission.conditions?.getValue() || undefined
    ormEntity.fields = permission.fields
    ormEntity.expiresAt = permission.expiresAt
    ormEntity.parentPermissionId = permission.parentPermissionId
    ormEntity.childPermissionIds = permission.childPermissionIds
    ormEntity.resource = permission.resource
    ormEntity.module = permission.module
    ormEntity.tags = permission.tags
    ormEntity.createdAt = permission.createdAt
    ormEntity.updatedAt = permission.updatedAt
    ormEntity.deletedAt = permission.deletedAt

    return ormEntity
  }

  /**
   * @method updateOrm
   * @description 从领域实体更新数据库实体
   * @param ormEntity 数据库实体
   * @param permission 领域实体
   */
  static updateOrm(ormEntity: PermissionOrmEntity, permission: Permission): void {
    ormEntity.name = permission.getName()
    ormEntity.code = permission.getCode()
    ormEntity.description = permission.description
    ormEntity.type = permission.getType()
    ormEntity.status = permission.getStatus()
    ormEntity.action = permission.getAction()
    ormEntity.organizationId = permission.organizationId
    ormEntity.adminUserId = permission.adminUserId
    ormEntity.roleIds = permission.roleIds
    ormEntity.isSystemPermission = permission.getIsSystemPermission()
    ormEntity.isDefaultPermission = permission.getIsDefaultPermission()
    ormEntity.conditions = permission.conditions?.getValue() || undefined
    ormEntity.fields = permission.fields
    ormEntity.expiresAt = permission.expiresAt
    ormEntity.parentPermissionId = permission.parentPermissionId
    ormEntity.childPermissionIds = permission.childPermissionIds
    ormEntity.resource = permission.resource
    ormEntity.module = permission.module
    ormEntity.tags = permission.tags
    ormEntity.updatedAt = permission.updatedAt
    ormEntity.deletedAt = permission.deletedAt
  }

  /**
   * @method toDomainList
   * @description 批量将数据库实体列表转换为领域实体列表
   * @param ormEntities 数据库实体列表
   * @returns {Permission[]} 领域实体列表
   */
  static toDomainList(ormEntities: PermissionOrmEntity[]): Permission[] {
    return ormEntities.map((ormEntity) => this.toDomain(ormEntity))
  }

  /**
   * @method toOrmList
   * @description 批量将领域实体列表转换为数据库实体列表
   * @param permissions 领域实体列表
   * @returns {PermissionOrmEntity[]} 数据库实体列表
   */
  static toOrmList(permissions: Permission[]): PermissionOrmEntity[] {
    return permissions.map((permission) => this.toOrm(permission))
  }

  /**
   * @method toPartialOrm
   * @description 将领域实体转换为部分数据库实体（用于更新操作）
   * @param permission 领域实体
   * @returns {Partial<PermissionOrmEntity>} 部分数据库实体
   */
  static toPartialOrm(permission: Permission): Partial<PermissionOrmEntity> {
    return {
      name: permission.getName(),
      code: permission.getCode(),
      description: permission.description,
      type: permission.getType(),
      status: permission.getStatus(),
      action: permission.getAction(),
      organizationId: permission.organizationId,
      adminUserId: permission.adminUserId,
      roleIds: permission.roleIds,
      isSystemPermission: permission.getIsSystemPermission(),
      isDefaultPermission: permission.getIsDefaultPermission(),
      conditions: permission.conditions?.getValue() || undefined,
      fields: permission.fields,
      expiresAt: permission.expiresAt,
      parentPermissionId: permission.parentPermissionId,
      childPermissionIds: permission.childPermissionIds,
      resource: permission.resource,
      module: permission.module,
      tags: permission.tags,
      updatedAt: permission.updatedAt,
      deletedAt: permission.deletedAt,
    }
  }

  /**
   * @method validateOrmEntity
   * @description 验证数据库实体的有效性
   * @param ormEntity 数据库实体
   * @returns {boolean} 是否有效
   */
  static validateOrmEntity(ormEntity: PermissionOrmEntity): boolean {
    return !!(
      ormEntity.id &&
      ormEntity.name &&
      ormEntity.code &&
      ormEntity.type &&
      ormEntity.status &&
      ormEntity.action &&
      ormEntity.tenantId &&
      ormEntity.adminUserId
    )
  }

  /**
   * @method validateDomainEntity
   * @description 验证领域实体的有效性
   * @param permission 领域实体
   * @returns {boolean} 是否有效
   */
  static validateDomainEntity(permission: Permission): boolean {
    return !!(
      permission.id &&
      permission.getName() &&
      permission.getCode() &&
      permission.getType() &&
      permission.getStatus() &&
      permission.getAction() &&
      permission.tenantId &&
      permission.adminUserId
    )
  }
} 
import { User } from '../../domain/entities/user.entity';
import { UserOrmEntity } from '../entities/user.orm.entity';
import { UserStatusValue, UserStatus } from '../../domain/value-objects/user-status.value-object';
import { Username } from '../../domain/value-objects/username.value-object';
import { Email } from '../../domain/value-objects/email.value-object';
import { Phone } from '../../domain/value-objects/phone.value-object';

/**
 * @class UserMapper
 * @description
 * 用户映射器，专门负责领域实体与数据库实体之间的转换。
 * 
 * 主要原理与机制：
 * 1. 遵循单一职责原则，只负责映射转换
 * 2. 处理值对象的序列化和反序列化
 * 3. 确保领域实体的纯净性
 * 4. 提供类型安全的映射方法
 * 5. 支持批量映射操作
 * 6. 处理多租户数据隔离
 */
export class UserMapper {
  /**
   * @method toDomain
   * @description 将数据库实体转换为领域实体
   * @param ormEntity 数据库实体
   * @returns {User} 领域实体
   */
  static toDomain(ormEntity: UserOrmEntity): User {
    const user = new User(
      ormEntity.id,
      ormEntity.username,
      ormEntity.email,
      ormEntity.firstName,
      ormEntity.lastName,
      ormEntity.tenantId,
      ormEntity.adminUserId,
      ormEntity.passwordHash,
      ormEntity.phone,
      ormEntity.displayName,
      ormEntity.avatar,
      ormEntity.organizationIds,
      ormEntity.roleIds,
      ormEntity.preferences
    );

    // 设置状态
    user.status = new UserStatusValue(ormEntity.status as UserStatus);

    // 设置时间戳
    user.createdAt = ormEntity.createdAt;
    user.updatedAt = ormEntity.updatedAt;
    if (ormEntity.deletedAt) {
      user.deletedAt = ormEntity.deletedAt;
    }

    // 设置其他字段
    if (ormEntity.lastLoginAt) {
      user.lastLoginAt = ormEntity.lastLoginAt;
    }
    user.loginAttempts = ormEntity.loginAttempts;
    if (ormEntity.lockedUntil) {
      user.lockedUntil = ormEntity.lockedUntil;
    }
    user.emailVerified = ormEntity.emailVerified;
    user.phoneVerified = ormEntity.phoneVerified;
    user.twoFactorEnabled = ormEntity.twoFactorEnabled;
    if (ormEntity.twoFactorSecret) {
      user.twoFactorSecret = ormEntity.twoFactorSecret;
    }

    return user;
  }

  /**
   * @method toOrm
   * @description 将领域实体转换为数据库实体
   * @param user 领域实体
   * @returns {UserOrmEntity} 数据库实体
   */
  static toOrm(user: User): UserOrmEntity {
    const ormEntity = new UserOrmEntity();

    ormEntity.id = user.id;
    ormEntity.username = user.getUsername();
    ormEntity.email = user.getEmail();
    ormEntity.firstName = user.firstName;
    ormEntity.lastName = user.lastName;
    ormEntity.tenantId = user.tenantId;
    ormEntity.adminUserId = user.adminUserId;
    ormEntity.passwordHash = user.passwordHash;
    ormEntity.phone = user.getPhone();
    ormEntity.displayName = user.displayName;
    ormEntity.avatar = user.avatar;
    ormEntity.status = user.getStatus();
    ormEntity.organizationIds = user.organizationIds;
    ormEntity.roleIds = user.roleIds;
    ormEntity.lastLoginAt = user.lastLoginAt;
    ormEntity.loginAttempts = user.loginAttempts;
    ormEntity.lockedUntil = user.lockedUntil;
    ormEntity.emailVerified = user.emailVerified;
    ormEntity.phoneVerified = user.phoneVerified;
    ormEntity.twoFactorEnabled = user.twoFactorEnabled;
    ormEntity.twoFactorSecret = user.twoFactorSecret;
    ormEntity.preferences = user.preferences;
    ormEntity.createdAt = user.createdAt;
    ormEntity.updatedAt = user.updatedAt;
    ormEntity.deletedAt = user.deletedAt;

    return ormEntity;
  }

  /**
   * @method updateOrm
   * @description 从领域实体更新数据库实体
   * @param ormEntity 数据库实体
   * @param user 领域实体
   */
  static updateOrm(ormEntity: UserOrmEntity, user: User): void {
    ormEntity.username = user.getUsername();
    ormEntity.email = user.getEmail();
    ormEntity.firstName = user.firstName;
    ormEntity.lastName = user.lastName;
    ormEntity.phone = user.getPhone();
    ormEntity.displayName = user.displayName;
    ormEntity.avatar = user.avatar;
    ormEntity.status = user.getStatus();
    ormEntity.organizationIds = user.organizationIds;
    ormEntity.roleIds = user.roleIds;
    ormEntity.lastLoginAt = user.lastLoginAt;
    ormEntity.loginAttempts = user.loginAttempts;
    ormEntity.lockedUntil = user.lockedUntil;
    ormEntity.emailVerified = user.emailVerified;
    ormEntity.phoneVerified = user.phoneVerified;
    ormEntity.twoFactorEnabled = user.twoFactorEnabled;
    ormEntity.twoFactorSecret = user.twoFactorSecret;
    ormEntity.preferences = user.preferences;
    ormEntity.updatedAt = user.updatedAt;
    ormEntity.deletedAt = user.deletedAt;
  }

  /**
   * @method toDomainList
   * @description 批量将数据库实体列表转换为领域实体列表
   * @param ormEntities 数据库实体列表
   * @returns {User[]} 领域实体列表
   */
  static toDomainList(ormEntities: UserOrmEntity[]): User[] {
    return ormEntities.map(ormEntity => this.toDomain(ormEntity));
  }

  /**
   * @method toOrmList
   * @description 批量将领域实体列表转换为数据库实体列表
   * @param users 领域实体列表
   * @returns {UserOrmEntity[]} 数据库实体列表
   */
  static toOrmList(users: User[]): UserOrmEntity[] {
    return users.map(user => this.toOrm(user));
  }

  /**
   * @method toPartialOrm
   * @description 将领域实体转换为部分数据库实体（用于更新操作）
   * @param user 领域实体
   * @returns {Partial<UserOrmEntity>} 部分数据库实体
   */
  static toPartialOrm(user: User): Partial<UserOrmEntity> {
    return {
      username: user.getUsername(),
      email: user.getEmail(),
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.getPhone(),
      displayName: user.displayName,
      avatar: user.avatar,
      status: user.getStatus(),
      organizationIds: user.organizationIds,
      roleIds: user.roleIds,
      lastLoginAt: user.lastLoginAt,
      loginAttempts: user.loginAttempts,
      lockedUntil: user.lockedUntil,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      twoFactorSecret: user.twoFactorSecret,
      preferences: user.preferences,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    };
  }

  /**
   * @method validateOrmEntity
   * @description 验证数据库实体的完整性
   * @param ormEntity 数据库实体
   * @returns {boolean} 是否有效
   */
  static validateOrmEntity(ormEntity: UserOrmEntity): boolean {
    return !!(
      ormEntity.id &&
      ormEntity.username &&
      ormEntity.email &&
      ormEntity.firstName &&
      ormEntity.lastName &&
      ormEntity.tenantId &&
      ormEntity.adminUserId &&
      ormEntity.passwordHash &&
      ormEntity.status &&
      ormEntity.createdAt &&
      ormEntity.updatedAt
    );
  }

  /**
   * @method validateDomainEntity
   * @description 验证领域实体的完整性
   * @param user 领域实体
   * @returns {boolean} 是否有效
   */
  static validateDomainEntity(user: User): boolean {
    try {
      return !!(
        user.id &&
        user.getUsername() &&
        user.getEmail() &&
        user.firstName &&
        user.lastName &&
        user.tenantId &&
        user.adminUserId &&
        user.passwordHash &&
        user.getStatus() &&
        user.createdAt &&
        user.updatedAt
      );
    } catch (error) {
      // 如果验证过程中抛出异常，说明实体无效
      return false;
    }
  }
} 
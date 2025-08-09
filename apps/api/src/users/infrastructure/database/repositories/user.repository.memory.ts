import { Injectable } from '@nestjs/common';
import { UserRepository, FindUsersOptions, CountUsersOptions } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserName } from '../../../domain/value-objects/username.vo';
import { UserStatusType } from '../../../domain/value-objects/user-status.vo';

/**
 * @class UserRepositoryMemory
 * @description
 * 用户仓储的内存实现，用于测试和开发阶段。
 * 
 * 主要特点：
 * 1. 基于内存存储，数据在应用重启后丢失
 * 2. 支持多租户数据隔离
 * 3. 实现完整的仓储接口
 * 4. 提供基本的查询和过滤功能
 * 
 * 使用场景：
 * 1. 单元测试和集成测试
 * 2. 开发阶段的原型验证
 * 3. 演示和演示环境
 */
@Injectable()
export class UserRepositoryMemory implements UserRepository {
  /**
   * @private
   * @description 内存存储，按租户ID分组
   */
  private readonly users = new Map<string, Map<string, User>>();

  /**
   * @method save
   * @description 保存用户（创建或更新）
   */
  async save(user: User): Promise<User> {
    const tenantId = user.getTenantId();
    const userId = user.getId().getValue();

    // 确保租户的用户映射存在
    if (!this.users.has(tenantId)) {
      this.users.set(tenantId, new Map());
    }

    const tenantUsers = this.users.get(tenantId)!;
    tenantUsers.set(userId, user);

    return user;
  }

  /**
   * @method findById
   * @description 根据ID查找用户
   */
  async findById(id: UserId, tenantId: string): Promise<User | null> {
    const tenantUsers = this.users.get(tenantId);
    if (!tenantUsers) {
      return null;
    }

    return tenantUsers.get(id.getValue()) || null;
  }

  /**
   * @method findByEmail
   * @description 根据邮箱查找用户
   */
  async findByEmail(email: Email, tenantId: string): Promise<User | null> {
    const tenantUsers = this.users.get(tenantId);
    if (!tenantUsers) {
      return null;
    }

    for (const user of tenantUsers.values()) {
      if (user.getEmail().equals(email)) {
        return user;
      }
    }

    return null;
  }

  /**
   * @method findByUsername
   * @description 根据用户名查找用户
   */
  async findByUsername(username: UserName, tenantId: string): Promise<User | null> {
    const tenantUsers = this.users.get(tenantId);
    if (!tenantUsers) {
      return null;
    }

    for (const user of tenantUsers.values()) {
      if (user.getUsername().equals(username)) {
        return user;
      }
    }

    return null;
  }

  /**
   * @method findByEmailOrUsername
   * @description 根据邮箱或用户名查找用户（用于登录）
   */
  async findByEmailOrUsername(identifier: string, tenantId: string): Promise<User | null> {
    const tenantUsers = this.users.get(tenantId);
    if (!tenantUsers) {
      return null;
    }

    for (const user of tenantUsers.values()) {
      const email = user.getEmail().getValue().toLowerCase();
      const username = user.getUsername().getValue().toLowerCase();
      const searchIdentifier = identifier.toLowerCase();

      if (email === searchIdentifier || username === searchIdentifier) {
        return user;
      }
    }

    return null;
  }

  /**
   * @method exists
   * @description 检查用户是否存在
   */
  async exists(id: UserId, tenantId: string): Promise<boolean> {
    const tenantUsers = this.users.get(tenantId);
    if (!tenantUsers) {
      return false;
    }

    return tenantUsers.has(id.getValue());
  }

  /**
   * @method existsByEmail
   * @description 检查邮箱是否已被使用
   */
  async existsByEmail(email: Email, tenantId: string, excludeId?: UserId): Promise<boolean> {
    const tenantUsers = this.users.get(tenantId);
    if (!tenantUsers) {
      return false;
    }

    for (const user of tenantUsers.values()) {
      if (user.getEmail().equals(email)) {
        // 如果指定了排除ID，则跳过该用户
        if (excludeId && user.getId().equals(excludeId)) {
          continue;
        }
        return true;
      }
    }

    return false;
  }

  /**
   * @method existsByUsername
   * @description 检查用户名是否已被使用
   */
  async existsByUsername(username: UserName, tenantId: string, excludeId?: UserId): Promise<boolean> {
    const tenantUsers = this.users.get(tenantId);
    if (!tenantUsers) {
      return false;
    }

    for (const user of tenantUsers.values()) {
      if (user.getUsername().equals(username)) {
        // 如果指定了排除ID，则跳过该用户
        if (excludeId && user.getId().equals(excludeId)) {
          continue;
        }
        return true;
      }
    }

    return false;
  }

  /**
   * @method delete
   * @description 删除用户（软删除）
   */
  async delete(id: UserId, tenantId: string): Promise<void> {
    const tenantUsers = this.users.get(tenantId);
    if (!tenantUsers) {
      return;
    }

    const user = tenantUsers.get(id.getValue());
    if (user) {
      // 执行软删除
      user.delete();
      tenantUsers.set(id.getValue(), user);
    }
  }

  /**
   * @method findActiveUsers
   * @description 查找活跃用户列表
   */
  async findActiveUsers(tenantId: string, options?: FindUsersOptions): Promise<User[]> {
    const tenantUsers = this.users.get(tenantId);
    if (!tenantUsers) {
      return [];
    }

    let users = Array.from(tenantUsers.values()).filter(user =>
      user.getStatus().getValue() === UserStatusType.ACTIVE
    );

    return this.applyFilters(users, options);
  }

  /**
   * @method findUsersByStatus
   * @description 根据状态查找用户
   */
  async findUsersByStatus(status: string, tenantId: string, options?: FindUsersOptions): Promise<User[]> {
    const tenantUsers = this.users.get(tenantId);
    if (!tenantUsers) {
      return [];
    }

    let users = Array.from(tenantUsers.values()).filter(user =>
      user.getStatus().getValue() === status as UserStatusType
    );

    return this.applyFilters(users, options);
  }

  /**
   * @method count
   * @description 统计用户数量
   */
  async count(tenantId: string, options?: CountUsersOptions): Promise<number> {
    const tenantUsers = this.users.get(tenantId);
    if (!tenantUsers) {
      return 0;
    }

    let users = Array.from(tenantUsers.values());

    // 应用状态过滤
    if (options?.status) {
      users = users.filter(user => user.getStatus().getValue() === options.status);
    }

    // 应用搜索过滤
    if (options?.search) {
      const searchTerm = options.search.toLowerCase();
      users = users.filter(user => {
        const email = user.getEmail().getValue().toLowerCase();
        const username = user.getUsername().getValue().toLowerCase();
        return email.includes(searchTerm) || username.includes(searchTerm);
      });
    }

    // 应用删除过滤
    if (!options?.includeDeleted) {
      users = users.filter(user => user.getStatus().getValue() !== UserStatusType.DELETED);
    }

    return users.length;
  }

  /**
   * @method findUsersForTenant
   * @description 查找租户下的所有用户
   */
  async findUsersForTenant(tenantId: string, options?: FindUsersOptions): Promise<User[]> {
    const tenantUsers = this.users.get(tenantId);
    if (!tenantUsers) {
      return [];
    }

    let users = Array.from(tenantUsers.values());

    return this.applyFilters(users, options);
  }

  /**
   * @private
   * @method applyFilters
   * @description 应用查询过滤和排序
   */
  private applyFilters(users: User[], options?: FindUsersOptions): User[] {
    // 应用搜索过滤
    if (options?.search) {
      const searchTerm = options.search.toLowerCase();
      users = users.filter(user => {
        const email = user.getEmail().getValue().toLowerCase();
        const username = user.getUsername().getValue().toLowerCase();
        return email.includes(searchTerm) || username.includes(searchTerm);
      });
    }

    // 应用删除过滤
    if (!options?.includeDeleted) {
      users = users.filter(user => user.getStatus().getValue() !== UserStatusType.DELETED);
    }

    // 应用排序
    if (options?.sortBy) {
      users.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (options.sortBy) {
          case 'createdAt':
            aValue = a.getCreatedAt();
            bValue = b.getCreatedAt();
            break;
          case 'updatedAt':
            aValue = a.getUpdatedAt();
            bValue = b.getUpdatedAt();
            break;
          case 'username':
            aValue = a.getUsername().getValue();
            bValue = b.getUsername().getValue();
            break;
          case 'email':
            aValue = a.getEmail().getValue();
            bValue = b.getEmail().getValue();
            break;
          default:
            return 0;
        }

        if (options.sortOrder === 'desc') {
          return bValue.localeCompare(aValue);
        }
        return aValue.localeCompare(bValue);
      });
    }

    // 应用分页
    if (options?.offset !== undefined) {
      users = users.slice(options.offset);
    }

    if (options?.limit !== undefined) {
      users = users.slice(0, options.limit);
    }

    return users;
  }

  /**
   * @method clear
   * @description 清空所有数据（仅用于测试）
   */
  clear(): void {
    this.users.clear();
  }
}

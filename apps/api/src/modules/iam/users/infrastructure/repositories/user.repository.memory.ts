import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { UserStatusValue, UserStatus } from '../../domain/value-objects/user-status.value-object';
import { Username } from '../../domain/value-objects/username.value-object';
import { Email } from '../../domain/value-objects/email.value-object';
import { Phone } from '../../domain/value-objects/phone.value-object';
import { UserRepository } from '../../domain/repositories/user.repository';

/**
 * @class UserRepositoryMemory
 * @description
 * 基于内存的用户仓储实现，用于测试和开发环境。
 */
@Injectable()
export class UserRepositoryMemory extends UserRepository {
  private users = new Map<string, User>();

  async save(user: User): Promise<User> {
    // 检查用户名重复
    const existingUserByUsername = await this.findByUsernameString(user.getUsername(), user.tenantId);
    if (existingUserByUsername && existingUserByUsername.id !== user.id) {
      throw new Error('用户名已存在');
    }

    // 检查邮箱重复
    const existingUserByEmail = await this.findByEmailString(user.getEmail(), user.tenantId);
    if (existingUserByEmail && existingUserByEmail.id !== user.id) {
      throw new Error('邮箱已存在');
    }

    this.users.set(user.id, user);
    return user;
  }

  async findById(id: string, tenantId: string): Promise<User | null> {
    const user = this.users.get(id);
    // 只返回未删除的用户
    return user && user.tenantId === tenantId && user.getStatus() !== 'DELETED' ? user : null;
  }

  async findByUsername(username: Username, tenantId: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.tenantId === tenantId && user.getUsername() === username.toString()) {
        return user;
      }
    }
    return null;
  }

  async findByUsernameString(username: string, tenantId: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.tenantId === tenantId && user.getUsername() === username) {
        return user;
      }
    }
    return null;
  }

  async findByEmail(email: Email, tenantId: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.tenantId === tenantId && user.getEmail() === email.toString()) {
        return user;
      }
    }
    return null;
  }

  async findByEmailString(email: string, tenantId: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.tenantId === tenantId && user.getEmail() === email) {
        return user;
      }
    }
    return null;
  }

  async findByPhone(phone: Phone, tenantId: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.tenantId === tenantId && user.getPhone() === phone.toString()) {
        return user;
      }
    }
    return null;
  }

  async findByPhoneString(phone: string, tenantId: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.tenantId === tenantId && user.getPhone() === phone) {
        return user;
      }
    }
    return null;
  }

  async findByIds(ids: string[], tenantId: string): Promise<User[]> {
    const users: User[] = [];
    for (const id of ids) {
      const user = this.users.get(id);
      if (user && user.tenantId === tenantId) {
        users.push(user);
      }
    }
    return users;
  }

  async findByOrganizationId(organizationId: string, tenantId: string): Promise<User[]> {
    const users: User[] = [];
    for (const user of this.users.values()) {
      if (user.tenantId === tenantId && user.organizationIds?.includes(organizationId)) {
        users.push(user);
      }
    }
    return users;
  }

  async findByRoleId(roleId: string, tenantId: string): Promise<User[]> {
    const users: User[] = [];
    for (const user of this.users.values()) {
      if (user.tenantId === tenantId && user.roleIds?.includes(roleId)) {
        users.push(user);
      }
    }
    return users;
  }

  async findByStatus(status: UserStatusValue, tenantId: string): Promise<User[]> {
    const users: User[] = [];
    for (const user of this.users.values()) {
      if (user.tenantId === tenantId && user.getStatus() === status.toString()) {
        users.push(user);
      }
    }
    return users;
  }

  async findByAdminUserId(adminUserId: string, tenantId: string): Promise<User[]> {
    const users: User[] = [];
    for (const user of this.users.values()) {
      if (user.tenantId === tenantId && user.adminUserId === adminUserId) {
        users.push(user);
      }
    }
    return users;
  }

  async findActive(tenantId: string): Promise<User[]> {
    const users: User[] = [];
    for (const user of this.users.values()) {
      if (user.tenantId === tenantId && user.getStatus() === UserStatus.ACTIVE) {
        users.push(user);
      }
    }
    return users;
  }

  async findPending(tenantId: string): Promise<User[]> {
    const users: User[] = [];
    for (const user of this.users.values()) {
      if (user.tenantId === tenantId && user.getStatus() === UserStatus.PENDING) {
        users.push(user);
      }
    }
    return users;
  }

  async findSuspended(tenantId: string): Promise<User[]> {
    const users: User[] = [];
    for (const user of this.users.values()) {
      if (user.tenantId === tenantId && user.getStatus() === UserStatus.SUSPENDED) {
        users.push(user);
      }
    }
    return users;
  }

  async findDeleted(tenantId: string): Promise<User[]> {
    const users: User[] = [];
    for (const user of this.users.values()) {
      if (user.tenantId === tenantId && user.getStatus() === UserStatus.DELETED) {
        users.push(user);
      }
    }
    return users;
  }

  async findAll(tenantId: string): Promise<User[]> {
    const users: User[] = [];
    for (const user of this.users.values()) {
      if (user.tenantId === tenantId && user.getStatus() !== UserStatus.DELETED) {
        users.push(user);
      }
    }
    return users;
  }

  async findAllWithDeleted(tenantId: string): Promise<User[]> {
    const users: User[] = [];
    for (const user of this.users.values()) {
      if (user.tenantId === tenantId) {
        users.push(user);
      }
    }
    return users;
  }

  async exists(id: string, tenantId: string): Promise<boolean> {
    const user = this.users.get(id);
    return user ? user.tenantId === tenantId : false;
  }

  async existsByUsername(username: Username, tenantId: string, excludeId?: string): Promise<boolean> {
    for (const user of this.users.values()) {
      if (user.tenantId === tenantId &&
        user.getUsername() === username.toString() &&
        user.id !== excludeId) {
        return true;
      }
    }
    return false;
  }

  async existsByUsernameString(username: string, tenantId: string, excludeId?: string): Promise<boolean> {
    for (const user of this.users.values()) {
      if (user.tenantId === tenantId &&
        user.getUsername() === username &&
        user.id !== excludeId) {
        return true;
      }
    }
    return false;
  }

  async existsByEmail(email: Email, tenantId: string, excludeId?: string): Promise<boolean> {
    for (const user of this.users.values()) {
      if (user.tenantId === tenantId &&
        user.getEmail() === email.toString() &&
        user.id !== excludeId) {
        return true;
      }
    }
    return false;
  }

  async existsByEmailString(email: string, tenantId: string, excludeId?: string): Promise<boolean> {
    for (const user of this.users.values()) {
      if (user.tenantId === tenantId &&
        user.getEmail() === email &&
        user.id !== excludeId) {
        return true;
      }
    }
    return false;
  }

  async existsByPhone(phone: Phone, tenantId: string, excludeId?: string): Promise<boolean> {
    for (const user of this.users.values()) {
      if (user.tenantId === tenantId &&
        user.getPhone() === phone.toString() &&
        user.id !== excludeId) {
        return true;
      }
    }
    return false;
  }

  async existsByPhoneString(phone: string, tenantId: string, excludeId?: string): Promise<boolean> {
    for (const user of this.users.values()) {
      if (user.tenantId === tenantId &&
        user.getPhone() === phone &&
        user.id !== excludeId) {
        return true;
      }
    }
    return false;
  }

  async count(tenantId: string): Promise<number> {
    let count = 0;
    for (const user of this.users.values()) {
      if (user.tenantId === tenantId && user.getStatus() !== UserStatus.DELETED) {
        count++;
      }
    }
    return count;
  }

  async countByStatus(status: UserStatusValue, tenantId: string): Promise<number> {
    let count = 0;
    for (const user of this.users.values()) {
      if (user.tenantId === tenantId && user.getStatus() === status.toString()) {
        count++;
      }
    }
    return count;
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const user = this.users.get(id);
    if (user && user.tenantId === tenantId) {
      user.markAsDeleted();
      this.users.set(id, user);
      return true;
    }
    return false;
  }

  async hardDelete(id: string, tenantId: string): Promise<boolean> {
    const user = this.users.get(id);
    if (user && user.tenantId === tenantId) {
      this.users.delete(id);
      return true;
    }
    return false;
  }

  async restore(id: string, tenantId: string): Promise<boolean> {
    const user = this.users.get(id);
    if (user && user.tenantId === tenantId) {
      user.restore();
      this.users.set(id, user);
      return true;
    }
    return false;
  }

  async updateStatus(id: string, status: UserStatusValue, tenantId: string): Promise<boolean> {
    const user = this.users.get(id);
    if (user && user.tenantId === tenantId) {
      user.status = status;
      this.users.set(id, user);
      return true;
    }
    return false;
  }

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
    let filteredUsers: User[] = [];

    // 过滤用户
    for (const user of this.users.values()) {
      if (user.tenantId !== tenantId || user.getStatus() === UserStatus.DELETED) {
        continue;
      }

      // 应用过滤器
      if (filters?.status && user.getStatus() !== filters.status.toString()) {
        continue;
      }
      if (filters?.organizationId && !user.organizationIds?.includes(filters.organizationId)) {
        continue;
      }
      if (filters?.roleId && !user.roleIds?.includes(filters.roleId)) {
        continue;
      }
      if (filters?.adminUserId && user.adminUserId !== filters.adminUserId) {
        continue;
      }
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        const matches = user.getUsername().toLowerCase().includes(search) ||
          user.getEmail().toLowerCase().includes(search) ||
          user.firstName.toLowerCase().includes(search) ||
          user.lastName.toLowerCase().includes(search);
        if (!matches) {
          continue;
        }
      }

      filteredUsers.push(user);
    }

    // 排序
    if (sort) {
      filteredUsers.sort((a, b) => {
        let aValue: any, bValue: any;

        switch (sort.field) {
          case 'username':
            aValue = a.getUsername();
            bValue = b.getUsername();
            break;
          case 'email':
            aValue = a.getEmail();
            bValue = b.getEmail();
            break;
          case 'firstName':
            aValue = a.firstName;
            bValue = b.firstName;
            break;
          case 'lastName':
            aValue = a.lastName;
            bValue = b.lastName;
            break;
          case 'status':
            aValue = a.getStatus();
            bValue = b.getStatus();
            break;
          case 'createdAt':
            aValue = a.createdAt;
            bValue = b.createdAt;
            break;
          case 'updatedAt':
            aValue = a.updatedAt;
            bValue = b.updatedAt;
            break;
          default:
            aValue = a.createdAt;
            bValue = b.createdAt;
        }

        if (sort.order === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    } else {
      // 默认按创建时间倒序
      filteredUsers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    const total = filteredUsers.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const users = filteredUsers.slice(startIndex, endIndex);
    const totalPages = Math.ceil(total / limit);

    return {
      users,
      total,
      page,
      limit,
      totalPages
    };
  }

  async findBySearch(search: string, tenantId: string, limit?: number): Promise<User[]> {
    const users: User[] = [];
    const searchLower = search.toLowerCase();

    for (const user of this.users.values()) {
      if (user.tenantId === tenantId && user.getStatus() !== UserStatus.DELETED) {
        const matches = user.getUsername().toLowerCase().includes(searchLower) ||
          user.getEmail().toLowerCase().includes(searchLower) ||
          user.firstName.toLowerCase().includes(searchLower) ||
          user.lastName.toLowerCase().includes(searchLower);

        if (matches) {
          users.push(user);
        }
      }
    }

    // 按创建时间倒序排序
    users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return limit ? users.slice(0, limit) : users;
  }

  async findRecent(tenantId: string, limit?: number): Promise<User[]> {
    const users: User[] = [];

    for (const user of this.users.values()) {
      if (user.tenantId === tenantId && user.getStatus() !== UserStatus.DELETED) {
        users.push(user);
      }
    }

    // 按创建时间倒序排序
    users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return limit ? users.slice(0, limit) : users;
  }

  async findByDateRange(startDate: Date, endDate: Date, tenantId: string): Promise<User[]> {
    const users: User[] = [];

    for (const user of this.users.values()) {
      if (user.tenantId === tenantId &&
        user.getStatus() !== UserStatus.DELETED &&
        user.createdAt >= startDate &&
        user.createdAt <= endDate) {
        users.push(user);
      }
    }

    // 按创建时间倒序排序
    users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return users;
  }

  async findLocked(tenantId: string): Promise<User[]> {
    const users: User[] = [];

    for (const user of this.users.values()) {
      if (user.tenantId === tenantId &&
        user.getStatus() !== UserStatus.DELETED &&
        user.lockedUntil &&
        user.lockedUntil > new Date()) {
        users.push(user);
      }
    }

    return users;
  }

  async findWithFailedLoginAttempts(threshold: number, tenantId: string): Promise<User[]> {
    const users: User[] = [];

    for (const user of this.users.values()) {
      if (user.tenantId === tenantId &&
        user.getStatus() !== UserStatus.DELETED &&
        user.loginAttempts >= threshold) {
        users.push(user);
      }
    }

    return users;
  }

  clear(): void {
    this.users.clear();
  }
} 
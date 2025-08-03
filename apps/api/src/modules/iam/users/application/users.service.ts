import { Injectable, NotFoundException, ConflictException, BadRequestException, Inject } from '@nestjs/common';
import { User } from '../domain/entities/user.entity';
import { UserStatusValue } from '../domain/value-objects/user-status.value-object';
import { Username } from '../domain/value-objects/username.value-object';
import { Email } from '../domain/value-objects/email.value-object';
import { Phone } from '../domain/value-objects/phone.value-object';
import { generateUuid } from '../../../../shared/domain/utils/uuid.util';
import { UserRepository } from '../domain/repositories/user.repository';

/**
 * @class UsersService
 * @description
 * 用户应用服务，负责协调领域对象完成业务用例。
 * 这是应用层的核心服务，连接表现层和领域层。
 */
@Injectable()
export class UsersService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository
  ) { }

  /**
   * @method createUser
   * @description 创建新用户
   */
  async createUser(
    username: string,
    email: string,
    firstName: string,
    lastName: string,
    tenantId: string,
    adminUserId: string,
    passwordHash: string,
    phone?: string,
    displayName?: string,
    avatar?: string,
    organizationIds?: string[],
    roleIds?: string[],
    preferences?: Record<string, any>
  ): Promise<User> {
    try {
      // 验证用户名是否已存在
      if (await this.userRepository.existsByUsernameString(username, tenantId)) {
        throw new ConflictException('用户名已存在');
      }

      // 验证邮箱是否已存在
      if (await this.userRepository.existsByEmailString(email, tenantId)) {
        throw new ConflictException('邮箱已存在');
      }

      // 验证手机号是否已存在（如果提供）
      if (phone && await this.userRepository.existsByPhoneString(phone, tenantId)) {
        throw new ConflictException('手机号已存在');
      }

      // 创建用户实体
      const user = new User(
        generateUuid(),
        username,
        email,
        firstName,
        lastName,
        tenantId,
        adminUserId,
        passwordHash,
        phone,
        displayName,
        avatar,
        organizationIds,
        roleIds,
        preferences
      );

      // 保存到仓储
      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('创建用户失败: ' + (error as Error).message);
    }
  }

  /**
   * @method getUserById
   * @description 根据ID获取用户
   */
  async getUserById(id: string, tenantId: string): Promise<User> {
    const user = await this.userRepository.findById(id, tenantId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  /**
   * @method getUserByUsername
   * @description 根据用户名获取用户
   */
  async getUserByUsername(username: string, tenantId: string): Promise<User> {
    const user = await this.userRepository.findByUsernameString(username, tenantId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  /**
   * @method getUserByEmail
   * @description 根据邮箱获取用户
   */
  async getUserByEmail(email: string, tenantId: string): Promise<User> {
    const user = await this.userRepository.findByEmailString(email, tenantId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  /**
   * @method getAllUsers
   * @description 获取所有用户
   */
  async getAllUsers(tenantId: string): Promise<User[]> {
    return await this.userRepository.findAll(tenantId);
  }

  /**
   * @method getActiveUsers
   * @description 获取所有激活状态的用户
   */
  async getActiveUsers(tenantId: string): Promise<User[]> {
    return await this.userRepository.findActive(tenantId);
  }

  /**
   * @method activateUser
   * @description 激活用户
   */
  async activateUser(id: string, tenantId: string): Promise<User> {
    const user = await this.getUserById(id, tenantId);
    user.activate();
    return await this.userRepository.save(user);
  }

  /**
   * @method suspendUser
   * @description 禁用用户
   */
  async suspendUser(id: string, tenantId: string): Promise<User> {
    const user = await this.getUserById(id, tenantId);
    user.suspend();
    return await this.userRepository.save(user);
  }

  /**
   * @method updateUserInfo
   * @description 更新用户信息
   */
  async updateUserInfo(
    id: string,
    tenantId: string,
    firstName: string,
    lastName: string,
    displayName?: string,
    avatar?: string
  ): Promise<User> {
    const user = await this.getUserById(id, tenantId);
    user.updateInfo(firstName, lastName, displayName, avatar);
    return await this.userRepository.save(user);
  }

  /**
   * @method updateUserContactInfo
   * @description 更新用户联系信息
   */
  async updateUserContactInfo(
    id: string,
    tenantId: string,
    email: string,
    phone?: string
  ): Promise<User> {
    const user = await this.getUserById(id, tenantId);

    // 验证邮箱唯一性（排除当前用户）
    if (await this.userRepository.existsByEmailString(email, tenantId, id)) {
      throw new ConflictException('邮箱已存在');
    }

    // 验证手机号唯一性（如果提供且排除当前用户）
    if (phone && await this.userRepository.existsByPhoneString(phone, tenantId, id)) {
      throw new ConflictException('手机号已存在');
    }

    user.updateContactInfo(email, phone);
    return await this.userRepository.save(user);
  }

  /**
   * @method updateUserPassword
   * @description 更新用户密码
   */
  async updateUserPassword(id: string, tenantId: string, passwordHash: string): Promise<User> {
    const user = await this.getUserById(id, tenantId);
    user.updatePassword(passwordHash);
    return await this.userRepository.save(user);
  }

  /**
   * @method deleteUser
   * @description 删除用户（软删除）
   */
  async deleteUser(id: string, tenantId: string): Promise<boolean> {
    const user = await this.getUserById(id, tenantId);
    user.markAsDeleted();
    await this.userRepository.save(user);
    return true;
  }

  /**
   * @method restoreUser
   * @description 恢复已删除的用户
   */
  async restoreUser(id: string, tenantId: string): Promise<User> {
    const user = await this.userRepository.findById(id, tenantId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    user.restore();
    return await this.userRepository.save(user);
  }

  /**
   * @method assignUserToOrganization
   * @description 将用户分配到组织
   */
  async assignUserToOrganization(id: string, tenantId: string, organizationId: string): Promise<User> {
    const user = await this.getUserById(id, tenantId);
    user.assignToOrganization(organizationId);
    return await this.userRepository.save(user);
  }

  /**
   * @method removeUserFromOrganization
   * @description 从组织移除用户
   */
  async removeUserFromOrganization(id: string, tenantId: string, organizationId?: string): Promise<User> {
    const user = await this.getUserById(id, tenantId);
    user.removeFromOrganization(organizationId);
    return await this.userRepository.save(user);
  }

  /**
   * @method assignRoleToUser
   * @description 为用户分配角色
   */
  async assignRoleToUser(id: string, tenantId: string, roleId: string): Promise<User> {
    const user = await this.getUserById(id, tenantId);
    user.assignRole(roleId);
    return await this.userRepository.save(user);
  }

  /**
   * @method removeRoleFromUser
   * @description 移除用户角色
   */
  async removeRoleFromUser(id: string, tenantId: string, roleId?: string): Promise<User> {
    const user = await this.getUserById(id, tenantId);
    user.removeRole(roleId);
    return await this.userRepository.save(user);
  }

  /**
   * @method getUserStats
   * @description 获取用户统计信息
   */
  async getUserStats(tenantId: string) {
    const [totalCount, activeCount, pendingCount, suspendedCount, deletedCount] = await Promise.all([
      this.userRepository.count(tenantId),
      this.userRepository.countByStatus(UserStatusValue.active(), tenantId),
      this.userRepository.countByStatus(UserStatusValue.pending(), tenantId),
      this.userRepository.countByStatus(UserStatusValue.suspended(), tenantId),
      this.userRepository.countByStatus(UserStatusValue.deleted(), tenantId),
    ]);

    return {
      total: totalCount,
      active: activeCount,
      pending: pendingCount,
      suspended: suspendedCount,
      deleted: deletedCount
    };
  }

  /**
   * @method searchUsers
   * @description 搜索用户
   */
  async searchUsers(
    searchTerm: string,
    tenantId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ users: User[]; total: number; page: number; limit: number; totalPages: number }> {
    return await this.userRepository.findWithPagination(
      page,
      limit,
      tenantId,
      { search: searchTerm }
    );
  }

  /**
   * @method getUsersWithPagination
   * @description 分页获取用户列表
   */
  async getUsersWithPagination(
    tenantId: string,
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: UserStatusValue;
      organizationId?: string;
      roleId?: string;
      search?: string;
    },
    sort?: {
      field: 'username' | 'email' | 'firstName' | 'lastName' | 'status' | 'createdAt' | 'updatedAt';
      order: 'asc' | 'desc';
    }
  ): Promise<{ users: User[]; total: number; page: number; limit: number; totalPages: number }> {
    return await this.userRepository.findWithPagination(
      page,
      limit,
      tenantId,
      filters,
      sort
    );
  }
} 
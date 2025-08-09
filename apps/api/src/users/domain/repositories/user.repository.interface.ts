import { User } from '../entities/user.entity';
import { UserId } from '../value-objects/user-id.vo';
import { Email } from '../value-objects/email.vo';
import { UserName } from '../value-objects/username.vo';

/**
 * @interface UserRepository
 * @description
 * 用户仓储接口，定义用户持久化的抽象接口。
 * 
 * 主要职责：
 * 1. 提供用户数据的持久化抽象
 * 2. 定义用户查询和操作的方法
 * 3. 支持多租户数据隔离
 * 4. 提供事务支持
 * 
 * 实现原则：
 * 1. 依赖倒置：领域层不依赖基础设施层
 * 2. 接口隔离：只暴露必要的仓储方法
 * 3. 单一职责：专注于用户数据的持久化
 */
export interface UserRepository {
  /**
   * @method save
   * @description 保存用户（创建或更新）
   * @param {User} user - 用户聚合根
   * @returns {Promise<User>} 保存后的用户
   */
  save(user: User): Promise<User>;

  /**
   * @method findById
   * @description 根据ID查找用户
   * @param {UserId} id - 用户ID
   * @param {string} tenantId - 租户ID
   * @returns {Promise<User | null>} 找到的用户或null
   */
  findById(id: UserId, tenantId: string): Promise<User | null>;

  /**
   * @method findByEmail
   * @description 根据邮箱查找用户
   * @param {Email} email - 用户邮箱
   * @param {string} tenantId - 租户ID
   * @returns {Promise<User | null>} 找到的用户或null
   */
  findByEmail(email: Email, tenantId: string): Promise<User | null>;

  /**
   * @method findByUsername
   * @description 根据用户名查找用户
   * @param {UserName} username - 用户名
   * @param {string} tenantId - 租户ID
   * @returns {Promise<User | null>} 找到的用户或null
   */
  findByUsername(username: UserName, tenantId: string): Promise<User | null>;

  /**
   * @method findByEmailOrUsername
   * @description 根据邮箱或用户名查找用户（用于登录）
   * @param {string} identifier - 邮箱或用户名
   * @param {string} tenantId - 租户ID
   * @returns {Promise<User | null>} 找到的用户或null
   */
  findByEmailOrUsername(identifier: string, tenantId: string): Promise<User | null>;

  /**
   * @method exists
   * @description 检查用户是否存在
   * @param {UserId} id - 用户ID
   * @param {string} tenantId - 租户ID
   * @returns {Promise<boolean>} 用户是否存在
   */
  exists(id: UserId, tenantId: string): Promise<boolean>;

  /**
   * @method existsByEmail
   * @description 检查邮箱是否已被使用
   * @param {Email} email - 邮箱
   * @param {string} tenantId - 租户ID
   * @param {UserId} [excludeId] - 排除的用户ID（用于更新时检查）
   * @returns {Promise<boolean>} 邮箱是否已被使用
   */
  existsByEmail(email: Email, tenantId: string, excludeId?: UserId): Promise<boolean>;

  /**
   * @method existsByUsername
   * @description 检查用户名是否已被使用
   * @param {UserName} username - 用户名
   * @param {string} tenantId - 租户ID
   * @param {UserId} [excludeId] - 排除的用户ID（用于更新时检查）
   * @returns {Promise<boolean>} 用户名是否已被使用
   */
  existsByUsername(username: UserName, tenantId: string, excludeId?: UserId): Promise<boolean>;

  /**
   * @method delete
   * @description 删除用户（软删除）
   * @param {UserId} id - 用户ID
   * @param {string} tenantId - 租户ID
   * @returns {Promise<void>}
   */
  delete(id: UserId, tenantId: string): Promise<void>;

  /**
   * @method findActiveUsers
   * @description 查找活跃用户列表
   * @param {string} tenantId - 租户ID
   * @param {FindUsersOptions} options - 查询选项
   * @returns {Promise<User[]>} 用户列表
   */
  findActiveUsers(tenantId: string, options?: FindUsersOptions): Promise<User[]>;

  /**
   * @method findUsersByStatus
   * @description 根据状态查找用户
   * @param {string} status - 用户状态
   * @param {string} tenantId - 租户ID
   * @param {FindUsersOptions} options - 查询选项
   * @returns {Promise<User[]>} 用户列表
   */
  findUsersByStatus(status: string, tenantId: string, options?: FindUsersOptions): Promise<User[]>;

  /**
   * @method count
   * @description 统计用户数量
   * @param {string} tenantId - 租户ID
   * @param {CountUsersOptions} options - 统计选项
   * @returns {Promise<number>} 用户数量
   */
  count(tenantId: string, options?: CountUsersOptions): Promise<number>;

  /**
   * @method findUsersForTenant
   * @description 查找租户下的所有用户
   * @param {string} tenantId - 租户ID
   * @param {FindUsersOptions} options - 查询选项
   * @returns {Promise<User[]>} 用户列表
   */
  findUsersForTenant(tenantId: string, options?: FindUsersOptions): Promise<User[]>;
}

/**
 * @interface FindUsersOptions
 * @description 查找用户的选项
 */
export interface FindUsersOptions {
  /**
   * @property {number} limit - 限制返回数量
   */
  limit?: number;

  /**
   * @property {number} offset - 偏移量（用于分页）
   */
  offset?: number;

  /**
   * @property {string} sortBy - 排序字段
   */
  sortBy?: 'createdAt' | 'updatedAt' | 'username' | 'email';

  /**
   * @property {'asc' | 'desc'} sortOrder - 排序方向
   */
  sortOrder?: 'asc' | 'desc';

  /**
   * @property {string} search - 搜索关键词（用户名或邮箱）
   */
  search?: string;

  /**
   * @property {boolean} includeDeleted - 是否包含已删除用户
   */
  includeDeleted?: boolean;
}

/**
 * @interface CountUsersOptions
 * @description 统计用户的选项
 */
export interface CountUsersOptions {
  /**
   * @property {string} status - 用户状态过滤
   */
  status?: string;

  /**
   * @property {boolean} includeDeleted - 是否包含已删除用户
   */
  includeDeleted?: boolean;

  /**
   * @property {string} search - 搜索关键词
   */
  search?: string;
}

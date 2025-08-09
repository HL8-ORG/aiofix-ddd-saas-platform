import { LoginAttempt, LoginAttemptStatus, LoginAttemptType } from '../entities/login-attempt.entity';
import { UserId } from '../../../users/domain/value-objects/user-id.vo';

/**
 * @interface FindLoginAttemptsOptions
 * @description 查找登录尝试的选项
 */
export interface FindLoginAttemptsOptions {
  status?: LoginAttemptStatus;
  type?: LoginAttemptType;
  userId?: string;
  tenantId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  limit?: number;
  offset?: number;
  orderBy?: 'createdAt' | 'status' | 'type';
  orderDirection?: 'ASC' | 'DESC';
}

/**
 * @interface CountLoginAttemptsOptions
 * @description 统计登录尝试的选项
 */
export interface CountLoginAttemptsOptions {
  status?: LoginAttemptStatus;
  type?: LoginAttemptType;
  userId?: string;
  tenantId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}

/**
 * @interface LoginAttemptRepository
 * @description 登录尝试仓储接口
 */
export interface LoginAttemptRepository {
  /**
   * @method save
   * @description 保存登录尝试记录
   * @param {LoginAttempt} loginAttempt - 登录尝试记录
   * @returns {Promise<LoginAttempt>} 保存后的记录
   */
  save(loginAttempt: LoginAttempt): Promise<LoginAttempt>;

  /**
   * @method findById
   * @description 根据ID查找登录尝试记录
   * @param {string} id - 记录ID
   * @returns {Promise<LoginAttempt | null>} 登录尝试记录或null
   */
  findById(id: string): Promise<LoginAttempt | null>;

  /**
   * @method findByUserId
   * @description 根据用户ID查找登录尝试记录
   * @param {UserId} userId - 用户ID
   * @param {string} tenantId - 租户ID
   * @param {FindLoginAttemptsOptions} options - 查找选项
   * @returns {Promise<LoginAttempt[]>} 登录尝试记录列表
   */
  findByUserId(userId: UserId, tenantId: string, options?: FindLoginAttemptsOptions): Promise<LoginAttempt[]>;

  /**
   * @method findByEmail
   * @description 根据邮箱查找登录尝试记录
   * @param {string} email - 邮箱
   * @param {string} tenantId - 租户ID
   * @param {FindLoginAttemptsOptions} options - 查找选项
   * @returns {Promise<LoginAttempt[]>} 登录尝试记录列表
   */
  findByEmail(email: string, tenantId: string, options?: FindLoginAttemptsOptions): Promise<LoginAttempt[]>;

  /**
   * @method findByIpAddress
   * @description 根据IP地址查找登录尝试记录
   * @param {string} ipAddress - IP地址
   * @param {string} tenantId - 租户ID
   * @param {FindLoginAttemptsOptions} options - 查找选项
   * @returns {Promise<LoginAttempt[]>} 登录尝试记录列表
   */
  findByIpAddress(ipAddress: string, tenantId: string, options?: FindLoginAttemptsOptions): Promise<LoginAttempt[]>;

  /**
   * @method findFailedAttempts
   * @description 查找失败的登录尝试记录
   * @param {string} tenantId - 租户ID
   * @param {FindLoginAttemptsOptions} options - 查找选项
   * @returns {Promise<LoginAttempt[]>} 失败的登录尝试记录列表
   */
  findFailedAttempts(tenantId: string, options?: FindLoginAttemptsOptions): Promise<LoginAttempt[]>;

  /**
   * @method findSuccessfulAttempts
   * @description 查找成功的登录尝试记录
   * @param {string} tenantId - 租户ID
   * @param {FindLoginAttemptsOptions} options - 查找选项
   * @returns {Promise<LoginAttempt[]>} 成功的登录尝试记录列表
   */
  findSuccessfulAttempts(tenantId: string, options?: FindLoginAttemptsOptions): Promise<LoginAttempt[]>;

  /**
   * @method findBlockedAttempts
   * @description 查找被阻止的登录尝试记录
   * @param {string} tenantId - 租户ID
   * @param {FindLoginAttemptsOptions} options - 查找选项
   * @returns {Promise<LoginAttempt[]>} 被阻止的登录尝试记录列表
   */
  findBlockedAttempts(tenantId: string, options?: FindLoginAttemptsOptions): Promise<LoginAttempt[]>;

  /**
   * @method countByUserId
   * @description 统计用户的登录尝试次数
   * @param {UserId} userId - 用户ID
   * @param {string} tenantId - 租户ID
   * @param {CountLoginAttemptsOptions} options - 统计选项
   * @returns {Promise<number>} 登录尝试次数
   */
  countByUserId(userId: UserId, tenantId: string, options?: CountLoginAttemptsOptions): Promise<number>;

  /**
   * @method countByEmail
   * @description 统计邮箱的登录尝试次数
   * @param {string} email - 邮箱
   * @param {string} tenantId - 租户ID
   * @param {CountLoginAttemptsOptions} options - 统计选项
   * @returns {Promise<number>} 登录尝试次数
   */
  countByEmail(email: string, tenantId: string, options?: CountLoginAttemptsOptions): Promise<number>;

  /**
   * @method countByIpAddress
   * @description 统计IP地址的登录尝试次数
   * @param {string} ipAddress - IP地址
   * @param {string} tenantId - 租户ID
   * @param {CountLoginAttemptsOptions} options - 统计选项
   * @returns {Promise<number>} 登录尝试次数
   */
  countByIpAddress(ipAddress: string, tenantId: string, options?: CountLoginAttemptsOptions): Promise<number>;

  /**
   * @method countFailedAttempts
   * @description 统计失败的登录尝试次数
   * @param {string} tenantId - 租户ID
   * @param {CountLoginAttemptsOptions} options - 统计选项
   * @returns {Promise<number>} 失败的登录尝试次数
   */
  countFailedAttempts(tenantId: string, options?: CountLoginAttemptsOptions): Promise<number>;

  /**
   * @method countFailedAttemptsByEmail
   * @description 统计邮箱的失败登录尝试次数
   * @param {string} email - 邮箱
   * @param {string} tenantId - 租户ID
   * @param {CountLoginAttemptsOptions} options - 统计选项
   * @returns {Promise<number>} 失败的登录尝试次数
   */
  countFailedAttemptsByEmail(email: string, tenantId: string, options?: CountLoginAttemptsOptions): Promise<number>;

  /**
   * @method countFailedAttemptsByIpAddress
   * @description 统计IP地址的失败登录尝试次数
   * @param {string} ipAddress - IP地址
   * @param {string} tenantId - 租户ID
   * @param {CountLoginAttemptsOptions} options - 统计选项
   * @returns {Promise<number>} 失败的登录尝试次数
   */
  countFailedAttemptsByIpAddress(ipAddress: string, tenantId: string, options?: CountLoginAttemptsOptions): Promise<number>;

  /**
   * @method delete
   * @description 删除登录尝试记录
   * @param {string} id - 记录ID
   * @returns {Promise<void>}
   */
  delete(id: string): Promise<void>;

  /**
   * @method deleteByUserId
   * @description 删除用户的所有登录尝试记录
   * @param {UserId} userId - 用户ID
   * @param {string} tenantId - 租户ID
   * @returns {Promise<void>}
   */
  deleteByUserId(userId: UserId, tenantId: string): Promise<void>;

  /**
   * @method deleteByEmail
   * @description 删除邮箱的所有登录尝试记录
   * @param {string} email - 邮箱
   * @param {string} tenantId - 租户ID
   * @returns {Promise<void>}
   */
  deleteByEmail(email: string, tenantId: string): Promise<void>;

  /**
   * @method deleteOldAttempts
   * @description 删除旧的登录尝试记录
   * @param {string} tenantId - 租户ID
   * @param {Date} beforeDate - 删除此日期之前的记录
   * @returns {Promise<number>} 删除的记录数量
   */
  deleteOldAttempts(tenantId: string, beforeDate: Date): Promise<number>;

  /**
   * @method exists
   * @description 检查登录尝试记录是否存在
   * @param {string} id - 记录ID
   * @returns {Promise<boolean>} 如果存在返回true，否则返回false
   */
  exists(id: string): Promise<boolean>;

  /**
   * @method getRecentFailedAttempts
   * @description 获取最近的失败登录尝试记录
   * @param {string} email - 邮箱
   * @param {string} tenantId - 租户ID
   * @param {number} minutes - 时间范围（分钟）
   * @returns {Promise<LoginAttempt[]>} 最近的失败登录尝试记录列表
   */
  getRecentFailedAttempts(email: string, tenantId: string, minutes: number): Promise<LoginAttempt[]>;

  /**
   * @method getRecentFailedAttemptsByIp
   * @description 根据IP地址获取最近的失败登录尝试记录
   * @param {string} ipAddress - IP地址
   * @param {string} tenantId - 租户ID
   * @param {number} minutes - 时间范围（分钟）
   * @returns {Promise<LoginAttempt[]>} 最近的失败登录尝试记录列表
   */
  getRecentFailedAttemptsByIp(ipAddress: string, tenantId: string, minutes: number): Promise<LoginAttempt[]>;
}

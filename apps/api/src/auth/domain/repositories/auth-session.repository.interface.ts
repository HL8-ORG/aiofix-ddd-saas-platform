import { AuthSession, SessionStatus } from '../entities/auth-session.entity';
import { SessionId } from '../value-objects/session-id.vo';
import { UserId } from '../../../users/domain/value-objects/user-id.vo';

/**
 * @interface FindSessionsOptions
 * @description 查找会话的选项
 */
export interface FindSessionsOptions {
  status?: SessionStatus;
  userId?: string;
  tenantId?: string;
  deviceType?: string;
  ipAddress?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  lastActivityAfter?: Date;
  lastActivityBefore?: Date;
  limit?: number;
  offset?: number;
  orderBy?: 'createdAt' | 'lastActivityAt' | 'expiresAt';
  orderDirection?: 'ASC' | 'DESC';
}

/**
 * @interface CountSessionsOptions
 * @description 统计会话的选项
 */
export interface CountSessionsOptions {
  status?: SessionStatus;
  userId?: string;
  tenantId?: string;
  deviceType?: string;
  ipAddress?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  lastActivityAfter?: Date;
  lastActivityBefore?: Date;
}

/**
 * @interface AuthSessionRepository
 * @description 认证会话仓储接口
 */
export interface AuthSessionRepository {
  /**
   * @method save
   * @description 保存会话
   * @param {AuthSession} session - 会话对象
   * @returns {Promise<AuthSession>} 保存后的会话
   */
  save(session: AuthSession): Promise<AuthSession>;

  /**
   * @method findById
   * @description 根据ID查找会话
   * @param {SessionId} sessionId - 会话ID
   * @returns {Promise<AuthSession | null>} 会话对象或null
   */
  findById(sessionId: SessionId): Promise<AuthSession | null>;

  /**
   * @method findByUserId
   * @description 根据用户ID查找会话
   * @param {UserId} userId - 用户ID
   * @param {string} tenantId - 租户ID
   * @param {FindSessionsOptions} options - 查找选项
   * @returns {Promise<AuthSession[]>} 会话列表
   */
  findByUserId(userId: UserId, tenantId: string, options?: FindSessionsOptions): Promise<AuthSession[]>;

  /**
   * @method findByTenantId
   * @description 根据租户ID查找会话
   * @param {string} tenantId - 租户ID
   * @param {FindSessionsOptions} options - 查找选项
   * @returns {Promise<AuthSession[]>} 会话列表
   */
  findByTenantId(tenantId: string, options?: FindSessionsOptions): Promise<AuthSession[]>;

  /**
   * @method findActiveSessions
   * @description 查找活跃会话
   * @param {string} tenantId - 租户ID
   * @param {FindSessionsOptions} options - 查找选项
   * @returns {Promise<AuthSession[]>} 活跃会话列表
   */
  findActiveSessions(tenantId: string, options?: FindSessionsOptions): Promise<AuthSession[]>;

  /**
   * @method findExpiredSessions
   * @description 查找过期会话
   * @param {string} tenantId - 租户ID
   * @param {FindSessionsOptions} options - 查找选项
   * @returns {Promise<AuthSession[]>} 过期会话列表
   */
  findExpiredSessions(tenantId: string, options?: FindSessionsOptions): Promise<AuthSession[]>;

  /**
   * @method findRevokedSessions
   * @description 查找被撤销的会话
   * @param {string} tenantId - 租户ID
   * @param {FindSessionsOptions} options - 查找选项
   * @returns {Promise<AuthSession[]>} 被撤销的会话列表
   */
  findRevokedSessions(tenantId: string, options?: FindSessionsOptions): Promise<AuthSession[]>;

  /**
   * @method findByDeviceInfo
   * @description 根据设备信息查找会话
   * @param {string} tenantId - 租户ID
   * @param {string} userAgent - 用户代理
   * @param {string} ipAddress - IP地址
   * @param {FindSessionsOptions} options - 查找选项
   * @returns {Promise<AuthSession[]>} 会话列表
   */
  findByDeviceInfo(tenantId: string, userAgent: string, ipAddress: string, options?: FindSessionsOptions): Promise<AuthSession[]>;

  /**
   * @method countByUserId
   * @description 统计用户的会话数量
   * @param {UserId} userId - 用户ID
   * @param {string} tenantId - 租户ID
   * @param {CountSessionsOptions} options - 统计选项
   * @returns {Promise<number>} 会话数量
   */
  countByUserId(userId: UserId, tenantId: string, options?: CountSessionsOptions): Promise<number>;

  /**
   * @method countByTenantId
   * @description 统计租户的会话数量
   * @param {string} tenantId - 租户ID
   * @param {CountSessionsOptions} options - 统计选项
   * @returns {Promise<number>} 会话数量
   */
  countByTenantId(tenantId: string, options?: CountSessionsOptions): Promise<number>;

  /**
   * @method countActiveSessions
   * @description 统计活跃会话数量
   * @param {string} tenantId - 租户ID
   * @param {CountSessionsOptions} options - 统计选项
   * @returns {Promise<number>} 活跃会话数量
   */
  countActiveSessions(tenantId: string, options?: CountSessionsOptions): Promise<number>;

  /**
   * @method delete
   * @description 删除会话
   * @param {SessionId} sessionId - 会话ID
   * @returns {Promise<void>}
   */
  delete(sessionId: SessionId): Promise<void>;

  /**
   * @method deleteByUserId
   * @description 删除用户的所有会话
   * @param {UserId} userId - 用户ID
   * @param {string} tenantId - 租户ID
   * @returns {Promise<void>}
   */
  deleteByUserId(userId: UserId, tenantId: string): Promise<void>;

  /**
   * @method deleteExpiredSessions
   * @description 删除过期会话
   * @param {string} tenantId - 租户ID
   * @returns {Promise<number>} 删除的会话数量
   */
  deleteExpiredSessions(tenantId: string): Promise<number>;

  /**
   * @method revokeAllUserSessions
   * @description 撤销用户的所有会话
   * @param {UserId} userId - 用户ID
   * @param {string} tenantId - 租户ID
   * @returns {Promise<number>} 撤销的会话数量
   */
  revokeAllUserSessions(userId: UserId, tenantId: string): Promise<number>;

  /**
   * @method exists
   * @description 检查会话是否存在
   * @param {SessionId} sessionId - 会话ID
   * @returns {Promise<boolean>} 如果存在返回true，否则返回false
   */
  exists(sessionId: SessionId): Promise<boolean>;

  /**
   * @method existsActiveSession
   * @description 检查用户是否有活跃会话
   * @param {UserId} userId - 用户ID
   * @param {string} tenantId - 租户ID
   * @returns {Promise<boolean>} 如果有活跃会话返回true，否则返回false
   */
  existsActiveSession(userId: UserId, tenantId: string): Promise<boolean>;
}

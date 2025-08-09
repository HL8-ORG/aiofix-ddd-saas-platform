/**
 * @file session.repository.interface.ts
 * @description 会话仓储接口
 * 
 * 该接口定义了会话数据访问的抽象层，包括：
 * 1. 基本的CRUD操作
 * 2. 会话状态管理
 * 3. 会话查询和统计
 * 4. 会话清理
 */
import { Session } from '../entities/session.entity'
import { SessionId } from '../value-objects/session-id.vo'
import { UserId } from '../value-objects/user-id.vo'
import { TenantId } from '../value-objects/tenant-id.vo'

export interface SessionRepository {
  /**
   * 根据ID查找会话
   * @param sessionId 会话ID
   * @param tenantId 租户ID
   * @returns 会话实体或null
   */
  findById(sessionId: SessionId, tenantId: TenantId): Promise<Session | null>

  /**
   * 根据用户ID查找会话
   * @param userId 用户ID
   * @param tenantId 租户ID
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 会话列表
   */
  findByUserId(userId: UserId, tenantId: TenantId, limit?: number, offset?: number): Promise<Session[]>

  /**
   * 根据用户ID查找活跃会话
   * @param userId 用户ID
   * @param tenantId 租户ID
   * @returns 活跃会话列表
   */
  findActiveByUserId(userId: UserId, tenantId: TenantId): Promise<Session[]>

  /**
   * 保存会话
   * @param session 会话实体
   * @returns 保存后的会话实体
   */
  save(session: Session): Promise<Session>

  /**
   * 删除会话
   * @param sessionId 会话ID
   * @param tenantId 租户ID
   * @returns 是否删除成功
   */
  delete(sessionId: SessionId, tenantId: TenantId): Promise<boolean>

  /**
   * 删除用户的所有会话
   * @param userId 用户ID
   * @param tenantId 租户ID
   * @returns 删除的会话数量
   */
  deleteByUserId(userId: UserId, tenantId: TenantId): Promise<number>

  /**
   * 删除过期会话
   * @param tenantId 租户ID
   * @returns 删除的会话数量
   */
  deleteExpired(tenantId: TenantId): Promise<number>

  /**
   * 统计用户会话数量
   * @param userId 用户ID
   * @param tenantId 租户ID
   * @returns 会话数量
   */
  countByUserId(userId: UserId, tenantId: TenantId): Promise<number>

  /**
   * 统计活跃会话数量
   * @param userId 用户ID
   * @param tenantId 租户ID
   * @returns 活跃会话数量
   */
  countActiveByUserId(userId: UserId, tenantId: TenantId): Promise<number>

  /**
   * 统计租户会话数量
   * @param tenantId 租户ID
   * @returns 会话数量
   */
  countByTenant(tenantId: TenantId): Promise<number>

  /**
   * 更新会话最后活动时间
   * @param sessionId 会话ID
   * @param tenantId 租户ID
   * @returns 是否更新成功
   */
  updateLastActivity(sessionId: SessionId, tenantId: TenantId): Promise<boolean>

  /**
   * 检查会话是否存在
   * @param sessionId 会话ID
   * @param tenantId 租户ID
   * @returns 是否存在
   */
  exists(sessionId: SessionId, tenantId: TenantId): Promise<boolean>
}

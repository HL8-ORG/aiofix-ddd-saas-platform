/**
 * @file user.repository.interface.ts
 * @description 用户仓储接口
 * 
 * 该接口定义了用户数据访问的抽象层，包括：
 * 1. 基本的CRUD操作
 * 2. 按条件查询用户
 * 3. 用户状态管理
 * 4. 用户统计信息
 */
import { User } from '../entities/user.entity'
import { UserId } from '../value-objects/user-id.vo'
import { Email } from '../value-objects/email.vo'
import { UserName } from '../value-objects/username.vo'
import { TenantId } from '../value-objects/tenant-id.vo'

export interface UserRepository {
  /**
   * 根据ID查找用户
   * @param userId 用户ID
   * @param tenantId 租户ID
   * @returns 用户实体或null
   */
  findById(userId: UserId, tenantId: TenantId): Promise<User | null>

  /**
   * 根据邮箱查找用户
   * @param email 邮箱地址
   * @param tenantId 租户ID
   * @returns 用户实体或null
   */
  findByEmail(email: Email, tenantId: TenantId): Promise<User | null>

  /**
   * 根据用户名查找用户
   * @param username 用户名
   * @param tenantId 租户ID
   * @returns 用户实体或null
   */
  findByUsername(username: UserName, tenantId: TenantId): Promise<User | null>

  /**
   * 检查邮箱是否存在
   * @param email 邮箱地址
   * @param tenantId 租户ID
   * @returns 是否存在
   */
  existsByEmail(email: Email, tenantId: TenantId): Promise<boolean>

  /**
   * 检查用户名是否存在
   * @param username 用户名
   * @param tenantId 租户ID
   * @returns 是否存在
   */
  existsByUsername(username: UserName, tenantId: TenantId): Promise<boolean>

  /**
   * 保存用户
   * @param user 用户实体
   * @returns 保存后的用户实体
   */
  save(user: User): Promise<User>

  /**
   * 删除用户
   * @param userId 用户ID
   * @param tenantId 租户ID
   * @returns 是否删除成功
   */
  delete(userId: UserId, tenantId: TenantId): Promise<boolean>

  /**
   * 根据租户ID查找所有用户
   * @param tenantId 租户ID
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 用户列表
   */
  findByTenant(tenantId: TenantId, limit?: number, offset?: number): Promise<User[]>

  /**
   * 根据状态查找用户
   * @param status 用户状态
   * @param tenantId 租户ID
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 用户列表
   */
  findByStatus(status: string, tenantId: TenantId, limit?: number, offset?: number): Promise<User[]>

  /**
   * 统计租户用户数量
   * @param tenantId 租户ID
   * @returns 用户数量
   */
  countByTenant(tenantId: TenantId): Promise<number>

  /**
   * 根据状态统计用户数量
   * @param status 用户状态
   * @param tenantId 租户ID
   * @returns 用户数量
   */
  countByStatus(status: string, tenantId: TenantId): Promise<number>
}

/**
 * @interface IUserManagementService
 * @description
 * 用户管理服务接口，定义用户管理相关的业务操作契约。
 * 该接口采用依赖倒置原则，确保应用层不依赖具体实现。
 *
 * 主要原理与机制：
 * 1. 依赖倒置：应用层依赖抽象而非具体实现
 * 2. 接口隔离：只暴露必要的业务方法
 * 3. 单一职责：专注于用户管理业务逻辑
 * 4. 多租户支持：所有操作都基于租户隔离
 * 5. 安全控制：集成权限验证和安全策略
 * 6. 审计支持：支持操作审计和日志记录
 */
import { UpdateUserProfileCommand, type UpdateUserProfileResult } from '../../commands/update-user-profile.command'
import { ChangeUserPasswordCommand, type ChangeUserPasswordResult } from '../../commands/change-user-password.command'
import { ActivateUserCommand, type ActivateUserResult } from '../../commands/activate-user.command'
import { GetUserByEmailQuery, type GetUserByEmailResult } from '../../queries/get-user-by-email.query'

export interface IUserManagementService {
  /**
   * @method updateUserProfile
   * @description 更新用户资料
   * @param {UpdateUserProfileCommand} command - 更新用户资料命令
   * @returns {Promise<UpdateUserProfileResult>} 更新结果
   */
  updateUserProfile(command: UpdateUserProfileCommand): Promise<UpdateUserProfileResult>

  /**
   * @method changeUserPassword
   * @description 修改用户密码
   * @param {ChangeUserPasswordCommand} command - 修改用户密码命令
   * @returns {Promise<ChangeUserPasswordResult>} 修改结果
   */
  changeUserPassword(command: ChangeUserPasswordCommand): Promise<ChangeUserPasswordResult>

  /**
   * @method activateUser
   * @description 激活用户
   * @param {ActivateUserCommand} command - 激活用户命令
   * @returns {Promise<ActivateUserResult>} 激活结果
   */
  activateUser(command: ActivateUserCommand): Promise<ActivateUserResult>

  /**
   * @method deactivateUser
   * @description 停用用户
   * @param {string} userId - 用户ID
   * @param {string} tenantId - 租户ID
   * @param {string} deactivatedBy - 停用者ID
   * @param {string} reason - 停用原因
   * @returns {Promise<any>} 停用结果
   */
  deactivateUser(userId: string, tenantId: string, deactivatedBy: string, reason?: string): Promise<any>

  /**
   * @method lockUser
   * @description 锁定用户
   * @param {string} userId - 用户ID
   * @param {string} tenantId - 租户ID
   * @param {string} lockedBy - 锁定者ID
   * @param {string} reason - 锁定原因
   * @param {Date} lockedUntil - 锁定截止时间
   * @returns {Promise<any>} 锁定结果
   */
  lockUser(userId: string, tenantId: string, lockedBy: string, reason?: string, lockedUntil?: Date): Promise<any>

  /**
   * @method unlockUser
   * @description 解锁用户
   * @param {string} userId - 用户ID
   * @param {string} tenantId - 租户ID
   * @param {string} unlockedBy - 解锁者ID
   * @returns {Promise<any>} 解锁结果
   */
  unlockUser(userId: string, tenantId: string, unlockedBy: string): Promise<any>

  /**
   * @method deleteUser
   * @description 删除用户（软删除）
   * @param {string} userId - 用户ID
   * @param {string} tenantId - 租户ID
   * @param {string} deletedBy - 删除者ID
   * @param {string} reason - 删除原因
   * @returns {Promise<any>} 删除结果
   */
  deleteUser(userId: string, tenantId: string, deletedBy: string, reason?: string): Promise<any>

  /**
   * @method restoreUser
   * @description 恢复用户
   * @param {string} userId - 用户ID
   * @param {string} tenantId - 租户ID
   * @param {string} restoredBy - 恢复者ID
   * @returns {Promise<any>} 恢复结果
   */
  restoreUser(userId: string, tenantId: string, restoredBy: string): Promise<any>

  /**
   * @method getUserByEmail
   * @description 根据邮箱查询用户
   * @param {GetUserByEmailQuery} query - 根据邮箱查询用户查询
   * @returns {Promise<GetUserByEmailResult>} 查询结果
   */
  getUserByEmail(query: GetUserByEmailQuery): Promise<GetUserByEmailResult>

  /**
   * @method getUserByUsername
   * @description 根据用户名查询用户
   * @param {string} username - 用户名
   * @param {string} tenantId - 租户ID
   * @returns {Promise<any>} 查询结果
   */
  getUserByUsername(username: string, tenantId: string): Promise<any>

  /**
   * @method searchUsers
   * @description 搜索用户
   * @param {string} tenantId - 租户ID
   * @param {string} searchTerm - 搜索关键词
   * @param {number} page - 页码
   * @param {number} size - 每页大小
   * @param {string} sortBy - 排序字段
   * @param {string} sortOrder - 排序方向
   * @returns {Promise<any>} 搜索结果
   */
  searchUsers(
    tenantId: string,
    searchTerm?: string,
    page?: number,
    size?: number,
    sortBy?: string,
    sortOrder?: string,
  ): Promise<any>

  /**
   * @method getUsersByTenant
   * @description 获取租户下的所有用户
   * @param {string} tenantId - 租户ID
   * @param {number} page - 页码
   * @param {number} size - 每页大小
   * @param {string} status - 用户状态过滤
   * @returns {Promise<any>} 查询结果
   */
  getUsersByTenant(tenantId: string, page?: number, size?: number, status?: string): Promise<any>

  /**
   * @method getUserProfile
   * @description 获取用户资料
   * @param {string} userId - 用户ID
   * @param {string} tenantId - 租户ID
   * @param {boolean} includeSensitiveData - 是否包含敏感数据
   * @returns {Promise<any>} 用户资料
   */
  getUserProfile(userId: string, tenantId: string, includeSensitiveData?: boolean): Promise<any>

  /**
   * @method updateUserPreferences
   * @description 更新用户偏好设置
   * @param {string} userId - 用户ID
   * @param {string} tenantId - 租户ID
   * @param {Record<string, any>} preferences - 偏好设置
   * @returns {Promise<any>} 更新结果
   */
  updateUserPreferences(userId: string, tenantId: string, preferences: Record<string, any>): Promise<any>

  /**
   * @method verifyUserEmail
   * @description 验证用户邮箱
   * @param {string} userId - 用户ID
   * @param {string} tenantId - 租户ID
   * @param {string} verificationToken - 验证令牌
   * @returns {Promise<any>} 验证结果
   */
  verifyUserEmail(userId: string, tenantId: string, verificationToken: string): Promise<any>

  /**
   * @method verifyUserPhone
   * @description 验证用户手机号
   * @param {string} userId - 用户ID
   * @param {string} tenantId - 租户ID
   * @param {string} verificationCode - 验证码
   * @returns {Promise<any>} 验证结果
   */
  verifyUserPhone(userId: string, tenantId: string, verificationCode: string): Promise<any>

  /**
   * @method enableTwoFactorAuth
   * @description 启用双因素认证
   * @param {string} userId - 用户ID
   * @param {string} tenantId - 租户ID
   * @returns {Promise<any>} 启用结果
   */
  enableTwoFactorAuth(userId: string, tenantId: string): Promise<any>

  /**
   * @method disableTwoFactorAuth
   * @description 禁用双因素认证
   * @param {string} userId - 用户ID
   * @param {string} tenantId - 租户ID
   * @returns {Promise<any>} 禁用结果
   */
  disableTwoFactorAuth(userId: string, tenantId: string): Promise<any>
}

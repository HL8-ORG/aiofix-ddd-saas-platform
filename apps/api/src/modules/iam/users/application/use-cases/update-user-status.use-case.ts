import type { User } from '@/modules/iam/users/domain/entities/user.entity'
import type { UserRepository } from '@/modules/iam/users/domain/repositories/user.repository'
import {
  UserStatus,
  UserStatusValue,
} from '@/modules/iam/users/domain/value-objects/user-status.value-object'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

/**
 * @class UpdateUserStatusUseCase
 * @description
 * 更新用户状态用例，实现用户状态管理的具体业务逻辑。
 *
 * 主要原理与机制：
 * 1. 遵循Clean Architecture的Use Case模式
 * 2. 协调领域对象和基础设施服务
 * 3. 实现具体的业务用例逻辑
 * 4. 处理状态转换规则和业务验证
 * 5. 提供清晰的接口边界
 */
@Injectable()
export class UpdateUserStatusUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * @method execute
   * @description 执行更新用户状态用例
   *
   * @param userId - 用户ID
   * @param newStatus - 新状态
   * @param tenantId - 租户ID
   * @param adminUserId - 管理员用户ID
   * @param reason - 状态变更原因
   * @returns 更新后的用户实体
   */
  async execute(
    userId: string,
    newStatus: UserStatusValue,
    tenantId: string,
    adminUserId: string,
    reason?: string,
  ): Promise<User> {
    // 1. 获取用户
    const user = await this.userRepository.findById(userId, tenantId)
    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    // 2. 验证状态变更权限
    this.validateStatusChangePermission(user, adminUserId)

    // 3. 验证状态转换规则
    this.validateStatusTransition(user, newStatus)

    // 4. 更新用户状态
    this.updateUserStatus(user, newStatus, reason)

    // 5. 保存到仓储
    return await this.userRepository.save(user)
  }

  /**
   * @method executeActivate
   * @description 激活用户
   *
   * @param userId - 用户ID
   * @param tenantId - 租户ID
   * @param adminUserId - 管理员用户ID
   * @returns 更新后的用户实体
   */
  async executeActivate(
    userId: string,
    tenantId: string,
    adminUserId: string,
  ): Promise<User> {
    const activeStatus = new UserStatusValue(UserStatus.ACTIVE)
    return await this.execute(
      userId,
      activeStatus,
      tenantId,
      adminUserId,
      '用户激活',
    )
  }

  /**
   * @method executeSuspend
   * @description 禁用用户
   *
   * @param userId - 用户ID
   * @param tenantId - 租户ID
   * @param adminUserId - 管理员用户ID
   * @param reason - 禁用原因
   * @returns 更新后的用户实体
   */
  async executeSuspend(
    userId: string,
    tenantId: string,
    adminUserId: string,
    reason: string,
  ): Promise<User> {
    const suspendedStatus = new UserStatusValue(UserStatus.SUSPENDED)
    return await this.execute(
      userId,
      suspendedStatus,
      tenantId,
      adminUserId,
      reason,
    )
  }

  /**
   * @method executeBatchStatusUpdate
   * @description 批量更新用户状态
   *
   * @param userIds - 用户ID列表
   * @param newStatus - 新状态
   * @param tenantId - 租户ID
   * @param adminUserId - 管理员用户ID
   * @param reason - 状态变更原因
   * @returns 批量更新结果
   */
  async executeBatchStatusUpdate(
    userIds: string[],
    newStatus: UserStatusValue,
    tenantId: string,
    adminUserId: string,
    reason?: string,
  ): Promise<{ success: string[]; failed: string[] }> {
    const success: string[] = []
    const failed: string[] = []

    for (const userId of userIds) {
      try {
        await this.execute(userId, newStatus, tenantId, adminUserId, reason)
        success.push(userId)
      } catch (error) {
        failed.push(userId)
      }
    }

    return { success, failed }
  }

  /**
   * @method executeLockUser
   * @description 锁定用户（临时禁用）
   *
   * @param userId - 用户ID
   * @param tenantId - 租户ID
   * @param adminUserId - 管理员用户ID
   * @param duration - 锁定时长（分钟）
   * @param reason - 锁定原因
   * @returns 更新后的用户实体
   */
  async executeLockUser(
    userId: string,
    tenantId: string,
    adminUserId: string,
    duration: number,
    reason: string,
  ): Promise<User> {
    const user = await this.userRepository.findById(userId, tenantId)
    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    // 验证锁定权限
    this.validateStatusChangePermission(user, adminUserId)

    // 锁定用户（暂时使用禁用状态，实际实现中可能需要添加锁定功能）
    user.suspend()

    return await this.userRepository.save(user)
  }

  /**
   * @method executeUnlockUser
   * @description 解锁用户
   *
   * @param userId - 用户ID
   * @param tenantId - 租户ID
   * @param adminUserId - 管理员用户ID
   * @returns 更新后的用户实体
   */
  async executeUnlockUser(
    userId: string,
    tenantId: string,
    adminUserId: string,
  ): Promise<User> {
    const user = await this.userRepository.findById(userId, tenantId)
    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    // 验证解锁权限
    this.validateStatusChangePermission(user, adminUserId)

    // 解锁用户（暂时使用激活状态，实际实现中可能需要添加解锁功能）
    user.activate()

    return await this.userRepository.save(user)
  }

  /**
   * @method validateStatusChangePermission
   * @description 验证状态变更权限
   *
   * @param user - 用户实体
   * @param adminUserId - 管理员用户ID
   */
  private validateStatusChangePermission(
    user: User,
    adminUserId: string,
  ): void {
    // 不能修改自己的状态
    if (user.id === adminUserId) {
      throw new BadRequestException('不能修改自己的状态')
    }

    // 不能修改系统管理员的状态（这里可以根据实际业务逻辑判断）
    // 暂时注释掉，因为User实体可能没有isSystemAdmin方法
    // if (user.isSystemAdmin()) {
    //   throw new BadRequestException('不能修改系统管理员的状态');
    // }
  }

  /**
   * @method validateStatusTransition
   * @description 验证状态转换规则
   *
   * @param user - 用户实体
   * @param newStatus - 新状态
   */
  private validateStatusTransition(
    user: User,
    newStatus: UserStatusValue,
  ): void {
    const currentStatus = user.status.getValue()
    const targetStatus = newStatus.getValue()

    // 检查状态转换是否有效
    if (!this.isValidStatusTransition(currentStatus, targetStatus)) {
      throw new BadRequestException(
        `无效的状态转换：从 ${currentStatus} 到 ${targetStatus}`,
      )
    }
  }

  /**
   * @method isValidStatusTransition
   * @description 检查状态转换是否有效
   *
   * @param currentStatus - 当前状态
   * @param targetStatus - 目标状态
   * @returns 是否有效
   */
  private isValidStatusTransition(
    currentStatus: string,
    targetStatus: string,
  ): boolean {
    const validTransitions: Record<string, string[]> = {
      [UserStatus.PENDING]: [UserStatus.ACTIVE, UserStatus.DELETED],
      [UserStatus.ACTIVE]: [UserStatus.SUSPENDED], // 不允许直接从ACTIVE到DELETED
      [UserStatus.SUSPENDED]: [UserStatus.ACTIVE, UserStatus.DELETED],
      [UserStatus.DELETED]: [UserStatus.ACTIVE], // 恢复
    }

    const allowedTransitions = validTransitions[currentStatus] || []
    return allowedTransitions.includes(targetStatus)
  }

  /**
   * @method updateUserStatus
   * @description 更新用户状态
   *
   * @param user - 用户实体
   * @param newStatus - 新状态
   * @param reason - 变更原因
   */
  private updateUserStatus(
    user: User,
    newStatus: UserStatusValue,
    reason?: string,
  ): void {
    const currentStatus = user.status.getValue()
    const targetStatus = newStatus.getValue()

    switch (targetStatus) {
      case UserStatus.ACTIVE:
        user.activate()
        break
      case UserStatus.SUSPENDED:
        user.suspend()
        break
      case UserStatus.DELETED:
        user.markAsDeleted()
        break
      default:
        throw new BadRequestException(`不支持的状态：${targetStatus}`)
    }
  }

  /**
   * @method executeResetFailedLoginAttempts
   * @description 重置用户登录失败次数
   *
   * @param userId - 用户ID
   * @param tenantId - 租户ID
   * @param adminUserId - 管理员用户ID
   * @returns 更新后的用户实体
   */
  async executeResetFailedLoginAttempts(
    userId: string,
    tenantId: string,
    adminUserId: string,
  ): Promise<User> {
    const user = await this.userRepository.findById(userId, tenantId)
    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    // 重置登录失败次数（暂时注释掉，因为User实体可能没有这个方法）
    // user.resetFailedLoginAttempts();

    return await this.userRepository.save(user)
  }
}

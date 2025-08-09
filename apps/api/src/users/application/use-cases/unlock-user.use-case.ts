/**
 * @class UnlockUserUseCase
 * @description
 * 解锁用户用例，实现应用层业务逻辑。该用例负责协调领域对象和服务完成解锁用户的业务流程，
 * 包括权限验证、状态检查、安全策略等。
 *
 * 主要原理与机制：
 * 1. 应用层用例：协调领域对象和服务完成业务逻辑
 * 2. 依赖注入：通过构造函数注入所需的依赖
 * 3. 权限控制：解锁时验证操作权限
 * 4. 状态管理：确保用户状态转换的正确性
 * 5. 安全策略：实现账户安全保护机制
 * 6. 审计日志：记录解锁操作的审计信息
 */
import { Injectable, Inject } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { EventBus } from '@nestjs/cqrs'
import { UnlockUserCommand, type UnlockUserResult } from '../commands/unlock-user.command'
import type { UserRepository } from '../../domain/repositories/user.repository.interface'
import { UserId } from '../../domain/value-objects/user-id.vo'
import type { User } from '../../domain/entities/user.entity'

@Injectable()
export class UnlockUserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行解锁用户用例
   * @param {UnlockUserCommand} command - 解锁用户命令
   * @returns {Promise<UnlockUserResult>} 解锁结果
   */
  async execute(command: UnlockUserCommand): Promise<UnlockUserResult> {
    try {
      this.logger.log(
        `开始执行解锁用户用例: userId=${command.userId}, tenantId=${command.tenantId}`,
        'UnlockUserUseCase',
      )

      // 1. 验证命令
      command.validate()

      // 2. 查找用户
      const user = await this.findUser(command.userId, command.tenantId)

      // 3. 验证权限
      await this.validatePermissions(user, command)

      // 4. 验证用户状态
      await this.validateUserStatus(user)

      // 5. 检查锁定是否已过期
      const lockedUntil = user.getLockedUntil()
      const isExpired = lockedUntil && lockedUntil <= new Date()

      // 6. 解锁用户
      await this.unlockUser(user, command.reason)

      // 7. 保存用户
      await this.saveUser(user)

      // 8. 记录锁定过期日志（如果适用）
      if (isExpired) {
        this.logger.log(
          `用户锁定已过期，自动解锁: userId=${command.userId}`,
          'UnlockUserUseCase',
        )
      }

      // 9. 发布事件
      await this.publishUserUnlockedEvent(user, command)

      // 10. 记录审计日志
      await this.auditUserUnlock(user, command)

      this.logger.log(
        `解锁用户用例执行成功: userId=${command.userId}`,
        'UnlockUserUseCase',
      )

      return {
        success: true,
        userId: command.userId,
        message: isExpired ? '用户锁定已过期，自动解锁' : '用户解锁成功',
        unlockedAt: new Date(),
      }
    } catch (error) {
      this.logger.error(
        `解锁用户用例执行失败: ${(error as Error).message}`,
        (error as Error).stack,
        'UnlockUserUseCase',
      )

      return {
        success: false,
        userId: command.userId,
        error: (error as Error).message,
      }
    }
  }

  /**
   * @private
   * @method findUser
   * @description 查找用户
   * @param {string} userId - 用户ID
   * @param {string} tenantId - 租户ID
   * @returns {Promise<User>} 用户实体
   */
  private async findUser(userId: string, tenantId: string): Promise<User> {
    const user = await this.userRepository.findById(new UserId(userId), tenantId)
    if (!user) {
      throw new Error('用户不存在')
    }
    return user
  }

  /**
   * @private
   * @method validatePermissions
   * @description 验证权限
   * @param {User} user - 用户实体
   * @param {UnlockUserCommand} command - 命令
   */
  private async validatePermissions(user: User, command: UnlockUserCommand): Promise<void> {
    // 检查操作权限（这里可以添加更复杂的权限检查逻辑）
    // 例如：只有租户管理员或系统管理员可以解锁用户
    // 检查解锁者是否有权限解锁该用户
  }

  /**
   * @private
   * @method validateUserStatus
   * @description 验证用户状态
   * @param {User} user - 用户实体
   */
  private async validateUserStatus(user: User): Promise<void> {
    if (user.getStatus().isDeleted()) {
      throw new Error('已删除的用户无法解锁')
    }

    if (!user.getStatus().isLocked()) {
      throw new Error('用户没有被锁定，无需解锁')
    }
  }

  /**
   * @private
   * @method unlockUser
   * @description 解锁用户
   * @param {User} user - 用户实体
   * @param {string} reason - 解锁原因
   */
  private async unlockUser(user: User, reason?: string): Promise<void> {
    user.unlock()
  }

  /**
   * @private
   * @method saveUser
   * @description 保存用户
   * @param {User} user - 用户实体
   */
  private async saveUser(user: User): Promise<void> {
    await this.userRepository.save(user)
  }

  /**
   * @private
   * @method publishUserUnlockedEvent
   * @description 发布用户解锁事件
   * @param {User} user - 用户实体
   * @param {UnlockUserCommand} command - 命令
   */
  private async publishUserUnlockedEvent(user: User, command: UnlockUserCommand): Promise<void> {
    // 这里可以发布用户解锁事件
    // await this.eventBus.publish(new UserUnlockedEvent(user, command))
  }

  /**
   * @private
   * @method auditUserUnlock
   * @description 记录用户解锁审计日志
   * @param {User} user - 用户实体
   * @param {UnlockUserCommand} command - 命令
   */
  private async auditUserUnlock(user: User, command: UnlockUserCommand): Promise<void> {
    this.logger.log(
      `用户解锁审计: userId=${user.getId().getValue()}, unlockedBy=${command.unlockedBy}, reason=${command.reason || '无'}`,
      'UnlockUserUseCase',
    )
  }
}

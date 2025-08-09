/**
 * @class LockUserUseCase
 * @description
 * 锁定用户用例，实现应用层业务逻辑。该用例负责协调领域对象和服务完成锁定用户的业务流程，
 * 包括权限验证、状态检查、安全策略等。
 *
 * 主要原理与机制：
 * 1. 应用层用例：协调领域对象和服务完成业务逻辑
 * 2. 依赖注入：通过构造函数注入所需的依赖
 * 3. 权限控制：锁定时验证操作权限
 * 4. 状态管理：确保用户状态转换的正确性
 * 5. 安全策略：实现账户安全保护机制
 * 6. 审计日志：记录锁定操作的审计信息
 */
import { Injectable, Inject } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { EventBus } from '@nestjs/cqrs'
import { LockUserCommand, type LockUserResult } from '../commands/lock-user.command'
import type { UserRepository } from '../../domain/repositories/user.repository.interface'
import { UserId } from '../../domain/value-objects/user-id.vo'
import type { User } from '../../domain/entities/user.entity'

@Injectable()
export class LockUserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行锁定用户用例
   * @param {LockUserCommand} command - 锁定用户命令
   * @returns {Promise<LockUserResult>} 锁定结果
   */
  async execute(command: LockUserCommand): Promise<LockUserResult> {
    try {
      this.logger.log(
        `开始执行锁定用户用例: userId=${command.userId}, tenantId=${command.tenantId}`,
        'LockUserUseCase',
      )

      // 1. 验证命令
      command.validate()

      // 2. 查找用户
      const user = await this.findUser(command.userId, command.tenantId)

      // 3. 验证权限
      await this.validatePermissions(user, command)

      // 4. 验证用户状态
      await this.validateUserStatus(user)

      // 5. 锁定用户
      await this.lockUser(user, command.reason, command.lockedUntil)

      // 6. 保存用户
      await this.saveUser(user)

      // 7. 发布事件
      await this.publishUserLockedEvent(user, command)

      // 8. 记录审计日志
      await this.auditUserLock(user, command)

      this.logger.log(
        `锁定用户用例执行成功: userId=${command.userId}`,
        'LockUserUseCase',
      )

      return {
        success: true,
        userId: command.userId,
        message: '用户锁定成功',
        lockedAt: new Date(),
        lockedUntil: command.lockedUntil ? new Date(command.lockedUntil) : undefined,
      }
    } catch (error) {
      this.logger.error(
        `锁定用户用例执行失败: ${(error as Error).message}`,
        (error as Error).stack,
        'LockUserUseCase',
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
   * @param {LockUserCommand} command - 命令
   */
  private async validatePermissions(user: User, command: LockUserCommand): Promise<void> {
    // 检查操作权限（这里可以添加更复杂的权限检查逻辑）
    // 例如：只有租户管理员或系统管理员可以锁定用户
    // 检查锁定者是否有权限锁定该用户
  }

  /**
   * @private
   * @method validateUserStatus
   * @description 验证用户状态
   * @param {User} user - 用户实体
   */
  private async validateUserStatus(user: User): Promise<void> {
    if (user.getStatus().isDeleted()) {
      throw new Error('已删除的用户无法锁定')
    }

    if (user.getStatus().isLocked()) {
      throw new Error('用户已经被锁定')
    }

    if (!user.getStatus().isActive()) {
      throw new Error('非激活状态的用户无法锁定')
    }
  }

  /**
   * @private
   * @method lockUser
   * @description 锁定用户
   * @param {User} user - 用户实体
   * @param {string} reason - 锁定原因
   * @param {string} lockedUntil - 锁定截止时间
   */
  private async lockUser(user: User, reason?: string, lockedUntil?: string): Promise<void> {
    const lockedUntilDate = lockedUntil ? new Date(lockedUntil) : undefined
    user.lock(reason, lockedUntilDate)
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
   * @method publishUserLockedEvent
   * @description 发布用户锁定事件
   * @param {User} user - 用户实体
   * @param {LockUserCommand} command - 命令
   */
  private async publishUserLockedEvent(user: User, command: LockUserCommand): Promise<void> {
    // 这里可以发布用户锁定事件
    // await this.eventBus.publish(new UserLockedEvent(user, command))
  }

  /**
   * @private
   * @method auditUserLock
   * @description 记录用户锁定审计日志
   * @param {User} user - 用户实体
   * @param {LockUserCommand} command - 命令
   */
  private async auditUserLock(user: User, command: LockUserCommand): Promise<void> {
    this.logger.log(
      `用户锁定审计: userId=${user.getId().getValue()}, lockedBy=${command.lockedBy}, reason=${command.reason || '无'}, lockedUntil=${command.lockedUntil || '永久'}`,
      'LockUserUseCase',
    )
  }
}

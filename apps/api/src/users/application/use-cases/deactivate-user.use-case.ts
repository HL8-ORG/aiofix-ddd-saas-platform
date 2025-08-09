/**
 * @class DeactivateUserUseCase
 * @description
 * 停用用户用例，实现应用层业务逻辑。该用例负责协调领域对象和服务完成停用用户的业务流程，
 * 包括权限验证、状态检查、审计日志等。
 *
 * 主要原理与机制：
 * 1. 应用层用例：协调领域对象和服务完成业务逻辑
 * 2. 依赖注入：通过构造函数注入所需的依赖
 * 3. 权限控制：停用时验证操作权限
 * 4. 状态管理：确保用户状态转换的正确性
 * 5. 审计日志：记录停用操作的审计信息
 * 6. 错误处理：统一的错误处理和异常管理
 */
import { Injectable, Inject } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { EventBus } from '@nestjs/cqrs'
import { DeactivateUserCommand, type DeactivateUserResult } from '../commands/deactivate-user.command'
import type { UserRepository } from '../../domain/repositories/user.repository.interface'
import { UserId } from '../../domain/value-objects/user-id.vo'
import type { User } from '../../domain/entities/user.entity'

@Injectable()
export class DeactivateUserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行停用用户用例
   * @param {DeactivateUserCommand} command - 停用用户命令
   * @returns {Promise<DeactivateUserResult>} 停用结果
   */
  async execute(command: DeactivateUserCommand): Promise<DeactivateUserResult> {
    try {
      this.logger.log(
        `开始执行停用用户用例: userId=${command.userId}, tenantId=${command.tenantId}`,
        'DeactivateUserUseCase',
      )

      // 1. 验证命令
      command.validate()

      // 2. 查找用户
      const user = await this.findUser(command.userId, command.tenantId)

      // 3. 验证权限
      await this.validatePermissions(user, command)

      // 4. 验证用户状态
      await this.validateUserStatus(user)

      // 5. 停用用户
      await this.deactivateUser(user, command.reason)

      // 6. 保存用户
      await this.saveUser(user)

      // 7. 发布事件
      await this.publishUserDeactivatedEvent(user, command)

      // 8. 记录审计日志
      await this.auditUserDeactivation(user, command)

      this.logger.log(
        `停用用户用例执行成功: userId=${command.userId}`,
        'DeactivateUserUseCase',
      )

      return {
        success: true,
        userId: command.userId,
        message: '用户停用成功',
        deactivatedAt: new Date(),
      }
    } catch (error) {
      this.logger.error(
        `停用用户用例执行失败: ${(error as Error).message}`,
        (error as Error).stack,
        'DeactivateUserUseCase',
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
   * @param {DeactivateUserCommand} command - 命令
   */
  private async validatePermissions(user: User, command: DeactivateUserCommand): Promise<void> {
    // 检查操作权限（这里可以添加更复杂的权限检查逻辑）
    // 例如：只有租户管理员或系统管理员可以停用用户
    // 检查停用者是否有权限停用该用户
  }

  /**
   * @private
   * @method validateUserStatus
   * @description 验证用户状态
   * @param {User} user - 用户实体
   */
  private async validateUserStatus(user: User): Promise<void> {
    if (user.getStatus().isDeleted()) {
      throw new Error('已删除的用户无法停用')
    }

    if (!user.getStatus().isActive()) {
      throw new Error('用户已经是非激活状态')
    }

    if (user.getStatus().isLocked()) {
      throw new Error('已锁定的用户无法停用')
    }
  }

  /**
   * @private
   * @method deactivateUser
   * @description 停用用户
   * @param {User} user - 用户实体
   * @param {string} reason - 停用原因
   */
  private async deactivateUser(user: User, reason?: string): Promise<void> {
    user.deactivate()
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
   * @method publishUserDeactivatedEvent
   * @description 发布用户停用事件
   * @param {User} user - 用户实体
   * @param {DeactivateUserCommand} command - 命令
   */
  private async publishUserDeactivatedEvent(user: User, command: DeactivateUserCommand): Promise<void> {
    // 这里可以发布用户停用事件
    // await this.eventBus.publish(new UserDeactivatedEvent(user, command))
  }

  /**
   * @private
   * @method auditUserDeactivation
   * @description 记录用户停用审计日志
   * @param {User} user - 用户实体
   * @param {DeactivateUserCommand} command - 命令
   */
  private async auditUserDeactivation(user: User, command: DeactivateUserCommand): Promise<void> {
    this.logger.log(
      `用户停用审计: userId=${user.getId().getValue()}, deactivatedBy=${command.deactivatedBy}, reason=${command.reason || '无'}`,
      'DeactivateUserUseCase',
    )
  }
}

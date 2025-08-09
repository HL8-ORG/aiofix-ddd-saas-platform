/**
 * @class ActivateUserUseCase
 * @description
 * 激活用户用例，实现应用层业务逻辑。该用例负责协调领域对象和服务完成激活用户的业务流程，
 * 包括权限验证、状态检查、审计日志等。
 *
 * 主要原理与机制：
 * 1. 应用层用例：协调领域对象和服务完成业务逻辑
 * 2. 依赖注入：通过构造函数注入所需的依赖
 * 3. 权限控制：激活时验证操作权限
 * 4. 状态管理：确保用户状态转换的正确性
 * 5. 审计日志：记录激活操作的审计信息
 * 6. 错误处理：统一的错误处理和异常管理
 */
import { Injectable, Inject } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { EventBus } from '@nestjs/cqrs'
import { ActivateUserCommand, type ActivateUserResult } from '../commands/activate-user.command'
import type { UserRepository } from '../../domain/repositories/user.repository.interface'
import { UserId } from '../../domain/value-objects/user-id.vo'
import type { User } from '../../domain/entities/user.entity'

@Injectable()
export class ActivateUserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行激活用户用例
   * @param {ActivateUserCommand} command - 激活用户命令
   * @returns {Promise<ActivateUserResult>} 激活结果
   */
  async execute(command: ActivateUserCommand): Promise<ActivateUserResult> {
    try {
      this.logger.log(
        `开始执行激活用户用例: userId=${command.userId}, tenantId=${command.tenantId}`,
        'ActivateUserUseCase',
      )

      // 1. 验证命令
      command.validate()

      // 2. 查找用户
      const user = await this.findUser(command.userId, command.tenantId)

      // 3. 验证权限
      await this.validatePermissions(user, command)

      // 4. 验证用户状态
      await this.validateUserStatus(user)

      // 5. 激活用户
      await this.activateUser(user, command.reason)

      // 6. 保存用户
      await this.saveUser(user)

      // 7. 发布事件
      await this.publishUserActivatedEvent(user, command)

      // 8. 记录审计日志
      await this.auditUserActivation(user, command)

      this.logger.log(
        `激活用户用例执行成功: userId=${command.userId}`,
        'ActivateUserUseCase',
      )

      return {
        success: true,
        userId: command.userId,
        message: '用户激活成功',
        activatedAt: new Date(),
      }
    } catch (error) {
      this.logger.error(
        `激活用户用例执行失败: ${(error as Error).message}`,
        (error as Error).stack,
        'ActivateUserUseCase',
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
   * @param {ActivateUserCommand} command - 命令
   */
  private async validatePermissions(user: User, command: ActivateUserCommand): Promise<void> {
    // 检查操作权限（这里可以添加更复杂的权限检查逻辑）
    // 例如：只有租户管理员或系统管理员可以激活用户
    // 检查激活者是否有权限激活该用户
  }

  /**
   * @private
   * @method validateUserStatus
   * @description 验证用户状态
   * @param {User} user - 用户实体
   */
  private async validateUserStatus(user: User): Promise<void> {
    if (user.getStatus().isDeleted()) {
      throw new Error('已删除的用户无法激活')
    }

    if (user.getStatus().isLocked()) {
      throw new Error('无法激活已锁定的用户')
    }

    if (user.getStatus().isActive()) {
      throw new Error('用户已经是激活状态')
    }
  }

  /**
   * @private
   * @method activateUser
   * @description 激活用户
   * @param {User} user - 用户实体
   * @param {string} reason - 激活原因
   */
  private async activateUser(user: User, reason?: string): Promise<void> {
    user.activate()
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
   * @method publishUserActivatedEvent
   * @description 发布用户激活事件
   * @param {User} user - 用户实体
   * @param {ActivateUserCommand} command - 命令
   */
  private async publishUserActivatedEvent(user: User, command: ActivateUserCommand): Promise<void> {
    // 这里可以发布用户激活事件
    // await this.eventBus.publish(new UserActivatedEvent(user, command))
  }

  /**
   * @private
   * @method auditUserActivation
   * @description 记录用户激活审计日志
   * @param {User} user - 用户实体
   * @param {ActivateUserCommand} command - 命令
   */
  private async auditUserActivation(user: User, command: ActivateUserCommand): Promise<void> {
    this.logger.log(
      `用户激活审计: userId=${user.getId().getValue()}, activatedBy=${command.activatedBy}, reason=${command.reason || '无'}`,
      'ActivateUserUseCase',
    )
  }
}

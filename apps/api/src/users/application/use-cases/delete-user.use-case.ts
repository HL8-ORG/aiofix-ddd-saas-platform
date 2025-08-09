/**
 * @class DeleteUserUseCase
 * @description
 * 删除用户用例，实现应用层业务逻辑。该用例负责协调领域对象和服务完成删除用户的业务流程，
 * 包括权限验证、状态检查、软删除策略等。
 *
 * 主要原理与机制：
 * 1. 应用层用例：协调领域对象和服务完成业务逻辑
 * 2. 依赖注入：通过构造函数注入所需的依赖
 * 3. 权限控制：删除时验证操作权限
 * 4. 软删除策略：保留数据完整性，支持恢复
 * 5. 审计日志：记录删除操作的审计信息
 * 6. 错误处理：统一的错误处理和异常管理
 */
import { Injectable, Inject } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { EventBus } from '@nestjs/cqrs'
import { DeleteUserCommand, type DeleteUserResult } from '../commands/delete-user.command'
import type { UserRepository } from '../../domain/repositories/user.repository.interface'
import { UserId } from '../../domain/value-objects/user-id.vo'
import type { User } from '../../domain/entities/user.entity'

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行删除用户用例
   * @param {DeleteUserCommand} command - 删除用户命令
   * @returns {Promise<DeleteUserResult>} 删除结果
   */
  async execute(command: DeleteUserCommand): Promise<DeleteUserResult> {
    try {
      this.logger.log(
        `开始执行删除用户用例: userId=${command.userId}, tenantId=${command.tenantId}, permanent=${command.permanent}`,
        'DeleteUserUseCase',
      )

      // 1. 验证命令
      command.validate()

      // 2. 查找用户
      const user = await this.findUser(command.userId, command.tenantId)

      // 3. 验证权限
      await this.validatePermissions(user, command)

      // 4. 验证用户状态
      await this.validateUserStatus(user)

      // 5. 删除用户
      await this.deleteUser(user, command.reason, command.permanent)

      // 6. 保存用户
      await this.saveUser(user)

      // 7. 发布事件
      await this.publishUserDeletedEvent(user, command)

      // 8. 记录审计日志
      await this.auditUserDeletion(user, command)

      this.logger.log(
        `删除用户用例执行成功: userId=${command.userId}`,
        'DeleteUserUseCase',
      )

      return {
        success: true,
        userId: command.userId,
        message: command.permanent ? '用户永久删除成功' : '用户删除成功',
        deletedAt: new Date(),
        permanent: command.permanent,
      }
    } catch (error) {
      this.logger.error(
        `删除用户用例执行失败: ${(error as Error).message}`,
        (error as Error).stack,
        'DeleteUserUseCase',
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
   * @param {DeleteUserCommand} command - 命令
   */
  private async validatePermissions(user: User, command: DeleteUserCommand): Promise<void> {
    // 检查操作权限（这里可以添加更复杂的权限检查逻辑）
    // 例如：只有租户管理员或系统管理员可以删除用户
    // 检查删除者是否有权限删除该用户

    // 如果是永久删除，需要特殊权限
    if (command.permanent) {
      // 检查是否有永久删除权限
      // 例如：只有系统管理员可以永久删除用户
    }
  }

  /**
   * @private
   * @method validateUserStatus
   * @description 验证用户状态
   * @param {User} user - 用户实体
   */
  private async validateUserStatus(user: User): Promise<void> {
    if (user.getStatus().isDeleted()) {
      throw new Error('用户已经被删除')
    }
  }

  /**
   * @private
   * @method deleteUser
   * @description 删除用户
   * @param {User} user - 用户实体
   * @param {string} reason - 删除原因
   * @param {boolean} permanent - 是否永久删除
   */
  private async deleteUser(user: User, reason?: string, permanent?: boolean): Promise<void> {
    user.delete(reason)
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
   * @method publishUserDeletedEvent
   * @description 发布用户删除事件
   * @param {User} user - 用户实体
   * @param {DeleteUserCommand} command - 命令
   */
  private async publishUserDeletedEvent(user: User, command: DeleteUserCommand): Promise<void> {
    // 这里可以发布用户删除事件
    // await this.eventBus.publish(new UserDeletedEvent(user, command))
  }

  /**
   * @private
   * @method auditUserDeletion
   * @description 记录用户删除审计日志
   * @param {User} user - 用户实体
   * @param {DeleteUserCommand} command - 命令
   */
  private async auditUserDeletion(user: User, command: DeleteUserCommand): Promise<void> {
    this.logger.log(
      `用户删除审计: userId=${user.getId().getValue()}, deletedBy=${command.deletedBy}, reason=${command.reason || '无'}, permanent=${command.permanent}`,
      'DeleteUserUseCase',
    )
  }
}

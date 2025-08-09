/**
 * @class UpdateUserProfileUseCase
 * @description
 * 更新用户资料用例，实现应用层业务逻辑。该用例负责协调领域对象和服务完成更新用户资料的业务流程，
 * 包括权限验证、数据验证、状态检查、审计日志等。
 *
 * 主要原理与机制：
 * 1. 应用层用例：协调领域对象和服务完成业务逻辑
 * 2. 依赖注入：通过构造函数注入所需的依赖
 * 3. 权限控制：更新时验证用户权限
 * 4. 数据验证：验证更新数据的有效性
 * 5. 审计日志：记录更新操作的审计信息
 * 6. 错误处理：统一的错误处理和异常管理
 */
import { Injectable, Inject } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { EventBus } from '@nestjs/cqrs'
import { UpdateUserProfileCommand, type UpdateUserProfileResult } from '../commands/update-user-profile.command'
import type { UserRepository } from '../../domain/repositories/user.repository.interface'
import { UserId } from '../../domain/value-objects/user-id.vo'
import { PhoneNumber } from '../../domain/value-objects/phone-number.vo'
import type { User } from '../../domain/entities/user.entity'

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行更新用户资料用例
   * @param {UpdateUserProfileCommand} command - 更新用户资料命令
   * @returns {Promise<UpdateUserProfileResult>} 更新结果
   */
  async execute(command: UpdateUserProfileCommand): Promise<UpdateUserProfileResult> {
    try {
      this.logger.log(
        `开始执行更新用户资料用例: userId=${command.userId}, tenantId=${command.tenantId}`,
        'UpdateUserProfileUseCase',
      )

      // 1. 验证命令
      command.validate()

      // 2. 查找用户
      const user = await this.findUser(command.userId, command.tenantId)

      // 3. 验证权限
      await this.validatePermissions(user, command)

      // 4. 更新用户资料
      const updatedFields = await this.updateUserProfile(user, command)

      // 5. 保存用户
      await this.saveUser(user)

      // 6. 发布事件
      await this.publishUserProfileUpdatedEvent(user, command, updatedFields)

      // 7. 记录审计日志
      await this.auditUserProfileUpdate(user, command, updatedFields)

      this.logger.log(
        `更新用户资料用例执行成功: userId=${command.userId}, updatedFields=${updatedFields.join(', ')}`,
        'UpdateUserProfileUseCase',
      )

      return {
        success: true,
        userId: command.userId,
        message: '用户资料更新成功',
        updatedFields,
      }
    } catch (error) {
      this.logger.error(
        `更新用户资料用例执行失败: ${(error as Error).message}`,
        (error as Error).stack,
        'UpdateUserProfileUseCase',
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
   * @param {UpdateUserProfileCommand} command - 命令
   */
  private async validatePermissions(user: User, command: UpdateUserProfileCommand): Promise<void> {
    // 检查用户状态
    if (user.getStatus().isDeleted()) {
      throw new Error('已删除的用户无法更新资料')
    }

    if (user.getStatus().isLocked()) {
      throw new Error('无法更新已锁定用户的资料')
    }

    // 检查操作权限（这里可以添加更复杂的权限检查逻辑）
    // 例如：只有用户本人、租户管理员或系统管理员可以修改用户资料
  }

  /**
   * @private
   * @method updateUserProfile
   * @description 更新用户资料
   * @param {User} user - 用户实体
   * @param {UpdateUserProfileCommand} command - 命令
   * @returns {Promise<string[]>} 更新的字段列表
   */
  private async updateUserProfile(user: User, command: UpdateUserProfileCommand): Promise<string[]> {
    const updatedFields: string[] = []

    // 更新基本信息
    if (command.firstName !== undefined || command.lastName !== undefined || command.avatar !== undefined || command.phone !== undefined) {
      user.updateProfile({
        firstName: command.firstName,
        lastName: command.lastName,
        avatar: command.avatar,
        phoneNumber: command.phone ? new PhoneNumber(command.phone) : undefined,
      })
      updatedFields.push('profile')
    }

    return updatedFields
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
   * @method publishUserProfileUpdatedEvent
   * @description 发布用户资料更新事件
   * @param {User} user - 用户实体
   * @param {UpdateUserProfileCommand} command - 命令
   * @param {string[]} updatedFields - 更新的字段列表
   */
  private async publishUserProfileUpdatedEvent(
    user: User,
    command: UpdateUserProfileCommand,
    updatedFields: string[],
  ): Promise<void> {
    // 这里可以发布用户资料更新事件
    // await this.eventBus.publish(new UserProfileUpdatedEvent(user, command, updatedFields))
  }

  /**
   * @private
   * @method auditUserProfileUpdate
   * @description 记录用户资料更新审计日志
   * @param {User} user - 用户实体
   * @param {UpdateUserProfileCommand} command - 命令
   * @param {string[]} updatedFields - 更新的字段列表
   */
  private async auditUserProfileUpdate(
    user: User,
    command: UpdateUserProfileCommand,
    updatedFields: string[],
  ): Promise<void> {
    this.logger.log(
      `用户资料更新审计: userId=${user.getId().getValue()}, updatedBy=${command.updatedBy}, fields=${updatedFields.join(', ')}`,
      'UpdateUserProfileUseCase',
    )
  }
}

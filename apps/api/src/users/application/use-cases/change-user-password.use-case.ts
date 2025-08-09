/**
 * @class ChangeUserPasswordUseCase
 * @description
 * 修改用户密码用例，实现应用层业务逻辑。该用例负责协调领域对象和服务完成修改用户密码的业务流程，
 * 包括密码验证、安全策略检查、审计日志等。
 *
 * 主要原理与机制：
 * 1. 应用层用例：协调领域对象和服务完成业务逻辑
 * 2. 依赖注入：通过构造函数注入所需的依赖
 * 3. 安全控制：验证当前密码和密码策略
 * 4. 数据验证：验证新密码的有效性
 * 5. 审计日志：记录密码修改的审计信息
 * 6. 错误处理：统一的错误处理和异常管理
 */
import { Injectable, Inject } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { EventBus } from '@nestjs/cqrs'
import { ChangeUserPasswordCommand, type ChangeUserPasswordResult } from '../commands/change-user-password.command'
import type { UserRepository } from '../../domain/repositories/user.repository.interface'
import { UserId } from '../../domain/value-objects/user-id.vo'
import { Password } from '../../domain/value-objects/password.vo'
import type { User } from '../../domain/entities/user.entity'

@Injectable()
export class ChangeUserPasswordUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行修改用户密码用例
   * @param {ChangeUserPasswordCommand} command - 修改用户密码命令
   * @returns {Promise<ChangeUserPasswordResult>} 修改结果
   */
  async execute(command: ChangeUserPasswordCommand): Promise<ChangeUserPasswordResult> {
    try {
      this.logger.log(
        `开始执行修改用户密码用例: userId=${command.userId}, tenantId=${command.tenantId}`,
        'ChangeUserPasswordUseCase',
      )

      // 1. 验证命令
      command.validate()

      // 2. 查找用户
      const user = await this.findUser(command.userId, command.tenantId)

      // 3. 验证用户状态
      await this.validateUserStatus(user)

      // 4. 验证当前密码
      await this.validateCurrentPassword(user, command.currentPassword)

      // 5. 验证新密码策略
      await this.validateNewPasswordPolicy(command.newPassword)

      // 6. 修改密码
      await this.changePassword(user, command.currentPassword, command.newPassword, command.clientIp, command.userAgent)

      // 7. 保存用户
      await this.saveUser(user)

      // 8. 发布事件
      await this.publishPasswordChangedEvent(user, command)

      // 9. 记录审计日志
      await this.auditPasswordChange(user, command)

      this.logger.log(
        `修改用户密码用例执行成功: userId=${command.userId}`,
        'ChangeUserPasswordUseCase',
      )

      return {
        success: true,
        userId: command.userId,
        message: '密码修改成功',
        passwordChangedAt: new Date(),
      }
    } catch (error) {
      this.logger.error(
        `修改用户密码用例执行失败: ${(error as Error).message}`,
        (error as Error).stack,
        'ChangeUserPasswordUseCase',
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
   * @method validateUserStatus
   * @description 验证用户状态
   * @param {User} user - 用户实体
   */
  private async validateUserStatus(user: User): Promise<void> {
    if (user.getStatus().isDeleted()) {
      throw new Error('已删除的用户无法修改密码')
    }

    if (user.getStatus().isLocked()) {
      throw new Error('已锁定的用户无法修改密码')
    }

    if (!user.getStatus().isActive()) {
      throw new Error('非激活状态的用户无法修改密码')
    }
  }

  /**
   * @private
   * @method validateCurrentPassword
   * @description 验证当前密码
   * @param {User} user - 用户实体
   * @param {string} currentPassword - 当前密码
   */
  private async validateCurrentPassword(user: User, currentPassword: string): Promise<void> {
    if (!user.verifyPassword(currentPassword)) {
      throw new Error('当前密码不正确')
    }
  }

  /**
   * @private
   * @method validateNewPasswordPolicy
   * @description 验证新密码策略
   * @param {string} newPassword - 新密码
   */
  private async validateNewPasswordPolicy(newPassword: string): Promise<void> {
    // 检查密码长度
    if (newPassword.length < 8) {
      throw new Error('新密码长度不能少于8个字符')
    }

    if (newPassword.length > 128) {
      throw new Error('新密码长度不能超过128个字符')
    }

    // 检查密码复杂度
    const hasUpperCase = /[A-Z]/.test(newPassword)
    const hasLowerCase = /[a-z]/.test(newPassword)
    const hasNumbers = /\d/.test(newPassword)
    const hasSpecialChars = /[@$!%*?&]/.test(newPassword)

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChars) {
      throw new Error('新密码必须包含大小写字母、数字和特殊字符')
    }

    // 检查常见弱密码
    const weakPasswords = [
      'password', '123456', 'qwerty', 'admin', 'letmein',
      'welcome', 'monkey', 'dragon', 'master', 'hello'
    ]

    if (weakPasswords.includes(newPassword.toLowerCase())) {
      throw new Error('新密码不能使用常见弱密码')
    }
  }

  /**
   * @private
   * @method changePassword
   * @description 修改密码
   * @param {User} user - 用户实体
   * @param {string} newPassword - 新密码
   * @param {string} clientIp - 客户端IP
   * @param {string} userAgent - 用户代理
   */
  private async changePassword(
    user: User,
    currentPassword: string,
    newPassword: string,
    clientIp?: string,
    userAgent?: string,
  ): Promise<void> {
    const password = Password.create(newPassword)
    user.changePassword(currentPassword, password, clientIp, userAgent)
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
   * @method publishPasswordChangedEvent
   * @description 发布密码修改事件
   * @param {User} user - 用户实体
   * @param {ChangeUserPasswordCommand} command - 命令
   */
  private async publishPasswordChangedEvent(user: User, command: ChangeUserPasswordCommand): Promise<void> {
    // 这里可以发布密码修改事件
    // await this.eventBus.publish(new UserPasswordChangedEvent(user, command))
  }

  /**
   * @private
   * @method auditPasswordChange
   * @description 记录密码修改审计日志
   * @param {User} user - 用户实体
   * @param {ChangeUserPasswordCommand} command - 命令
   */
  private async auditPasswordChange(user: User, command: ChangeUserPasswordCommand): Promise<void> {
    this.logger.log(
      `用户密码修改审计: userId=${user.getId().getValue()}, changedBy=${command.changedBy}, clientIp=${command.clientIp}`,
      'ChangeUserPasswordUseCase',
    )
  }
}

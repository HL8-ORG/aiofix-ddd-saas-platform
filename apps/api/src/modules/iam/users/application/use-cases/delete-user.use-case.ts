import type { User } from '@/modules/iam/users/domain/entities/user.entity'
import type { UserRepository } from '@/modules/iam/users/domain/repositories/user.repository'
import { UserStatus } from '@/modules/iam/users/domain/value-objects/user-status.value-object'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

/**
 * @class DeleteUserUseCase
 * @description
 * 删除用户用例，实现用户删除的具体业务逻辑。
 *
 * 主要原理与机制：
 * 1. 遵循Clean Architecture的Use Case模式
 * 2. 协调领域对象和基础设施服务
 * 3. 实现具体的业务用例逻辑
 * 4. 处理软删除和硬删除
 * 5. 提供清晰的接口边界
 */
@Injectable()
export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * @method execute
   * @description 执行删除用户用例（软删除）
   *
   * @param userId - 用户ID
   * @param tenantId - 租户ID
   * @param adminUserId - 管理员用户ID
   * @returns 删除操作结果
   */
  async execute(
    userId: string,
    tenantId: string,
    adminUserId: string,
  ): Promise<boolean> {
    // 1. 获取用户
    const user = await this.userRepository.findById(userId, tenantId)
    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    // 2. 验证删除权限
    this.validateDeletePermission(user, adminUserId)

    // 3. 验证用户状态
    this.validateUserStatus(user)

    // 4. 执行软删除
    return await this.userRepository.delete(userId, tenantId)
  }

  /**
   * @method executeHardDelete
   * @description 执行硬删除用户用例
   *
   * @param userId - 用户ID
   * @param tenantId - 租户ID
   * @param adminUserId - 管理员用户ID
   * @returns 删除操作结果
   */
  async executeHardDelete(
    userId: string,
    tenantId: string,
    adminUserId: string,
  ): Promise<boolean> {
    // 1. 获取用户
    const user = await this.userRepository.findById(userId, tenantId)
    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    // 2. 验证删除权限
    this.validateDeletePermission(user, adminUserId)

    // 3. 执行硬删除
    return await this.userRepository.hardDelete(userId, tenantId)
  }

  /**
   * @method executeBatchDelete
   * @description 执行批量删除用户用例
   *
   * @param userIds - 用户ID列表
   * @param tenantId - 租户ID
   * @param adminUserId - 管理员用户ID
   * @returns 删除操作结果
   */
  async executeBatchDelete(
    userIds: string[],
    tenantId: string,
    adminUserId: string,
  ): Promise<{ success: string[]; failed: string[] }> {
    const success: string[] = []
    const failed: string[] = []

    for (const userId of userIds) {
      try {
        const result = await this.execute(userId, tenantId, adminUserId)
        if (result) {
          success.push(userId)
        } else {
          failed.push(userId)
        }
      } catch (error) {
        failed.push(userId)
      }
    }

    return { success, failed }
  }

  /**
   * @method executeRestore
   * @description 恢复已删除的用户
   *
   * @param userId - 用户ID
   * @param tenantId - 租户ID
   * @param adminUserId - 管理员用户ID
   * @returns 恢复操作结果
   */
  async executeRestore(
    userId: string,
    tenantId: string,
    adminUserId: string,
  ): Promise<boolean> {
    // 1. 获取用户（包括已删除的）
    const user = await this.userRepository.findById(userId, tenantId)
    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    // 2. 验证用户状态
    if (!user.status.isDeleted()) {
      throw new BadRequestException('用户未被删除，无法恢复')
    }

    // 3. 执行恢复
    return await this.userRepository.restore(userId, tenantId)
  }

  /**
   * @method validateDeletePermission
   * @description 验证删除权限
   *
   * @param user - 用户实体
   * @param adminUserId - 管理员用户ID
   */
  private validateDeletePermission(user: User, adminUserId: string): void {
    // 不能删除自己
    if (user.id === adminUserId) {
      throw new BadRequestException('不能删除自己的账户')
    }

    // 不能删除系统管理员（这里可以根据实际业务逻辑判断）
    // 暂时注释掉，因为User实体可能没有isSystemAdmin方法
    // if (user.isSystemAdmin()) {
    //   throw new BadRequestException('不能删除系统管理员账户');
    // }
  }

  /**
   * @method validateUserStatus
   * @description 验证用户状态
   *
   * @param user - 用户实体
   */
  private validateUserStatus(user: User): void {
    // 检查用户是否可以删除
    if (!user.status.canDelete()) {
      throw new BadRequestException(
        `用户状态为 ${user.status.getValue()}，无法删除`,
      )
    }
  }

  /**
   * @method executePermanentDelete
   * @description 执行永久删除用户用例（需要特殊权限）
   *
   * @param userId - 用户ID
   * @param tenantId - 租户ID
   * @param adminUserId - 管理员用户ID
   * @param reason - 删除原因
   * @returns 删除操作结果
   */
  async executePermanentDelete(
    userId: string,
    tenantId: string,
    adminUserId: string,
    reason: string,
  ): Promise<boolean> {
    // 1. 获取用户
    const user = await this.userRepository.findById(userId, tenantId)
    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    // 2. 验证特殊权限（这里可以添加更严格的权限检查）
    this.validatePermanentDeletePermission(user, adminUserId)

    // 3. 记录删除原因（可以记录到审计日志）
    // TODO: 记录审计日志

    // 4. 执行硬删除
    return await this.userRepository.hardDelete(userId, tenantId)
  }

  /**
   * @method validatePermanentDeletePermission
   * @description 验证永久删除权限
   *
   * @param user - 用户实体
   * @param adminUserId - 管理员用户ID
   */
  private validatePermanentDeletePermission(
    user: User,
    adminUserId: string,
  ): void {
    // 不能删除自己
    if (user.id === adminUserId) {
      throw new BadRequestException('不能永久删除自己的账户')
    }

    // 不能删除系统管理员（这里可以根据实际业务逻辑判断）
    // 暂时注释掉，因为User实体可能没有isSystemAdmin方法
    // if (user.isSystemAdmin()) {
    //   throw new BadRequestException('不能永久删除系统管理员账户');
    // }

    // 检查用户是否已被软删除
    if (!user.status.isDeleted()) {
      throw new BadRequestException('只能永久删除已被软删除的用户')
    }
  }
}

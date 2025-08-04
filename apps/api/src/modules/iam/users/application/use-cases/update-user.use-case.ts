import type { User } from '@/modules/iam/users/domain/entities/user.entity'
import type { UserRepository } from '@/modules/iam/users/domain/repositories/user.repository'
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

/**
 * @class UpdateUserUseCase
 * @description
 * 更新用户用例，实现用户信息更新的具体业务逻辑。
 *
 * 主要原理与机制：
 * 1. 遵循Clean Architecture的Use Case模式
 * 2. 协调领域对象和基础设施服务
 * 3. 实现具体的业务用例逻辑
 * 4. 处理业务规则验证和冲突检测
 * 5. 提供清晰的接口边界
 */
@Injectable()
export class UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * @method execute
   * @description 执行更新用户用例
   *
   * @param userId - 用户ID
   * @param updateData - 更新数据
   * @param tenantId - 租户ID
   * @returns 更新后的用户实体
   */
  async execute(
    userId: string,
    updateData: {
      firstName?: string
      lastName?: string
      phone?: string
      displayName?: string
      avatar?: string
      organizationIds?: string[]
      roleIds?: string[]
      preferences?: Record<string, any>
    },
    tenantId: string,
  ): Promise<User> {
    // 1. 获取现有用户
    const existingUser = await this.userRepository.findById(userId, tenantId)
    if (!existingUser) {
      throw new NotFoundException('用户不存在')
    }

    // 2. 验证业务规则
    await this.validateBusinessRules(updateData, existingUser, tenantId)

    // 3. 更新用户信息
    this.updateUserFields(existingUser, updateData)

    // 4. 保存到仓储
    return await this.userRepository.save(existingUser)
  }

  /**
   * @method validateBusinessRules
   * @description 验证业务规则
   *
   * @param updateData - 更新数据
   * @param existingUser - 现有用户
   * @param tenantId - 租户ID
   */
  private async validateBusinessRules(
    updateData: any,
    existingUser: User,
    tenantId: string,
  ): Promise<void> {
    // 验证手机号是否已被其他用户使用（如果更新手机号）
    if (updateData.phone && updateData.phone !== existingUser.phone) {
      if (
        await this.userRepository.existsByPhoneString(
          updateData.phone,
          tenantId,
          existingUser.id,
        )
      ) {
        throw new ConflictException('手机号已被其他用户使用')
      }
    }
  }

  /**
   * @method updateUserFields
   * @description 更新用户字段
   *
   * @param user - 用户实体
   * @param updateData - 更新数据
   */
  private updateUserFields(user: User, updateData: any): void {
    // 更新基本信息
    if (
      updateData.firstName !== undefined ||
      updateData.lastName !== undefined ||
      updateData.displayName !== undefined ||
      updateData.avatar !== undefined
    ) {
      user.updateInfo(
        updateData.firstName ?? user.firstName,
        updateData.lastName ?? user.lastName,
        updateData.displayName,
        updateData.avatar,
      )
    }

    // 更新联系信息
    if (updateData.phone !== undefined) {
      user.updateContactInfo(user.email.getValue(), updateData.phone)
    }

    // 更新组织列表
    if (updateData.organizationIds !== undefined) {
      // 先移除所有组织，然后添加新的
      user.removeFromOrganization()
      updateData.organizationIds.forEach((orgId: string) => {
        user.assignToOrganization(orgId)
      })
    }

    // 更新角色列表
    if (updateData.roleIds !== undefined) {
      // 先移除所有角色，然后添加新的
      user.removeRole()
      updateData.roleIds.forEach((roleId: string) => {
        user.assignRole(roleId)
      })
    }

    // 更新偏好设置
    if (updateData.preferences !== undefined) {
      user.updatePreferences(updateData.preferences)
    }
  }

  /**
   * @method executePartialUpdate
   * @description 执行部分更新用户用例
   *
   * @param userId - 用户ID
   * @param field - 要更新的字段
   * @param value - 新值
   * @param tenantId - 租户ID
   * @returns 更新后的用户实体
   */
  async executePartialUpdate(
    userId: string,
    field: 'firstName' | 'lastName' | 'phone' | 'displayName' | 'avatar',
    value: string,
    tenantId: string,
  ): Promise<User> {
    const user = await this.userRepository.findById(userId, tenantId)
    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    // 验证业务规则
    if (field === 'phone') {
      await this.validateBusinessRules({ phone: value }, user, tenantId)
    }

    // 更新特定字段
    switch (field) {
      case 'firstName':
        user.updateInfo(value, user.lastName, user.displayName, user.avatar)
        break
      case 'lastName':
        user.updateInfo(user.firstName, value, user.displayName, user.avatar)
        break
      case 'phone':
        user.updateContactInfo(user.email.getValue(), value)
        break
      case 'displayName':
        user.updateInfo(user.firstName, user.lastName, value, user.avatar)
        break
      case 'avatar':
        user.updateInfo(user.firstName, user.lastName, user.displayName, value)
        break
    }

    return await this.userRepository.save(user)
  }
}

import { User } from '@/modules/iam/users/domain/entities/user.entity'
import type { UserRepository } from '@/modules/iam/users/domain/repositories/user.repository'
import { generateUuid } from '@/shared/domain/utils/uuid.util'
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common'

/**
 * @class CreateUserUseCase
 * @description
 * 创建用户用例，实现用户创建的具体业务逻辑。
 *
 * 主要原理与机制：
 * 1. 遵循Clean Architecture的Use Case模式
 * 2. 协调领域对象和基础设施服务
 * 3. 实现具体的业务用例逻辑
 * 4. 处理业务规则验证
 * 5. 提供清晰的接口边界
 */
@Injectable()
export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * @method execute
   * @description 执行创建用户用例
   *
   * @param createUserData - 创建用户数据
   * @param tenantId - 租户ID
   * @param adminUserId - 管理员用户ID
   * @returns 创建的用户实体
   */
  async execute(
    createUserData: {
      username: string
      email: string
      firstName: string
      lastName: string
      passwordHash: string
      phone?: string
      displayName?: string
      avatar?: string
      organizationIds?: string[]
      roleIds?: string[]
      preferences?: Record<string, any>
    },
    tenantId: string,
    adminUserId: string,
  ): Promise<User> {
    // 1. 验证业务规则
    await this.validateBusinessRules(createUserData, tenantId)

    // 2. 创建用户实体
    const user = this.createUserEntity(createUserData, tenantId, adminUserId)

    // 3. 保存到仓储
    return await this.userRepository.save(user)
  }

  /**
   * @method validateBusinessRules
   * @description 验证业务规则
   *
   * @param createUserData - 创建用户数据
   * @param tenantId - 租户ID
   */
  private async validateBusinessRules(
    createUserData: any,
    tenantId: string,
  ): Promise<void> {
    // 验证用户名是否已存在
    if (
      await this.userRepository.existsByUsernameString(
        createUserData.username,
        tenantId,
      )
    ) {
      throw new ConflictException('用户名已存在')
    }

    // 验证邮箱是否已存在
    if (
      await this.userRepository.existsByEmailString(
        createUserData.email,
        tenantId,
      )
    ) {
      throw new ConflictException('邮箱已存在')
    }

    // 验证手机号是否已存在（如果提供）
    if (
      createUserData.phone &&
      (await this.userRepository.existsByPhoneString(
        createUserData.phone,
        tenantId,
      ))
    ) {
      throw new ConflictException('手机号已存在')
    }
  }

  /**
   * @method createUserEntity
   * @description 创建用户实体
   *
   * @param createUserData - 创建用户数据
   * @param tenantId - 租户ID
   * @param adminUserId - 管理员用户ID
   * @returns 用户实体
   */
  private createUserEntity(
    createUserData: any,
    tenantId: string,
    adminUserId: string,
  ): User {
    const userId = generateUuid()

    return new User(
      userId,
      createUserData.username,
      createUserData.email,
      createUserData.firstName,
      createUserData.lastName,
      tenantId,
      adminUserId,
      createUserData.passwordHash,
      createUserData.phone,
      createUserData.displayName,
      createUserData.avatar,
      createUserData.organizationIds,
      createUserData.roleIds,
      createUserData.preferences,
    )
  }
}

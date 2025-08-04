import type { User } from '@/modules/iam/users/domain/entities/user.entity'
import type { UserRepository } from '@/modules/iam/users/domain/repositories/user.repository'
import { Injectable, NotFoundException } from '@nestjs/common'

/**
 * @class GetUserUseCase
 * @description
 * 获取用户用例，实现用户查询的具体业务逻辑。
 *
 * 主要原理与机制：
 * 1. 遵循Clean Architecture的Use Case模式
 * 2. 协调领域对象和基础设施服务
 * 3. 实现具体的业务用例逻辑
 * 4. 处理用户查询和缓存
 * 5. 提供清晰的接口边界
 */
@Injectable()
export class GetUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * @method execute
   * @description 执行获取用户用例
   *
   * @param userId - 用户ID
   * @param tenantId - 租户ID
   * @returns 用户实体
   */
  async execute(userId: string, tenantId: string): Promise<User> {
    const user = await this.userRepository.findById(userId, tenantId)
    if (!user) {
      throw new NotFoundException('用户不存在')
    }
    return user
  }

  /**
   * @method executeByUsername
   * @description 根据用户名获取用户
   *
   * @param username - 用户名
   * @param tenantId - 租户ID
   * @returns 用户实体
   */
  async executeByUsername(username: string, tenantId: string): Promise<User> {
    const user = await this.userRepository.findByUsernameString(
      username,
      tenantId,
    )
    if (!user) {
      throw new NotFoundException('用户不存在')
    }
    return user
  }

  /**
   * @method executeByEmail
   * @description 根据邮箱获取用户
   *
   * @param email - 邮箱
   * @param tenantId - 租户ID
   * @returns 用户实体
   */
  async executeByEmail(email: string, tenantId: string): Promise<User> {
    const user = await this.userRepository.findByEmailString(email, tenantId)
    if (!user) {
      throw new NotFoundException('用户不存在')
    }
    return user
  }
}

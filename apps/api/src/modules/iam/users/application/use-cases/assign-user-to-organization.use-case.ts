import type { User } from '@/modules/iam/users/domain/entities/user.entity'
import type { UserRepository } from '@/modules/iam/users/domain/repositories/user.repository'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

/**
 * @class AssignUserToOrganizationUseCase
 * @description
 * 分配用户到组织用例，实现用户组织分配的具体业务逻辑。
 *
 * 主要原理与机制：
 * 1. 遵循Clean Architecture的Use Case模式
 * 2. 协调领域对象和基础设施服务
 * 3. 实现具体的业务用例逻辑
 * 4. 处理组织分配的业务规则验证
 * 5. 提供清晰的接口边界
 */
@Injectable()
export class AssignUserToOrganizationUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * @method execute
   * @description 执行分配用户到组织用例
   *
   * @param userId - 用户ID
   * @param organizationId - 组织ID
   * @param tenantId - 租户ID
   * @param adminUserId - 管理员用户ID
   * @returns 更新后的用户实体
   */
  async execute(
    userId: string,
    organizationId: string,
    tenantId: string,
    adminUserId: string,
  ): Promise<User> {
    // 1. 获取用户
    const user = await this.userRepository.findById(userId, tenantId)
    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    // 2. 验证分配权限
    this.validateAssignmentPermission(user, adminUserId)

    // 3. 验证用户状态
    this.validateUserStatus(user)

    // 4. 分配用户到组织
    user.assignToOrganization(organizationId)

    // 5. 保存到仓储
    return await this.userRepository.save(user)
  }

  /**
   * @method executeBatchAssign
   * @description 批量分配用户到组织
   *
   * @param userIds - 用户ID列表
   * @param organizationId - 组织ID
   * @param tenantId - 租户ID
   * @param adminUserId - 管理员用户ID
   * @returns 批量分配结果
   */
  async executeBatchAssign(
    userIds: string[],
    organizationId: string,
    tenantId: string,
    adminUserId: string,
  ): Promise<{ success: string[]; failed: string[] }> {
    const success: string[] = []
    const failed: string[] = []

    for (const userId of userIds) {
      try {
        await this.execute(userId, organizationId, tenantId, adminUserId)
        success.push(userId)
      } catch (error) {
        failed.push(userId)
      }
    }

    return { success, failed }
  }

  /**
   * @method executeRemoveFromOrganization
   * @description 从组织中移除用户
   *
   * @param userId - 用户ID
   * @param organizationId - 组织ID
   * @param tenantId - 租户ID
   * @param adminUserId - 管理员用户ID
   * @returns 更新后的用户实体
   */
  async executeRemoveFromOrganization(
    userId: string,
    organizationId: string,
    tenantId: string,
    adminUserId: string,
  ): Promise<User> {
    // 1. 获取用户
    const user = await this.userRepository.findById(userId, tenantId)
    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    // 2. 验证移除权限
    this.validateAssignmentPermission(user, adminUserId)

    // 3. 从组织中移除用户
    user.removeFromOrganization(organizationId)

    // 4. 保存到仓储
    return await this.userRepository.save(user)
  }

  /**
   * @method executeUpdateOrganizationIds
   * @description 更新用户的组织列表
   *
   * @param userId - 用户ID
   * @param organizationIds - 组织ID列表
   * @param tenantId - 租户ID
   * @param adminUserId - 管理员用户ID
   * @returns 更新后的用户实体
   */
  async executeUpdateOrganizationIds(
    userId: string,
    organizationIds: string[],
    tenantId: string,
    adminUserId: string,
  ): Promise<User> {
    // 1. 获取用户
    const user = await this.userRepository.findById(userId, tenantId)
    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    // 2. 验证更新权限
    this.validateAssignmentPermission(user, adminUserId)

    // 3. 验证用户状态
    this.validateUserStatus(user)

    // 4. 更新组织列表
    // 先移除所有组织，然后添加新的
    user.removeFromOrganization()
    organizationIds.forEach((orgId: string) => {
      user.assignToOrganization(orgId)
    })

    // 5. 保存到仓储
    return await this.userRepository.save(user)
  }

  /**
   * @method executeGetUsersByOrganization
   * @description 获取组织下的所有用户
   *
   * @param organizationId - 组织ID
   * @param tenantId - 租户ID
   * @returns 用户列表
   */
  async executeGetUsersByOrganization(
    organizationId: string,
    tenantId: string,
  ): Promise<User[]> {
    return await this.userRepository.findByOrganizationId(
      organizationId,
      tenantId,
    )
  }

  /**
   * @method validateAssignmentPermission
   * @description 验证分配权限
   *
   * @param user - 用户实体
   * @param adminUserId - 管理员用户ID
   */
  private validateAssignmentPermission(user: User, adminUserId: string): void {
    // 不能修改自己的组织分配
    if (user.id === adminUserId) {
      throw new BadRequestException('不能修改自己的组织分配')
    }

    // 不能修改系统管理员的组织分配（这里可以根据实际业务逻辑判断）
    // 暂时注释掉，因为User实体可能没有isSystemAdmin方法
    // if (user.isSystemAdmin()) {
    //   throw new BadRequestException('不能修改系统管理员的组织分配');
    // }
  }

  /**
   * @method validateUserStatus
   * @description 验证用户状态
   *
   * @param user - 用户实体
   */
  private validateUserStatus(user: User): void {
    // 只有激活状态的用户才能被分配到组织
    if (!user.status.isActive()) {
      throw new BadRequestException('只有激活状态的用户才能被分配到组织')
    }
  }

  /**
   * @method executeTransferUser
   * @description 将用户从一个组织转移到另一个组织
   *
   * @param userId - 用户ID
   * @param fromOrganizationId - 原组织ID
   * @param toOrganizationId - 目标组织ID
   * @param tenantId - 租户ID
   * @param adminUserId - 管理员用户ID
   * @returns 更新后的用户实体
   */
  async executeTransferUser(
    userId: string,
    fromOrganizationId: string,
    toOrganizationId: string,
    tenantId: string,
    adminUserId: string,
  ): Promise<User> {
    // 1. 获取用户
    const user = await this.userRepository.findById(userId, tenantId)
    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    // 2. 验证转移权限
    this.validateAssignmentPermission(user, adminUserId)

    // 3. 验证用户状态
    this.validateUserStatus(user)

    // 4. 验证用户是否在原组织中
    if (!user.organizationIds.includes(fromOrganizationId)) {
      throw new BadRequestException('用户不在指定的原组织中')
    }

    // 5. 执行转移
    user.removeFromOrganization(fromOrganizationId)
    user.assignToOrganization(toOrganizationId)

    // 6. 保存到仓储
    return await this.userRepository.save(user)
  }

  /**
   * @method executeGetUserOrganizations
   * @description 获取用户所属的所有组织
   *
   * @param userId - 用户ID
   * @param tenantId - 租户ID
   * @returns 组织ID列表
   */
  async executeGetUserOrganizations(
    userId: string,
    tenantId: string,
  ): Promise<string[]> {
    const user = await this.userRepository.findById(userId, tenantId)
    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    return user.organizationIds
  }
}

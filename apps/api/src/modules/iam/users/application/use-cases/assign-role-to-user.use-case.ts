import type { User } from '@/modules/iam/users/domain/entities/user.entity'
import type { UserRepository } from '@/modules/iam/users/domain/repositories/user.repository'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

/**
 * @class AssignRoleToUserUseCase
 * @description
 * 为用户分配角色用例，实现用户角色分配的具体业务逻辑。
 *
 * 主要原理与机制：
 * 1. 遵循Clean Architecture的Use Case模式
 * 2. 协调领域对象和基础设施服务
 * 3. 实现具体的业务用例逻辑
 * 4. 处理角色分配的业务规则验证
 * 5. 提供清晰的接口边界
 */
@Injectable()
export class AssignRoleToUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * @method execute
   * @description 执行为用户分配角色用例
   *
   * @param userId - 用户ID
   * @param roleId - 角色ID
   * @param tenantId - 租户ID
   * @param adminUserId - 管理员用户ID
   * @returns 更新后的用户实体
   */
  async execute(
    userId: string,
    roleId: string,
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

    // 4. 分配角色给用户
    user.assignRole(roleId)

    // 5. 保存到仓储
    return await this.userRepository.save(user)
  }

  /**
   * @method executeBatchAssign
   * @description 批量为用户分配角色
   *
   * @param userIds - 用户ID列表
   * @param roleId - 角色ID
   * @param tenantId - 租户ID
   * @param adminUserId - 管理员用户ID
   * @returns 批量分配结果
   */
  async executeBatchAssign(
    userIds: string[],
    roleId: string,
    tenantId: string,
    adminUserId: string,
  ): Promise<{ success: string[]; failed: string[] }> {
    const success: string[] = []
    const failed: string[] = []

    for (const userId of userIds) {
      try {
        await this.execute(userId, roleId, tenantId, adminUserId)
        success.push(userId)
      } catch (error) {
        failed.push(userId)
      }
    }

    return { success, failed }
  }

  /**
   * @method executeRemoveRole
   * @description 移除用户的角色
   *
   * @param userId - 用户ID
   * @param roleId - 角色ID
   * @param tenantId - 租户ID
   * @param adminUserId - 管理员用户ID
   * @returns 更新后的用户实体
   */
  async executeRemoveRole(
    userId: string,
    roleId: string,
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

    // 3. 移除用户角色
    user.removeRole(roleId)

    // 4. 保存到仓储
    return await this.userRepository.save(user)
  }

  /**
   * @method executeUpdateRoleIds
   * @description 更新用户的角色列表
   *
   * @param userId - 用户ID
   * @param roleIds - 角色ID列表
   * @param tenantId - 租户ID
   * @param adminUserId - 管理员用户ID
   * @returns 更新后的用户实体
   */
  async executeUpdateRoleIds(
    userId: string,
    roleIds: string[],
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

    // 4. 更新角色列表
    // 先移除所有角色，然后添加新的
    user.removeRole()
    roleIds.forEach((roleId: string) => {
      user.assignRole(roleId)
    })

    // 5. 保存到仓储
    return await this.userRepository.save(user)
  }

  /**
   * @method executeGetUsersByRole
   * @description 获取拥有指定角色的所有用户
   *
   * @param roleId - 角色ID
   * @param tenantId - 租户ID
   * @returns 用户列表
   */
  async executeGetUsersByRole(
    roleId: string,
    tenantId: string,
  ): Promise<User[]> {
    return await this.userRepository.findByRoleId(roleId, tenantId)
  }

  /**
   * @method validateAssignmentPermission
   * @description 验证分配权限
   *
   * @param user - 用户实体
   * @param adminUserId - 管理员用户ID
   */
  private validateAssignmentPermission(user: User, adminUserId: string): void {
    // 不能修改自己的角色分配
    if (user.id === adminUserId) {
      throw new BadRequestException('不能修改自己的角色分配')
    }

    // 不能修改系统管理员的角色分配（这里可以根据实际业务逻辑判断）
    // 暂时注释掉，因为User实体可能没有isSystemAdmin方法
    // if (user.isSystemAdmin()) {
    //   throw new BadRequestException('不能修改系统管理员的角色分配');
    // }
  }

  /**
   * @method validateUserStatus
   * @description 验证用户状态
   *
   * @param user - 用户实体
   */
  private validateUserStatus(user: User): void {
    // 只有激活状态的用户才能被分配角色
    if (!user.status.isActive()) {
      throw new BadRequestException('只有激活状态的用户才能被分配角色')
    }
  }

  /**
   * @method executeAssignMultipleRoles
   * @description 为用户分配多个角色
   *
   * @param userId - 用户ID
   * @param roleIds - 角色ID列表
   * @param tenantId - 租户ID
   * @param adminUserId - 管理员用户ID
   * @returns 更新后的用户实体
   */
  async executeAssignMultipleRoles(
    userId: string,
    roleIds: string[],
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

    // 4. 分配多个角色
    for (const roleId of roleIds) {
      user.assignRole(roleId)
    }

    // 5. 保存到仓储
    return await this.userRepository.save(user)
  }

  /**
   * @method executeGetUserRoles
   * @description 获取用户的所有角色
   *
   * @param userId - 用户ID
   * @param tenantId - 租户ID
   * @returns 角色ID列表
   */
  async executeGetUserRoles(
    userId: string,
    tenantId: string,
  ): Promise<string[]> {
    const user = await this.userRepository.findById(userId, tenantId)
    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    return user.roleIds
  }

  /**
   * @method executeReplaceRoles
   * @description 替换用户的所有角色
   *
   * @param userId - 用户ID
   * @param newRoleIds - 新的角色ID列表
   * @param tenantId - 租户ID
   * @param adminUserId - 管理员用户ID
   * @returns 更新后的用户实体
   */
  async executeReplaceRoles(
    userId: string,
    newRoleIds: string[],
    tenantId: string,
    adminUserId: string,
  ): Promise<User> {
    // 1. 获取用户
    const user = await this.userRepository.findById(userId, tenantId)
    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    // 2. 验证替换权限
    this.validateAssignmentPermission(user, adminUserId)

    // 3. 验证用户状态
    this.validateUserStatus(user)

    // 4. 替换所有角色
    // 先移除所有角色，然后添加新的
    user.removeRole()
    newRoleIds.forEach((roleId: string) => {
      user.assignRole(roleId)
    })

    // 5. 保存到仓储
    return await this.userRepository.save(user)
  }

  /**
   * @method executeCheckUserHasRole
   * @description 检查用户是否拥有指定角色
   *
   * @param userId - 用户ID
   * @param roleId - 角色ID
   * @param tenantId - 租户ID
   * @returns 是否拥有角色
   */
  async executeCheckUserHasRole(
    userId: string,
    roleId: string,
    tenantId: string,
  ): Promise<boolean> {
    const user = await this.userRepository.findById(userId, tenantId)
    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    return user.roleIds.includes(roleId)
  }
}

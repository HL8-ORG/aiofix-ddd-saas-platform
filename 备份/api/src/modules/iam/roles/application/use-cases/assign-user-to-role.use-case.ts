import type { Role } from '@/modules/iam/roles/domain/entities/role.entity'
import type { RoleRepository } from '@/modules/iam/roles/domain/repositories/role.repository'
import type { RoleCacheService } from '@/modules/iam/roles/infrastructure/cache/role-cache.service'
import type { RoleNotificationService } from '@/modules/iam/roles/infrastructure/external/role-notification.service'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

/**
 * @class AssignUserToRoleUseCase
 * @description
 * 分配用户到角色用例，实现用户角色分配的具体业务逻辑。
 *
 * 主要原理与机制：
 * 1. 遵循Clean Architecture的Use Case模式
 * 2. 协调领域对象和基础设施服务
 * 3. 实现具体的业务用例逻辑
 * 4. 处理业务规则和验证
 * 5. 管理事务和副作用
 * 6. 提供清晰的接口边界
 */
@Injectable()
export class AssignUserToRoleUseCase {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly notificationService: RoleNotificationService,
    private readonly cacheService: RoleCacheService,
  ) {}

  /**
   * @method execute
   * @description 执行分配用户到角色用例
   *
   * @param roleId - 角色ID
   * @param userId - 用户ID
   * @param tenantId - 租户ID
   * @param adminUserId - 管理员用户ID
   * @returns 更新后的角色实体
   */
  async execute(
    roleId: string,
    userId: string,
    tenantId: string,
    adminUserId: string,
  ): Promise<Role> {
    // 1. 获取角色
    const role = await this.roleRepository.findById(roleId, tenantId)
    if (!role) {
      throw new NotFoundException(`角色 ${roleId} 不存在`)
    }

    // 2. 业务规则验证
    await this.validateAssignmentRules(role, userId)

    // 3. 分配用户
    role.assignUser(userId)

    // 4. 持久化角色
    await this.roleRepository.save(role)

    // 5. 缓存更新
    await this.cacheService.set(tenantId, role)

    // 6. 发送通知
    await this.notificationService.notifyUserAssignedToRole(
      role,
      userId,
      adminUserId,
    )

    // 7. 返回更新后的角色
    return role
  }

  /**
   * @method validateAssignmentRules
   * @description 验证分配业务规则
   *
   * @param role - 角色实体
   * @param userId - 用户ID
   */
  private async validateAssignmentRules(
    role: Role,
    userId: string,
  ): Promise<void> {
    // 检查角色状态
    if (!role.canAssignToUser()) {
      throw new BadRequestException('角色当前状态无法分配给用户')
    }

    // 检查用户是否已经在角色中
    if (role.userIds.includes(userId)) {
      throw new BadRequestException('用户已经在该角色中')
    }

    // 检查最大用户数限制
    if (role.maxUsers && role.userIds.length >= role.maxUsers) {
      throw new BadRequestException('角色已达到最大用户数限制')
    }

    // 检查角色是否过期
    if (role.expiresAt && role.expiresAt < new Date()) {
      throw new BadRequestException('角色已过期，无法分配用户')
    }
  }
}

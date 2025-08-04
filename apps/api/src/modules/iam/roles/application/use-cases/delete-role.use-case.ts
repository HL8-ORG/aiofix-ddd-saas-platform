import type { Role } from '@/modules/iam/roles/domain/entities/role.entity'
import type { RoleRepository } from '@/modules/iam/roles/domain/repositories/role.repository'
import type { RoleCacheService } from '@/modules/iam/roles/infrastructure/cache/role-cache.service'
import type { RoleNotificationService } from '@/modules/iam/roles/infrastructure/external/role-notification.service'
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

/**
 * @class DeleteRoleUseCase
 * @description
 * 删除角色用例，实现角色删除的具体业务逻辑。
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
export class DeleteRoleUseCase {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly notificationService: RoleNotificationService,
    private readonly cacheService: RoleCacheService,
  ) {}

  /**
   * @method execute
   * @description 执行删除角色用例
   *
   * @param id - 角色ID
   * @param tenantId - 租户ID
   * @param adminUserId - 管理员用户ID
   */
  async execute(
    id: string,
    tenantId: string,
    adminUserId: string,
  ): Promise<void> {
    // 1. 获取角色
    const role = await this.roleRepository.findById(id, tenantId)
    if (!role) {
      throw new NotFoundException(`角色 ${id} 不存在`)
    }

    // 2. 业务规则验证
    await this.validateDeleteRules(role)

    // 3. 软删除角色
    role.markAsDeleted()

    // 4. 持久化角色
    await this.roleRepository.save(role)

    // 5. 删除缓存
    await this.cacheService.delete(tenantId, id)

    // 6. 发送通知
    await this.notificationService.notifyRoleDeleted(role, adminUserId)
  }

  /**
   * @method validateDeleteRules
   * @description 验证删除业务规则
   *
   * @param role - 角色实体
   */
  private async validateDeleteRules(role: Role): Promise<void> {
    // 检查是否为系统角色
    if (role.getIsSystemRole()) {
      throw new ForbiddenException('系统角色不可删除')
    }

    // 检查是否为默认角色
    if (role.getIsDefaultRole()) {
      throw new ForbiddenException('默认角色不可删除')
    }

    // 检查是否有用户使用该角色
    if (role.userIds.length > 0) {
      throw new ForbiddenException('该角色下还有用户，无法删除')
    }

    // 检查是否有子角色
    if (role.childRoleIds.length > 0) {
      throw new ForbiddenException('该角色下还有子角色，无法删除')
    }
  }
}

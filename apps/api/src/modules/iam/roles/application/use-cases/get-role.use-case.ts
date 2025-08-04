import type { Role } from '@/modules/iam/roles/domain/entities/role.entity'
import type { RoleRepository } from '@/modules/iam/roles/domain/repositories/role.repository'
import type { RoleCacheService } from '@/modules/iam/roles/infrastructure/cache/role-cache.service'
import { Injectable, NotFoundException } from '@nestjs/common'

/**
 * @class GetRoleUseCase
 * @description
 * 获取角色用例，实现角色查询的具体业务逻辑。
 *
 * 主要原理与机制：
 * 1. 遵循Clean Architecture的Use Case模式
 * 2. 协调领域对象和基础设施服务
 * 3. 实现具体的业务用例逻辑
 * 4. 处理缓存策略
 * 5. 提供清晰的接口边界
 */
@Injectable()
export class GetRoleUseCase {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly cacheService: RoleCacheService,
  ) {}

  /**
   * @method execute
   * @description 执行获取角色用例
   *
   * @param id - 角色ID
   * @param tenantId - 租户ID
   * @returns 角色实体
   */
  async execute(id: string, tenantId: string): Promise<Role> {
    // 1. 尝试从缓存获取
    const cachedRole = await this.cacheService.get(tenantId, id)
    if (cachedRole) {
      return cachedRole
    }

    // 2. 从数据库获取
    const role = await this.roleRepository.findById(id, tenantId)
    if (!role) {
      throw new NotFoundException(`角色 ${id} 不存在`)
    }

    // 3. 缓存角色数据
    await this.cacheService.set(tenantId, role)

    // 4. 返回角色
    return role
  }
}

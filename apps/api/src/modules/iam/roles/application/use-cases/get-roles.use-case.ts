import type { Role } from '@/modules/iam/roles/domain/entities/role.entity'
import type { RoleRepository } from '@/modules/iam/roles/domain/repositories/role.repository'
import { Injectable } from '@nestjs/common'
import type { QueryRoleDto } from '../dto/query-role.dto'

/**
 * @class GetRolesUseCase
 * @description
 * 获取角色列表用例，实现角色查询的具体业务逻辑。
 *
 * 主要原理与机制：
 * 1. 遵循Clean Architecture的Use Case模式
 * 2. 协调领域对象和基础设施服务
 * 3. 实现具体的业务用例逻辑
 * 4. 处理查询过滤和分页
 * 5. 提供清晰的接口边界
 */
@Injectable()
export class GetRolesUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  /**
   * @method execute
   * @description 执行获取角色列表用例
   *
   * @param queryDto - 查询DTO
   * @param tenantId - 租户ID
   * @returns 角色列表和总数
   */
  async execute(
    queryDto: QueryRoleDto,
    tenantId: string,
  ): Promise<{ roles: Role[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      status,
      isSystemRole,
      isDefaultRole,
      organizationId,
    } = queryDto

    // 根据查询条件获取角色
    let roles: Role[] = []

    if (status) {
      switch (status) {
        case 'ACTIVE':
          roles = await this.roleRepository.findActiveRoles(tenantId)
          break
        case 'SUSPENDED':
          roles = await this.roleRepository.findSuspendedRoles(tenantId)
          break
        case 'DELETED':
          roles = await this.roleRepository.findDeletedRoles(tenantId)
          break
        default:
          roles = await this.roleRepository.findByTenant(tenantId)
      }
    } else if (isSystemRole !== undefined) {
      if (isSystemRole) {
        roles = await this.roleRepository.findSystemRoles(tenantId)
      } else {
        // 获取非系统角色
        const allRoles = await this.roleRepository.findByTenant(tenantId)
        roles = allRoles.filter((role) => !role.getIsSystemRole())
      }
    } else if (isDefaultRole !== undefined) {
      if (isDefaultRole) {
        roles = await this.roleRepository.findDefaultRoles(tenantId)
      } else {
        // 获取非默认角色
        const allRoles = await this.roleRepository.findByTenant(tenantId)
        roles = allRoles.filter((role) => !role.getIsDefaultRole())
      }
    } else if (organizationId) {
      roles = await this.roleRepository.findByOrganization(
        organizationId,
        tenantId,
      )
    } else {
      roles = await this.roleRepository.findByTenant(tenantId)
    }

    // 确保roles是数组
    const safeRoles = roles || []

    // 计算总数
    const total = safeRoles.length

    // 分页处理
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedRoles = safeRoles.slice(startIndex, endIndex)

    return {
      roles: paginatedRoles,
      total,
    }
  }
}

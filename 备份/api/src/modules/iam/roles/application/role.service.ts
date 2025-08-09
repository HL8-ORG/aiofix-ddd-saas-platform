import { Inject, Injectable } from '@nestjs/common'
import type { Role } from '../domain/entities/role.entity'
import type { CreateRoleDto } from './dto/create-role.dto'
import type { QueryRoleDto } from './dto/query-role.dto'
import type { UpdateRoleDto } from './dto/update-role.dto'
import type {
  AssignUserToRoleUseCase,
  CreateRoleUseCase,
  DeleteRoleUseCase,
  GetRoleUseCase,
  GetRolesUseCase,
  UpdateRoleUseCase,
} from './use-cases'

/**
 * @class RoleService
 * @description
 * 角色服务协调器，协调各个Use Case完成业务功能。
 *
 * 主要原理与机制：
 * 1. 遵循Clean Architecture的协调器模式
 * 2. 协调各个Use Case的调用
 * 3. 提供统一的业务接口
 * 4. 处理跨Use Case的协调逻辑
 * 5. 维护业务流程的完整性
 */
@Injectable()
export class RoleService {
  constructor(
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly updateRoleUseCase: UpdateRoleUseCase,
    private readonly deleteRoleUseCase: DeleteRoleUseCase,
    private readonly getRoleUseCase: GetRoleUseCase,
    private readonly getRolesUseCase: GetRolesUseCase,
    private readonly assignUserToRoleUseCase: AssignUserToRoleUseCase,
  ) {}

  /**
   * @method createRole
   * @description 创建角色
   */
  async createRole(
    createRoleDto: CreateRoleDto,
    tenantId: string,
    adminUserId: string,
  ): Promise<Role> {
    return await this.createRoleUseCase.execute(
      createRoleDto,
      tenantId,
      adminUserId,
    )
  }

  /**
   * @method getRoleById
   * @description 根据ID获取角色
   */
  async getRoleById(id: string, tenantId: string): Promise<Role> {
    return await this.getRoleUseCase.execute(id, tenantId)
  }

  /**
   * @method getRoles
   * @description 获取角色列表
   */
  async getRoles(
    queryDto: QueryRoleDto,
    tenantId: string,
  ): Promise<{ roles: Role[]; total: number }> {
    return await this.getRolesUseCase.execute(queryDto, tenantId)
  }

  /**
   * @method updateRole
   * @description 更新角色
   */
  async updateRole(
    id: string,
    updateRoleDto: UpdateRoleDto,
    tenantId: string,
    adminUserId: string,
  ): Promise<Role> {
    return await this.updateRoleUseCase.execute(
      id,
      updateRoleDto,
      tenantId,
      adminUserId,
    )
  }

  /**
   * @method deleteRole
   * @description 删除角色（软删除）
   */
  async deleteRole(
    id: string,
    tenantId: string,
    adminUserId: string,
  ): Promise<void> {
    return await this.deleteRoleUseCase.execute(id, tenantId, adminUserId)
  }

  /**
   * @method assignUserToRole
   * @description 分配用户到角色
   */
  async assignUserToRole(
    roleId: string,
    userId: string,
    tenantId: string,
    adminUserId: string,
  ): Promise<Role> {
    return await this.assignUserToRoleUseCase.execute(
      roleId,
      userId,
      tenantId,
      adminUserId,
    )
  }
}

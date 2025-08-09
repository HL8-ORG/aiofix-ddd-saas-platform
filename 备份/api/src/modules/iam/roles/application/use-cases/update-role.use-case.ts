import type { Role } from '@/modules/iam/roles/domain/entities/role.entity'
import type { RoleRepository } from '@/modules/iam/roles/domain/repositories/role.repository'
import type { RoleCacheService } from '@/modules/iam/roles/infrastructure/cache/role-cache.service'
import type { RoleNotificationService } from '@/modules/iam/roles/infrastructure/external/role-notification.service'
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import type { UpdateRoleDto } from '../dto/update-role.dto'

/**
 * @class UpdateRoleUseCase
 * @description
 * 更新角色用例，实现角色更新的具体业务逻辑。
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
export class UpdateRoleUseCase {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly notificationService: RoleNotificationService,
    private readonly cacheService: RoleCacheService,
  ) {}

  /**
   * @method execute
   * @description 执行更新角色用例
   *
   * @param id - 角色ID
   * @param updateRoleDto - 更新角色DTO
   * @param tenantId - 租户ID
   * @param adminUserId - 管理员用户ID
   * @returns 更新后的角色实体
   */
  async execute(
    id: string,
    updateRoleDto: UpdateRoleDto,
    tenantId: string,
    adminUserId: string,
  ): Promise<Role> {
    // 1. 获取现有角色
    const existingRole = await this.roleRepository.findById(id, tenantId)
    if (!existingRole) {
      throw new NotFoundException(`角色 ${id} 不存在`)
    }

    // 2. 业务规则验证
    await this.validateUpdateRules(updateRoleDto, existingRole, tenantId)

    // 3. 记录变更
    const changes = this.recordChanges(updateRoleDto, existingRole)

    // 4. 更新角色
    this.updateRoleEntity(updateRoleDto, existingRole)

    // 5. 持久化角色
    await this.roleRepository.save(existingRole)

    // 6. 缓存更新
    await this.cacheService.set(tenantId, existingRole)

    // 7. 发送通知
    await this.notificationService.notifyRoleUpdated(
      existingRole,
      adminUserId,
      changes,
    )

    // 8. 返回更新后的角色
    return existingRole
  }

  /**
   * @method validateUpdateRules
   * @description 验证更新业务规则
   *
   * @param updateRoleDto - 更新角色DTO
   * @param existingRole - 现有角色
   * @param tenantId - 租户ID
   */
  private async validateUpdateRules(
    updateRoleDto: UpdateRoleDto,
    existingRole: Role,
    tenantId: string,
  ): Promise<void> {
    // 检查是否为系统角色
    if (
      existingRole.getIsSystemRole() &&
      updateRoleDto.isSystemRole === false
    ) {
      throw new ForbiddenException('系统角色不能修改为普通角色')
    }

    // 验证角色代码唯一性（如果更新代码）
    if (updateRoleDto.code && updateRoleDto.code !== existingRole.getCode()) {
      const existingRoleByCode = await this.roleRepository.findByCode(
        updateRoleDto.code,
        tenantId,
      )
      if (existingRoleByCode && existingRoleByCode.id !== existingRole.id) {
        throw new BadRequestException(`角色代码 ${updateRoleDto.code} 已存在`)
      }
    }

    // 验证角色名称唯一性（如果更新名称）
    if (updateRoleDto.name && updateRoleDto.name !== existingRole.getName()) {
      const existingRoleByName = await this.roleRepository.findByName(
        updateRoleDto.name,
        tenantId,
      )
      if (existingRoleByName && existingRoleByName.id !== existingRole.id) {
        throw new BadRequestException(`角色名称 ${updateRoleDto.name} 已存在`)
      }
    }

    // 验证优先级范围
    if (updateRoleDto.priority !== undefined) {
      if (updateRoleDto.priority < 1 || updateRoleDto.priority > 1000) {
        throw new BadRequestException('角色优先级必须在1-1000之间')
      }
    }

    // 验证最大用户数
    if (updateRoleDto.maxUsers !== undefined) {
      if (updateRoleDto.maxUsers < 1) {
        throw new BadRequestException('最大用户数必须大于0')
      }
    }
  }

  /**
   * @method recordChanges
   * @description 记录变更
   *
   * @param updateRoleDto - 更新角色DTO
   * @param existingRole - 现有角色
   * @returns 变更记录
   */
  private recordChanges(updateRoleDto: UpdateRoleDto, existingRole: Role): any {
    const changes: any = {}

    if (updateRoleDto.name && updateRoleDto.name !== existingRole.getName()) {
      changes.name = { from: existingRole.getName(), to: updateRoleDto.name }
    }

    if (updateRoleDto.code && updateRoleDto.code !== existingRole.getCode()) {
      changes.code = { from: existingRole.getCode(), to: updateRoleDto.code }
    }

    if (
      updateRoleDto.description !== undefined &&
      updateRoleDto.description !== existingRole.description
    ) {
      changes.description = {
        from: existingRole.description,
        to: updateRoleDto.description,
      }
    }

    if (
      updateRoleDto.priority !== undefined &&
      updateRoleDto.priority !== existingRole.getPriority()
    ) {
      changes.priority = {
        from: existingRole.getPriority(),
        to: updateRoleDto.priority,
      }
    }

    if (
      updateRoleDto.organizationId !== undefined &&
      updateRoleDto.organizationId !== existingRole.organizationId
    ) {
      changes.organizationId = {
        from: existingRole.organizationId,
        to: updateRoleDto.organizationId,
      }
    }

    if (
      updateRoleDto.maxUsers !== undefined &&
      updateRoleDto.maxUsers !== existingRole.maxUsers
    ) {
      changes.maxUsers = {
        from: existingRole.maxUsers,
        to: updateRoleDto.maxUsers,
      }
    }

    if (
      updateRoleDto.expiresAt !== undefined &&
      updateRoleDto.expiresAt !== existingRole.expiresAt
    ) {
      changes.expiresAt = {
        from: existingRole.expiresAt,
        to: updateRoleDto.expiresAt,
      }
    }

    if (
      updateRoleDto.parentRoleId !== undefined &&
      updateRoleDto.parentRoleId !== existingRole.parentRoleId
    ) {
      changes.parentRoleId = {
        from: existingRole.parentRoleId,
        to: updateRoleDto.parentRoleId,
      }
    }

    return changes
  }

  /**
   * @method updateRoleEntity
   * @description 更新角色实体
   *
   * @param updateRoleDto - 更新角色DTO
   * @param role - 角色实体
   */
  private updateRoleEntity(updateRoleDto: UpdateRoleDto, role: Role): void {
    // 更新角色信息
    if (
      updateRoleDto.name ||
      updateRoleDto.code ||
      updateRoleDto.description !== undefined ||
      updateRoleDto.priority !== undefined
    ) {
      role.updateInfo(
        updateRoleDto.name || role.getName(),
        updateRoleDto.code || role.getCode(),
        updateRoleDto.description,
        updateRoleDto.priority,
      )
    }

    // 更新其他属性
    if (updateRoleDto.organizationId !== undefined) {
      role.organizationId = updateRoleDto.organizationId
    }

    if (updateRoleDto.maxUsers !== undefined) {
      role.maxUsers = updateRoleDto.maxUsers
    }

    if (updateRoleDto.expiresAt !== undefined) {
      role.expiresAt = updateRoleDto.expiresAt
    }

    if (updateRoleDto.parentRoleId !== undefined) {
      if (updateRoleDto.parentRoleId) {
        role.setInheritance(updateRoleDto.parentRoleId)
      } else {
        role.removeInheritance()
      }
    }
  }
}

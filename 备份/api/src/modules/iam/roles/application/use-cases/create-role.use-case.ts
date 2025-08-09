import { Role } from '@/modules/iam/roles/domain/entities/role.entity'
import type { RoleRepository } from '@/modules/iam/roles/domain/repositories/role.repository'
import type { RoleCacheService } from '@/modules/iam/roles/infrastructure/cache/role-cache.service'
import type { RoleNotificationService } from '@/modules/iam/roles/infrastructure/external/role-notification.service'
import { generateUuid } from '@/shared/domain/utils/uuid.util'
import { BadRequestException, Injectable } from '@nestjs/common'
import type { CreateRoleDto } from '../dto/create-role.dto'

/**
 * @class CreateRoleUseCase
 * @description
 * 创建角色用例，实现角色创建的具体业务逻辑。
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
export class CreateRoleUseCase {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly notificationService: RoleNotificationService,
    private readonly cacheService: RoleCacheService,
  ) {}

  /**
   * @method execute
   * @description 执行创建角色用例
   *
   * @param createRoleDto - 创建角色DTO
   * @param tenantId - 租户ID
   * @param adminUserId - 管理员用户ID
   * @returns 创建的角色实体
   */
  async execute(
    createRoleDto: CreateRoleDto,
    tenantId: string,
    adminUserId: string,
  ): Promise<Role> {
    // 1. 业务规则验证
    await this.validateBusinessRules(createRoleDto, tenantId)

    // 2. 创建角色实体
    const role = this.createRoleEntity(createRoleDto, tenantId, adminUserId)

    // 3. 持久化角色
    await this.roleRepository.save(role)

    // 4. 缓存角色数据
    await this.cacheService.set(tenantId, role)

    // 5. 发送通知
    await this.notificationService.notifyRoleCreated(role, adminUserId)

    // 6. 返回创建的角色
    return role
  }

  /**
   * @method validateBusinessRules
   * @description 验证业务规则
   *
   * @param createRoleDto - 创建角色DTO
   * @param tenantId - 租户ID
   */
  private async validateBusinessRules(
    createRoleDto: CreateRoleDto,
    tenantId: string,
  ): Promise<void> {
    // 验证角色代码唯一性
    const existingRoleByCode = await this.roleRepository.findByCode(
      createRoleDto.code,
      tenantId,
    )
    if (existingRoleByCode) {
      throw new BadRequestException(`角色代码 ${createRoleDto.code} 已存在`)
    }

    // 验证角色名称唯一性
    const existingRoleByName = await this.roleRepository.findByName(
      createRoleDto.name,
      tenantId,
    )
    if (existingRoleByName) {
      throw new BadRequestException(`角色名称 ${createRoleDto.name} 已存在`)
    }

    // 验证优先级范围
    if (createRoleDto.priority) {
      if (createRoleDto.priority < 1 || createRoleDto.priority > 1000) {
        throw new BadRequestException('角色优先级必须在1-1000之间')
      }
    }

    // 验证最大用户数
    if (createRoleDto.maxUsers !== undefined) {
      if (createRoleDto.maxUsers < 1) {
        throw new BadRequestException('最大用户数必须大于0')
      }
    }
  }

  /**
   * @method createRoleEntity
   * @description 创建角色实体
   *
   * @param createRoleDto - 创建角色DTO
   * @param tenantId - 租户ID
   * @param adminUserId - 管理员用户ID
   * @returns 角色实体
   */
  private createRoleEntity(
    createRoleDto: CreateRoleDto,
    tenantId: string,
    adminUserId: string,
  ): Role {
    const roleId = generateUuid()

    const role = new Role(
      roleId,
      createRoleDto.name,
      createRoleDto.code,
      tenantId,
      adminUserId,
      createRoleDto.description,
      createRoleDto.organizationId,
      createRoleDto.priority,
      createRoleDto.isSystemRole,
      createRoleDto.isDefaultRole,
      createRoleDto.maxUsers,
      createRoleDto.expiresAt,
      createRoleDto.parentRoleId,
    )

    // 分配权限
    if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
      createRoleDto.permissionIds.forEach((permissionId) => {
        role.assignPermission(permissionId)
      })
    }

    // 分配用户
    if (createRoleDto.userIds && createRoleDto.userIds.length > 0) {
      createRoleDto.userIds.forEach((userId) => {
        role.assignUser(userId)
      })
    }

    return role
  }
}

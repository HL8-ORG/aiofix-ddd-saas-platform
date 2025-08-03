import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { Role } from '../domain/entities/role.entity';
import { RoleRepository } from '../domain/repositories/role.repository';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';
import { generateUuid } from '@/shared/domain/utils/uuid.util';

/**
 * @class RoleService
 * @description
 * 角色应用服务，实现角色管理的业务用例。
 * 
 * 主要原理与机制：
 * 1. 协调领域对象完成业务逻辑
 * 2. 处理事务边界和业务规则验证
 * 3. 提供应用层的数据转换和验证
 * 4. 处理多租户隔离
 */
@Injectable()
export class RoleService {
  constructor(
    @Inject('RoleRepository')
    private readonly roleRepository: RoleRepository
  ) { }

  /**
   * @method createRole
   * @description 创建角色
   */
  async createRole(createRoleDto: CreateRoleDto, tenantId: string, adminUserId: string): Promise<Role> {
    const {
      name,
      code,
      description,
      organizationId,
      priority = 100,
      isSystemRole = false,
      isDefaultRole = false,
      maxUsers,
      expiresAt,
      parentRoleId,
      permissionIds = [],
      userIds = [],
    } = createRoleDto;

    // 检查角色代码是否已存在
    const existingRole = await this.roleRepository.findByCode(code, tenantId);
    if (existingRole) {
      throw new BadRequestException(`角色代码 ${code} 已存在`);
    }

    // 创建角色实体
    const role = new Role(
      generateUuid(),
      name,
      code,
      tenantId,
      adminUserId,
      description,
      organizationId,
      priority,
      isSystemRole,
      isDefaultRole,
      maxUsers,
      expiresAt,
      parentRoleId
    );

    // 分配权限
    if (permissionIds.length > 0) {
      permissionIds.forEach(permissionId => {
        role.assignPermission(permissionId);
      });
    }

    // 分配用户
    if (userIds.length > 0) {
      userIds.forEach(userId => {
        role.assignUser(userId);
      });
    }

    // 保存角色
    await this.roleRepository.save(role);
    return role;
  }

  /**
   * @method getRoleById
   * @description 根据ID获取角色
   */
  async getRoleById(id: string, tenantId: string): Promise<Role> {
    const role = await this.roleRepository.findById(id, tenantId);
    if (!role) {
      throw new NotFoundException(`角色 ${id} 不存在`);
    }
    return role;
  }

  /**
   * @method getRoles
   * @description 获取角色列表
   */
  async getRoles(queryDto: QueryRoleDto, tenantId: string): Promise<{ roles: Role[]; total: number }> {
    const { page = 1, limit = 10, ...filters } = queryDto;
    const offset = (page - 1) * limit;

    const roles = await this.roleRepository.findByTenant(tenantId);
    const total = roles.length;

    return { roles, total };
  }

  /**
   * @method updateRole
   * @description 更新角色
   */
  async updateRole(id: string, updateRoleDto: UpdateRoleDto, tenantId: string): Promise<Role> {
    const role = await this.getRoleById(id, tenantId);

    // 检查是否为系统角色
    if (role.getIsSystemRole() && updateRoleDto.isSystemRole === false) {
      throw new ForbiddenException('系统角色不能修改为普通角色');
    }

    // 更新角色信息
    if (updateRoleDto.name || updateRoleDto.code || updateRoleDto.description !== undefined || updateRoleDto.priority !== undefined) {
      role.updateInfo(
        updateRoleDto.name || role.getName(),
        updateRoleDto.code || role.getCode(),
        updateRoleDto.description,
        updateRoleDto.priority
      );
    }

    // 更新其他属性
    if (updateRoleDto.organizationId !== undefined) {
      role.organizationId = updateRoleDto.organizationId;
    }

    if (updateRoleDto.maxUsers !== undefined) {
      role.maxUsers = updateRoleDto.maxUsers;
    }

    if (updateRoleDto.expiresAt !== undefined) {
      role.expiresAt = updateRoleDto.expiresAt;
    }

    if (updateRoleDto.parentRoleId !== undefined) {
      if (updateRoleDto.parentRoleId) {
        role.setInheritance(updateRoleDto.parentRoleId);
      } else {
        role.removeInheritance();
      }
    }

    await this.roleRepository.save(role);
    return role;
  }

  /**
   * @method deleteRole
   * @description 删除角色（软删除）
   */
  async deleteRole(id: string, tenantId: string): Promise<void> {
    const role = await this.getRoleById(id, tenantId);
    role.markAsDeleted();
    await this.roleRepository.save(role);
  }

  /**
   * @method restoreRole
   * @description 恢复角色
   */
  async restoreRole(id: string, tenantId: string): Promise<Role> {
    const role = await this.getRoleById(id, tenantId);
    role.restore();
    await this.roleRepository.save(role);
    return role;
  }

  /**
   * @method activateRole
   * @description 激活角色
   */
  async activateRole(id: string, tenantId: string): Promise<Role> {
    const role = await this.getRoleById(id, tenantId);
    role.activate();
    await this.roleRepository.save(role);
    return role;
  }

  /**
   * @method suspendRole
   * @description 暂停角色
   */
  async suspendRole(id: string, tenantId: string): Promise<Role> {
    const role = await this.getRoleById(id, tenantId);
    role.suspend();
    await this.roleRepository.save(role);
    return role;
  }

  /**
   * @method assignPermissionsToRole
   * @description 为角色分配权限
   */
  async assignPermissionsToRole(roleId: string, permissionIds: string[], tenantId: string): Promise<Role> {
    const role = await this.getRoleById(roleId, tenantId);

    permissionIds.forEach(permissionId => {
      role.assignPermission(permissionId);
    });

    await this.roleRepository.save(role);
    return role;
  }

  /**
   * @method removePermissionsFromRole
   * @description 从角色移除权限
   */
  async removePermissionsFromRole(roleId: string, permissionIds: string[], tenantId: string): Promise<Role> {
    const role = await this.getRoleById(roleId, tenantId);

    permissionIds.forEach(permissionId => {
      role.removePermission(permissionId);
    });

    await this.roleRepository.save(role);
    return role;
  }

  /**
   * @method assignUsersToRole
   * @description 为角色分配用户
   */
  async assignUsersToRole(roleId: string, userIds: string[], tenantId: string): Promise<Role> {
    const role = await this.getRoleById(roleId, tenantId);

    userIds.forEach(userId => {
      role.assignUser(userId);
    });

    await this.roleRepository.save(role);
    return role;
  }

  /**
   * @method removeUsersFromRole
   * @description 从角色移除用户
   */
  async removeUsersFromRole(roleId: string, userIds: string[], tenantId: string): Promise<Role> {
    const role = await this.getRoleById(roleId, tenantId);

    userIds.forEach(userId => {
      role.removeUser(userId);
    });

    await this.roleRepository.save(role);
    return role;
  }

  /**
   * @method setRoleInheritance
   * @description 设置角色继承关系
   */
  async setRoleInheritance(roleId: string, parentRoleId: string, tenantId: string): Promise<Role> {
    const role = await this.getRoleById(roleId, tenantId);
    const parentRole = await this.getRoleById(parentRoleId, tenantId);

    role.setInheritance(parentRoleId);
    parentRole.addChildRole(roleId);

    await this.roleRepository.save(parentRole);
    await this.roleRepository.save(role);
    return role;
  }

  /**
   * @method removeRoleInheritance
   * @description 移除角色继承关系
   */
  async removeRoleInheritance(roleId: string, tenantId: string): Promise<Role> {
    const role = await this.getRoleById(roleId, tenantId);

    if (role.parentRoleId) {
      const parentRole = await this.getRoleById(role.parentRoleId, tenantId);
      parentRole.removeChildRole(roleId);
      await this.roleRepository.save(parentRole);
    }

    role.removeInheritance();
    await this.roleRepository.save(role);
    return role;
  }

  /**
   * @method getRolesByUser
   * @description 获取用户的角色列表
   */
  async getRolesByUser(userId: string, tenantId: string): Promise<Role[]> {
    return await this.roleRepository.findByUser(userId, tenantId);
  }

  /**
   * @method getRolesByPermission
   * @description 获取拥有指定权限的角色列表
   */
  async getRolesByPermission(permissionId: string, tenantId: string): Promise<Role[]> {
    return await this.roleRepository.findByPermission(permissionId, tenantId);
  }

  /**
   * @method getSystemRoles
   * @description 获取系统角色列表
   */
  async getSystemRoles(tenantId: string): Promise<Role[]> {
    return await this.roleRepository.findSystemRoles(tenantId);
  }

  /**
   * @method getDefaultRoles
   * @description 获取默认角色列表
   */
  async getDefaultRoles(tenantId: string): Promise<Role[]> {
    return await this.roleRepository.findDefaultRoles(tenantId);
  }
} 
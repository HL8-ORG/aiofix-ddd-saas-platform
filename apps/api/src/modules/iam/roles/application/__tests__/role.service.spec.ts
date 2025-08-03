import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RoleService } from '../role.service';
import { RoleRepository } from '../../domain/repositories/role.repository';
import { Role } from '../../domain/entities/role.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { QueryRoleDto } from '../dto/query-role.dto';
import { generateUuid } from '@/shared/domain/utils/uuid.util';
import { RoleStatus } from '../../domain/value-objects/role-status.value-object';

/**
 * @description 角色服务应用层单元测试
 */
describe('RoleService', () => {
  let service: RoleService;
  let roleRepository: jest.Mocked<RoleRepository>;

  const mockRoleRepository = {
    save: jest.fn(),
    findById: jest.fn(),
    findByCode: jest.fn(),
    findByTenant: jest.fn(),
    findByUser: jest.fn(),
    findByPermission: jest.fn(),
    findSystemRoles: jest.fn(),
    findDefaultRoles: jest.fn(),
    updateStatus: jest.fn(),
    delete: jest.fn(),
  };

  const mockRole = {
    id: generateUuid(),
    name: '测试角色',
    code: 'TEST_ROLE',
    description: '测试角色描述',
    status: 'ACTIVE',
    tenantId: generateUuid(),
    adminUserId: generateUuid(),
    priority: 100,
    isSystemRole: false,
    isDefaultRole: false,
    permissionIds: [],
    userIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    activate: jest.fn(),
    suspend: jest.fn(),
    markAsDeleted: jest.fn(),
    restore: jest.fn(),
    updateInfo: jest.fn(),
    assignPermission: jest.fn(),
    removePermission: jest.fn(),
    assignUser: jest.fn(),
    removeUser: jest.fn(),
    setInheritance: jest.fn(),
    removeInheritance: jest.fn(),
    addChildRole: jest.fn(),
    removeChildRole: jest.fn(),
    hasPermission: jest.fn(),
    hasUser: jest.fn(),
    isActive: jest.fn(),
    isSuspended: jest.fn(),
    isExpired: jest.fn(),
    canAssignToUser: jest.fn(),
    getName: jest.fn().mockReturnValue('测试角色'),
    getCode: jest.fn().mockReturnValue('TEST_ROLE'),
    getStatus: jest.fn().mockReturnValue('ACTIVE'),
    getPriority: jest.fn().mockReturnValue(100),
    getPermissionIds: jest.fn().mockReturnValue([]),
    getUserIds: jest.fn().mockReturnValue([]),
    getIsSystemRole: jest.fn().mockReturnValue(false),
    getIsDefaultRole: jest.fn().mockReturnValue(false),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: 'RoleRepository',
          useValue: mockRoleRepository,
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    roleRepository = module.get('RoleRepository');

    jest.clearAllMocks();
  });

  describe('createRole', () => {
    it('应该成功创建角色', async () => {
      const createRoleDto: CreateRoleDto = {
        name: '测试角色',
        code: 'TEST_ROLE',
        description: '测试角色描述',
        priority: 100,
        isSystemRole: false,
        isDefaultRole: false,
      };

      roleRepository.findByCode.mockResolvedValue(null);
      roleRepository.save.mockResolvedValue(mockRole);

      const result = await service.createRole(createRoleDto, 'tenant-1', 'admin-1');

      expect(roleRepository.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Role);
      expect(result.name.getValue()).toBe('测试角色');
      expect(result.code.getValue()).toBe('TEST_ROLE');
    });

    it('应该拒绝创建重复代码的角色', async () => {
      const createRoleDto: CreateRoleDto = {
        name: '测试角色',
        code: 'EXISTING_ROLE',
        description: '测试角色描述',
      };

      roleRepository.findByCode.mockResolvedValue(mockRole);

      await expect(service.createRole(createRoleDto, 'tenant-1', 'admin-1')).rejects.toThrow(BadRequestException);
      expect(roleRepository.save).not.toHaveBeenCalled();
    });

    it('应该创建带有权限的角色', async () => {
      const createRoleDto: CreateRoleDto = {
        name: '测试角色',
        code: 'TEST_ROLE',
        description: '测试角色描述',
        permissionIds: [generateUuid(), generateUuid()],
      };

      roleRepository.findByCode.mockResolvedValue(null);
      roleRepository.save.mockResolvedValue(mockRole);

      const result = await service.createRole(createRoleDto, 'tenant-1', 'admin-1');

      expect(roleRepository.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Role);
      expect(result.name.getValue()).toBe('测试角色');
      expect(result.code.getValue()).toBe('TEST_ROLE');
    });

    it('应该创建带有用户的角色', async () => {
      const createRoleDto: CreateRoleDto = {
        name: '测试角色',
        code: 'TEST_ROLE',
        description: '测试角色描述',
        userIds: [generateUuid(), generateUuid()],
      };

      roleRepository.findByCode.mockResolvedValue(null);
      roleRepository.save.mockResolvedValue(mockRole);

      const result = await service.createRole(createRoleDto, 'tenant-1', 'admin-1');

      expect(roleRepository.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Role);
      expect(result.name.getValue()).toBe('测试角色');
      expect(result.code.getValue()).toBe('TEST_ROLE');
    });
  });

  describe('getRoleById', () => {
    it('应该成功获取角色', async () => {
      const roleId = generateUuid();
      const tenantId = generateUuid();

      roleRepository.findById.mockResolvedValue(mockRole);

      const result = await service.getRoleById(roleId, tenantId);

      expect(roleRepository.findById).toHaveBeenCalledWith(roleId, tenantId);
      expect(result).toBe(mockRole);
    });

    it('应该抛出异常当角色不存在时', async () => {
      const roleId = generateUuid();
      const tenantId = generateUuid();

      roleRepository.findById.mockResolvedValue(null);

      await expect(service.getRoleById(roleId, tenantId)).rejects.toThrow(NotFoundException);
      expect(roleRepository.findById).toHaveBeenCalledWith(roleId, tenantId);
    });
  });

  describe('getRoles', () => {
    it('应该成功获取角色列表', async () => {
      const queryDto: QueryRoleDto = {
        page: 1,
        limit: 10,
        name: '测试',
        code: 'TEST',
        status: RoleStatus.ACTIVE,
      };
      const tenantId = generateUuid();
      const mockRoles = [mockRole, mockRole];

      roleRepository.findByTenant.mockResolvedValue(mockRoles);

      const result = await service.getRoles(queryDto, tenantId);

      expect(roleRepository.findByTenant).toHaveBeenCalledWith(tenantId);
      expect(result.roles).toBe(mockRoles);
      expect(result.total).toBe(2);
    });
  });

  describe('updateRole', () => {
    it('应该成功更新角色', async () => {
      const roleId = generateUuid();
      const tenantId = generateUuid();
      const updateRoleDto: UpdateRoleDto = {
        name: '更新后的角色',
        code: 'UPDATED_ROLE',
        description: '更新后的描述',
        priority: 200,
      };

      roleRepository.findById.mockResolvedValue(mockRole);
      roleRepository.save.mockResolvedValue(mockRole);

      const result = await service.updateRole(roleId, updateRoleDto, tenantId);

      expect(roleRepository.findById).toHaveBeenCalledWith(roleId, tenantId);
      expect(mockRole.updateInfo).toHaveBeenCalledWith(
        updateRoleDto.name,
        updateRoleDto.code,
        updateRoleDto.description,
        updateRoleDto.priority
      );
      expect(roleRepository.save).toHaveBeenCalledWith(mockRole);
      expect(result).toBe(mockRole);
    });

    it('应该抛出异常当角色不存在时', async () => {
      const roleId = generateUuid();
      const tenantId = generateUuid();
      const updateRoleDto: UpdateRoleDto = {
        name: '更新后的角色',
        code: 'UPDATED_ROLE',
      };

      roleRepository.findById.mockResolvedValue(null);

      await expect(service.updateRole(roleId, updateRoleDto, tenantId)).rejects.toThrow(NotFoundException);
      expect(roleRepository.findById).toHaveBeenCalledWith(roleId, tenantId);
      expect(roleRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteRole', () => {
    it('应该成功删除角色', async () => {
      const roleId = generateUuid();
      const tenantId = generateUuid();

      roleRepository.findById.mockResolvedValue(mockRole);
      roleRepository.save.mockResolvedValue(mockRole);

      await service.deleteRole(roleId, tenantId);

      expect(roleRepository.findById).toHaveBeenCalledWith(roleId, tenantId);
      expect(mockRole.markAsDeleted).toHaveBeenCalled();
      expect(roleRepository.save).toHaveBeenCalledWith(mockRole);
    });

    it('应该抛出异常当角色不存在时', async () => {
      const roleId = generateUuid();
      const tenantId = generateUuid();

      roleRepository.findById.mockResolvedValue(null);

      await expect(service.deleteRole(roleId, tenantId)).rejects.toThrow(NotFoundException);
      expect(roleRepository.findById).toHaveBeenCalledWith(roleId, tenantId);
      expect(roleRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('activateRole', () => {
    it('应该成功激活角色', async () => {
      const roleId = generateUuid();
      const tenantId = generateUuid();

      roleRepository.findById.mockResolvedValue(mockRole);
      roleRepository.save.mockResolvedValue(mockRole);

      const result = await service.activateRole(roleId, tenantId);

      expect(roleRepository.findById).toHaveBeenCalledWith(roleId, tenantId);
      expect(mockRole.activate).toHaveBeenCalled();
      expect(roleRepository.save).toHaveBeenCalledWith(mockRole);
      expect(result).toBe(mockRole);
    });
  });

  describe('suspendRole', () => {
    it('应该成功暂停角色', async () => {
      const roleId = generateUuid();
      const tenantId = generateUuid();

      roleRepository.findById.mockResolvedValue(mockRole);
      roleRepository.save.mockResolvedValue(mockRole);

      const result = await service.suspendRole(roleId, tenantId);

      expect(roleRepository.findById).toHaveBeenCalledWith(roleId, tenantId);
      expect(mockRole.suspend).toHaveBeenCalled();
      expect(roleRepository.save).toHaveBeenCalledWith(mockRole);
      expect(result).toBe(mockRole);
    });
  });

  describe('restoreRole', () => {
    it('应该成功恢复角色', async () => {
      const roleId = generateUuid();
      const tenantId = generateUuid();

      roleRepository.findById.mockResolvedValue(mockRole);
      roleRepository.save.mockResolvedValue(mockRole);

      const result = await service.restoreRole(roleId, tenantId);

      expect(roleRepository.findById).toHaveBeenCalledWith(roleId, tenantId);
      expect(mockRole.restore).toHaveBeenCalled();
      expect(roleRepository.save).toHaveBeenCalledWith(mockRole);
      expect(result).toBe(mockRole);
    });
  });

  describe('assignPermissionsToRole', () => {
    it('应该成功为角色分配权限', async () => {
      const roleId = generateUuid();
      const tenantId = generateUuid();
      const permissionIds = [generateUuid(), generateUuid()];

      roleRepository.findById.mockResolvedValue(mockRole);
      roleRepository.save.mockResolvedValue(mockRole);

      const result = await service.assignPermissionsToRole(roleId, permissionIds, tenantId);

      expect(roleRepository.findById).toHaveBeenCalledWith(roleId, tenantId);
      expect(roleRepository.save).toHaveBeenCalledWith(mockRole);
      expect(result).toBe(mockRole);
    });
  });

  describe('removePermissionsFromRole', () => {
    it('应该成功从角色移除权限', async () => {
      const roleId = generateUuid();
      const tenantId = generateUuid();
      const permissionIds = [generateUuid(), generateUuid()];

      roleRepository.findById.mockResolvedValue(mockRole);
      roleRepository.save.mockResolvedValue(mockRole);

      const result = await service.removePermissionsFromRole(roleId, permissionIds, tenantId);

      expect(roleRepository.findById).toHaveBeenCalledWith(roleId, tenantId);
      expect(roleRepository.save).toHaveBeenCalledWith(mockRole);
      expect(result).toBe(mockRole);
    });
  });

  describe('assignUsersToRole', () => {
    it('应该成功为角色分配用户', async () => {
      const roleId = generateUuid();
      const tenantId = generateUuid();
      const userIds = [generateUuid(), generateUuid()];

      roleRepository.findById.mockResolvedValue(mockRole);
      roleRepository.save.mockResolvedValue(mockRole);

      const result = await service.assignUsersToRole(roleId, userIds, tenantId);

      expect(roleRepository.findById).toHaveBeenCalledWith(roleId, tenantId);
      expect(roleRepository.save).toHaveBeenCalledWith(mockRole);
      expect(result).toBe(mockRole);
    });
  });

  describe('removeUsersFromRole', () => {
    it('应该成功从角色移除用户', async () => {
      const roleId = generateUuid();
      const tenantId = generateUuid();
      const userIds = [generateUuid(), generateUuid()];

      roleRepository.findById.mockResolvedValue(mockRole);
      roleRepository.save.mockResolvedValue(mockRole);

      const result = await service.removeUsersFromRole(roleId, userIds, tenantId);

      expect(roleRepository.findById).toHaveBeenCalledWith(roleId, tenantId);
      expect(roleRepository.save).toHaveBeenCalledWith(mockRole);
      expect(result).toBe(mockRole);
    });
  });

  describe('setRoleInheritance', () => {
    it('应该成功设置角色继承关系', async () => {
      const roleId = generateUuid();
      const parentRoleId = generateUuid();
      const tenantId = generateUuid();

      const mockParentRole = {
        ...mockRole,
        id: parentRoleId,
        addChildRole: jest.fn(),
      };

      roleRepository.findById
        .mockResolvedValueOnce(mockRole)
        .mockResolvedValueOnce(mockParentRole);
      roleRepository.save.mockResolvedValue(mockRole);

      const result = await service.setRoleInheritance(roleId, parentRoleId, tenantId);

      expect(roleRepository.findById).toHaveBeenCalledWith(roleId, tenantId);
      expect(roleRepository.findById).toHaveBeenCalledWith(parentRoleId, tenantId);
      expect(mockRole.setInheritance).toHaveBeenCalledWith(parentRoleId);
      expect(mockParentRole.addChildRole).toHaveBeenCalledWith(roleId);
      expect(roleRepository.save).toHaveBeenCalledWith(mockParentRole);
      expect(roleRepository.save).toHaveBeenCalledWith(mockRole);
      expect(result).toBe(mockRole);
    });
  });

  describe('removeRoleInheritance', () => {
    it('应该成功移除角色继承关系', async () => {
      const roleId = generateUuid();
      const tenantId = generateUuid();

      roleRepository.findById.mockResolvedValue(mockRole);
      roleRepository.save.mockResolvedValue(mockRole);

      const result = await service.removeRoleInheritance(roleId, tenantId);

      expect(roleRepository.findById).toHaveBeenCalledWith(roleId, tenantId);
      expect(mockRole.removeInheritance).toHaveBeenCalled();
      expect(roleRepository.save).toHaveBeenCalledWith(mockRole);
      expect(result).toBe(mockRole);
    });
  });

  describe('getRolesByUser', () => {
    it('应该成功获取用户的角色列表', async () => {
      const userId = generateUuid();
      const tenantId = generateUuid();
      const mockRoles = [mockRole, mockRole];

      roleRepository.findByUser.mockResolvedValue(mockRoles);

      const result = await service.getRolesByUser(userId, tenantId);

      expect(roleRepository.findByUser).toHaveBeenCalledWith(userId, tenantId);
      expect(result).toBe(mockRoles);
    });
  });

  describe('getRolesByPermission', () => {
    it('应该成功获取拥有指定权限的角色列表', async () => {
      const permissionId = generateUuid();
      const tenantId = generateUuid();
      const mockRoles = [mockRole, mockRole];

      roleRepository.findByPermission.mockResolvedValue(mockRoles);

      const result = await service.getRolesByPermission(permissionId, tenantId);

      expect(roleRepository.findByPermission).toHaveBeenCalledWith(permissionId, tenantId);
      expect(result).toBe(mockRoles);
    });
  });

  describe('getSystemRoles', () => {
    it('应该成功获取系统角色列表', async () => {
      const tenantId = generateUuid();
      const mockRoles = [mockRole, mockRole];

      roleRepository.findSystemRoles.mockResolvedValue(mockRoles);

      const result = await service.getSystemRoles(tenantId);

      expect(roleRepository.findSystemRoles).toHaveBeenCalledWith(tenantId);
      expect(result).toBe(mockRoles);
    });
  });

  describe('getDefaultRoles', () => {
    it('应该成功获取默认角色列表', async () => {
      const tenantId = generateUuid();
      const mockRoles = [mockRole, mockRole];

      roleRepository.findDefaultRoles.mockResolvedValue(mockRoles);

      const result = await service.getDefaultRoles(tenantId);

      expect(roleRepository.findDefaultRoles).toHaveBeenCalledWith(tenantId);
      expect(result).toBe(mockRoles);
    });
  });
}); 
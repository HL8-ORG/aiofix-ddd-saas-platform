import { Test, type TestingModule } from '@nestjs/testing'
import { Role } from '../../domain/entities/role.entity'
import type { CreateRoleDto } from '../dto/create-role.dto'
import type { QueryRoleDto } from '../dto/query-role.dto'
import type { UpdateRoleDto } from '../dto/update-role.dto'
import { RoleService } from '../role.service'
import {
  AssignUserToRoleUseCase,
  CreateRoleUseCase,
  DeleteRoleUseCase,
  GetRoleUseCase,
  GetRolesUseCase,
  UpdateRoleUseCase,
} from '../use-cases'

/**
 * @description 角色服务协调器单元测试
 */
describe('RoleService', () => {
  let service: RoleService
  let createRoleUseCase: jest.Mocked<CreateRoleUseCase>
  let updateRoleUseCase: jest.Mocked<UpdateRoleUseCase>
  let deleteRoleUseCase: jest.Mocked<DeleteRoleUseCase>
  let getRoleUseCase: jest.Mocked<GetRoleUseCase>
  let getRolesUseCase: jest.Mocked<GetRolesUseCase>
  let assignUserToRoleUseCase: jest.Mocked<AssignUserToRoleUseCase>

  const mockRole = {
    id: 'role-1',
    name: '测试角色',
    code: 'TEST_ROLE',
    description: '测试角色描述',
    status: 'ACTIVE',
    tenantId: 'tenant-1',
    adminUserId: 'admin-1',
    priority: 100,
    isSystemRole: false,
    isDefaultRole: false,
    permissionIds: [],
    userIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any

  beforeEach(async () => {
    const mockCreateRoleUseCase = {
      execute: jest.fn(),
    }

    const mockUpdateRoleUseCase = {
      execute: jest.fn(),
    }

    const mockDeleteRoleUseCase = {
      execute: jest.fn(),
    }

    const mockGetRoleUseCase = {
      execute: jest.fn(),
    }

    const mockGetRolesUseCase = {
      execute: jest.fn(),
    }

    const mockAssignUserToRoleUseCase = {
      execute: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        { provide: CreateRoleUseCase, useValue: mockCreateRoleUseCase },
        { provide: UpdateRoleUseCase, useValue: mockUpdateRoleUseCase },
        { provide: DeleteRoleUseCase, useValue: mockDeleteRoleUseCase },
        { provide: GetRoleUseCase, useValue: mockGetRoleUseCase },
        { provide: GetRolesUseCase, useValue: mockGetRolesUseCase },
        {
          provide: AssignUserToRoleUseCase,
          useValue: mockAssignUserToRoleUseCase,
        },
      ],
    }).compile()

    service = module.get<RoleService>(RoleService)
    createRoleUseCase = module.get(CreateRoleUseCase)
    updateRoleUseCase = module.get(UpdateRoleUseCase)
    deleteRoleUseCase = module.get(DeleteRoleUseCase)
    getRoleUseCase = module.get(GetRoleUseCase)
    getRolesUseCase = module.get(GetRolesUseCase)
    assignUserToRoleUseCase = module.get(AssignUserToRoleUseCase)

    jest.clearAllMocks()
  })

  describe('createRole', () => {
    it('应该成功创建角色', async () => {
      // Arrange
      const createRoleDto: CreateRoleDto = {
        name: '测试角色',
        code: 'TEST_ROLE',
        description: '测试角色描述',
        priority: 100,
        isSystemRole: false,
        isDefaultRole: false,
      }
      const tenantId = 'tenant-1'
      const adminUserId = 'admin-1'

      createRoleUseCase.execute.mockResolvedValue(mockRole)

      // Act
      const result = await service.createRole(
        createRoleDto,
        tenantId,
        adminUserId,
      )

      // Assert
      expect(createRoleUseCase.execute).toHaveBeenCalledWith(
        createRoleDto,
        tenantId,
        adminUserId,
      )
      expect(result).toBe(mockRole)
    })
  })

  describe('getRoleById', () => {
    it('应该成功获取角色', async () => {
      // Arrange
      const roleId = 'role-1'
      const tenantId = 'tenant-1'

      getRoleUseCase.execute.mockResolvedValue(mockRole)

      // Act
      const result = await service.getRoleById(roleId, tenantId)

      // Assert
      expect(getRoleUseCase.execute).toHaveBeenCalledWith(roleId, tenantId)
      expect(result).toBe(mockRole)
    })
  })

  describe('getRoles', () => {
    it('应该成功获取角色列表', async () => {
      // Arrange
      const queryDto: QueryRoleDto = {
        page: 1,
        limit: 10,
      }
      const tenantId = 'tenant-1'
      const expectedResult = { roles: [mockRole], total: 1 }

      getRolesUseCase.execute.mockResolvedValue(expectedResult)

      // Act
      const result = await service.getRoles(queryDto, tenantId)

      // Assert
      expect(getRolesUseCase.execute).toHaveBeenCalledWith(queryDto, tenantId)
      expect(result).toBe(expectedResult)
    })
  })

  describe('updateRole', () => {
    it('应该成功更新角色', async () => {
      // Arrange
      const roleId = 'role-1'
      const updateRoleDto: UpdateRoleDto = {
        name: '更新后的角色',
        description: '更新后的描述',
      }
      const tenantId = 'tenant-1'
      const adminUserId = 'admin-1'

      updateRoleUseCase.execute.mockResolvedValue(mockRole)

      // Act
      const result = await service.updateRole(
        roleId,
        updateRoleDto,
        tenantId,
        adminUserId,
      )

      // Assert
      expect(updateRoleUseCase.execute).toHaveBeenCalledWith(
        roleId,
        updateRoleDto,
        tenantId,
        adminUserId,
      )
      expect(result).toBe(mockRole)
    })
  })

  describe('deleteRole', () => {
    it('应该成功删除角色', async () => {
      // Arrange
      const roleId = 'role-1'
      const tenantId = 'tenant-1'
      const adminUserId = 'admin-1'

      deleteRoleUseCase.execute.mockResolvedValue()

      // Act
      await service.deleteRole(roleId, tenantId, adminUserId)

      // Assert
      expect(deleteRoleUseCase.execute).toHaveBeenCalledWith(
        roleId,
        tenantId,
        adminUserId,
      )
    })
  })

  describe('assignUserToRole', () => {
    it('应该成功分配用户到角色', async () => {
      // Arrange
      const roleId = 'role-1'
      const userId = 'user-1'
      const tenantId = 'tenant-1'
      const adminUserId = 'admin-1'

      assignUserToRoleUseCase.execute.mockResolvedValue(mockRole)

      // Act
      const result = await service.assignUserToRole(
        roleId,
        userId,
        tenantId,
        adminUserId,
      )

      // Assert
      expect(assignUserToRoleUseCase.execute).toHaveBeenCalledWith(
        roleId,
        userId,
        tenantId,
        adminUserId,
      )
      expect(result).toBe(mockRole)
    })
  })
})

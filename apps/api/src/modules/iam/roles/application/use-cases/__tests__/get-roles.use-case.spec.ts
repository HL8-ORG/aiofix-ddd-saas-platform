import { Role } from '@/modules/iam/roles/domain/entities/role.entity'
import { RoleRepository } from '@/modules/iam/roles/domain/repositories/role.repository'
import { RoleStatus } from '@/modules/iam/roles/domain/value-objects/role-status.value-object'
import { Test, type TestingModule } from '@nestjs/testing'
import type { QueryRoleDto } from '../../dto/query-role.dto'
import { GetRolesUseCase } from '../get-roles.use-case'

/**
 * @description 获取角色列表用例单元测试
 */
describe('GetRolesUseCase', () => {
  let useCase: GetRolesUseCase
  let roleRepository: jest.Mocked<RoleRepository>

  beforeEach(async () => {
    const mockRoleRepository = {
      findByTenant: jest.fn(),
      findActiveRoles: jest.fn(),
      findSuspendedRoles: jest.fn(),
      findDeletedRoles: jest.fn(),
      findSystemRoles: jest.fn(),
      findDefaultRoles: jest.fn(),
      findByOrganization: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetRolesUseCase,
        { provide: RoleRepository, useValue: mockRoleRepository },
      ],
    }).compile()

    useCase = module.get<GetRolesUseCase>(GetRolesUseCase)
    roleRepository = module.get(RoleRepository)
  })

  describe('execute', () => {
    const tenantId = 'tenant-1'

    it('应该获取所有角色', async () => {
      // Arrange
      const queryDto: QueryRoleDto = { page: 1, limit: 10 }
      const mockRoles = [
        new Role('role-1', '角色1', 'ROLE_1', tenantId, 'admin-1'),
        new Role('role-2', '角色2', 'ROLE_2', tenantId, 'admin-1'),
      ]
      roleRepository.findByTenant.mockResolvedValue(mockRoles)

      // Act
      const result = await useCase.execute(queryDto, tenantId)

      // Assert
      expect(roleRepository.findByTenant).toHaveBeenCalledWith(tenantId)
      expect(result.roles).toEqual(mockRoles)
      expect(result.total).toBe(2)
    })

    it('应该根据状态过滤角色', async () => {
      // Arrange
      const queryDto: QueryRoleDto = {
        page: 1,
        limit: 10,
        status: RoleStatus.ACTIVE,
      }
      const mockRoles = [
        new Role('role-1', '活跃角色', 'ACTIVE_ROLE', tenantId, 'admin-1'),
      ]
      roleRepository.findActiveRoles.mockResolvedValue(mockRoles)

      // Act
      const result = await useCase.execute(queryDto, tenantId)

      // Assert
      expect(roleRepository.findActiveRoles).toHaveBeenCalledWith(tenantId)
      expect(result.roles).toEqual(mockRoles)
      expect(result.total).toBe(1)
    })

    it('应该根据系统角色过滤', async () => {
      // Arrange
      const queryDto: QueryRoleDto = { page: 1, limit: 10, isSystemRole: true }
      const systemRoles = [
        new Role('role-1', '系统角色', 'SYSTEM_ROLE', tenantId, 'admin-1'),
      ]
      roleRepository.findSystemRoles.mockResolvedValue(systemRoles)

      // Act
      const result = await useCase.execute(queryDto, tenantId)

      // Assert
      expect(roleRepository.findSystemRoles).toHaveBeenCalledWith(tenantId)
      expect(result.roles).toEqual(systemRoles)
      expect(result.total).toBe(1)
    })

    it('应该根据组织过滤角色', async () => {
      // Arrange
      const queryDto: QueryRoleDto = {
        page: 1,
        limit: 10,
        organizationId: 'org-1',
      }
      const mockRoles = [
        new Role('role-1', '组织角色', 'ORG_ROLE', tenantId, 'admin-1'),
      ]
      roleRepository.findByOrganization.mockResolvedValue(mockRoles)

      // Act
      const result = await useCase.execute(queryDto, tenantId)

      // Assert
      expect(roleRepository.findByOrganization).toHaveBeenCalledWith(
        'org-1',
        tenantId,
      )
      expect(result.roles).toEqual(mockRoles)
      expect(result.total).toBe(1)
    })

    it('应该正确分页', async () => {
      // Arrange
      const queryDto: QueryRoleDto = { page: 2, limit: 2 }
      const allRoles = [
        new Role('role-1', '角色1', 'ROLE_1', tenantId, 'admin-1'),
        new Role('role-2', '角色2', 'ROLE_2', tenantId, 'admin-1'),
        new Role('role-3', '角色3', 'ROLE_3', tenantId, 'admin-1'),
        new Role('role-4', '角色4', 'ROLE_4', tenantId, 'admin-1'),
      ]
      roleRepository.findByTenant.mockResolvedValue(allRoles)

      // Act
      const result = await useCase.execute(queryDto, tenantId)

      // Assert
      expect(result.roles).toHaveLength(2)
      expect(result.total).toBe(4)
      expect(result.roles[0].id).toBe('role-3')
      expect(result.roles[1].id).toBe('role-4')
    })
  })
})

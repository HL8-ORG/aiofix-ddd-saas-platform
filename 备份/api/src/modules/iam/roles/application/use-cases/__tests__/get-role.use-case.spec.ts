import { Role } from '@/modules/iam/roles/domain/entities/role.entity'
import { RoleRepository } from '@/modules/iam/roles/domain/repositories/role.repository'
import { RoleCacheService } from '@/modules/iam/roles/infrastructure/cache/role-cache.service'
import { NotFoundException } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import { GetRoleUseCase } from '../get-role.use-case'

/**
 * @description 获取角色用例单元测试
 */
describe('GetRoleUseCase', () => {
  let useCase: GetRoleUseCase
  let roleRepository: jest.Mocked<RoleRepository>
  let cacheService: jest.Mocked<RoleCacheService>

  beforeEach(async () => {
    const mockRoleRepository = {
      findById: jest.fn(),
    }

    const mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetRoleUseCase,
        { provide: RoleRepository, useValue: mockRoleRepository },
        { provide: RoleCacheService, useValue: mockCacheService },
      ],
    }).compile()

    useCase = module.get<GetRoleUseCase>(GetRoleUseCase)
    roleRepository = module.get(RoleRepository)
    cacheService = module.get(RoleCacheService)
  })

  describe('execute', () => {
    const roleId = 'role-1'
    const tenantId = 'tenant-1'

    it('应该从缓存中获取角色', async () => {
      // Arrange
      const mockRole = new Role(
        roleId,
        '测试角色',
        'TEST_ROLE',
        tenantId,
        'admin-1',
      )
      cacheService.get.mockResolvedValue(mockRole)

      // Act
      const result = await useCase.execute(roleId, tenantId)

      // Assert
      expect(cacheService.get).toHaveBeenCalledWith(tenantId, roleId)
      expect(roleRepository.findById).not.toHaveBeenCalled()
      expect(result).toBe(mockRole)
    })

    it('应该从数据库获取角色并缓存', async () => {
      // Arrange
      const mockRole = new Role(
        roleId,
        '测试角色',
        'TEST_ROLE',
        tenantId,
        'admin-1',
      )
      cacheService.get.mockResolvedValue(null)
      roleRepository.findById.mockResolvedValue(mockRole)
      cacheService.set.mockResolvedValue()

      // Act
      const result = await useCase.execute(roleId, tenantId)

      // Assert
      expect(cacheService.get).toHaveBeenCalledWith(tenantId, roleId)
      expect(roleRepository.findById).toHaveBeenCalledWith(roleId, tenantId)
      expect(cacheService.set).toHaveBeenCalledWith(tenantId, mockRole)
      expect(result).toBe(mockRole)
    })

    it('应该在角色不存在时抛出异常', async () => {
      // Arrange
      cacheService.get.mockResolvedValue(null)
      roleRepository.findById.mockResolvedValue(null)

      // Act & Assert
      await expect(useCase.execute(roleId, tenantId)).rejects.toThrow(
        NotFoundException,
      )
      expect(cacheService.set).not.toHaveBeenCalled()
    })
  })
})

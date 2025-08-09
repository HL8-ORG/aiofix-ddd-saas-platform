import { Role } from '@/modules/iam/roles/domain/entities/role.entity'
import { RoleRepository } from '@/modules/iam/roles/domain/repositories/role.repository'
import { RoleCacheService } from '@/modules/iam/roles/infrastructure/cache/role-cache.service'
import { RoleNotificationService } from '@/modules/iam/roles/infrastructure/external/role-notification.service'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import { AssignUserToRoleUseCase } from '../assign-user-to-role.use-case'

/**
 * @description 分配用户到角色用例单元测试
 */
describe('AssignUserToRoleUseCase', () => {
  let useCase: AssignUserToRoleUseCase
  let roleRepository: jest.Mocked<RoleRepository>
  let notificationService: jest.Mocked<RoleNotificationService>
  let cacheService: jest.Mocked<RoleCacheService>

  beforeEach(async () => {
    const mockRoleRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    }

    const mockNotificationService = {
      notifyUserAssignedToRole: jest.fn(),
    }

    const mockCacheService = {
      set: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignUserToRoleUseCase,
        { provide: RoleRepository, useValue: mockRoleRepository },
        { provide: RoleNotificationService, useValue: mockNotificationService },
        { provide: RoleCacheService, useValue: mockCacheService },
      ],
    }).compile()

    useCase = module.get<AssignUserToRoleUseCase>(AssignUserToRoleUseCase)
    roleRepository = module.get(RoleRepository)
    notificationService = module.get(RoleNotificationService)
    cacheService = module.get(RoleCacheService)
  })

  describe('execute', () => {
    const roleId = 'role-1'
    const userId = 'user-1'
    const tenantId = 'tenant-1'
    const adminUserId = 'admin-1'

    it('应该成功分配用户到角色', async () => {
      // Arrange
      const mockRole = new Role(
        roleId,
        '测试角色',
        'TEST_ROLE',
        tenantId,
        adminUserId,
      )
      mockRole.canAssignToUser = jest.fn().mockReturnValue(true)
      mockRole.assignUser = jest.fn()
      mockRole.userIds = []

      roleRepository.findById.mockResolvedValue(mockRole)
      roleRepository.save.mockResolvedValue()
      notificationService.notifyUserAssignedToRole.mockResolvedValue()
      cacheService.set.mockResolvedValue()

      // Act
      const result = await useCase.execute(
        roleId,
        userId,
        tenantId,
        adminUserId,
      )

      // Assert
      expect(roleRepository.findById).toHaveBeenCalledWith(roleId, tenantId)
      expect(mockRole.assignUser).toHaveBeenCalledWith(userId)
      expect(roleRepository.save).toHaveBeenCalledWith(mockRole)
      expect(cacheService.set).toHaveBeenCalledWith(tenantId, mockRole)
      expect(notificationService.notifyUserAssignedToRole).toHaveBeenCalledWith(
        mockRole,
        userId,
        adminUserId,
      )
      expect(result).toBe(mockRole)
    })

    it('应该在角色不存在时抛出异常', async () => {
      // Arrange
      roleRepository.findById.mockResolvedValue(null)

      // Act & Assert
      await expect(
        useCase.execute(roleId, userId, tenantId, adminUserId),
      ).rejects.toThrow(NotFoundException)
      expect(roleRepository.save).not.toHaveBeenCalled()
    })

    it('应该在角色状态不允许分配时抛出异常', async () => {
      // Arrange
      const mockRole = new Role(
        roleId,
        '测试角色',
        'TEST_ROLE',
        tenantId,
        adminUserId,
      )
      mockRole.canAssignToUser = jest.fn().mockReturnValue(false)

      roleRepository.findById.mockResolvedValue(mockRole)

      // Act & Assert
      await expect(
        useCase.execute(roleId, userId, tenantId, adminUserId),
      ).rejects.toThrow(BadRequestException)
      expect(roleRepository.save).not.toHaveBeenCalled()
    })

    it('应该在用户已在角色中时抛出异常', async () => {
      // Arrange
      const mockRole = new Role(
        roleId,
        '测试角色',
        'TEST_ROLE',
        tenantId,
        adminUserId,
      )
      mockRole.canAssignToUser = jest.fn().mockReturnValue(true)
      mockRole.userIds = [userId]

      roleRepository.findById.mockResolvedValue(mockRole)

      // Act & Assert
      await expect(
        useCase.execute(roleId, userId, tenantId, adminUserId),
      ).rejects.toThrow(BadRequestException)
      expect(roleRepository.save).not.toHaveBeenCalled()
    })

    it('应该在达到最大用户数时抛出异常', async () => {
      // Arrange
      const mockRole = new Role(
        roleId,
        '测试角色',
        'TEST_ROLE',
        tenantId,
        adminUserId,
      )
      mockRole.canAssignToUser = jest.fn().mockReturnValue(true)
      mockRole.userIds = ['user-2', 'user-3']
      mockRole.maxUsers = 2

      roleRepository.findById.mockResolvedValue(mockRole)

      // Act & Assert
      await expect(
        useCase.execute(roleId, userId, tenantId, adminUserId),
      ).rejects.toThrow(BadRequestException)
      expect(roleRepository.save).not.toHaveBeenCalled()
    })

    it('应该在角色过期时抛出异常', async () => {
      // Arrange
      const mockRole = new Role(
        roleId,
        '测试角色',
        'TEST_ROLE',
        tenantId,
        adminUserId,
      )
      mockRole.canAssignToUser = jest.fn().mockReturnValue(true)
      mockRole.userIds = []
      mockRole.expiresAt = new Date('2020-01-01')

      roleRepository.findById.mockResolvedValue(mockRole)

      // Act & Assert
      await expect(
        useCase.execute(roleId, userId, tenantId, adminUserId),
      ).rejects.toThrow(BadRequestException)
      expect(roleRepository.save).not.toHaveBeenCalled()
    })
  })
})

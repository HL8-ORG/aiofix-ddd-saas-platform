import { Role } from '@/modules/iam/roles/domain/entities/role.entity'
import { RoleRepository } from '@/modules/iam/roles/domain/repositories/role.repository'
import { RoleCacheService } from '@/modules/iam/roles/infrastructure/cache/role-cache.service'
import { RoleNotificationService } from '@/modules/iam/roles/infrastructure/external/role-notification.service'
import { generateUuid } from '@/shared/domain/utils/uuid.util'
import { BadRequestException } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import type { CreateRoleDto } from '../../dto/create-role.dto'
import { CreateRoleUseCase } from '../create-role.use-case'

/**
 * @description 创建角色用例单元测试
 */
describe('CreateRoleUseCase', () => {
  let useCase: CreateRoleUseCase
  let roleRepository: jest.Mocked<RoleRepository>
  let notificationService: jest.Mocked<RoleNotificationService>
  let cacheService: jest.Mocked<RoleCacheService>

  beforeEach(async () => {
    const mockRoleRepository = {
      findByCode: jest.fn(),
      findByName: jest.fn(),
      save: jest.fn(),
    }

    const mockNotificationService = {
      notifyRoleCreated: jest.fn(),
    }

    const mockCacheService = {
      set: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateRoleUseCase,
        { provide: RoleRepository, useValue: mockRoleRepository },
        { provide: RoleNotificationService, useValue: mockNotificationService },
        { provide: RoleCacheService, useValue: mockCacheService },
      ],
    }).compile()

    useCase = module.get<CreateRoleUseCase>(CreateRoleUseCase)
    roleRepository = module.get(RoleRepository)
    notificationService = module.get(RoleNotificationService)
    cacheService = module.get(RoleCacheService)
  })

  describe('execute', () => {
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

    it('应该成功创建角色', async () => {
      // Arrange
      roleRepository.findByCode.mockResolvedValue(null)
      roleRepository.findByName.mockResolvedValue(null)
      roleRepository.save.mockResolvedValue()
      notificationService.notifyRoleCreated.mockResolvedValue()
      cacheService.set.mockResolvedValue()

      // Act
      const result = await useCase.execute(createRoleDto, tenantId, adminUserId)

      // Assert
      expect(result).toBeInstanceOf(Role)
      expect(result.name.getValue()).toBe('测试角色')
      expect(result.code.getValue()).toBe('TEST_ROLE')
      expect(result.tenantId).toBe(tenantId)
      expect(result.adminUserId).toBe(adminUserId)
      expect(roleRepository.save).toHaveBeenCalledWith(result)
      expect(cacheService.set).toHaveBeenCalledWith(tenantId, result)
      expect(notificationService.notifyRoleCreated).toHaveBeenCalledWith(
        result,
        adminUserId,
      )
    })

    it('应该拒绝创建重复代码的角色', async () => {
      // Arrange
      const existingRole = new Role(
        'existing-id',
        'Existing Role',
        'TEST_ROLE',
        tenantId,
        adminUserId,
      )
      roleRepository.findByCode.mockResolvedValue(existingRole)

      // Act & Assert
      await expect(
        useCase.execute(createRoleDto, tenantId, adminUserId),
      ).rejects.toThrow(BadRequestException)
      expect(roleRepository.save).not.toHaveBeenCalled()
    })

    it('应该拒绝创建重复名称的角色', async () => {
      // Arrange
      const existingRole = new Role(
        'existing-id',
        '测试角色',
        'EXISTING_ROLE',
        tenantId,
        adminUserId,
      )
      roleRepository.findByCode.mockResolvedValue(null)
      roleRepository.findByName.mockResolvedValue(existingRole)

      // Act & Assert
      await expect(
        useCase.execute(createRoleDto, tenantId, adminUserId),
      ).rejects.toThrow(BadRequestException)
      expect(roleRepository.save).not.toHaveBeenCalled()
    })

    it('应该拒绝优先级超出范围的角色', async () => {
      // Arrange
      const invalidDto = { ...createRoleDto, priority: 2000 }
      roleRepository.findByCode.mockResolvedValue(null)
      roleRepository.findByName.mockResolvedValue(null)

      // Act & Assert
      await expect(
        useCase.execute(invalidDto, tenantId, adminUserId),
      ).rejects.toThrow(BadRequestException)
      expect(roleRepository.save).not.toHaveBeenCalled()
    })

    it('应该拒绝最大用户数小于1的角色', async () => {
      // Arrange
      const invalidDto = { ...createRoleDto, maxUsers: 0 }
      roleRepository.findByCode.mockResolvedValue(null)
      roleRepository.findByName.mockResolvedValue(null)

      // Act & Assert
      await expect(
        useCase.execute(invalidDto, tenantId, adminUserId),
      ).rejects.toThrow(BadRequestException)
      expect(roleRepository.save).not.toHaveBeenCalled()
    })

    it('应该创建带有权限的角色', async () => {
      // Arrange
      const dtoWithPermissions = {
        ...createRoleDto,
        permissionIds: [generateUuid(), generateUuid()],
      }
      roleRepository.findByCode.mockResolvedValue(null)
      roleRepository.findByName.mockResolvedValue(null)
      roleRepository.save.mockResolvedValue()
      notificationService.notifyRoleCreated.mockResolvedValue()
      cacheService.set.mockResolvedValue()

      // Act
      const result = await useCase.execute(
        dtoWithPermissions,
        tenantId,
        adminUserId,
      )

      // Assert
      expect(result.permissionIds).toHaveLength(2)
      expect(result.permissionIds).toEqual(dtoWithPermissions.permissionIds)
    })

    it('应该创建带有用户的角色', async () => {
      // Arrange
      const dtoWithUsers = {
        ...createRoleDto,
        userIds: [generateUuid(), generateUuid()],
      }
      roleRepository.findByCode.mockResolvedValue(null)
      roleRepository.findByName.mockResolvedValue(null)
      roleRepository.save.mockResolvedValue()
      notificationService.notifyRoleCreated.mockResolvedValue()
      cacheService.set.mockResolvedValue()

      // Act
      const result = await useCase.execute(dtoWithUsers, tenantId, adminUserId)

      // Assert
      expect(result.userIds).toHaveLength(2)
      expect(result.userIds).toEqual(dtoWithUsers.userIds)
    })
  })
})

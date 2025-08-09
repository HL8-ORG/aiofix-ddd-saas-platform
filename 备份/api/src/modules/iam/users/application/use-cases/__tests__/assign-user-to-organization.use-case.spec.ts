import type { User } from '@/modules/iam/users/domain/entities/user.entity'
import { UserRepository } from '@/modules/iam/users/domain/repositories/user.repository'
import {
  UserStatus,
  UserStatusValue,
} from '@/modules/iam/users/domain/value-objects/user-status.value-object'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import { AssignUserToOrganizationUseCase } from '../assign-user-to-organization.use-case'

/**
 * @description 分配用户到组织用例的单元测试
 */
describe('AssignUserToOrganizationUseCase', () => {
  let useCase: AssignUserToOrganizationUseCase
  let userRepository: jest.Mocked<UserRepository>

  const mockUserRepository = {
    findById: jest.fn(),
    save: jest.fn(),
    findByOrganizationId: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignUserToOrganizationUseCase,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile()

    useCase = module.get<AssignUserToOrganizationUseCase>(
      AssignUserToOrganizationUseCase,
    )
    userRepository = module.get(UserRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('execute', () => {
    const userId = 'user-1'
    const organizationId = 'org-1'
    const tenantId = 'tenant-1'
    const adminUserId = 'admin-1'

    it('应该成功分配用户到组织', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        status: {
          isActive: jest.fn().mockReturnValue(true),
        },
        assignToOrganization: jest.fn(),
        removeFromOrganization: jest.fn(),
      } as any

      const updatedMockUser = { ...mockUser }

      userRepository.findById.mockResolvedValue(mockUser)
      userRepository.save.mockResolvedValue(updatedMockUser)

      // Act
      const result = await useCase.execute(
        userId,
        organizationId,
        tenantId,
        adminUserId,
      )

      // Assert
      expect(result).toBe(updatedMockUser)
      expect(userRepository.findById).toHaveBeenCalledWith(userId, tenantId)
      expect(mockUser.assignToOrganization).toHaveBeenCalledWith(organizationId)
      expect(userRepository.save).toHaveBeenCalledWith(mockUser)
    })

    it('当用户不存在时应该抛出NotFoundException', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null)

      // Act & Assert
      await expect(
        useCase.execute(userId, organizationId, tenantId, adminUserId),
      ).rejects.toThrow(NotFoundException)
      await expect(
        useCase.execute(userId, organizationId, tenantId, adminUserId),
      ).rejects.toThrow('用户不存在')
    })

    it('当尝试修改自己的组织分配时应该抛出BadRequestException', async () => {
      // Arrange
      const mockUser = {
        id: 'admin-1', // 与adminUserId相同
        status: {
          isActive: jest.fn().mockReturnValue(true),
        },
        assignToOrganization: jest.fn(),
        removeFromOrganization: jest.fn(),
      } as any

      userRepository.findById.mockResolvedValue(mockUser)

      // Act & Assert
      await expect(
        useCase.execute(userId, organizationId, tenantId, adminUserId),
      ).rejects.toThrow(BadRequestException)
      await expect(
        useCase.execute(userId, organizationId, tenantId, adminUserId),
      ).rejects.toThrow('不能修改自己的组织分配')
    })

    it('当用户状态不是激活时应该抛出BadRequestException', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        status: {
          isActive: jest.fn().mockReturnValue(false),
        },
        assignToOrganization: jest.fn(),
        removeFromOrganization: jest.fn(),
      } as any

      userRepository.findById.mockResolvedValue(mockUser)

      // Act & Assert
      await expect(
        useCase.execute(userId, organizationId, tenantId, adminUserId),
      ).rejects.toThrow(BadRequestException)
      await expect(
        useCase.execute(userId, organizationId, tenantId, adminUserId),
      ).rejects.toThrow('只有激活状态的用户才能被分配到组织')
    })
  })

  describe('executeBatchAssign', () => {
    const userIds = ['user-1', 'user-2', 'user-3']
    const organizationId = 'org-1'
    const tenantId = 'tenant-1'
    const adminUserId = 'admin-1'

    it('应该成功批量分配用户到组织', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        status: {
          isActive: jest.fn().mockReturnValue(true),
        },
        assignToOrganization: jest.fn(),
        removeFromOrganization: jest.fn(),
      } as any

      const updatedMockUser = { ...mockUser }

      userRepository.findById.mockResolvedValue(mockUser)
      userRepository.save.mockResolvedValue(updatedMockUser)

      // Act
      const result = await useCase.executeBatchAssign(
        userIds,
        organizationId,
        tenantId,
        adminUserId,
      )

      // Assert
      expect(result.success).toEqual(['user-1', 'user-2', 'user-3'])
      expect(result.failed).toEqual([])
      expect(userRepository.findById).toHaveBeenCalledTimes(3)
      expect(userRepository.save).toHaveBeenCalledTimes(3)
    })

    it('应该正确处理部分失败的批量分配', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        status: {
          isActive: jest.fn().mockReturnValue(true),
        },
        assignToOrganization: jest.fn(),
        removeFromOrganization: jest.fn(),
      } as any

      const updatedMockUser = { ...mockUser }

      userRepository.findById
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null) // 第二个用户不存在
        .mockResolvedValueOnce(mockUser)
      userRepository.save
        .mockResolvedValueOnce(updatedMockUser)
        .mockResolvedValueOnce(updatedMockUser)

      // Act
      const result = await useCase.executeBatchAssign(
        userIds,
        organizationId,
        tenantId,
        adminUserId,
      )

      // Assert
      expect(result.success).toEqual(['user-1', 'user-3'])
      expect(result.failed).toEqual(['user-2'])
    })
  })

  describe('executeRemoveFromOrganization', () => {
    const userId = 'user-1'
    const organizationId = 'org-1'
    const tenantId = 'tenant-1'
    const adminUserId = 'admin-1'

    it('应该成功从组织中移除用户', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        status: {
          isActive: jest.fn().mockReturnValue(true),
        },
        assignToOrganization: jest.fn(),
        removeFromOrganization: jest.fn(),
      } as any

      const updatedMockUser = { ...mockUser }

      userRepository.findById.mockResolvedValue(mockUser)
      userRepository.save.mockResolvedValue(updatedMockUser)

      // Act
      const result = await useCase.executeRemoveFromOrganization(
        userId,
        organizationId,
        tenantId,
        adminUserId,
      )

      // Assert
      expect(result).toBe(updatedMockUser)
      expect(mockUser.removeFromOrganization).toHaveBeenCalledWith(
        organizationId,
      )
    })

    it('当用户不存在时应该抛出NotFoundException', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null)

      // Act & Assert
      await expect(
        useCase.executeRemoveFromOrganization(
          userId,
          organizationId,
          tenantId,
          adminUserId,
        ),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('executeUpdateOrganizationIds', () => {
    const userId = 'user-1'
    const organizationIds = ['org-1', 'org-2']
    const tenantId = 'tenant-1'
    const adminUserId = 'admin-1'

    it('应该成功更新用户的组织列表', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        status: {
          isActive: jest.fn().mockReturnValue(true),
        },
        assignToOrganization: jest.fn(),
        removeFromOrganization: jest.fn(),
      } as any

      const updatedMockUser = { ...mockUser }

      userRepository.findById.mockResolvedValue(mockUser)
      userRepository.save.mockResolvedValue(updatedMockUser)

      // Act
      const result = await useCase.executeUpdateOrganizationIds(
        userId,
        organizationIds,
        tenantId,
        adminUserId,
      )

      // Assert
      expect(result).toBe(updatedMockUser)
      expect(mockUser.removeFromOrganization).toHaveBeenCalled()
      expect(mockUser.assignToOrganization).toHaveBeenCalledTimes(2)
      expect(mockUser.assignToOrganization).toHaveBeenCalledWith('org-1')
      expect(mockUser.assignToOrganization).toHaveBeenCalledWith('org-2')
    })

    it('当用户不存在时应该抛出NotFoundException', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null)

      // Act & Assert
      await expect(
        useCase.executeUpdateOrganizationIds(
          userId,
          organizationIds,
          tenantId,
          adminUserId,
        ),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('executeGetUsersByOrganization', () => {
    const organizationId = 'org-1'
    const tenantId = 'tenant-1'

    it('应该成功获取组织下的所有用户', async () => {
      // Arrange
      const mockUsers = [
        { id: 'user-1', username: 'user1' },
        { id: 'user-2', username: 'user2' },
      ] as unknown as User[]

      userRepository.findByOrganizationId.mockResolvedValue(mockUsers)

      // Act
      const result = await useCase.executeGetUsersByOrganization(
        organizationId,
        tenantId,
      )

      // Assert
      expect(result).toBe(mockUsers)
      expect(userRepository.findByOrganizationId).toHaveBeenCalledWith(
        organizationId,
        tenantId,
      )
    })
  })

  describe('executeTransferUser', () => {
    const userId = 'user-1'
    const fromOrganizationId = 'org-1'
    const toOrganizationId = 'org-2'
    const tenantId = 'tenant-1'
    const adminUserId = 'admin-1'

    it('应该成功将用户从一个组织转移到另一个组织', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        status: {
          isActive: jest.fn().mockReturnValue(true),
        },
        organizationIds: ['org-1', 'org-3'],
        assignToOrganization: jest.fn(),
        removeFromOrganization: jest.fn(),
      } as any

      const updatedMockUser = { ...mockUser }

      userRepository.findById.mockResolvedValue(mockUser)
      userRepository.save.mockResolvedValue(updatedMockUser)

      // Act
      const result = await useCase.executeTransferUser(
        userId,
        fromOrganizationId,
        toOrganizationId,
        tenantId,
        adminUserId,
      )

      // Assert
      expect(result).toBe(updatedMockUser)
      expect(mockUser.removeFromOrganization).toHaveBeenCalledWith(
        fromOrganizationId,
      )
      expect(mockUser.assignToOrganization).toHaveBeenCalledWith(
        toOrganizationId,
      )
    })

    it('当用户不在指定的原组织中时应该抛出BadRequestException', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        status: {
          isActive: jest.fn().mockReturnValue(true),
        },
        organizationIds: ['org-2', 'org-3'], // 不包含fromOrganizationId
        assignToOrganization: jest.fn(),
        removeFromOrganization: jest.fn(),
      } as any

      userRepository.findById.mockResolvedValue(mockUser)

      // Act & Assert
      await expect(
        useCase.executeTransferUser(
          userId,
          fromOrganizationId,
          toOrganizationId,
          tenantId,
          adminUserId,
        ),
      ).rejects.toThrow(BadRequestException)
      await expect(
        useCase.executeTransferUser(
          userId,
          fromOrganizationId,
          toOrganizationId,
          tenantId,
          adminUserId,
        ),
      ).rejects.toThrow('用户不在指定的原组织中')
    })
  })

  describe('executeGetUserOrganizations', () => {
    const userId = 'user-1'
    const tenantId = 'tenant-1'

    it('应该成功获取用户所属的所有组织', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        organizationIds: ['org-1', 'org-2', 'org-3'],
      } as any

      userRepository.findById.mockResolvedValue(mockUser)

      // Act
      const result = await useCase.executeGetUserOrganizations(userId, tenantId)

      // Assert
      expect(result).toEqual(['org-1', 'org-2', 'org-3'])
      expect(userRepository.findById).toHaveBeenCalledWith(userId, tenantId)
    })

    it('当用户不存在时应该抛出NotFoundException', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null)

      // Act & Assert
      await expect(
        useCase.executeGetUserOrganizations(userId, tenantId),
      ).rejects.toThrow(NotFoundException)
    })
  })
})

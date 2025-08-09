import type { User } from '@/modules/iam/users/domain/entities/user.entity'
import { UserRepository } from '@/modules/iam/users/domain/repositories/user.repository'
import {
  UserStatus,
  UserStatusValue,
} from '@/modules/iam/users/domain/value-objects/user-status.value-object'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import { AssignRoleToUserUseCase } from '../assign-role-to-user.use-case'

/**
 * @description 分配角色给用户用例的单元测试
 */
describe('AssignRoleToUserUseCase', () => {
  let useCase: AssignRoleToUserUseCase
  let userRepository: jest.Mocked<UserRepository>

  const mockUserRepository = {
    findById: jest.fn(),
    save: jest.fn(),
    findByRoleId: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignRoleToUserUseCase,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile()

    useCase = module.get<AssignRoleToUserUseCase>(AssignRoleToUserUseCase)
    userRepository = module.get(UserRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('execute', () => {
    const userId = 'user-1'
    const roleId = 'role-1'
    const tenantId = 'tenant-1'
    const adminUserId = 'admin-1'

    it('应该成功分配角色给用户', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        status: {
          isActive: jest.fn().mockReturnValue(true),
        },
        assignRole: jest.fn(),
        removeRole: jest.fn(),
      } as any

      const updatedMockUser = { ...mockUser }

      userRepository.findById.mockResolvedValue(mockUser)
      userRepository.save.mockResolvedValue(updatedMockUser)

      // Act
      const result = await useCase.execute(
        userId,
        roleId,
        tenantId,
        adminUserId,
      )

      // Assert
      expect(result).toBe(updatedMockUser)
      expect(userRepository.findById).toHaveBeenCalledWith(userId, tenantId)
      expect(mockUser.assignRole).toHaveBeenCalledWith(roleId)
      expect(userRepository.save).toHaveBeenCalledWith(mockUser)
    })

    it('当用户不存在时应该抛出NotFoundException', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null)

      // Act & Assert
      await expect(
        useCase.execute(userId, roleId, tenantId, adminUserId),
      ).rejects.toThrow(NotFoundException)
      await expect(
        useCase.execute(userId, roleId, tenantId, adminUserId),
      ).rejects.toThrow('用户不存在')
    })

    it('当尝试修改自己的角色分配时应该抛出BadRequestException', async () => {
      // Arrange
      const mockUser = {
        id: 'admin-1', // 与adminUserId相同
        status: {
          isActive: jest.fn().mockReturnValue(true),
        },
        assignRole: jest.fn(),
        removeRole: jest.fn(),
      } as any

      userRepository.findById.mockResolvedValue(mockUser)

      // Act & Assert
      await expect(
        useCase.execute(userId, roleId, tenantId, adminUserId),
      ).rejects.toThrow(BadRequestException)
      await expect(
        useCase.execute(userId, roleId, tenantId, adminUserId),
      ).rejects.toThrow('不能修改自己的角色分配')
    })

    it('当用户状态不是激活时应该抛出BadRequestException', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        status: {
          isActive: jest.fn().mockReturnValue(false),
        },
        assignRole: jest.fn(),
        removeRole: jest.fn(),
      } as any

      userRepository.findById.mockResolvedValue(mockUser)

      // Act & Assert
      await expect(
        useCase.execute(userId, roleId, tenantId, adminUserId),
      ).rejects.toThrow(BadRequestException)
      await expect(
        useCase.execute(userId, roleId, tenantId, adminUserId),
      ).rejects.toThrow('只有激活状态的用户才能被分配角色')
    })
  })

  describe('executeBatchAssign', () => {
    const userIds = ['user-1', 'user-2', 'user-3']
    const roleId = 'role-1'
    const tenantId = 'tenant-1'
    const adminUserId = 'admin-1'

    it('应该成功批量分配角色给用户', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        status: {
          isActive: jest.fn().mockReturnValue(true),
        },
        assignRole: jest.fn(),
        removeRole: jest.fn(),
      } as any

      const updatedMockUser = { ...mockUser }

      userRepository.findById.mockResolvedValue(mockUser)
      userRepository.save.mockResolvedValue(updatedMockUser)

      // Act
      const result = await useCase.executeBatchAssign(
        userIds,
        roleId,
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
        assignRole: jest.fn(),
        removeRole: jest.fn(),
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
        roleId,
        tenantId,
        adminUserId,
      )

      // Assert
      expect(result.success).toEqual(['user-1', 'user-3'])
      expect(result.failed).toEqual(['user-2'])
    })
  })

  describe('executeRemoveRole', () => {
    const userId = 'user-1'
    const roleId = 'role-1'
    const tenantId = 'tenant-1'
    const adminUserId = 'admin-1'

    it('应该成功移除用户的角色', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        status: {
          isActive: jest.fn().mockReturnValue(true),
        },
        assignRole: jest.fn(),
        removeRole: jest.fn(),
      } as any

      const updatedMockUser = { ...mockUser }

      userRepository.findById.mockResolvedValue(mockUser)
      userRepository.save.mockResolvedValue(updatedMockUser)

      // Act
      const result = await useCase.executeRemoveRole(
        userId,
        roleId,
        tenantId,
        adminUserId,
      )

      // Assert
      expect(result).toBe(updatedMockUser)
      expect(mockUser.removeRole).toHaveBeenCalledWith(roleId)
    })

    it('当用户不存在时应该抛出NotFoundException', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null)

      // Act & Assert
      await expect(
        useCase.executeRemoveRole(userId, roleId, tenantId, adminUserId),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('executeUpdateRoleIds', () => {
    const userId = 'user-1'
    const roleIds = ['role-1', 'role-2']
    const tenantId = 'tenant-1'
    const adminUserId = 'admin-1'

    it('应该成功更新用户的角色列表', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        status: {
          isActive: jest.fn().mockReturnValue(true),
        },
        assignRole: jest.fn(),
        removeRole: jest.fn(),
      } as any

      const updatedMockUser = { ...mockUser }

      userRepository.findById.mockResolvedValue(mockUser)
      userRepository.save.mockResolvedValue(updatedMockUser)

      // Act
      const result = await useCase.executeUpdateRoleIds(
        userId,
        roleIds,
        tenantId,
        adminUserId,
      )

      // Assert
      expect(result).toBe(updatedMockUser)
      expect(mockUser.removeRole).toHaveBeenCalled()
      expect(mockUser.assignRole).toHaveBeenCalledTimes(2)
      expect(mockUser.assignRole).toHaveBeenCalledWith('role-1')
      expect(mockUser.assignRole).toHaveBeenCalledWith('role-2')
    })

    it('当用户不存在时应该抛出NotFoundException', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null)

      // Act & Assert
      await expect(
        useCase.executeUpdateRoleIds(userId, roleIds, tenantId, adminUserId),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('executeGetUsersByRole', () => {
    const roleId = 'role-1'
    const tenantId = 'tenant-1'

    it('应该成功获取拥有指定角色的所有用户', async () => {
      // Arrange
      const mockUsers = [
        { id: 'user-1', username: 'user1' },
        { id: 'user-2', username: 'user2' },
      ] as unknown as User[]

      userRepository.findByRoleId.mockResolvedValue(mockUsers)

      // Act
      const result = await useCase.executeGetUsersByRole(roleId, tenantId)

      // Assert
      expect(result).toBe(mockUsers)
      expect(userRepository.findByRoleId).toHaveBeenCalledWith(roleId, tenantId)
    })
  })

  describe('executeAssignMultipleRoles', () => {
    const userId = 'user-1'
    const roleIds = ['role-1', 'role-2', 'role-3']
    const tenantId = 'tenant-1'
    const adminUserId = 'admin-1'

    it('应该成功为用户分配多个角色', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        status: {
          isActive: jest.fn().mockReturnValue(true),
        },
        assignRole: jest.fn(),
        removeRole: jest.fn(),
      } as any

      const updatedMockUser = { ...mockUser }

      userRepository.findById.mockResolvedValue(mockUser)
      userRepository.save.mockResolvedValue(updatedMockUser)

      // Act
      const result = await useCase.executeAssignMultipleRoles(
        userId,
        roleIds,
        tenantId,
        adminUserId,
      )

      // Assert
      expect(result).toBe(updatedMockUser)
      expect(mockUser.assignRole).toHaveBeenCalledTimes(3)
      expect(mockUser.assignRole).toHaveBeenCalledWith('role-1')
      expect(mockUser.assignRole).toHaveBeenCalledWith('role-2')
      expect(mockUser.assignRole).toHaveBeenCalledWith('role-3')
    })

    it('当用户不存在时应该抛出NotFoundException', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null)

      // Act & Assert
      await expect(
        useCase.executeAssignMultipleRoles(
          userId,
          roleIds,
          tenantId,
          adminUserId,
        ),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('executeGetUserRoles', () => {
    const userId = 'user-1'
    const tenantId = 'tenant-1'

    it('应该成功获取用户的所有角色', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        roleIds: ['role-1', 'role-2', 'role-3'],
      } as any

      userRepository.findById.mockResolvedValue(mockUser)

      // Act
      const result = await useCase.executeGetUserRoles(userId, tenantId)

      // Assert
      expect(result).toEqual(['role-1', 'role-2', 'role-3'])
      expect(userRepository.findById).toHaveBeenCalledWith(userId, tenantId)
    })

    it('当用户不存在时应该抛出NotFoundException', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null)

      // Act & Assert
      await expect(
        useCase.executeGetUserRoles(userId, tenantId),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('executeReplaceRoles', () => {
    const userId = 'user-1'
    const newRoleIds = ['role-1', 'role-2']
    const tenantId = 'tenant-1'
    const adminUserId = 'admin-1'

    it('应该成功替换用户的所有角色', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        status: {
          isActive: jest.fn().mockReturnValue(true),
        },
        assignRole: jest.fn(),
        removeRole: jest.fn(),
      } as any

      const updatedMockUser = { ...mockUser }

      userRepository.findById.mockResolvedValue(mockUser)
      userRepository.save.mockResolvedValue(updatedMockUser)

      // Act
      const result = await useCase.executeReplaceRoles(
        userId,
        newRoleIds,
        tenantId,
        adminUserId,
      )

      // Assert
      expect(result).toBe(updatedMockUser)
      expect(mockUser.removeRole).toHaveBeenCalled()
      expect(mockUser.assignRole).toHaveBeenCalledTimes(2)
      expect(mockUser.assignRole).toHaveBeenCalledWith('role-1')
      expect(mockUser.assignRole).toHaveBeenCalledWith('role-2')
    })

    it('当用户不存在时应该抛出NotFoundException', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null)

      // Act & Assert
      await expect(
        useCase.executeReplaceRoles(userId, newRoleIds, tenantId, adminUserId),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('executeCheckUserHasRole', () => {
    const userId = 'user-1'
    const roleId = 'role-1'
    const tenantId = 'tenant-1'

    it('当用户拥有指定角色时应该返回true', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        roleIds: ['role-1', 'role-2', 'role-3'],
      } as any

      userRepository.findById.mockResolvedValue(mockUser)

      // Act
      const result = await useCase.executeCheckUserHasRole(
        userId,
        roleId,
        tenantId,
      )

      // Assert
      expect(result).toBe(true)
      expect(userRepository.findById).toHaveBeenCalledWith(userId, tenantId)
    })

    it('当用户不拥有指定角色时应该返回false', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        roleIds: ['role-2', 'role-3'],
      } as any

      userRepository.findById.mockResolvedValue(mockUser)

      // Act
      const result = await useCase.executeCheckUserHasRole(
        userId,
        roleId,
        tenantId,
      )

      // Assert
      expect(result).toBe(false)
    })

    it('当用户不存在时应该抛出NotFoundException', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null)

      // Act & Assert
      await expect(
        useCase.executeCheckUserHasRole(userId, roleId, tenantId),
      ).rejects.toThrow(NotFoundException)
    })
  })
})

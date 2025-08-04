import { User } from '@/modules/iam/users/domain/entities/user.entity'
import { UserRepository } from '@/modules/iam/users/domain/repositories/user.repository'
import {
  UserStatus,
  UserStatusValue,
} from '@/modules/iam/users/domain/value-objects/user-status.value-object'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import { UpdateUserUseCase } from '../update-user.use-case'

/**
 * @description 更新用户用例的单元测试
 */
describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase
  let userRepository: jest.Mocked<UserRepository>

  const mockUserRepository = {
    findById: jest.fn(),
    save: jest.fn(),
    existsByPhoneString: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserUseCase,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile()

    useCase = module.get<UpdateUserUseCase>(UpdateUserUseCase)
    userRepository = module.get(UserRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('execute', () => {
    const userId = 'user-1'
    const tenantId = 'tenant-1'
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name',
      phone: '13987654321',
      displayName: 'Updated User',
      avatar: 'https://example.com/new-avatar.jpg',
      organizationIds: ['org-3', 'org-4'],
      roleIds: ['role-3', 'role-4'],
      preferences: { theme: 'light' },
    }

    it('应该成功更新用户信息', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        username: 'testuser',
        email: {
          getValue: jest.fn().mockReturnValue('test@example.com'),
        },
        firstName: 'Test',
        lastName: 'User',
        status: new UserStatusValue(UserStatus.ACTIVE),
        tenantId: 'tenant-1',
        adminUserId: 'admin-1',
        passwordHash: 'hashedPassword123',
        phone: '13812345678',
        displayName: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
        organizationIds: ['org-1', 'org-2'],
        roleIds: ['role-1', 'role-2'],
        preferences: { theme: 'dark' },
        updateInfo: jest.fn(),
        updateContactInfo: jest.fn(),
        removeFromOrganization: jest.fn(),
        assignToOrganization: jest.fn(),
        removeRole: jest.fn(),
        assignRole: jest.fn(),
        updatePreferences: jest.fn(),
      } as any

      const updatedMockUser = { ...mockUser, ...updateData }

      userRepository.findById.mockResolvedValue(mockUser)
      userRepository.existsByPhoneString.mockResolvedValue(false)
      userRepository.save.mockResolvedValue(updatedMockUser)

      // Act
      const result = await useCase.execute(userId, updateData, tenantId)

      // Assert
      expect(result).toBe(updatedMockUser)
      expect(userRepository.findById).toHaveBeenCalledWith(userId, tenantId)
      expect(userRepository.save).toHaveBeenCalledWith(mockUser)
    })

    it('当用户不存在时应该抛出NotFoundException', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null)

      // Act & Assert
      await expect(
        useCase.execute(userId, updateData, tenantId),
      ).rejects.toThrow(NotFoundException)
      await expect(
        useCase.execute(userId, updateData, tenantId),
      ).rejects.toThrow('用户不存在')
    })

    it('当手机号已被其他用户使用时应该抛出ConflictException', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        phone: '13812345678',
        updateInfo: jest.fn(),
        updateContactInfo: jest.fn(),
        removeFromOrganization: jest.fn(),
        assignToOrganization: jest.fn(),
        removeRole: jest.fn(),
        assignRole: jest.fn(),
        updatePreferences: jest.fn(),
      } as any

      userRepository.findById.mockResolvedValue(mockUser)
      userRepository.existsByPhoneString.mockResolvedValue(true)

      // Act & Assert
      await expect(
        useCase.execute(userId, updateData, tenantId),
      ).rejects.toThrow(ConflictException)
      await expect(
        useCase.execute(userId, updateData, tenantId),
      ).rejects.toThrow('手机号已被其他用户使用')
    })

    it('应该正确处理部分更新', async () => {
      // Arrange
      const partialUpdateData = {
        firstName: 'Updated',
        displayName: 'Updated User',
      }

      const mockUser = {
        id: 'user-1',
        firstName: 'Test',
        lastName: 'User',
        displayName: 'Test User',
        updateInfo: jest.fn(),
        updateContactInfo: jest.fn(),
        removeFromOrganization: jest.fn(),
        assignToOrganization: jest.fn(),
        removeRole: jest.fn(),
        assignRole: jest.fn(),
        updatePreferences: jest.fn(),
      } as any

      const updatedMockUser = { ...mockUser, ...partialUpdateData }

      userRepository.findById.mockResolvedValue(mockUser)
      userRepository.save.mockResolvedValue(updatedMockUser)

      // Act
      const result = await useCase.execute(userId, partialUpdateData, tenantId)

      // Assert
      expect(result).toBe(updatedMockUser)
      expect(mockUser.updateInfo).toHaveBeenCalledWith(
        'Updated',
        'User',
        'Updated User',
        undefined,
      )
    })
  })

  describe('executePartialUpdate', () => {
    const userId = 'user-1'
    const tenantId = 'tenant-1'

    it('应该成功更新firstName', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        firstName: 'Test',
        lastName: 'User',
        displayName: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
        updateInfo: jest.fn(),
        updateContactInfo: jest.fn(),
      } as any

      const updatedMockUser = { ...mockUser, firstName: 'Updated' }

      userRepository.findById.mockResolvedValue(mockUser)
      userRepository.save.mockResolvedValue(updatedMockUser)

      // Act
      const result = await useCase.executePartialUpdate(
        userId,
        'firstName',
        'Updated',
        tenantId,
      )

      // Assert
      expect(result).toBe(updatedMockUser)
      expect(mockUser.updateInfo).toHaveBeenCalledWith(
        'Updated',
        'User',
        'Test User',
        'https://example.com/avatar.jpg',
      )
    })

    it('应该成功更新phone', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        phone: '13812345678',
        email: {
          getValue: jest.fn().mockReturnValue('test@example.com'),
        },
        updateInfo: jest.fn(),
        updateContactInfo: jest.fn(),
      } as any

      const updatedMockUser = { ...mockUser, phone: '13987654321' }

      userRepository.findById.mockResolvedValue(mockUser)
      userRepository.existsByPhoneString.mockResolvedValue(false)
      userRepository.save.mockResolvedValue(updatedMockUser)

      // Act
      const result = await useCase.executePartialUpdate(
        userId,
        'phone',
        '13987654321',
        tenantId,
      )

      // Assert
      expect(result).toBe(updatedMockUser)
      expect(mockUser.updateContactInfo).toHaveBeenCalledWith(
        'test@example.com',
        '13987654321',
      )
    })

    it('当用户不存在时应该抛出NotFoundException', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null)

      // Act & Assert
      await expect(
        useCase.executePartialUpdate(userId, 'firstName', 'Updated', tenantId),
      ).rejects.toThrow(NotFoundException)
    })

    it('当更新手机号且手机号已被使用时应该抛出ConflictException', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        phone: '13812345678',
        email: {
          getValue: jest.fn().mockReturnValue('test@example.com'),
        },
        updateInfo: jest.fn(),
        updateContactInfo: jest.fn(),
      } as any

      userRepository.findById.mockResolvedValue(mockUser)
      userRepository.existsByPhoneString.mockResolvedValue(true)

      // Act & Assert
      await expect(
        useCase.executePartialUpdate(userId, 'phone', '13987654321', tenantId),
      ).rejects.toThrow(ConflictException)
    })
  })
})

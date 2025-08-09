import type { User } from '@/modules/iam/users/domain/entities/user.entity'
import { UserRepository } from '@/modules/iam/users/domain/repositories/user.repository'
import {
  UserStatus,
  UserStatusValue,
} from '@/modules/iam/users/domain/value-objects/user-status.value-object'
import { NotFoundException } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import { GetUserUseCase } from '../get-user.use-case'

/**
 * @description 获取用户用例的单元测试
 */
describe('GetUserUseCase', () => {
  let useCase: GetUserUseCase
  let userRepository: jest.Mocked<UserRepository>

  const mockUserRepository = {
    findById: jest.fn(),
    findByUsernameString: jest.fn(),
    findByEmailString: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserUseCase,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile()

    useCase = module.get<GetUserUseCase>(GetUserUseCase)
    userRepository = module.get(UserRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('execute', () => {
    const userId = 'user-1'
    const tenantId = 'tenant-1'

    it('应该成功根据ID获取用户', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        username: {
          getValue: jest.fn().mockReturnValue('testuser'),
        },
        email: {
          getValue: jest.fn().mockReturnValue('test@example.com'),
        },
        firstName: 'Test',
        lastName: 'User',
        status: new UserStatusValue(UserStatus.ACTIVE),
        tenantId: 'tenant-1',
        adminUserId: 'admin-1',
        passwordHash: 'hashedPassword123',
        phone: {
          getValue: jest.fn().mockReturnValue('13812345678'),
        },
        displayName: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
        organizationIds: ['org-1', 'org-2'],
        roleIds: ['role-1', 'role-2'],
        preferences: { theme: 'dark' },
        loginAttempts: 0,
        emailVerified: false,
        phoneVerified: false,
        twoFactorEnabled: false,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        updateInfo: jest.fn(),
        updateContactInfo: jest.fn(),
        removeFromOrganization: jest.fn(),
        assignToOrganization: jest.fn(),
        removeRole: jest.fn(),
        assignRole: jest.fn(),
        updatePreferences: jest.fn(),
        activate: jest.fn(),
        suspend: jest.fn(),
        markAsDeleted: jest.fn(),
        restore: jest.fn(),
        getEmail: jest.fn().mockReturnValue('test@example.com'),
      } as unknown as User

      userRepository.findById.mockResolvedValue(mockUser)

      // Act
      const result = await useCase.execute(userId, tenantId)

      // Assert
      expect(result).toBe(mockUser)
      expect(userRepository.findById).toHaveBeenCalledWith(userId, tenantId)
    })

    it('当用户不存在时应该抛出NotFoundException', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null)

      // Act & Assert
      await expect(useCase.execute(userId, tenantId)).rejects.toThrow(
        NotFoundException,
      )
      await expect(useCase.execute(userId, tenantId)).rejects.toThrow(
        '用户不存在',
      )
    })
  })

  describe('executeByUsername', () => {
    const username = 'testuser'
    const tenantId = 'tenant-1'

    it('应该成功根据用户名获取用户', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        username: {
          getValue: jest.fn().mockReturnValue('testuser'),
        },
        email: {
          getValue: jest.fn().mockReturnValue('test@example.com'),
        },
        firstName: 'Test',
        lastName: 'User',
        status: new UserStatusValue(UserStatus.ACTIVE),
        tenantId: 'tenant-1',
        adminUserId: 'admin-1',
        passwordHash: 'hashedPassword123',
        phone: {
          getValue: jest.fn().mockReturnValue('13812345678'),
        },
        displayName: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
        organizationIds: ['org-1', 'org-2'],
        roleIds: ['role-1', 'role-2'],
        preferences: { theme: 'dark' },
        loginAttempts: 0,
        emailVerified: false,
        phoneVerified: false,
        twoFactorEnabled: false,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        updateInfo: jest.fn(),
        updateContactInfo: jest.fn(),
        removeFromOrganization: jest.fn(),
        assignToOrganization: jest.fn(),
        removeRole: jest.fn(),
        assignRole: jest.fn(),
        updatePreferences: jest.fn(),
        activate: jest.fn(),
        suspend: jest.fn(),
        markAsDeleted: jest.fn(),
        restore: jest.fn(),
        getEmail: jest.fn().mockReturnValue('test@example.com'),
      } as unknown as User

      userRepository.findByUsernameString.mockResolvedValue(mockUser)

      // Act
      const result = await useCase.executeByUsername(username, tenantId)

      // Assert
      expect(result).toBe(mockUser)
      expect(userRepository.findByUsernameString).toHaveBeenCalledWith(
        username,
        tenantId,
      )
    })

    it('当用户不存在时应该抛出NotFoundException', async () => {
      // Arrange
      userRepository.findByUsernameString.mockResolvedValue(null)

      // Act & Assert
      await expect(
        useCase.executeByUsername(username, tenantId),
      ).rejects.toThrow(NotFoundException)
      await expect(
        useCase.executeByUsername(username, tenantId),
      ).rejects.toThrow('用户不存在')
    })
  })

  describe('executeByEmail', () => {
    const email = 'test@example.com'
    const tenantId = 'tenant-1'

    it('应该成功根据邮箱获取用户', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        username: {
          getValue: jest.fn().mockReturnValue('testuser'),
        },
        email: {
          getValue: jest.fn().mockReturnValue('test@example.com'),
        },
        firstName: 'Test',
        lastName: 'User',
        status: new UserStatusValue(UserStatus.ACTIVE),
        tenantId: 'tenant-1',
        adminUserId: 'admin-1',
        passwordHash: 'hashedPassword123',
        phone: {
          getValue: jest.fn().mockReturnValue('13812345678'),
        },
        displayName: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
        organizationIds: ['org-1', 'org-2'],
        roleIds: ['role-1', 'role-2'],
        preferences: { theme: 'dark' },
        loginAttempts: 0,
        emailVerified: false,
        phoneVerified: false,
        twoFactorEnabled: false,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        updateInfo: jest.fn(),
        updateContactInfo: jest.fn(),
        removeFromOrganization: jest.fn(),
        assignToOrganization: jest.fn(),
        removeRole: jest.fn(),
        assignRole: jest.fn(),
        updatePreferences: jest.fn(),
        activate: jest.fn(),
        suspend: jest.fn(),
        markAsDeleted: jest.fn(),
        restore: jest.fn(),
        getEmail: jest.fn().mockReturnValue('test@example.com'),
      } as unknown as User

      userRepository.findByEmailString.mockResolvedValue(mockUser)

      // Act
      const result = await useCase.executeByEmail(email, tenantId)

      // Assert
      expect(result).toBe(mockUser)
      expect(userRepository.findByEmailString).toHaveBeenCalledWith(
        email,
        tenantId,
      )
    })

    it('当用户不存在时应该抛出NotFoundException', async () => {
      // Arrange
      userRepository.findByEmailString.mockResolvedValue(null)

      // Act & Assert
      await expect(useCase.executeByEmail(email, tenantId)).rejects.toThrow(
        NotFoundException,
      )
      await expect(useCase.executeByEmail(email, tenantId)).rejects.toThrow(
        '用户不存在',
      )
    })
  })
})

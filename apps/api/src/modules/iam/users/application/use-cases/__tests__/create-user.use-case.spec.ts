import type { User } from '@/modules/iam/users/domain/entities/user.entity'
import { UserRepository } from '@/modules/iam/users/domain/repositories/user.repository'
import {
  UserStatus,
  UserStatusValue,
} from '@/modules/iam/users/domain/value-objects/user-status.value-object'
import { ConflictException } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import { CreateUserUseCase } from '../create-user.use-case'

/**
 * @description 创建用户用例的单元测试
 */
describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase
  let userRepository: jest.Mocked<UserRepository>

  const mockUserRepository = {
    save: jest.fn(),
    existsByUsernameString: jest.fn(),
    existsByEmailString: jest.fn(),
    existsByPhoneString: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile()

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase)
    userRepository = module.get(UserRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('execute', () => {
    const createUserData = {
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      passwordHash: 'hashedPassword123',
      phone: '13812345678',
      displayName: 'Test User',
      avatar: 'https://example.com/avatar.jpg',
      organizationIds: ['org-1', 'org-2'],
      roleIds: ['role-1', 'role-2'],
      preferences: { theme: 'dark' },
    }

    const tenantId = 'tenant-1'
    const adminUserId = 'admin-1'

    it('应该成功创建用户', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        status: new UserStatusValue(UserStatus.PENDING),
        tenantId: 'tenant-1',
        adminUserId: 'admin-1',
        passwordHash: 'hashedPassword123',
        phone: '13812345678',
        displayName: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
        organizationIds: ['org-1', 'org-2'],
        roleIds: ['role-1', 'role-2'],
        preferences: { theme: 'dark' },
      } as unknown as User

      userRepository.existsByUsernameString.mockResolvedValue(false)
      userRepository.existsByEmailString.mockResolvedValue(false)
      userRepository.existsByPhoneString.mockResolvedValue(false)
      userRepository.save.mockResolvedValue(mockUser)

      // Act
      const result = await useCase.execute(
        createUserData,
        tenantId,
        adminUserId,
      )

      // Assert
      expect(result).toBe(mockUser)
      expect(userRepository.existsByUsernameString).toHaveBeenCalledWith(
        'testuser',
        tenantId,
      )
      expect(userRepository.existsByEmailString).toHaveBeenCalledWith(
        'test@example.com',
        tenantId,
      )
      expect(userRepository.existsByPhoneString).toHaveBeenCalledWith(
        '13812345678',
        tenantId,
      )
      expect(userRepository.save).toHaveBeenCalled()
    })

    it('当用户名已存在时应该抛出ConflictException', async () => {
      // Arrange
      userRepository.existsByUsernameString.mockResolvedValue(true)

      // Act & Assert
      await expect(
        useCase.execute(createUserData, tenantId, adminUserId),
      ).rejects.toThrow(ConflictException)
      await expect(
        useCase.execute(createUserData, tenantId, adminUserId),
      ).rejects.toThrow('用户名已存在')
    })

    it('当邮箱已存在时应该抛出ConflictException', async () => {
      // Arrange
      userRepository.existsByUsernameString.mockResolvedValue(false)
      userRepository.existsByEmailString.mockResolvedValue(true)

      // Act & Assert
      await expect(
        useCase.execute(createUserData, tenantId, adminUserId),
      ).rejects.toThrow(ConflictException)
      await expect(
        useCase.execute(createUserData, tenantId, adminUserId),
      ).rejects.toThrow('邮箱已存在')
    })

    it('当手机号已存在时应该抛出ConflictException', async () => {
      // Arrange
      userRepository.existsByUsernameString.mockResolvedValue(false)
      userRepository.existsByEmailString.mockResolvedValue(false)
      userRepository.existsByPhoneString.mockResolvedValue(true)

      // Act & Assert
      await expect(
        useCase.execute(createUserData, tenantId, adminUserId),
      ).rejects.toThrow(ConflictException)
      await expect(
        useCase.execute(createUserData, tenantId, adminUserId),
      ).rejects.toThrow('手机号已存在')
    })

    it('当没有提供手机号时不应该检查手机号唯一性', async () => {
      // Arrange
      const createUserDataWithoutPhone = {
        ...createUserData,
        phone: undefined,
      }

      const mockUser = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        status: new UserStatusValue(UserStatus.PENDING),
        tenantId: 'tenant-1',
        adminUserId: 'admin-1',
        passwordHash: 'hashedPassword123',
      } as unknown as User

      userRepository.existsByUsernameString.mockResolvedValue(false)
      userRepository.existsByEmailString.mockResolvedValue(false)
      userRepository.save.mockResolvedValue(mockUser)

      // Act
      await useCase.execute(createUserDataWithoutPhone, tenantId, adminUserId)

      // Assert
      expect(userRepository.existsByPhoneString).not.toHaveBeenCalled()
    })

    it('应该正确处理可选的字段', async () => {
      // Arrange
      const createUserDataMinimal = {
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        passwordHash: 'hashedPassword123',
      }

      const mockUser = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        status: new UserStatusValue(UserStatus.PENDING),
        tenantId: 'tenant-1',
        adminUserId: 'admin-1',
        passwordHash: 'hashedPassword123',
      } as unknown as User

      userRepository.existsByUsernameString.mockResolvedValue(false)
      userRepository.existsByEmailString.mockResolvedValue(false)
      userRepository.save.mockResolvedValue(mockUser)

      // Act
      const result = await useCase.execute(
        createUserDataMinimal,
        tenantId,
        adminUserId,
      )

      // Assert
      expect(result).toBe(mockUser)
      expect(userRepository.existsByUsernameString).toHaveBeenCalledWith(
        'testuser',
        tenantId,
      )
      expect(userRepository.existsByEmailString).toHaveBeenCalledWith(
        'test@example.com',
        tenantId,
      )
    })
  })
})

/**
 * @file get-user-profile.use-case.spec.ts
 * @description GetUserProfileUseCase 单元测试
 */
import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@libs/pino-nestjs'
import { GetUserProfileUseCase } from '../get-user-profile.use-case'
import { GetUserProfileQuery } from '../../queries/get-user-profile.query'
import { UserRepository } from '../../../domain/repositories/user.repository.interface'
import { User } from '../../../domain/entities/user.entity'
import { UserId } from '../../../domain/value-objects/user-id.vo'

describe('GetUserProfileUseCase', () => {
  let useCase: GetUserProfileUseCase
  let userRepository: jest.Mocked<UserRepository>
  let logger: jest.Mocked<Logger>

  const mockUser = {
    getId: jest.fn().mockReturnValue({ getValue: () => '550e8400-e29b-41d4-a716-446655440000' }),
    getEmail: jest.fn().mockReturnValue({ getValue: () => 'test@example.com' }),
    getUsername: jest.fn().mockReturnValue({ getValue: () => 'testuser' }),
    getFirstName: jest.fn().mockReturnValue('John'),
    getLastName: jest.fn().mockReturnValue('Doe'),
    getDisplayName: jest.fn().mockReturnValue('John Doe'),
    getAvatar: jest.fn().mockReturnValue('https://example.com/avatar.jpg'),
    getPhoneNumber: jest.fn().mockReturnValue({ getValue: () => '+8613800138000' }),
    getStatus: jest.fn().mockReturnValue({
      getValue: () => 'active',
      isDeleted: jest.fn().mockReturnValue(false)
    }),
    isEmailVerified: jest.fn().mockReturnValue(true),
    isPhoneVerified: jest.fn().mockReturnValue(false),
    isTwoFactorEnabled: jest.fn().mockReturnValue(false),
    getLastLoginAt: jest.fn().mockReturnValue(new Date('2024-01-01')),
    getCreatedAt: jest.fn().mockReturnValue(new Date('2024-01-01')),
    getUpdatedAt: jest.fn().mockReturnValue(new Date('2024-01-01')),
    getPreferences: jest.fn().mockReturnValue({ theme: 'dark' }),
    getLoginAttempts: jest.fn().mockReturnValue(0),
    getLockedUntil: jest.fn().mockReturnValue(undefined),
    getPasswordChangedAt: jest.fn().mockReturnValue(new Date('2024-01-01')),
    getTwoFactorSecret: jest.fn().mockReturnValue(undefined),
  } as unknown as User

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserProfileUseCase,
        {
          provide: 'UserRepository',
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile()

    useCase = module.get<GetUserProfileUseCase>(GetUserProfileUseCase)
    userRepository = module.get('UserRepository')
    logger = module.get(Logger)
  })

  describe('execute', () => {
    const createQuery = (overrides: Partial<any> = {}) => {
      return new GetUserProfileQuery({
        userId: '550e8400-e29b-41d4-a716-446655440000',
        tenantId: 'tenant-123',
        includeSensitiveData: false,
        ...overrides,
      })
    }

    it('应该成功执行获取用户资料用例', async () => {
      // Arrange
      const query = createQuery()
      userRepository.findById.mockResolvedValue(mockUser)

      // Act
      const result = await useCase.execute(query)

      // Assert
      expect(result.success).toBe(true)
      expect(result.userProfile).toBeDefined()
      expect(result.userProfile?.id).toBe('550e8400-e29b-41d4-a716-446655440000')
      expect(result.userProfile?.email).toBe('test@example.com')
      expect(result.userProfile?.username).toBe('testuser')
      expect(userRepository.findById).toHaveBeenCalledWith(expect.any(UserId), 'tenant-123')
    })

    it('应该处理用户不存在的情况', async () => {
      // Arrange
      const query = createQuery()
      userRepository.findById.mockResolvedValue(null)

      // Act
      const result = await useCase.execute(query)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('用户不存在')
      expect(result.userProfile).toBeNull()
    })

    it('应该处理已删除用户的情况', async () => {
      // Arrange
      const query = createQuery()
      const deletedUser = {
        ...mockUser,
        getStatus: jest.fn().mockReturnValue({
          getValue: () => 'deleted',
          isDeleted: jest.fn().mockReturnValue(true)
        }),
      } as unknown as User
      userRepository.findById.mockResolvedValue(deletedUser)

      // Act
      const result = await useCase.execute(query)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('已删除的用户无法获取资料')
      expect(result.userProfile).toBeNull()
    })

    it('应该处理查询验证失败', async () => {
      // Arrange
      const query = createQuery({ userId: '' }) // 无效的用户ID

      // Act
      const result = await useCase.execute(query)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.userProfile).toBeNull()
    })

    it('应该处理仓储异常', async () => {
      // Arrange
      const query = createQuery()
      const error = new Error('Database connection failed')
      userRepository.findById.mockRejectedValue(error)

      // Act
      const result = await useCase.execute(query)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Database connection failed')
      expect(result.userProfile).toBeNull()
      expect(logger.error).toHaveBeenCalled()
    })

    it('应该构建正确的用户资料', async () => {
      // Arrange
      const query = createQuery()
      userRepository.findById.mockResolvedValue(mockUser)

      // Act
      const result = await useCase.execute(query)

      // Assert
      expect(result.success).toBe(true)
      expect(result.userProfile).toEqual({
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'John',
        lastName: 'Doe',
        displayName: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
        phone: '+8613800138000',
        status: 'active',
        emailVerified: true,
        phoneVerified: false,
        twoFactorEnabled: false,
        lastLoginAt: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        preferences: { theme: 'dark' },
      })
    })

    it('应该包含敏感数据当includeSensitiveData为true时', async () => {
      // Arrange
      const query = createQuery({ includeSensitiveData: true })
      const userWithSensitiveData = {
        ...mockUser,
        getLoginAttempts: jest.fn().mockReturnValue(3),
        getLockedUntil: jest.fn().mockReturnValue(new Date('2024-01-02')),
        getPasswordChangedAt: jest.fn().mockReturnValue(new Date('2024-01-01')),
        getTwoFactorSecret: jest.fn().mockReturnValue('secret123'),
      } as unknown as User
      userRepository.findById.mockResolvedValue(userWithSensitiveData)

      // Act
      const result = await useCase.execute(query)

      // Assert
      expect(result.success).toBe(true)
      expect(result.userProfile).toEqual(
        expect.objectContaining({
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'test@example.com',
          loginAttempts: 3,
          lockedUntil: new Date('2024-01-02'),
          passwordChangedAt: new Date('2024-01-01'),
          twoFactorSecret: 'secret123',
        })
      )
    })

    it('应该记录审计日志', async () => {
      // Arrange
      const query = createQuery()
      userRepository.findById.mockResolvedValue(mockUser)

      // Act
      await useCase.execute(query)

      // Assert
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('开始执行获取用户资料用例'),
        'GetUserProfileUseCase'
      )
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('获取用户资料用例执行成功'),
        'GetUserProfileUseCase'
      )
    })

    it('应该处理用户没有手机号的情况', async () => {
      // Arrange
      const query = createQuery()
      const userWithoutPhone = {
        ...mockUser,
        getPhoneNumber: jest.fn().mockReturnValue(undefined),
      } as unknown as User
      userRepository.findById.mockResolvedValue(userWithoutPhone)

      // Act
      const result = await useCase.execute(query)

      // Assert
      expect(result.success).toBe(true)
      expect(result.userProfile?.phone).toBeUndefined()
    })

    it('应该处理用户没有偏好设置的情况', async () => {
      // Arrange
      const query = createQuery()
      const userWithoutPreferences = {
        ...mockUser,
        getPreferences: jest.fn().mockReturnValue(undefined),
      } as unknown as User
      userRepository.findById.mockResolvedValue(userWithoutPreferences)

      // Act
      const result = await useCase.execute(query)

      // Assert
      expect(result.success).toBe(true)
      expect(result.userProfile?.preferences).toBeUndefined()
    })
  })
})

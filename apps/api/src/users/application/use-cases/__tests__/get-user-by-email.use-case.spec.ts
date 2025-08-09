import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@libs/pino-nestjs'
import { GetUserByEmailUseCase } from '../get-user-by-email.use-case'
import { GetUserByEmailQuery } from '../../queries/get-user-by-email.query'
import type { UserRepository } from '../../../domain/repositories/user.repository.interface'
import type { User } from '../../../domain/entities/user.entity'

describe('GetUserByEmailUseCase', () => {
  let useCase: GetUserByEmailUseCase
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
      isActive: jest.fn().mockReturnValue(true),
      isLocked: jest.fn().mockReturnValue(false),
      isDeleted: jest.fn().mockReturnValue(false)
    }),
    isEmailVerified: jest.fn().mockReturnValue(true),
    isPhoneVerified: jest.fn().mockReturnValue(false),
    isTwoFactorEnabled: jest.fn().mockReturnValue(false),
    getLastLoginAt: jest.fn().mockReturnValue(new Date('2024-01-01')),
    getCreatedAt: jest.fn().mockReturnValue(new Date('2024-01-01')),
    getUpdatedAt: jest.fn().mockReturnValue(new Date('2024-01-01')),
  } as unknown as User

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserByEmailUseCase,
        {
          provide: 'UserRepository',
          useValue: {
            findById: jest.fn(),
            save: jest.fn(),
            findByEmail: jest.fn(),
            findByUsername: jest.fn(),
            findByEmailOrUsername: jest.fn(),
            exists: jest.fn(),
            existsByEmail: jest.fn(),
            existsByUsername: jest.fn(),
            delete: jest.fn(),
            findActiveUsers: jest.fn(),
            findUsersByStatus: jest.fn(),
            count: jest.fn(),
            findUsersForTenant: jest.fn(),
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

    useCase = module.get<GetUserByEmailUseCase>(GetUserByEmailUseCase)
    userRepository = module.get('UserRepository')
    logger = module.get(Logger)
  })

  describe('execute', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    const createQuery = (overrides: Partial<any> = {}) => {
      return new GetUserByEmailQuery({
        email: 'test@example.com',
        tenantId: '550e8400-e29b-41d4-a716-446655440001',
        includeSensitiveData: false,
        ...overrides,
      })
    }

    it('应该成功根据邮箱获取用户', async () => {
      // Arrange
      const query = createQuery()
      userRepository.findByEmail.mockResolvedValue(mockUser)

      // Act
      const result = await useCase.execute(query)

      // Assert
      expect(result.success).toBe(true)
      expect(result.user).toBeDefined()
      expect(result.user.id).toBe('550e8400-e29b-41d4-a716-446655440000')
      expect(result.user.email).toBe('test@example.com')
      expect(result.user.username).toBe('testuser')
      expect(userRepository.findByEmail).toHaveBeenCalledWith(expect.any(Object), '550e8400-e29b-41d4-a716-446655440001')
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('根据邮箱查询用户用例执行成功'),
        'GetUserByEmailUseCase'
      )
    })

    it('应该处理用户不存在的情况', async () => {
      // Arrange
      const query = createQuery()
      userRepository.findByEmail.mockResolvedValue(null)

      // Act
      const result = await useCase.execute(query)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('用户不存在')
      expect(result.user).toBeUndefined()
      expect(logger.error).toHaveBeenCalled()
    })

    it('应该处理已删除用户的情况', async () => {
      // Arrange
      const query = createQuery()
      const deletedUser = {
        ...mockUser,
        getStatus: jest.fn().mockReturnValue({
          getValue: () => 'deleted',
          isActive: jest.fn().mockReturnValue(false),
          isLocked: jest.fn().mockReturnValue(false),
          isDeleted: jest.fn().mockReturnValue(true)
        }),
      }
      userRepository.findByEmail.mockResolvedValue(deletedUser as unknown as User)

      // Act
      const result = await useCase.execute(query)

      // Assert
      expect(result.success).toBe(true)
      expect(result.user).toBeUndefined()
      // 当用户被删除时，用例返回success: true，不会记录错误日志
      expect(logger.error).not.toHaveBeenCalled()
    })

    it('应该处理查询验证失败', async () => {
      // Arrange
      const query = createQuery({ email: '' }) // 无效的邮箱

      // Act
      const result = await useCase.execute(query)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(logger.error).toHaveBeenCalled()
    })

    it('应该处理仓储异常', async () => {
      // Arrange
      const query = createQuery()
      const error = new Error('Database connection failed')
      userRepository.findByEmail.mockRejectedValue(error)

      // Act
      const result = await useCase.execute(query)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Database connection failed')
      expect(logger.error).toHaveBeenCalled()
    })

    it('应该记录审计日志', async () => {
      // Arrange
      const query = createQuery()
      userRepository.findByEmail.mockResolvedValue(mockUser)

      // Act
      await useCase.execute(query)

      // Assert
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('开始执行根据邮箱查询用户用例'),
        'GetUserByEmailUseCase'
      )
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('根据邮箱查询用户用例执行成功'),
        'GetUserByEmailUseCase'
      )
    })
  })
})

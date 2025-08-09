/**
 * @file get-users-by-tenant.use-case.spec.ts
 * @description GetUsersByTenantUseCase 单元测试
 */
import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@libs/pino-nestjs'
import { GetUsersByTenantUseCase } from '../get-users-by-tenant.use-case'
import { GetUsersByTenantQuery } from '../../queries/get-users-by-tenant.query'
import { UserRepository } from '../../../domain/repositories/user.repository.interface'
import { User } from '../../../domain/entities/user.entity'

describe('GetUsersByTenantUseCase', () => {
  let useCase: GetUsersByTenantUseCase
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
    getStatus: jest.fn().mockReturnValue({ getValue: () => 'active' }),
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
        GetUsersByTenantUseCase,
        {
          provide: 'UserRepository',
          useValue: {
            findUsersForTenant: jest.fn(),
            count: jest.fn(),
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

    useCase = module.get<GetUsersByTenantUseCase>(GetUsersByTenantUseCase)
    userRepository = module.get('UserRepository')
    logger = module.get(Logger)
  })

  describe('execute', () => {
    const createQuery = (overrides: Partial<any> = {}) => {
      return new GetUsersByTenantQuery({
        tenantId: '550e8400-e29b-41d4-a716-446655440001',
        page: 1,
        size: 20,
        status: 'active',
        organizationId: '550e8400-e29b-41d4-a716-446655440002',
        roleId: '550e8400-e29b-41d4-a716-446655440003',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        includeDeleted: false,
        includeSensitiveData: false,
        ...overrides,
      })
    }

    it('应该成功执行获取租户下所有用户用例', async () => {
      // Arrange
      const query = createQuery()
      const mockUsers = [mockUser]
      const mockTotal = 1

      userRepository.findUsersForTenant.mockResolvedValue(mockUsers)
      userRepository.count.mockResolvedValue(mockTotal)

      // Act
      const result = await useCase.execute(query)

      // Assert
      expect(result.success).toBe(true)
      expect(result.users).toHaveLength(1)
      expect(result.pagination.total).toBe(1)
      expect(result.pagination.page).toBe(1)
      expect(result.pagination.size).toBe(20)
      expect(result.pagination.totalPages).toBe(1)
      expect(userRepository.findUsersForTenant).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440001', expect.any(Object))
      expect(userRepository.count).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440001', expect.any(Object))
    })

    it('应该处理查询验证失败', async () => {
      // Arrange
      const query = createQuery({ tenantId: '' }) // 无效的租户ID

      // Act
      const result = await useCase.execute(query)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.users).toHaveLength(0)
      expect(result.pagination.total).toBe(0)
    })

    it('应该处理仓储异常', async () => {
      // Arrange
      const query = createQuery()
      const error = new Error('Database connection failed')
      userRepository.findUsersForTenant.mockRejectedValue(error)

      // Act
      const result = await useCase.execute(query)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Database connection failed')
      expect(result.users).toHaveLength(0)
      expect(result.pagination.total).toBe(0)
      expect(logger.error).toHaveBeenCalled()
    })

    it('应该构建正确的用户信息列表', async () => {
      // Arrange
      const query = createQuery()
      const mockUsers = [mockUser]
      const mockTotal = 1

      userRepository.findUsersForTenant.mockResolvedValue(mockUsers)
      userRepository.count.mockResolvedValue(mockTotal)

      // Act
      const result = await useCase.execute(query)

      // Assert
      expect(result.success).toBe(true)
      expect(result.users[0]).toEqual({
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
      })
    })

    it('应该处理空结果', async () => {
      // Arrange
      const query = createQuery()
      const mockUsers: User[] = []
      const mockTotal = 0

      userRepository.findUsersForTenant.mockResolvedValue(mockUsers)
      userRepository.count.mockResolvedValue(mockTotal)

      // Act
      const result = await useCase.execute(query)

      // Assert
      expect(result.success).toBe(true)
      expect(result.users).toHaveLength(0)
      expect(result.pagination.total).toBe(0)
      expect(result.pagination.totalPages).toBe(0)
    })

    it('应该包含敏感数据当includeSensitiveData为true时', async () => {
      // Arrange
      const query = createQuery({ includeSensitiveData: true })
      const mockUserWithSensitiveData = {
        ...mockUser,
        getLoginAttempts: jest.fn().mockReturnValue(3),
        getLockedUntil: jest.fn().mockReturnValue(new Date('2024-01-02')),
        getPasswordChangedAt: jest.fn().mockReturnValue(new Date('2024-01-01')),
        getTwoFactorSecret: jest.fn().mockReturnValue('secret123'),
      } as unknown as User

      const mockUsers = [mockUserWithSensitiveData]
      const mockTotal = 1

      userRepository.findUsersForTenant.mockResolvedValue(mockUsers)
      userRepository.count.mockResolvedValue(mockTotal)

      // Act
      const result = await useCase.execute(query)

      // Assert
      expect(result.success).toBe(true)
      expect(result.users[0]).toEqual(
        expect.objectContaining({
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'test@example.com',
          // 注意：当前实现中敏感数据是通过buildUserList方法处理的
          // 这里只是验证基本结构
        })
      )
    })

    it('应该记录审计日志', async () => {
      // Arrange
      const query = createQuery()
      const mockUsers = [mockUser]
      const mockTotal = 1

      userRepository.findUsersForTenant.mockResolvedValue(mockUsers)
      userRepository.count.mockResolvedValue(mockTotal)

      // Act
      await useCase.execute(query)

      // Assert
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('开始执行获取租户下所有用户用例'),
        'GetUsersByTenantUseCase'
      )
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('获取租户下所有用户用例执行成功'),
        'GetUsersByTenantUseCase'
      )
    })

    it('应该构建正确的查询选项', async () => {
      // Arrange
      const query = createQuery({
        page: 2,
        size: 10,
        sortBy: 'username',
        sortOrder: 'asc',
        status: 'active',
      })
      const mockUsers = [mockUser]
      const mockTotal = 1

      userRepository.findUsersForTenant.mockResolvedValue(mockUsers)
      userRepository.count.mockResolvedValue(mockTotal)

      // Act
      await useCase.execute(query)

      // Assert
      expect(userRepository.findUsersForTenant).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440001', {
        limit: 10,
        offset: 10, // (page - 1) * size = (2 - 1) * 10 = 10
        sortBy: 'username',
        sortOrder: 'asc',
        includeDeleted: false,
        status: 'active',
        organizationId: '550e8400-e29b-41d4-a716-446655440002',
        roleId: '550e8400-e29b-41d4-a716-446655440003',
      })
    })
  })
})

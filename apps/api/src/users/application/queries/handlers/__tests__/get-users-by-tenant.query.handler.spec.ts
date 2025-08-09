/**
 * @file get-users-by-tenant.query.handler.spec.ts
 * @description GetUsersByTenantQueryHandler 单元测试
 */
import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@libs/pino-nestjs'
import { GetUsersByTenantQueryHandler } from '../get-users-by-tenant.query.handler'
import { GetUsersByTenantQuery } from '../../get-users-by-tenant.query'
import { GetUsersByTenantUseCase } from '../../../use-cases/get-users-by-tenant.use-case'

describe('GetUsersByTenantQueryHandler', () => {
  let handler: GetUsersByTenantQueryHandler
  let getUsersByTenantUseCase: jest.Mocked<GetUsersByTenantUseCase>
  let logger: jest.Mocked<Logger>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUsersByTenantQueryHandler,
        {
          provide: GetUsersByTenantUseCase,
          useValue: {
            execute: jest.fn(),
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

    handler = module.get<GetUsersByTenantQueryHandler>(GetUsersByTenantQueryHandler)
    getUsersByTenantUseCase = module.get(GetUsersByTenantUseCase)
    logger = module.get(Logger)
  })

  describe('execute', () => {
    const createQuery = (overrides: Partial<any> = {}) => {
      return new GetUsersByTenantQuery({
        tenantId: 'tenant-123',
        page: 1,
        size: 20,
        status: 'active',
        organizationId: 'org-123',
        roleId: 'role-123',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        includeDeleted: false,
        includeSensitiveData: false,
        ...overrides,
      })
    }

    it('应该成功处理获取租户下所有用户查询', async () => {
      // Arrange
      const query = createQuery()
      const mockResult = {
        success: true,
        users: [
          {
            id: 'user-123',
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
          },
        ],
        pagination: {
          page: 1,
          size: 20,
          total: 1,
          totalPages: 1,
        },
      }

      getUsersByTenantUseCase.execute.mockResolvedValue(mockResult)

      // Act
      const result = await handler.execute(query)

      // Assert
      expect(result).toEqual(mockResult)
      expect(getUsersByTenantUseCase.execute).toHaveBeenCalledWith(query)
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('开始处理获取租户下所有用户查询'),
        'GetUsersByTenantQueryHandler'
      )
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('获取租户下所有用户查询处理完成'),
        'GetUsersByTenantQueryHandler'
      )
    })

    it('应该处理用例执行异常', async () => {
      // Arrange
      const query = createQuery()
      const error = new Error('Use case execution failed')
      getUsersByTenantUseCase.execute.mockRejectedValue(error)

      // Act
      const result = await handler.execute(query)

      // Assert
      expect(result.success).toBe(false)
      expect(result.users).toHaveLength(0)
      expect(result.pagination.total).toBe(0)
      expect(result.error).toBe('Use case execution failed')
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('获取租户下所有用户查询处理失败'),
        expect.any(String),
        'GetUsersByTenantQueryHandler'
      )
    })

    it('应该记录查询处理日志', async () => {
      // Arrange
      const query = createQuery()
      const mockResult = {
        success: true,
        users: [],
        pagination: {
          page: 1,
          size: 20,
          total: 0,
          totalPages: 0,
        },
      }

      getUsersByTenantUseCase.execute.mockResolvedValue(mockResult)

      // Act
      await handler.execute(query)

      // Assert
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('开始处理获取租户下所有用户查询'),
        'GetUsersByTenantQueryHandler'
      )
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('获取租户下所有用户查询处理完成'),
        'GetUsersByTenantQueryHandler'
      )
    })

    it('应该处理包含敏感数据的查询', async () => {
      // Arrange
      const query = createQuery({ includeSensitiveData: true })
      const mockResult = {
        success: true,
        users: [
          {
            id: 'user-123',
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
            loginAttempts: 3,
            lockedUntil: new Date('2024-01-02'),
            passwordChangedAt: new Date('2024-01-01'),
            twoFactorSecret: 'secret123',
          },
        ],
        pagination: {
          page: 1,
          size: 20,
          total: 1,
          totalPages: 1,
        },
      }

      getUsersByTenantUseCase.execute.mockResolvedValue(mockResult)

      // Act
      const result = await handler.execute(query)

      // Assert
      expect(result).toEqual(mockResult)
      expect(getUsersByTenantUseCase.execute).toHaveBeenCalledWith(query)
      // 注意：当前实现中敏感数据是通过buildUserList方法处理的
      // 这里只是验证基本结构
      expect(result.users[0]).toEqual(
        expect.objectContaining({
          id: 'user-123',
          email: 'test@example.com',
        })
      )
    })

    it('应该处理不同的查询参数', async () => {
      // Arrange
      const query = createQuery({
        page: 2,
        size: 10,
        status: 'inactive',
        sortBy: 'username',
        sortOrder: 'asc',
      })
      const mockResult = {
        success: true,
        users: [],
        pagination: {
          page: 2,
          size: 10,
          total: 0,
          totalPages: 0,
        },
      }

      getUsersByTenantUseCase.execute.mockResolvedValue(mockResult)

      // Act
      const result = await handler.execute(query)

      // Assert
      expect(result).toEqual(mockResult)
      expect(getUsersByTenantUseCase.execute).toHaveBeenCalledWith(query)
    })

    it('应该处理空结果', async () => {
      // Arrange
      const query = createQuery()
      const mockResult = {
        success: true,
        users: [],
        pagination: {
          page: 1,
          size: 20,
          total: 0,
          totalPages: 0,
        },
      }

      getUsersByTenantUseCase.execute.mockResolvedValue(mockResult)

      // Act
      const result = await handler.execute(query)

      // Assert
      expect(result.success).toBe(true)
      expect(result.users).toHaveLength(0)
      expect(result.pagination.total).toBe(0)
      expect(result.pagination.totalPages).toBe(0)
    })
  })
})

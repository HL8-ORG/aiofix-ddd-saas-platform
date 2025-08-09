/**
 * @file search-users.query.handler.spec.ts
 * @description SearchUsersQueryHandler 单元测试
 */
import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@libs/pino-nestjs'
import { SearchUsersQueryHandler } from '../search-users.query.handler'
import { SearchUsersQuery } from '../../search-users.query'
import { SearchUsersUseCase } from '../../../use-cases/search-users.use-case'

describe('SearchUsersQueryHandler', () => {
  let handler: SearchUsersQueryHandler
  let searchUsersUseCase: jest.Mocked<SearchUsersUseCase>
  let logger: jest.Mocked<Logger>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchUsersQueryHandler,
        {
          provide: SearchUsersUseCase,
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

    handler = module.get<SearchUsersQueryHandler>(SearchUsersQueryHandler)
    searchUsersUseCase = module.get(SearchUsersUseCase)
    logger = module.get(Logger)
  })

  describe('execute', () => {
    const createQuery = (overrides: Partial<any> = {}) => {
      return new SearchUsersQuery({
        tenantId: 'tenant-123',
        searchTerm: 'test',
        page: 1,
        size: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        status: 'active',
        organizationId: 'org-123',
        roleId: 'role-123',
        includeDeleted: false,
        ...overrides,
      })
    }

    it('应该成功处理搜索用户查询', async () => {
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

      searchUsersUseCase.execute.mockResolvedValue(mockResult)

      // Act
      const result = await handler.execute(query)

      // Assert
      expect(result).toEqual(mockResult)
      expect(searchUsersUseCase.execute).toHaveBeenCalledWith(query)
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('开始处理搜索用户查询'),
        'SearchUsersQueryHandler'
      )
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('搜索用户查询处理完成'),
        'SearchUsersQueryHandler'
      )
    })

    it('应该处理用例执行异常', async () => {
      // Arrange
      const query = createQuery()
      const error = new Error('Use case execution failed')
      searchUsersUseCase.execute.mockRejectedValue(error)

      // Act
      const result = await handler.execute(query)

      // Assert
      expect(result.success).toBe(false)
      expect(result.users).toHaveLength(0)
      expect(result.pagination.total).toBe(0)
      expect(result.error).toBe('Use case execution failed')
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('搜索用户查询处理失败'),
        expect.any(String),
        'SearchUsersQueryHandler'
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

      searchUsersUseCase.execute.mockResolvedValue(mockResult)

      // Act
      await handler.execute(query)

      // Assert
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('开始处理搜索用户查询'),
        'SearchUsersQueryHandler'
      )
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('搜索用户查询处理完成'),
        'SearchUsersQueryHandler'
      )
    })

    it('应该处理不同的查询参数', async () => {
      // Arrange
      const query = createQuery({
        searchTerm: 'john',
        page: 2,
        size: 10,
        status: 'inactive',
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

      searchUsersUseCase.execute.mockResolvedValue(mockResult)

      // Act
      const result = await handler.execute(query)

      // Assert
      expect(result).toEqual(mockResult)
      expect(searchUsersUseCase.execute).toHaveBeenCalledWith(query)
    })
  })
})

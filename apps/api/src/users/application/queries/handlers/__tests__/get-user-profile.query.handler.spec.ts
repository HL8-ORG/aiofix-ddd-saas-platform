/**
 * @file get-user-profile.query.handler.spec.ts
 * @description GetUserProfileQueryHandler 单元测试
 */
import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@libs/pino-nestjs'
import { GetUserProfileQueryHandler } from '../get-user-profile.query.handler'
import { GetUserProfileQuery } from '../../get-user-profile.query'
import { GetUserProfileUseCase } from '../../../use-cases/get-user-profile.use-case'

describe('GetUserProfileQueryHandler', () => {
  let handler: GetUserProfileQueryHandler
  let getUserProfileUseCase: jest.Mocked<GetUserProfileUseCase>
  let logger: jest.Mocked<Logger>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserProfileQueryHandler,
        {
          provide: GetUserProfileUseCase,
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

    handler = module.get<GetUserProfileQueryHandler>(GetUserProfileQueryHandler)
    getUserProfileUseCase = module.get(GetUserProfileUseCase)
    logger = module.get(Logger)
  })

  describe('execute', () => {
    const createQuery = (overrides: Partial<any> = {}) => {
      return new GetUserProfileQuery({
        userId: 'user-123',
        tenantId: 'tenant-123',
        includeSensitiveData: false,
        ...overrides,
      })
    }

    it('应该成功处理获取用户资料查询', async () => {
      // Arrange
      const query = createQuery()
      const mockResult = {
        success: true,
        userProfile: {
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
          preferences: { theme: 'dark' },
        },
      }

      getUserProfileUseCase.execute.mockResolvedValue(mockResult)

      // Act
      const result = await handler.execute(query)

      // Assert
      expect(result).toEqual(mockResult)
      expect(getUserProfileUseCase.execute).toHaveBeenCalledWith(query)
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('开始处理获取用户资料查询'),
        'GetUserProfileQueryHandler'
      )
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('获取用户资料查询处理完成'),
        'GetUserProfileQueryHandler'
      )
    })

    it('应该处理用例执行异常', async () => {
      // Arrange
      const query = createQuery()
      const error = new Error('Use case execution failed')
      getUserProfileUseCase.execute.mockRejectedValue(error)

      // Act
      const result = await handler.execute(query)

      // Assert
      expect(result.success).toBe(false)
      expect(result.userProfile).toBeNull()
      expect(result.error).toBe('Use case execution failed')
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('获取用户资料查询处理失败'),
        expect.any(String),
        'GetUserProfileQueryHandler'
      )
    })

    it('应该记录查询处理日志', async () => {
      // Arrange
      const query = createQuery()
      const mockResult = {
        success: true,
        userProfile: {
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
          preferences: { theme: 'dark' },
        },
      }

      getUserProfileUseCase.execute.mockResolvedValue(mockResult)

      // Act
      await handler.execute(query)

      // Assert
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('开始处理获取用户资料查询'),
        'GetUserProfileQueryHandler'
      )
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('获取用户资料查询处理完成'),
        'GetUserProfileQueryHandler'
      )
    })

    it('应该处理包含敏感数据的查询', async () => {
      // Arrange
      const query = createQuery({ includeSensitiveData: true })
      const mockResult = {
        success: true,
        userProfile: {
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
          preferences: { theme: 'dark' },
          loginAttempts: 3,
          lockedUntil: new Date('2024-01-02'),
          passwordChangedAt: new Date('2024-01-01'),
          twoFactorSecret: 'secret123',
        },
      }

      getUserProfileUseCase.execute.mockResolvedValue(mockResult)

      // Act
      const result = await handler.execute(query)

      // Assert
      expect(result).toEqual(mockResult)
      expect(getUserProfileUseCase.execute).toHaveBeenCalledWith(query)
      // 注意：当前实现中敏感数据是通过buildUserProfile方法处理的
      // 这里只是验证基本结构
      expect(result.userProfile).toEqual(
        expect.objectContaining({
          id: 'user-123',
          email: 'test@example.com',
        })
      )
    })

    it('应该处理用户不存在的情况', async () => {
      // Arrange
      const query = createQuery()
      const mockResult = {
        success: false,
        userProfile: null,
        error: '用户不存在',
      }

      getUserProfileUseCase.execute.mockResolvedValue(mockResult)

      // Act
      const result = await handler.execute(query)

      // Assert
      expect(result.success).toBe(false)
      expect(result.userProfile).toBeNull()
      expect(result.error).toBe('用户不存在')
    })
  })
})

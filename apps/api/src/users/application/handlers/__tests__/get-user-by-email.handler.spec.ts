import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@libs/pino-nestjs'
import { GetUserByEmailHandler } from '../get-user-by-email.handler'
import { GetUserByEmailQuery } from '../../queries/get-user-by-email.query'
import { GetUserByEmailUseCase } from '../../use-cases/get-user-by-email.use-case'

describe('GetUserByEmailHandler', () => {
  let handler: GetUserByEmailHandler
  let getUserByEmailUseCase: jest.Mocked<GetUserByEmailUseCase>
  let logger: jest.Mocked<Logger>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserByEmailHandler,
        {
          provide: GetUserByEmailUseCase,
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

    handler = module.get<GetUserByEmailHandler>(GetUserByEmailHandler)
    getUserByEmailUseCase = module.get(GetUserByEmailUseCase)
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

    it('应该成功处理根据邮箱获取用户查询', async () => {
      // Arrange
      const query = createQuery()
      const expectedResult = {
        success: true,
        user: {
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
        },
      }
      getUserByEmailUseCase.execute.mockResolvedValue(expectedResult)

      // Act
      const result = await handler.execute(query)

      // Assert
      expect(result).toEqual(expectedResult)
      expect(getUserByEmailUseCase.execute).toHaveBeenCalledWith(query)
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('开始处理根据邮箱查询用户查询'),
        'GetUserByEmailHandler'
      )
    })

    it('应该处理查询执行异常', async () => {
      // Arrange
      const query = createQuery()
      const error = new Error('User not found')
      getUserByEmailUseCase.execute.mockRejectedValue(error)

      // Act
      const result = await handler.execute(query)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('User not found')
      expect(logger.error).toHaveBeenCalled()
    })
  })
})

import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@libs/pino-nestjs'
import { GetUserByUsernameHandler } from '../get-user-by-username.handler'
import { GetUserByUsernameQuery } from '../../queries/get-user-by-username.query'
import { GetUserByUsernameUseCase } from '../../use-cases/get-user-by-username.use-case'

describe('GetUserByUsernameHandler', () => {
  let handler: GetUserByUsernameHandler
  let getUserByUsernameUseCase: jest.Mocked<GetUserByUsernameUseCase>
  let logger: jest.Mocked<Logger>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserByUsernameHandler,
        {
          provide: GetUserByUsernameUseCase,
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

    handler = module.get<GetUserByUsernameHandler>(GetUserByUsernameHandler)
    getUserByUsernameUseCase = module.get(GetUserByUsernameUseCase)
    logger = module.get(Logger)
  })

  describe('execute', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    const createQuery = (overrides: Partial<any> = {}) => {
      return new GetUserByUsernameQuery({
        username: 'testuser',
        tenantId: '550e8400-e29b-41d4-a716-446655440001',
        includeSensitiveData: false,
        ...overrides,
      })
    }

    it('应该成功处理根据用户名获取用户查询', async () => {
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
      getUserByUsernameUseCase.execute.mockResolvedValue(expectedResult)

      // Act
      const result = await handler.execute(query)

      // Assert
      expect(result).toEqual(expectedResult)
      expect(getUserByUsernameUseCase.execute).toHaveBeenCalledWith(query)
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('开始处理根据用户名查询用户查询'),
        'GetUserByUsernameHandler'
      )
    })

    it('应该处理查询执行异常', async () => {
      // Arrange
      const query = createQuery()
      const error = new Error('User not found')
      getUserByUsernameUseCase.execute.mockRejectedValue(error)

      // Act
      const result = await handler.execute(query)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('User not found')
      expect(logger.error).toHaveBeenCalled()
    })
  })
})

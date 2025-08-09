import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@libs/pino-nestjs'
import { DeactivateUserHandler } from '../deactivate-user.handler'
import { DeactivateUserCommand } from '../../commands/deactivate-user.command'
import { DeactivateUserUseCase } from '../../use-cases/deactivate-user.use-case'

describe('DeactivateUserHandler', () => {
  let handler: DeactivateUserHandler
  let deactivateUserUseCase: jest.Mocked<DeactivateUserUseCase>
  let logger: jest.Mocked<Logger>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeactivateUserHandler,
        {
          provide: DeactivateUserUseCase,
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

    handler = module.get<DeactivateUserHandler>(DeactivateUserHandler)
    deactivateUserUseCase = module.get(DeactivateUserUseCase)
    logger = module.get(Logger)
  })

  describe('execute', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    const createCommand = (overrides: Partial<any> = {}) => {
      return new DeactivateUserCommand({
        userId: '550e8400-e29b-41d4-a716-446655440000',
        tenantId: '550e8400-e29b-41d4-a716-446655440001',
        reason: 'Manual deactivation',
        deactivatedBy: '550e8400-e29b-41d4-a716-446655440002',
        ...overrides,
      })
    }

    it('应该成功处理停用用户命令', async () => {
      // Arrange
      const command = createCommand()
      const expectedResult = {
        success: true,
        userId: '550e8400-e29b-41d4-a716-446655440000',
        message: '用户停用成功',
        deactivatedAt: new Date(),
      }
      deactivateUserUseCase.execute.mockResolvedValue(expectedResult)

      // Act
      const result = await handler.execute(command)

      // Assert
      expect(result).toEqual(expectedResult)
      expect(deactivateUserUseCase.execute).toHaveBeenCalledWith(command)
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('开始处理停用用户命令'),
        'DeactivateUserHandler'
      )
    })

    it('应该处理命令执行异常', async () => {
      // Arrange
      const command = createCommand()
      const error = new Error('User not found')
      deactivateUserUseCase.execute.mockRejectedValue(error)

      // Act
      const result = await handler.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('User not found')
      expect(logger.error).toHaveBeenCalled()
    })
  })
})

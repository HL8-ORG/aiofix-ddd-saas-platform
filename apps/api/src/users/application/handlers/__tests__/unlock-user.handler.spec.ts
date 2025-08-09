import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@libs/pino-nestjs'
import { UnlockUserHandler } from '../unlock-user.handler'
import { UnlockUserCommand } from '../../commands/unlock-user.command'
import { UnlockUserUseCase } from '../../use-cases/unlock-user.use-case'

describe('UnlockUserHandler', () => {
  let handler: UnlockUserHandler
  let unlockUserUseCase: jest.Mocked<UnlockUserUseCase>
  let logger: jest.Mocked<Logger>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnlockUserHandler,
        {
          provide: UnlockUserUseCase,
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

    handler = module.get<UnlockUserHandler>(UnlockUserHandler)
    unlockUserUseCase = module.get(UnlockUserUseCase)
    logger = module.get(Logger)
  })

  describe('execute', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    const createCommand = (overrides: Partial<any> = {}) => {
      return new UnlockUserCommand({
        userId: '550e8400-e29b-41d4-a716-446655440000',
        tenantId: '550e8400-e29b-41d4-a716-446655440001',
        reason: 'Manual unlock',
        unlockedBy: '550e8400-e29b-41d4-a716-446655440002',
        ...overrides,
      })
    }

    it('应该成功处理解锁用户命令', async () => {
      // Arrange
      const command = createCommand()
      const expectedResult = {
        success: true,
        userId: '550e8400-e29b-41d4-a716-446655440000',
        message: '用户解锁成功',
        unlockedAt: new Date(),
      }
      unlockUserUseCase.execute.mockResolvedValue(expectedResult)

      // Act
      const result = await handler.execute(command)

      // Assert
      expect(result).toEqual(expectedResult)
      expect(unlockUserUseCase.execute).toHaveBeenCalledWith(command)
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('开始处理解锁用户命令'),
        'UnlockUserHandler'
      )
    })

    it('应该处理命令执行异常', async () => {
      // Arrange
      const command = createCommand()
      const error = new Error('User not found')
      unlockUserUseCase.execute.mockRejectedValue(error)

      // Act
      const result = await handler.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('User not found')
      expect(logger.error).toHaveBeenCalled()
    })
  })
})

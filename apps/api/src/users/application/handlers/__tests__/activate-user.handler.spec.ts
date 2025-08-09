import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@libs/pino-nestjs'
import { ActivateUserHandler } from '../activate-user.handler'
import { ActivateUserCommand } from '../../commands/activate-user.command'
import { ActivateUserUseCase } from '../../use-cases/activate-user.use-case'

describe('ActivateUserHandler', () => {
  let handler: ActivateUserHandler
  let activateUserUseCase: jest.Mocked<ActivateUserUseCase>
  let logger: jest.Mocked<Logger>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivateUserHandler,
        {
          provide: ActivateUserUseCase,
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

    handler = module.get<ActivateUserHandler>(ActivateUserHandler)
    activateUserUseCase = module.get(ActivateUserUseCase)
    logger = module.get(Logger)
  })

  describe('execute', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    const createCommand = (overrides: Partial<any> = {}) => {
      return new ActivateUserCommand({
        userId: '550e8400-e29b-41d4-a716-446655440000',
        tenantId: '550e8400-e29b-41d4-a716-446655440001',
        reason: 'Manual activation',
        activatedBy: '550e8400-e29b-41d4-a716-446655440002',
        ...overrides,
      })
    }

    it('应该成功处理激活用户命令', async () => {
      // Arrange
      const command = createCommand()
      const expectedResult = {
        success: true,
        userId: '550e8400-e29b-41d4-a716-446655440000',
        message: '用户激活成功',
        activatedAt: new Date(),
      }
      activateUserUseCase.execute.mockResolvedValue(expectedResult)

      // Act
      const result = await handler.execute(command)

      // Assert
      expect(result).toEqual(expectedResult)
      expect(activateUserUseCase.execute).toHaveBeenCalledWith(command)
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('开始处理激活用户命令'),
        'ActivateUserHandler'
      )
    })

    it('应该处理命令执行异常', async () => {
      // Arrange
      const command = createCommand()
      const error = new Error('User not found')
      activateUserUseCase.execute.mockRejectedValue(error)

      // Act
      const result = await handler.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('User not found')
      expect(logger.error).toHaveBeenCalled()
    })
  })
})

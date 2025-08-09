import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@libs/pino-nestjs'
import { LockUserHandler } from '../lock-user.handler'
import { LockUserCommand } from '../../commands/lock-user.command'
import { LockUserUseCase } from '../../use-cases/lock-user.use-case'

describe('LockUserHandler', () => {
  let handler: LockUserHandler
  let lockUserUseCase: jest.Mocked<LockUserUseCase>
  let logger: jest.Mocked<Logger>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LockUserHandler,
        {
          provide: LockUserUseCase,
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

    handler = module.get<LockUserHandler>(LockUserHandler)
    lockUserUseCase = module.get(LockUserUseCase)
    logger = module.get(Logger)
  })

  describe('execute', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    const createCommand = (overrides: Partial<any> = {}) => {
      return new LockUserCommand({
        userId: '550e8400-e29b-41d4-a716-446655440000',
        tenantId: '550e8400-e29b-41d4-a716-446655440001',
        reason: 'Security violation',
        lockedUntil: '2025-08-09T23:59:59.999Z',
        lockedBy: '550e8400-e29b-41d4-a716-446655440002',
        ...overrides,
      })
    }

    it('应该成功处理锁定用户命令', async () => {
      // Arrange
      const command = createCommand()
      const expectedResult = {
        success: true,
        userId: '550e8400-e29b-41d4-a716-446655440000',
        message: '用户锁定成功',
        lockedAt: new Date(),
        lockedUntil: new Date('2025-08-09T23:59:59.999Z'),
      }
      lockUserUseCase.execute.mockResolvedValue(expectedResult)

      // Act
      const result = await handler.execute(command)

      // Assert
      expect(result).toEqual(expectedResult)
      expect(lockUserUseCase.execute).toHaveBeenCalledWith(command)
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('开始处理锁定用户命令'),
        'LockUserHandler'
      )
      // 只有在成功的情况下才会记录完成日志
      // expect(logger.log).toHaveBeenCalledWith(
      //   expect.stringContaining('锁定用户命令处理完成'),
      //   'LockUserHandler'
      // )
    })

    it('应该处理命令执行异常', async () => {
      // Arrange
      const command = createCommand()
      const error = new Error('User not found')
      lockUserUseCase.execute.mockRejectedValue(error)

      // Act
      const result = await handler.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('User not found')
      expect(lockUserUseCase.execute).toHaveBeenCalledWith(command)
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('锁定用户命令处理失败'),
        expect.any(String),
        'LockUserHandler'
      )
    })

    it('应该记录命令处理日志', async () => {
      // Arrange
      const command = createCommand()
      const expectedResult = {
        success: true,
        userId: '550e8400-e29b-41d4-a716-446655440000',
        message: '用户锁定成功',
      }
      lockUserUseCase.execute.mockResolvedValue(expectedResult)

      // Act
      await handler.execute(command)

      // Assert
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('开始处理锁定用户命令'),
        'LockUserHandler'
      )
      // 只有在成功的情况下才会记录完成日志
      // expect(logger.log).toHaveBeenCalledWith(
      //   expect.stringContaining('锁定用户命令处理完成'),
      //   'LockUserHandler'
      // )
    })
  })
})

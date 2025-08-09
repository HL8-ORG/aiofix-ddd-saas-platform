import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@libs/pino-nestjs'
import { UpdateUserProfileHandler } from '../update-user-profile.handler'
import { UpdateUserProfileCommand } from '../../commands/update-user-profile.command'
import { UpdateUserProfileUseCase } from '../../use-cases/update-user-profile.use-case'

describe('UpdateUserProfileHandler', () => {
  let handler: UpdateUserProfileHandler
  let updateUserProfileUseCase: jest.Mocked<UpdateUserProfileUseCase>
  let logger: jest.Mocked<Logger>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserProfileHandler,
        {
          provide: UpdateUserProfileUseCase,
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

    handler = module.get<UpdateUserProfileHandler>(UpdateUserProfileHandler)
    updateUserProfileUseCase = module.get(UpdateUserProfileUseCase)
    logger = module.get(Logger)
  })

  describe('execute', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    const createCommand = (overrides: Partial<any> = {}) => {
      return new UpdateUserProfileCommand({
        userId: '550e8400-e29b-41d4-a716-446655440000',
        tenantId: '550e8400-e29b-41d4-a716-446655440001',
        firstName: 'Jane',
        lastName: 'Smith',
        displayName: 'Jane Smith',
        avatar: 'https://example.com/new-avatar.jpg',
        phone: '+8613800138001',
        preferences: { theme: 'dark', language: 'zh-CN' },
        updatedBy: '550e8400-e29b-41d4-a716-446655440002',
        ...overrides,
      })
    }

    it('应该成功处理更新用户资料命令', async () => {
      // Arrange
      const command = createCommand()
      const expectedResult = {
        success: true,
        userId: '550e8400-e29b-41d4-a716-446655440000',
        message: '用户资料更新成功',
        updatedAt: new Date(),
      }
      updateUserProfileUseCase.execute.mockResolvedValue(expectedResult)

      // Act
      const result = await handler.execute(command)

      // Assert
      expect(result).toEqual(expectedResult)
      expect(updateUserProfileUseCase.execute).toHaveBeenCalledWith(command)
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('开始处理更新用户资料命令'),
        'UpdateUserProfileHandler'
      )
    })

    it('应该处理命令执行异常', async () => {
      // Arrange
      const command = createCommand()
      const error = new Error('User not found')
      updateUserProfileUseCase.execute.mockRejectedValue(error)

      // Act
      const result = await handler.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('User not found')
      expect(logger.error).toHaveBeenCalled()
    })
  })
})

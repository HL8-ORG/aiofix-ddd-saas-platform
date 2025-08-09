import { Test, TestingModule } from '@nestjs/testing'
import { EventBus } from '@nestjs/cqrs'
import { Logger } from '@libs/pino-nestjs'
import { ChangeUserPasswordUseCase } from '../change-user-password.use-case'
import { ChangeUserPasswordCommand } from '../../commands/change-user-password.command'
import type { UserRepository } from '../../../domain/repositories/user.repository.interface'
import type { User } from '../../../domain/entities/user.entity'

describe('ChangeUserPasswordUseCase', () => {
  let useCase: ChangeUserPasswordUseCase
  let userRepository: jest.Mocked<UserRepository>
  let eventBus: jest.Mocked<EventBus>
  let logger: jest.Mocked<Logger>

  const mockUser = {
    getId: jest.fn().mockReturnValue({ getValue: () => '550e8400-e29b-41d4-a716-446655440000' }),
    getStatus: jest.fn().mockReturnValue({
      getValue: () => 'active',
      isActive: jest.fn().mockReturnValue(true),
      isLocked: jest.fn().mockReturnValue(false),
      isDeleted: jest.fn().mockReturnValue(false)
    }),
    verifyPassword: jest.fn().mockReturnValue(true),
    changePassword: jest.fn().mockImplementation(() => { }),
    resetPassword: jest.fn().mockImplementation(() => { }),
  } as unknown as User

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangeUserPasswordUseCase,
        {
          provide: 'UserRepository',
          useValue: {
            findById: jest.fn(),
            save: jest.fn(),
            findByEmail: jest.fn(),
            findByUsername: jest.fn(),
            findByEmailOrUsername: jest.fn(),
            exists: jest.fn(),
            existsByEmail: jest.fn(),
            existsByUsername: jest.fn(),
            delete: jest.fn(),
            findActiveUsers: jest.fn(),
            findUsersByStatus: jest.fn(),
            count: jest.fn(),
            findUsersForTenant: jest.fn(),
          } as any,
        },
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
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

    useCase = module.get<ChangeUserPasswordUseCase>(ChangeUserPasswordUseCase)
    userRepository = module.get('UserRepository')
    eventBus = module.get(EventBus)
    logger = module.get(Logger)
  })

  describe('execute', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    const createCommand = (overrides: Partial<any> = {}) => {
      return new ChangeUserPasswordCommand({
        userId: '550e8400-e29b-41d4-a716-446655440000',
        tenantId: '550e8400-e29b-41d4-a716-446655440001',
        currentPassword: 'oldPassword123',
        newPassword: 'NewPassword123!',
        changedBy: '550e8400-e29b-41d4-a716-446655440002',
        ...overrides,
      })
    }

    it('应该成功修改用户密码', async () => {
      // Arrange
      const command = createCommand()
      userRepository.findById.mockResolvedValue(mockUser)
      userRepository.save.mockResolvedValue(mockUser)

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(true)
      expect(result.userId).toBe('550e8400-e29b-41d4-a716-446655440000')
      expect(result.message).toBe('密码修改成功')
      expect(result.passwordChangedAt).toBeInstanceOf(Date)
      expect(userRepository.findById).toHaveBeenCalledWith(expect.any(Object), '550e8400-e29b-41d4-a716-446655440001')
      expect(userRepository.save).toHaveBeenCalledWith(mockUser)
      expect(mockUser.changePassword).toHaveBeenCalledWith('oldPassword123', expect.any(Object), undefined, undefined)
      // expect(eventBus.publish).toHaveBeenCalled() // 注释掉，因为publishPasswordChangedEvent被注释掉了
    })

    it('应该处理用户不存在的情况', async () => {
      // Arrange
      const command = createCommand()
      userRepository.findById.mockResolvedValue(null)

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('用户不存在')
      expect(logger.error).toHaveBeenCalled()
    })

    it('应该处理已删除用户的情况', async () => {
      // Arrange
      const command = createCommand()
      const deletedUser = {
        ...mockUser,
        getStatus: jest.fn().mockReturnValue({
          getValue: () => 'deleted',
          isActive: jest.fn().mockReturnValue(false),
          isLocked: jest.fn().mockReturnValue(false),
          isDeleted: jest.fn().mockReturnValue(true)
        }),
      }
      userRepository.findById.mockResolvedValue(deletedUser as unknown as User)

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('已删除的用户无法修改密码')
      expect(logger.error).toHaveBeenCalled()
    })

    it('应该处理命令验证失败', async () => {
      // Arrange
      const command = createCommand({ userId: '' }) // 无效的用户ID

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(logger.error).toHaveBeenCalled()
    })

    it('应该处理仓储异常', async () => {
      // Arrange
      const command = createCommand()
      const error = new Error('Database connection failed')
      userRepository.findById.mockRejectedValue(error)

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Database connection failed')
      expect(logger.error).toHaveBeenCalled()
    })
  })
})

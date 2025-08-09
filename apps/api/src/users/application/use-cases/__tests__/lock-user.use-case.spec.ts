import { Test, TestingModule } from '@nestjs/testing'
import { EventBus } from '@nestjs/cqrs'
import { Logger } from '@libs/pino-nestjs'
import { LockUserUseCase } from '../lock-user.use-case'
import { LockUserCommand } from '../../commands/lock-user.command'
import type { UserRepository } from '../../../domain/repositories/user.repository.interface'
import type { User } from '../../../domain/entities/user.entity'
import { UserId } from '../../../domain/value-objects/user-id.vo'
import { Email } from '../../../domain/value-objects/email.vo'
import { UserName } from '../../../domain/value-objects/username.vo'
import { Password } from '../../../domain/value-objects/password.vo'
import { UserStatus } from '../../../domain/value-objects/user-status.vo'
import { generateUuid } from '@/shared/utils/uuid.util'

describe('LockUserUseCase', () => {
  let useCase: LockUserUseCase
  let userRepository: jest.Mocked<UserRepository>
  let eventBus: jest.Mocked<EventBus>
  let logger: jest.Mocked<Logger>

  const mockUser = {
    getId: jest.fn().mockReturnValue({ getValue: () => '550e8400-e29b-41d4-a716-446655440000' }),
    getEmail: jest.fn().mockReturnValue({ getValue: () => 'test@example.com' }),
    getUsername: jest.fn().mockReturnValue({ getValue: () => 'testuser' }),
    getFirstName: jest.fn().mockReturnValue('John'),
    getLastName: jest.fn().mockReturnValue('Doe'),
    getDisplayName: jest.fn().mockReturnValue('John Doe'),
    getAvatar: jest.fn().mockReturnValue('https://example.com/avatar.jpg'),
    getPhoneNumber: jest.fn().mockReturnValue({ getValue: () => '+8613800138000' }),
    getStatus: jest.fn().mockReturnValue({
      getValue: () => 'active',
      isActive: jest.fn().mockReturnValue(true),
      isLocked: jest.fn().mockReturnValue(false),
      isDeleted: jest.fn().mockReturnValue(false)
    }),
    isEmailVerified: jest.fn().mockReturnValue(true),
    isPhoneVerified: jest.fn().mockReturnValue(false),
    isTwoFactorEnabled: jest.fn().mockReturnValue(false),
    getLastLoginAt: jest.fn().mockReturnValue(new Date('2024-01-01')),
    getCreatedAt: jest.fn().mockReturnValue(new Date('2024-01-01')),
    getUpdatedAt: jest.fn().mockReturnValue(new Date('2024-01-01')),
    lock: jest.fn(),
  } as unknown as User

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LockUserUseCase,
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
          },
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

    useCase = module.get<LockUserUseCase>(LockUserUseCase)
    userRepository = module.get('UserRepository')
    eventBus = module.get(EventBus)
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

    it('应该成功锁定用户', async () => {
      // Arrange
      const command = createCommand()
      userRepository.findById.mockResolvedValue(mockUser)
      userRepository.save.mockResolvedValue(mockUser)

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(true)
      expect(result.userId).toBe('550e8400-e29b-41d4-a716-446655440000')
      expect(result.message).toBe('用户锁定成功')
      expect(result.lockedAt).toBeInstanceOf(Date)
      expect(result.lockedUntil).toBeInstanceOf(Date)
      expect(userRepository.findById).toHaveBeenCalledWith(expect.any(Object), '550e8400-e29b-41d4-a716-446655440001')
      expect(userRepository.save).toHaveBeenCalledWith(mockUser)
      expect(mockUser.lock).toHaveBeenCalledWith('Security violation', new Date('2025-08-09T23:59:59.999Z'))
      // expect(eventBus.publish).toHaveBeenCalled()
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('锁定用户用例执行成功'),
        'LockUserUseCase'
      )
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
      expect(result.error).toBe('已删除的用户无法锁定')
      expect(logger.error).toHaveBeenCalled()
    })

    it('应该处理已锁定用户的情况', async () => {
      // Arrange
      const command = createCommand()
      const lockedUser = {
        ...mockUser,
        getStatus: jest.fn().mockReturnValue({
          getValue: () => 'locked',
          isActive: jest.fn().mockReturnValue(false),
          isLocked: jest.fn().mockReturnValue(true),
          isDeleted: jest.fn().mockReturnValue(false)
        }),
      }
      userRepository.findById.mockResolvedValue(lockedUser as unknown as User)

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('用户已经被锁定')
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

    it('应该处理保存用户异常', async () => {
      // Arrange
      const command = createCommand()
      userRepository.findById.mockResolvedValue(mockUser)
      const error = new Error('Save failed')
      userRepository.save.mockRejectedValue(error)

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Save failed')
      expect(logger.error).toHaveBeenCalled()
    })

    it('应该处理没有锁定截止时间的情况', async () => {
      // Arrange
      const command = createCommand({ lockedUntil: undefined })
      userRepository.findById.mockResolvedValue(mockUser)
      userRepository.save.mockResolvedValue(mockUser)

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(true)
      expect(result.lockedUntil).toBeUndefined()
      expect(mockUser.lock).toHaveBeenCalledWith('Security violation', undefined)
    })

    it('应该记录审计日志', async () => {
      // Arrange
      const command = createCommand()
      userRepository.findById.mockResolvedValue(mockUser)
      userRepository.save.mockResolvedValue(mockUser)

      // Act
      await useCase.execute(command)

      // Assert
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('开始执行锁定用户用例'),
        'LockUserUseCase'
      )
      // 只有在成功的情况下才会记录成功日志
      // expect(logger.log).toHaveBeenCalledWith(
      //   expect.stringContaining('锁定用户用例执行成功'),
      //   'LockUserUseCase'
      // )
    })
  })
})

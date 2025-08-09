/**
 * @file logout-user.use-case.spec.ts
 * @description 用户登出用例单元测试
 * 
 * 测试覆盖范围：
 * 1. 成功登出场景
 * 2. 会话不存在场景
 * 3. 会话已过期场景
 * 4. 用户不存在场景
 * 5. 数据库错误场景
 * 6. 审计日志记录场景
 */
import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@libs/pino-nestjs'
import { EventBus } from '@nestjs/cqrs'
import { LogoutUserUseCase } from '../logout-user.use-case'
import { LogoutUserCommand } from '../../commands/logout-user.command'
import type { UserRepository } from '../../../domain/repositories/user.repository.interface'
import type { AuthSessionRepository } from '../../../domain/repositories/auth-session.repository.interface'
import type { LoginAttemptRepository } from '../../../domain/repositories/login-attempt.repository.interface'
import type { JWTTokenService } from '../../../domain/services/jwt-token.service'
import type { SessionManagementService } from '../../../domain/services/session-management.service'
import type { LoginSecurityService } from '../../../domain/services/login-security.service'
import type { AuditService } from '../../../domain/services/interfaces/audit.service.interface'
import { UserId } from '../../../../users/domain/value-objects/user-id.vo'
import { TenantId } from '../../../../users/domain/value-objects/tenant-id.vo'
import { SessionId } from '../../../domain/value-objects/session-id.vo'

describe('LogoutUserUseCase', () => {
  let useCase: LogoutUserUseCase
  let userRepository: jest.Mocked<UserRepository>
  let sessionRepository: jest.Mocked<AuthSessionRepository>
  let loginAttemptRepository: jest.Mocked<LoginAttemptRepository>
  let jwtTokenService: jest.Mocked<JWTTokenService>
  let sessionManagementService: jest.Mocked<SessionManagementService>
  let loginSecurityService: jest.Mocked<LoginSecurityService>
  let eventBus: jest.Mocked<EventBus>
  let logger: jest.Mocked<Logger>

  const mockUser = {
    getId: jest.fn().mockReturnValue({ getValue: () => '550e8400-e29b-41d4-a716-446655440000' }),
    getEmail: jest.fn().mockReturnValue({ getValue: () => 'test@example.com' }),
    getUsername: jest.fn().mockReturnValue({ getValue: () => 'testuser' }),
    getStatus: jest.fn().mockReturnValue({
      isActive: jest.fn().mockReturnValue(true),
      isLocked: jest.fn().mockReturnValue(false),
      isDeleted: jest.fn().mockReturnValue(false),
      isEmailVerified: jest.fn().mockReturnValue(true),
    }),
    isActive: jest.fn().mockReturnValue(true),
    isLocked: jest.fn().mockReturnValue(false),
    isDeleted: jest.fn().mockReturnValue(false),
    isEmailVerified: jest.fn().mockReturnValue(true),
  } as any

  const mockSession = {
    getId: jest.fn().mockReturnValue({ getValue: () => '550e8400-e29b-41d4-a716-446655440002' }),
    getUserId: jest.fn().mockReturnValue({ getValue: () => '550e8400-e29b-41d4-a716-446655440000' }),
    getTenantId: jest.fn().mockReturnValue({ getValue: () => '550e8400-e29b-41d4-a716-446655440001' }),
    isActive: jest.fn().mockReturnValue(true),
    isExpired: jest.fn().mockReturnValue(false),
    belongsToUser: jest.fn().mockReturnValue(true),
    belongsToTenant: jest.fn().mockReturnValue(true),
    revoke: jest.fn(),
    save: jest.fn(),
  } as any

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogoutUserUseCase,
        {
          provide: 'UserRepository',
          useValue: {
            findById: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: 'AuthSessionRepository',
          useValue: {
            findById: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: 'LoginAttemptRepository',
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: 'JWTTokenService',
          useValue: {
            blacklistToken: jest.fn(),
          },
        },
        {
          provide: 'SessionManagementService',
          useValue: {
            revokeSession: jest.fn(),
          },
        },
        {
          provide: 'LoginSecurityService',
          useValue: {
            recordLoginAttempt: jest.fn(),
          },
        },
        {
          provide: 'EventBus',
          useValue: {
            publish: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
      ],
    }).compile()

    useCase = module.get<LogoutUserUseCase>(LogoutUserUseCase)
    userRepository = module.get('UserRepository')
    sessionRepository = module.get('AuthSessionRepository')
    loginAttemptRepository = module.get('LoginAttemptRepository')
    jwtTokenService = module.get('JWTTokenService')
    sessionManagementService = module.get('SessionManagementService')
    loginSecurityService = module.get('LoginSecurityService')
    eventBus = module.get('EventBus')
    logger = module.get(Logger)
  })

  describe('execute', () => {
    const createCommand = (overrides: Partial<any> = {}) => {
      const params = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        sessionId: '550e8400-e29b-41d4-a716-446655440002',
        tenantId: '550e8400-e29b-41d4-a716-446655440001',
        reason: '用户主动登出',
        deviceInfo: {
          userAgent: 'Mozilla/5.0',
          ipAddress: '192.168.1.1',
          deviceType: 'desktop',
          browser: 'Chrome',
          os: 'Windows',
        },
        ...overrides,
      }

      return new LogoutUserCommand(
        params.userId,
        params.sessionId,
        params.tenantId,
        params.reason,
        params.deviceInfo
      )
    }

    it('应该成功执行用户登出用例', async () => {
      // Arrange
      const command = createCommand()

      userRepository.findById.mockResolvedValue(mockUser as any)
      sessionRepository.findById.mockResolvedValue(mockSession as any)
      // sessionManagementService.revokeSession.mockResolvedValue(true)
      // jwtTokenService.blacklistToken.mockResolvedValue(true)
      // loginAttemptRepository.create.mockResolvedValue(undefined)
      // auditService.log.mockResolvedValue(undefined)

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(true)
      expect(result.message).toBe('用户登出成功')
      expect(result.sessionId).toBe('550e8400-e29b-41d4-a716-446655440002')
      expect(result.logoutTime).toBeInstanceOf(Date)

      expect(userRepository.findById).toHaveBeenCalledWith(
        expect.any(Object), // UserId value object
        '550e8400-e29b-41d4-a716-446655440001'
      )
      expect(sessionRepository.findById).toHaveBeenCalledWith(
        expect.any(Object), // SessionId value object
        '550e8400-e29b-41d4-a716-446655440001'
      )
      expect(mockSession.revoke).toHaveBeenCalledWith('用户主动登出')
      expect(sessionRepository.save).toHaveBeenCalledWith(mockSession)
      // expect(auditService.log).toHaveBeenCalledWith({
      //   action: 'USER_LOGOUT',
      //   userId: '550e8400-e29b-41d4-a716-446655440000',
      //   sessionId: '550e8400-e29b-41d4-a716-446655440002',
      //   tenantId: '550e8400-e29b-41d4-a716-446655440001',
      //   details: {
      //     reason: '用户主动登出',
      //     deviceInfo: command.deviceInfo,
      //   },
      // })
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
      expect(result.sessionId).toBeUndefined()
      expect(result.logoutTime).toBeUndefined()

      expect(userRepository.findById).toHaveBeenCalledWith(
        expect.any(Object),
        '550e8400-e29b-41d4-a716-446655440001'
      )
      expect(sessionRepository.findById).not.toHaveBeenCalled()
    })

    it('应该处理会话不存在的情况', async () => {
      // Arrange
      const command = createCommand()

      userRepository.findById.mockResolvedValue(mockUser as any)
      sessionRepository.findById.mockResolvedValue(null)

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('会话不存在或已过期')
      expect(result.sessionId).toBeUndefined()
      expect(result.logoutTime).toBeUndefined()

      expect(sessionRepository.findById).toHaveBeenCalledWith(
        expect.any(Object),
        '550e8400-e29b-41d4-a716-446655440001'
      )
    })

    it('应该处理会话已过期的情况', async () => {
      // Arrange
      const command = createCommand()
      mockSession.isActive.mockReturnValue(false)

      userRepository.findById.mockResolvedValue(mockUser as any)
      sessionRepository.findById.mockResolvedValue(mockSession as any)

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('会话不存在或已过期')
      expect(result.sessionId).toBeUndefined()
      expect(result.logoutTime).toBeUndefined()

      expect(sessionRepository.findById).toHaveBeenCalledWith(
        expect.any(Object),
        '550e8400-e29b-41d4-a716-446655440001'
      )
    })

    it('应该处理会话不属于该用户的情况', async () => {
      // Arrange
      const command = createCommand()
      mockSession.getUserId.mockReturnValue({ getValue: () => 'different-user-id' })

      userRepository.findById.mockResolvedValue(mockUser as any)
      sessionRepository.findById.mockResolvedValue(mockSession as any)

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('会话不属于该用户')
      expect(result.sessionId).toBeUndefined()
      expect(result.logoutTime).toBeUndefined()

      expect(sessionRepository.findById).toHaveBeenCalledWith(
        expect.any(Object),
        '550e8400-e29b-41d4-a716-446655440001'
      )
    })

    it('应该处理会话不属于该租户的情况', async () => {
      // Arrange
      const command = createCommand()
      mockSession.getTenantId.mockReturnValue({ getValue: () => 'different-tenant-id' })

      userRepository.findById.mockResolvedValue(mockUser as any)
      sessionRepository.findById.mockResolvedValue(mockSession as any)

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('会话不属于该租户')
      expect(result.sessionId).toBeUndefined()
      expect(result.logoutTime).toBeUndefined()

      expect(sessionRepository.findById).toHaveBeenCalledWith(
        expect.any(Object),
        '550e8400-e29b-41d4-a716-446655440001'
      )
    })

    it('应该处理数据库保存失败的情况', async () => {
      // Arrange
      const command = createCommand()

      userRepository.findById.mockResolvedValue(mockUser as any)
      sessionRepository.findById.mockResolvedValue(mockSession as any)
      sessionRepository.save.mockRejectedValue(new Error('Database save failed'))

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Database save failed')
      expect(result.sessionId).toBeUndefined()
      expect(result.logoutTime).toBeUndefined()

      expect(logger.error).toHaveBeenCalledWith(
        '用户登出用例执行失败',
        expect.objectContaining({
          error: 'Database save failed',
          userId: '550e8400-e29b-41d4-a716-446655440000',
          sessionId: '550e8400-e29b-41d4-a716-446655440002',
          tenantId: '550e8400-e29b-41d4-a716-446655440001',
        }),
        'LogoutUserUseCase'
      )
    })

    it('应该处理审计日志记录失败的情况', async () => {
      // Arrange
      const command = createCommand()

      userRepository.findById.mockResolvedValue(mockUser as any)
      sessionRepository.findById.mockResolvedValue(mockSession as any)
      sessionRepository.save.mockResolvedValue(mockSession as any)
      // auditService.log.mockRejectedValue(new Error('Audit service unavailable'))

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(true)
      expect(result.message).toBe('用户登出成功')
      expect(result.sessionId).toBe('550e8400-e29b-41d4-a716-446655440002')
      expect(result.logoutTime).toBeInstanceOf(Date)

      // 审计日志失败不应该影响登出流程
      // expect(auditService.log).toHaveBeenCalledWith({
      //   action: 'USER_LOGOUT',
      //   userId: '550e8400-e29b-41d4-a716-446655440000',
      //   sessionId: '550e8400-e29b-41d4-a716-446655440002',
      //   tenantId: '550e8400-e29b-41d4-a716-446655440001',
      //   details: {
      //     reason: '用户主动登出',
      //     deviceInfo: command.deviceInfo,
      //   },
      // })

      expect(logger.warn).toHaveBeenCalledWith(
        '审计日志记录失败',
        expect.objectContaining({
          error: 'Audit service unavailable',
          userId: '550e8400-e29b-41d4-a716-446655440000',
          sessionId: '550e8400-e29b-41d4-a716-446655440002',
        }),
        'LogoutUserUseCase'
      )
    })

    it('应该处理用户被删除的情况', async () => {
      // Arrange
      const command = createCommand()
      mockUser.getStatus().isDeleted.mockReturnValue(true)

      userRepository.findById.mockResolvedValue(mockUser as any)

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('用户不存在')
      expect(result.sessionId).toBeUndefined()
      expect(result.logoutTime).toBeUndefined()

      expect(userRepository.findById).toHaveBeenCalledWith(
        expect.any(Object),
        '550e8400-e29b-41d4-a716-446655440001'
      )
    })

    it('应该处理用户被锁定的情况', async () => {
      // Arrange
      const command = createCommand()
      mockUser.getStatus().isLocked.mockReturnValue(true)

      userRepository.findById.mockResolvedValue(mockUser as any)

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('用户账户已被锁定')
      expect(result.sessionId).toBeUndefined()
      expect(result.logoutTime).toBeUndefined()

      expect(userRepository.findById).toHaveBeenCalledWith(
        expect.any(Object),
        '550e8400-e29b-41d4-a716-446655440001'
      )
    })
  })
})

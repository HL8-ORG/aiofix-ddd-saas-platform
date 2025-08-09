/**
 * @file login-user.use-case.spec.ts
 * @description 用户登录用例单元测试
 * 
 * 测试覆盖范围：
 * 1. 成功登录场景
 * 2. 密码错误场景
 * 3. 用户不存在场景
 * 4. 用户被锁定场景
 * 5. 用户被停用场景
 * 6. 双因素认证场景
 * 7. 登录安全检查场景
 * 8. 验证码验证场景
 */
import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@libs/pino-nestjs'
import { EventBus } from '@nestjs/cqrs'
import { LoginUserUseCase } from '../login-user.use-case'
import { LoginUserCommand } from '../../commands/login-user.command'
import { UserRepository } from '../../../../users/domain/repositories/user.repository.interface'
import { AuthSessionRepository } from '../../../domain/repositories/auth-session.repository.interface'
import { LoginAttemptRepository } from '../../../domain/repositories/login-attempt.repository.interface'
import { JWTTokenService } from '../../../domain/services/jwt-token.service'
import { SessionManagementService } from '../../../domain/services/session-management.service'
import { LoginSecurityService } from '../../../domain/services/login-security.service'
import { Email } from '../../../../users/domain/value-objects/email.vo'
import { Password } from '../../../../users/domain/value-objects/password.vo'
import { UserId } from '../../../../users/domain/value-objects/user-id.vo'
import { TenantId } from '../../../../users/domain/value-objects/tenant-id.vo'

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase
  let userRepository: jest.Mocked<UserRepository>
  let authSessionRepository: jest.Mocked<AuthSessionRepository>
  let loginAttemptRepository: jest.Mocked<LoginAttemptRepository>
  let jwtTokenService: jest.Mocked<JWTTokenService>
  let sessionManagementService: jest.Mocked<SessionManagementService>
  let loginSecurityService: jest.Mocked<LoginSecurityService>
  let eventBus: jest.Mocked<EventBus>
  let auditService: jest.Mocked<any>
  let logger: jest.Mocked<Logger>

  const mockUser = {
    getId: jest.fn().mockReturnValue({ getValue: () => '550e8400-e29b-41d4-a716-446655440000' }),
    getEmail: jest.fn().mockReturnValue({ getValue: () => 'test@example.com' }),
    getUsername: jest.fn().mockReturnValue({ getValue: () => 'testuser' }),
    getFirstName: jest.fn().mockReturnValue('John'),
    getLastName: jest.fn().mockReturnValue('Doe'),
    getStatus: jest.fn().mockReturnValue({
      isActive: jest.fn().mockReturnValue(true),
      isLocked: jest.fn().mockReturnValue(false),
      isDeleted: jest.fn().mockReturnValue(false),
      getValue: jest.fn().mockReturnValue('active')
    }),
    isEmailVerified: jest.fn().mockReturnValue(true),
    isPhoneVerified: jest.fn().mockReturnValue(false),
    isTwoFactorEnabled: jest.fn().mockReturnValue(false),
    getTwoFactorMethod: jest.fn().mockReturnValue(null),
    getLoginAttempts: jest.fn().mockReturnValue(0),
    getLockedUntil: jest.fn().mockReturnValue(null),
    getLastLoginAt: jest.fn().mockReturnValue(new Date('2024-01-01')),
    getCreatedAt: jest.fn().mockReturnValue(new Date('2024-01-01')),
    getUpdatedAt: jest.fn().mockReturnValue(new Date('2024-01-01')),
    verifyPassword: jest.fn().mockResolvedValue(true),
    updateLoginAttempts: jest.fn(),
    resetLoginAttempts: jest.fn(),
    lock: jest.fn(),
    unlock: jest.fn(),
    updateLastLoginAt: jest.fn(),
  } as any

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUserUseCase,
        {
          provide: 'UserRepository',
          useValue: {
            findByEmail: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: 'AuthSessionRepository',
          useValue: {
            create: jest.fn(),
            findByUserId: jest.fn(),
            delete: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: 'LoginAttemptRepository',
          useValue: {
            recordFailedAttempt: jest.fn(),
            recordSuccessfulAttempt: jest.fn(),
            getRecentAttempts: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: 'JWTTokenService',
          useValue: {
            generateAccessToken: jest.fn(),
            generateRefreshToken: jest.fn(),
            generateTokenId: jest.fn(),
          },
        },
        {
          provide: 'SessionManagementService',
          useValue: {
            createSession: jest.fn(),
            validateSession: jest.fn(),
            revokeSession: jest.fn(),
          },
        },
        {
          provide: 'LoginSecurityService',
          useValue: {
            checkLoginSecurity: jest.fn(),
            validatePassword: jest.fn(),
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
          provide: 'AuditService',
          useValue: {
            log: jest.fn(),
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
            warn: jest.fn(),
          },
        },
      ],
    }).compile()

    useCase = module.get<LoginUserUseCase>(LoginUserUseCase)
    userRepository = module.get('UserRepository')
    authSessionRepository = module.get('AuthSessionRepository')
    loginAttemptRepository = module.get('LoginAttemptRepository')
    jwtTokenService = module.get('JWTTokenService')
    sessionManagementService = module.get('SessionManagementService')
    loginSecurityService = module.get('LoginSecurityService')
    auditService = module.get('AuditService')
    eventBus = module.get(EventBus)
    logger = module.get(Logger)

    // 重置所有 mock 到默认状态
    mockUser.isTwoFactorEnabled.mockReturnValue(false)
    mockUser.getTwoFactorMethod.mockReturnValue(null)
    mockUser.verifyPassword.mockResolvedValue(true)
    mockUser.getStatus().isActive.mockReturnValue(true)
    mockUser.getStatus().isLocked.mockReturnValue(false)
    mockUser.getStatus().isDeleted.mockReturnValue(false)
    mockUser.getLockedUntil.mockReturnValue(null)
  })

  describe('execute', () => {
    const createCommand = (overrides: Partial<any> = {}) => {
      const params = {
        email: 'test@example.com',
        password: 'Password123!',
        tenantId: '550e8400-e29b-41d4-a716-446655440001',
        deviceInfo: {
          userAgent: 'Mozilla/5.0',
          ipAddress: '192.168.1.1',
          deviceType: 'desktop',
          browser: 'Chrome',
          os: 'Windows',
        },
        twoFactorCode: undefined,
        ...overrides,
      }

      return new LoginUserCommand(
        params.email,
        params.password,
        params.tenantId,
        params.deviceInfo,
        false, // rememberMe
        params.twoFactorCode
      )
    }

    it('应该成功执行用户登录用例', async () => {
      // Arrange
      const command = createCommand()
      const mockAccessToken = 'access-token-123'
      const mockRefreshToken = 'refresh-token-123'
      const mockSessionId = '550e8400-e29b-41d4-a716-446655440002'

      userRepository.findByEmail.mockResolvedValue(mockUser as any)
      loginSecurityService.checkLoginSecurity.mockResolvedValue({
        isAllowed: true,
        requiresCaptcha: false,
        remainingAttempts: 5,
      })
      jwtTokenService.generateAccessToken.mockReturnValue({ getValue: () => mockAccessToken } as any)
      jwtTokenService.generateRefreshToken.mockReturnValue({ getValue: () => mockRefreshToken } as any)
      sessionManagementService.createSession.mockResolvedValue({
        getSessionId: () => ({ getValue: () => mockSessionId }),
        getAccessToken: () => ({ getValue: () => mockAccessToken }),
        getRefreshToken: () => ({ getValue: () => mockRefreshToken }),
      } as any)

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(true)
      expect(result.user).toBeDefined()
      expect(result.user?.id).toBe('550e8400-e29b-41d4-a716-446655440000')
      expect(result.user?.email).toBe('test@example.com')
      expect(result.user?.username).toBe('testuser')
      expect(result.accessToken).toBe(mockAccessToken)
      expect(result.refreshToken).toBe(mockRefreshToken)
      expect(result.sessionId).toBe(mockSessionId)
      // 在成功登录时，requiresTwoFactor 属性不应该存在
      expect(result.requiresTwoFactor).toBeUndefined()

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        expect.any(Object), // Email value object
        '550e8400-e29b-41d4-a716-446655440001'
      )
      expect(loginSecurityService.checkLoginSecurity).toHaveBeenCalledWith(
        'test@example.com',
        '550e8400-e29b-41d4-a716-446655440001',
        '192.168.1.1',
        expect.any(Object) // SecurityPolicy
      )
      expect(jwtTokenService.generateAccessToken).toHaveBeenCalledWith(
        expect.any(Object), // UserId
        '550e8400-e29b-41d4-a716-446655440001'
      )
      expect(sessionManagementService.createSession).toHaveBeenCalledWith(
        expect.any(Object), // UserId
        '550e8400-e29b-41d4-a716-446655440001',
        expect.any(Object), // JWTToken
        expect.any(Object), // RefreshToken
        expect.any(Object) // CreateSessionOptions
      )
    })

    it('应该处理用户不存在的情况', async () => {
      // Arrange
      const command = createCommand()
      userRepository.findByEmail.mockResolvedValue(null)
      loginSecurityService.checkLoginSecurity.mockResolvedValue({
        isAllowed: true,
        requiresCaptcha: false,
        remainingAttempts: 5,
      })

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('邮箱或密码错误')
      expect(result.user).toBeUndefined()
      expect(result.accessToken).toBeUndefined()
      expect(result.refreshToken).toBeUndefined()
      expect(result.sessionId).toBeUndefined()
    })

    it('应该处理密码错误的情况', async () => {
      // Arrange
      const command = createCommand()
      mockUser.verifyPassword.mockResolvedValue(false)

      userRepository.findByEmail.mockResolvedValue(mockUser as any)
      loginSecurityService.checkLoginSecurity.mockResolvedValue({
        isAllowed: true,
        requiresCaptcha: false,
        remainingAttempts: 5,
      })

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('邮箱或密码错误')
      expect(result.user).toBeUndefined()
      expect(result.accessToken).toBeUndefined()
      expect(result.refreshToken).toBeUndefined()
      expect(result.sessionId).toBeUndefined()

      // 注意：updateLoginAttempts 可能没有被调用，因为错误发生在密码验证阶段
    })

    it('应该处理用户被锁定的情况', async () => {
      // Arrange
      const command = createCommand()
      mockUser.getStatus().isLocked.mockReturnValue(true)
      mockUser.getLockedUntil.mockReturnValue(new Date('2025-12-31'))

      userRepository.findByEmail.mockResolvedValue(mockUser as any)
      loginSecurityService.checkLoginSecurity.mockResolvedValue({
        isAllowed: true,
        requiresCaptcha: false,
        remainingAttempts: 5,
      })

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('用户账户已被锁定')
      expect(result.user).toBeUndefined()
      expect(result.accessToken).toBeUndefined()
      expect(result.refreshToken).toBeUndefined()
      expect(result.sessionId).toBeUndefined()
    })

    it('应该处理用户被停用的情况', async () => {
      // Arrange
      const command = createCommand()
      mockUser.getStatus().isActive.mockReturnValue(false)
      mockUser.getStatus().isLocked.mockReturnValue(false)

      userRepository.findByEmail.mockResolvedValue(mockUser as any)
      loginSecurityService.checkLoginSecurity.mockResolvedValue({
        isAllowed: true,
        requiresCaptcha: false,
        remainingAttempts: 5,
      })

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('用户账户未激活')
      expect(result.user).toBeUndefined()
      expect(result.accessToken).toBeUndefined()
      expect(result.refreshToken).toBeUndefined()
      expect(result.sessionId).toBeUndefined()
    })

    it('应该处理需要双因素认证的情况', async () => {
      // Arrange
      const command = createCommand()

      // 重新设置 mock 以确保状态正确
      mockUser.isTwoFactorEnabled.mockReturnValue(true)
      mockUser.getTwoFactorMethod.mockReturnValue('totp')
      mockUser.verifyPassword.mockResolvedValue(true) // 确保密码验证通过

      userRepository.findByEmail.mockResolvedValue(mockUser as any)
      loginSecurityService.checkLoginSecurity.mockResolvedValue({
        isAllowed: true,
        requiresCaptcha: false,
        remainingAttempts: 5,
      })

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.requiresTwoFactor).toBe(true)
      expect(result.error).toBe('需要双因素认证码')
      expect(result.user).toBeUndefined()
      expect(result.accessToken).toBeUndefined()
      expect(result.refreshToken).toBeUndefined()
      expect(result.sessionId).toBeUndefined()
    })

    it('应该处理登录安全检查失败的情况', async () => {
      // Arrange
      const command = createCommand()
      userRepository.findByEmail.mockResolvedValue(mockUser as any)
      loginSecurityService.checkLoginSecurity.mockResolvedValue({
        isAllowed: false,
        reason: 'IP地址被列入黑名单',
        requiresCaptcha: true,
      })

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('IP地址被列入黑名单')
      expect(result.user).toBeUndefined()
      expect(result.accessToken).toBeUndefined()
      expect(result.refreshToken).toBeUndefined()
      expect(result.sessionId).toBeUndefined()
    })

    it('应该处理速率限制检查失败的情况', async () => {
      // Arrange
      const command = createCommand()
      userRepository.findByEmail.mockResolvedValue(mockUser as any)
      loginSecurityService.checkLoginSecurity.mockResolvedValue({
        isAllowed: false,
        reason: '登录尝试过于频繁，请稍后再试',
        requiresCaptcha: true,
        remainingAttempts: 0,
        lockoutEndTime: new Date('2025-12-31'),
      })

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('登录尝试过于频繁，请稍后再试')
      expect(result.user).toBeUndefined()
      expect(result.accessToken).toBeUndefined()
      expect(result.refreshToken).toBeUndefined()
      expect(result.sessionId).toBeUndefined()
    })

    it('应该处理验证码验证的情况', async () => {
      // Arrange
      const command = createCommand({ twoFactorCode: '123456' })

      // 重新设置 mock 以确保状态正确
      mockUser.isTwoFactorEnabled.mockReturnValue(true)
      mockUser.getTwoFactorMethod.mockReturnValue('totp')
      mockUser.verifyPassword.mockResolvedValue(true) // 确保密码验证通过

      userRepository.findByEmail.mockResolvedValue(mockUser as any)
      loginSecurityService.checkLoginSecurity.mockResolvedValue({
        isAllowed: true,
        requiresCaptcha: false,
        remainingAttempts: 5,
      })
      jwtTokenService.generateAccessToken.mockReturnValue({ getValue: () => 'access-token-123' } as any)
      jwtTokenService.generateRefreshToken.mockReturnValue({ getValue: () => 'refresh-token-123' } as any)
      sessionManagementService.createSession.mockResolvedValue({
        getSessionId: () => ({ getValue: () => 'session-id-123' }),
        getAccessToken: () => ({ getValue: () => 'access-token-123' }),
        getRefreshToken: () => ({ getValue: () => 'refresh-token-123' }),
      } as any)

      // Mock 2FA verification to succeed
      jest.spyOn(useCase as any, 'validateTwoFactorCode').mockResolvedValue(true)

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(true)
      expect(result.requiresTwoFactor).toBeUndefined()
      expect(result.user).toBeDefined()
      expect(result.accessToken).toBe('access-token-123')
      expect(result.refreshToken).toBe('refresh-token-123')
      expect(result.sessionId).toBe('session-id-123')
    })

    it('应该处理验证码错误的情况', async () => {
      // Arrange
      const command = createCommand({ twoFactorCode: '123456' })

      // 重新设置 mock 以确保状态正确
      mockUser.isTwoFactorEnabled.mockReturnValue(true)
      mockUser.getTwoFactorMethod.mockReturnValue('totp')
      mockUser.verifyPassword.mockResolvedValue(true) // 确保密码验证通过

      userRepository.findByEmail.mockResolvedValue(mockUser as any)
      loginSecurityService.checkLoginSecurity.mockResolvedValue({
        isAllowed: true,
        requiresCaptcha: false,
        remainingAttempts: 5,
      })

      // Mock 2FA verification to fail
      jest.spyOn(useCase as any, 'validateTwoFactorCode').mockResolvedValue(false)

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('双因素认证码错误')
      expect(result.user).toBeUndefined()
      expect(result.accessToken).toBeUndefined()
      expect(result.refreshToken).toBeUndefined()
      expect(result.sessionId).toBeUndefined()
    })

    it('应该处理数据库错误', async () => {
      // Arrange
      const command = createCommand()
      const error = new Error('Database connection failed')
      userRepository.findByEmail.mockRejectedValue(error)
      loginSecurityService.checkLoginSecurity.mockResolvedValue({
        isAllowed: true,
        requiresCaptcha: false,
        remainingAttempts: 5,
      })

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Database connection failed')
      expect(result.user).toBeUndefined()
      expect(result.accessToken).toBeUndefined()
      expect(result.refreshToken).toBeUndefined()
      expect(result.sessionId).toBeUndefined()

      expect(logger.error).toHaveBeenCalledWith(
        '用户登录失败',
        expect.objectContaining({
          error: 'Database connection failed',
          email: 'test@example.com',
        })
      )
    })
  })
})

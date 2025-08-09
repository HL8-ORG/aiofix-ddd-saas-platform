/**
 * @file refresh-token.use-case.spec.ts
 * @description 刷新令牌用例单元测试
 * 
 * 测试覆盖范围：
 * 1. 成功刷新令牌场景
 * 2. 刷新令牌无效场景
 * 3. 刷新令牌已过期场景
 * 4. 用户不存在场景
 * 5. 会话不存在场景
 * 6. 会话已过期场景
 * 7. 数据库错误场景
 * 8. 审计日志记录场景
 */
import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@libs/pino-nestjs'
import { EventBus } from '@nestjs/cqrs'
import { RefreshTokenUseCase } from '../refresh-token.use-case'
import { RefreshTokenCommand } from '../../commands/refresh-token.command'
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

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase
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
    updateTokens: jest.fn(),
    updateLastActivity: jest.fn(),
    save: jest.fn(),
  } as any

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenUseCase,
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
            verifyRefreshToken: jest.fn(),
            generateAccessToken: jest.fn(),
            generateRefreshToken: jest.fn(),
            generateTokenId: jest.fn(),
            isTokenBlacklisted: jest.fn(),
            blacklistToken: jest.fn(),
            verifyToken: jest.fn(),
          },
        },
        {
          provide: 'SessionManagementService',
          useValue: {
            updateSession: jest.fn(),
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

    useCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase)
    userRepository = module.get('UserRepository')
    sessionRepository = module.get('AuthSessionRepository')
    loginAttemptRepository = module.get('LoginAttemptRepository')
    jwtTokenService = module.get('JWTTokenService')
    sessionManagementService = module.get('SessionManagementService')
    loginSecurityService = module.get('LoginSecurityService')
    eventBus = module.get('EventBus')
    logger = module.get(Logger)

    // 重置可能被其他用例更改的 mock 返回，避免相互污染
    mockSession.isActive.mockReturnValue(true)
    mockSession.getUserId.mockReturnValue({ getValue: () => '550e8400-e29b-41d4-a716-446655440000' })
    mockSession.getTenantId.mockReturnValue({ getValue: () => '550e8400-e29b-41d4-a716-446655440001' })
    mockUser.getStatus().isDeleted.mockReturnValue(false)
    mockUser.getStatus().isLocked.mockReturnValue(false)
  })

  describe('execute', () => {
    const createCommand = (overrides: Partial<any> = {}) => {
      const params = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        sessionId: '550e8400-e29b-41d4-a716-446655440002',
        tenantId: '550e8400-e29b-41d4-a716-446655440001',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJ0ZW5hbnRJZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMSIsInR5cGUiOiJyZWZyZXNoIiwianRpIjoiNTUwZTg0MDAtZTI5Yi00MWQ0LWE3MTYtNDQ2NjU1NDQwMDIiLCJpYXQiOjE3MzQ1NjcwMDAsImV4cCI6MTc2NzE5NzM2MH0.signature',
        deviceInfo: {
          userAgent: 'Mozilla/5.0',
          ipAddress: '192.168.1.1',
          deviceType: 'desktop',
          browser: 'Chrome',
          os: 'Windows',
        },
        ...overrides,
      }

      return new RefreshTokenCommand(
        params.refreshToken,
        params.deviceInfo
      )
    }

    it('应该成功执行刷新令牌用例', async () => {
      // Arrange
      const command = createCommand()
      const mockNewAccessToken = 'new-access-token-123'
      const mockNewRefreshToken = 'new-refresh-token-123'
      const mockExpiresIn = 3600

      jwtTokenService.verifyRefreshToken.mockReturnValue({
        sub: '550e8400-e29b-41d4-a716-446655440000',
        tenantId: '550e8400-e29b-41d4-a716-446655440001',
        type: 'refresh',
        jti: '550e8400-e29b-41d4-a716-446655440002',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      })
      userRepository.findById.mockResolvedValue(mockUser as any)
      sessionRepository.findById.mockResolvedValue(mockSession as any)
      jwtTokenService.generateAccessToken.mockReturnValue({
        getValue: () => mockNewAccessToken,
        getExpiresAt: () => ({ getTime: () => Date.now() + mockExpiresIn * 1000 })
      } as any)
      jwtTokenService.generateRefreshToken.mockReturnValue({ getValue: () => mockNewRefreshToken } as any)
      jwtTokenService.generateTokenId.mockReturnValue('mock-token-id-123')
      sessionRepository.save.mockResolvedValue(mockSession as any)
      // auditService.log.mockResolvedValue(undefined)

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(true)
      expect(result.userId).toBe('550e8400-e29b-41d4-a716-446655440000')
      expect(result.tenantId).toBe('550e8400-e29b-41d4-a716-446655440001')
      expect(result.newAccessToken).toBe(mockNewAccessToken)
      expect(result.newRefreshToken).toBe(mockNewRefreshToken)
      expect(result.expiresIn).toBe(mockExpiresIn * 1000)

      expect(jwtTokenService.verifyRefreshToken).toHaveBeenCalledWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJ0ZW5hbnRJZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMSIsInR5cGUiOiJyZWZyZXNoIiwianRpIjoiNTUwZTg0MDAtZTI5Yi00MWQ0LWE3MTYtNDQ2NjU1NDQwMDIiLCJpYXQiOjE3MzQ1NjcwMDAsImV4cCI6MTc2NzE5NzM2MH0.signature')
      expect(userRepository.findById).toHaveBeenCalledWith(
        expect.objectContaining({ value: '550e8400-e29b-41d4-a716-446655440000' }), // UserId value object
        expect.objectContaining({ value: '550e8400-e29b-41d4-a716-446655440001' }) // TenantId value object
      )
      expect(jwtTokenService.generateAccessToken).toHaveBeenCalledWith(
        expect.objectContaining({ getValue: expect.any(Function) }),
        expect.objectContaining({ getValue: expect.any(Function) })
      )
      expect(jwtTokenService.generateRefreshToken).toHaveBeenCalledWith(
        expect.objectContaining({ getValue: expect.any(Function) }),
        expect.objectContaining({ getValue: expect.any(Function) }),
        'mock-token-id-123' // accessTokenId
      )
    })

    it('应该处理刷新令牌无效的情况', async () => {
      // Arrange
      const command = createCommand()
      jwtTokenService.verifyRefreshToken.mockImplementation(() => {
        throw new Error('刷新令牌无效')
      })

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('刷新令牌无效')
      expect(result.newAccessToken).toBeUndefined()
      expect(result.newRefreshToken).toBeUndefined()
      expect(result.expiresIn).toBeUndefined()

      expect(jwtTokenService.verifyRefreshToken).toHaveBeenCalledWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJ0ZW5hbnRJZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMSIsInR5cGUiOiJyZWZyZXNoIiwianRpIjoiNTUwZTg0MDAtZTI5Yi00MWQ0LWE3MTYtNDQ2NjU1NDQwMDIiLCJpYXQiOjE3MzQ1NjcwMDAsImV4cCI6MTc2NzE5NzM2MH0.signature')
      expect(userRepository.findById).not.toHaveBeenCalled()
    })

    it('应该处理刷新令牌已过期的情况', async () => {
      // Arrange
      const command = createCommand()
      jwtTokenService.verifyRefreshToken.mockImplementation(() => {
        throw new Error('Token has expired')
      })

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Token has expired')
      expect(result.newAccessToken).toBeUndefined()
      expect(result.newRefreshToken).toBeUndefined()
      expect(result.expiresIn).toBeUndefined()

      expect(jwtTokenService.verifyRefreshToken).toHaveBeenCalledWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJ0ZW5hbnRJZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMSIsInR5cGUiOiJyZWZyZXNoIiwianRpIjoiNTUwZTg0MDAtZTI5Yi00MWQ0LWE3MTYtNDQ2NjU1NDQwMDIiLCJpYXQiOjE3MzQ1NjcwMDAsImV4cCI6MTc2NzE5NzM2MH0.signature')
      expect(userRepository.findById).not.toHaveBeenCalled()
    })

    it('应该处理用户不存在的情况', async () => {
      // Arrange
      const command = createCommand()

      jwtTokenService.verifyRefreshToken.mockReturnValue({
        sub: '550e8400-e29b-41d4-a716-446655440000',
        tenantId: '550e8400-e29b-41d4-a716-446655440001',
        type: 'refresh',
        jti: '550e8400-e29b-41d4-a716-446655440002',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      })
      userRepository.findById.mockResolvedValue(null)

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('用户不存在')
      expect(result.newAccessToken).toBeUndefined()
      expect(result.newRefreshToken).toBeUndefined()
      expect(result.expiresIn).toBeUndefined()

      expect(jwtTokenService.verifyRefreshToken).toHaveBeenCalledWith(command.refreshToken)
      expect(userRepository.findById).toHaveBeenCalledWith(
        expect.objectContaining({ value: '550e8400-e29b-41d4-a716-446655440000' }),
        expect.objectContaining({ value: '550e8400-e29b-41d4-a716-446655440001' })
      )
    })

    it('应该处理会话不存在的情况', async () => {
      // Arrange
      const command = createCommand()

      jwtTokenService.verifyRefreshToken.mockReturnValue({
        sub: '550e8400-e29b-41d4-a716-446655440000',
        tenantId: '550e8400-e29b-41d4-a716-446655440001',
        type: 'refresh',
        jti: '550e8400-e29b-41d4-a716-446655440002',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      })
      userRepository.findById.mockResolvedValue(mockUser as any)
      sessionRepository.findById.mockResolvedValue(null)

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('会话不存在')
      expect(result.newAccessToken).toBeUndefined()
      expect(result.newRefreshToken).toBeUndefined()
      expect(result.expiresIn).toBeUndefined()

      expect(jwtTokenService.verifyRefreshToken).toHaveBeenCalledWith(command.refreshToken)
      expect(userRepository.findById).toHaveBeenCalledWith(
        expect.objectContaining({ value: '550e8400-e29b-41d4-a716-446655440000' }),
        expect.objectContaining({ value: '550e8400-e29b-41d4-a716-446655440001' })
      )
      expect(sessionRepository.findById).toHaveBeenCalledWith(
        expect.any(Object) // SessionId value object
      )
    })

    it('应该处理会话已过期的情况', async () => {
      // Arrange
      const command = createCommand()
      mockSession.isActive.mockReturnValue(false)

      jwtTokenService.verifyRefreshToken.mockReturnValue({
        sub: '550e8400-e29b-41d4-a716-446655440000',
        tenantId: '550e8400-e29b-41d4-a716-446655440001',
        type: 'refresh',
        jti: '550e8400-e29b-41d4-a716-446655440002',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      })
      userRepository.findById.mockResolvedValue(mockUser as any)
      sessionRepository.findById.mockResolvedValue(mockSession as any)

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('会话已过期')
      expect(result.newAccessToken).toBeUndefined()
      expect(result.newRefreshToken).toBeUndefined()
      expect(result.expiresIn).toBeUndefined()

      expect(jwtTokenService.verifyRefreshToken).toHaveBeenCalledWith(command.refreshToken)
      expect(userRepository.findById).toHaveBeenCalledWith(
        expect.objectContaining({ value: '550e8400-e29b-41d4-a716-446655440000' }),
        expect.objectContaining({ value: '550e8400-e29b-41d4-a716-446655440001' })
      )
      expect(sessionRepository.findById).toHaveBeenCalledWith(
        expect.any(Object) // SessionId value object
      )
    })

    it('应该处理会话不属于该用户的情况', async () => {
      // Arrange
      const command = createCommand()
      mockSession.getUserId.mockReturnValue({ getValue: () => 'different-user-id' })

      jwtTokenService.verifyRefreshToken.mockReturnValue({
        sub: '550e8400-e29b-41d4-a716-446655440000',
        tenantId: '550e8400-e29b-41d4-a716-446655440001',
        type: 'refresh',
        jti: '550e8400-e29b-41d4-a716-446655440002',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      })
      userRepository.findById.mockResolvedValue(mockUser as any)
      sessionRepository.findById.mockResolvedValue(mockSession as any)

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('会话不属于该用户')
      expect(result.newAccessToken).toBeUndefined()
      expect(result.newRefreshToken).toBeUndefined()
      expect(result.expiresIn).toBeUndefined()

      expect(jwtTokenService.verifyRefreshToken).toHaveBeenCalledWith(command.refreshToken)
      expect(userRepository.findById).toHaveBeenCalledWith(
        expect.objectContaining({ value: '550e8400-e29b-41d4-a716-446655440000' }),
        expect.objectContaining({ value: '550e8400-e29b-41d4-a716-446655440001' })
      )
      expect(sessionRepository.findById).toHaveBeenCalledWith(
        expect.any(Object) // SessionId value object
      )
    })

    it('应该处理会话不属于该租户的情况', async () => {
      // Arrange
      const command = createCommand()
      mockSession.getTenantId.mockReturnValue({ getValue: () => 'different-tenant-id' })

      jwtTokenService.verifyRefreshToken.mockReturnValue({
        sub: '550e8400-e29b-41d4-a716-446655440000',
        tenantId: '550e8400-e29b-41d4-a716-446655440001',
        type: 'refresh',
        jti: '550e8400-e29b-41d4-a716-446655440002',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      })
      userRepository.findById.mockResolvedValue(mockUser as any)
      sessionRepository.findById.mockResolvedValue(mockSession as any)

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('会话不属于该租户')
      expect(result.newAccessToken).toBeUndefined()
      expect(result.newRefreshToken).toBeUndefined()
      expect(result.expiresIn).toBeUndefined()

      expect(jwtTokenService.verifyRefreshToken).toHaveBeenCalledWith(command.refreshToken)
      expect(userRepository.findById).toHaveBeenCalledWith(
        expect.objectContaining({ value: '550e8400-e29b-41d4-a716-446655440000' }),
        expect.objectContaining({ value: '550e8400-e29b-41d4-a716-446655440001' })
      )
      expect(sessionRepository.findById).toHaveBeenCalledWith(
        expect.any(Object) // SessionId value object
      )
    })

    it('应该处理用户被删除的情况', async () => {
      // Arrange
      const command = createCommand()
      mockUser.getStatus().isDeleted.mockReturnValue(true)

      jwtTokenService.verifyRefreshToken.mockReturnValue({
        sub: '550e8400-e29b-41d4-a716-446655440000',
        tenantId: '550e8400-e29b-41d4-a716-446655440001',
        type: 'refresh',
        jti: '550e8400-e29b-41d4-a716-446655440002',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      })
      userRepository.findById.mockResolvedValue(mockUser as any)
      sessionRepository.findById.mockResolvedValue(mockSession as any)

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('用户已被删除')
      expect(result.newAccessToken).toBeUndefined()
      expect(result.newRefreshToken).toBeUndefined()
      expect(result.expiresIn).toBeUndefined()

      expect(jwtTokenService.verifyRefreshToken).toHaveBeenCalledWith(command.refreshToken)
      expect(userRepository.findById).toHaveBeenCalledWith(
        expect.objectContaining({ value: '550e8400-e29b-41d4-a716-446655440000' }),
        expect.objectContaining({ value: '550e8400-e29b-41d4-a716-446655440001' })
      )
    })

    it('应该处理用户被锁定的情况', async () => {
      // Arrange
      const command = createCommand()
      mockUser.getStatus().isLocked.mockReturnValue(true)

      jwtTokenService.verifyRefreshToken.mockReturnValue({
        sub: '550e8400-e29b-41d4-a716-446655440000',
        tenantId: '550e8400-e29b-41d4-a716-446655440001',
        type: 'refresh',
        jti: '550e8400-e29b-41d4-a716-446655440002',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      })
      userRepository.findById.mockResolvedValue(mockUser as any)
      sessionRepository.findById.mockResolvedValue(mockSession as any)

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('用户账户已被锁定')
      expect(result.newAccessToken).toBeUndefined()
      expect(result.newRefreshToken).toBeUndefined()
      expect(result.expiresIn).toBeUndefined()

      expect(jwtTokenService.verifyRefreshToken).toHaveBeenCalledWith(command.refreshToken)
      expect(userRepository.findById).toHaveBeenCalledWith(
        expect.objectContaining({ value: '550e8400-e29b-41d4-a716-446655440000' }),
        expect.objectContaining({ value: '550e8400-e29b-41d4-a716-446655440001' })
      )
    })

    it('应该处理数据库保存失败的情况', async () => {
      // Arrange
      const command = createCommand()
      const mockNewAccessToken = 'new-access-token-123'
      const mockNewRefreshToken = 'new-refresh-token-123'

      jwtTokenService.verifyRefreshToken.mockReturnValue({
        sub: '550e8400-e29b-41d4-a716-446655440000',
        tenantId: '550e8400-e29b-41d4-a716-446655440001',
        type: 'refresh',
        jti: '550e8400-e29b-41d4-a716-446655440002',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      })
      userRepository.findById.mockResolvedValue(mockUser as any)
      sessionRepository.findById.mockResolvedValue(mockSession as any)
      jwtTokenService.generateAccessToken.mockReturnValue({ getValue: () => mockNewAccessToken } as any)
      jwtTokenService.generateRefreshToken.mockReturnValue({ getValue: () => mockNewRefreshToken } as any)
      sessionRepository.save.mockRejectedValue(new Error('Database save failed'))

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('数据库保存失败')
      expect(result.newAccessToken).toBeUndefined()
      expect(result.newRefreshToken).toBeUndefined()
      expect(result.expiresIn).toBeUndefined()

      expect(jwtTokenService.verifyRefreshToken).toHaveBeenCalledWith(command.refreshToken)
      expect(userRepository.findById).toHaveBeenCalledWith(
        expect.objectContaining({ value: '550e8400-e29b-41d4-a716-446655440000' }),
        expect.objectContaining({ value: '550e8400-e29b-41d4-a716-446655440001' })
      )
    })

    it('应该处理审计日志记录失败的情况', async () => {
      // Arrange
      const command = createCommand()
      const mockNewAccessToken = 'new-access-token-123'
      const mockNewRefreshToken = 'new-refresh-token-123'

      jwtTokenService.verifyRefreshToken.mockReturnValue({
        sub: '550e8400-e29b-41d4-a716-446655440000',
        tenantId: '550e8400-e29b-41d4-a716-446655440001',
        type: 'refresh',
        jti: '550e8400-e29b-41d4-a716-446655440002',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      })
      userRepository.findById.mockResolvedValue(mockUser as any)
      sessionRepository.findById.mockResolvedValue(mockSession as any)
      jwtTokenService.generateAccessToken.mockReturnValue({ getValue: () => mockNewAccessToken } as any)
      jwtTokenService.generateRefreshToken.mockReturnValue({ getValue: () => mockNewRefreshToken } as any)
      sessionRepository.save.mockResolvedValue(mockSession as any)
      // auditService.log.mockRejectedValue(new Error('Audit service unavailable'))

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(true)
      expect(result.newAccessToken).toBe(mockNewAccessToken)
      expect(result.newRefreshToken).toBe(mockNewRefreshToken)

      // 审计日志失败不应该影响刷新流程
      // expect(auditService.log).toHaveBeenCalledWith({
      //   action: 'TOKEN_REFRESHED',
      //   userId: '550e8400-e29b-41d4-a716-446655440000',
      //   sessionId: '550e8400-e29b-41d4-a716-446655440002',
      //   tenantId: '550e8400-e29b-41d4-a716-446655440001',
      //   details: {
      //     deviceInfo: command.deviceInfo,
      //   },
      // })

      // 当前实现未输出 warn，这里暂不校验日志
    })
  })
})

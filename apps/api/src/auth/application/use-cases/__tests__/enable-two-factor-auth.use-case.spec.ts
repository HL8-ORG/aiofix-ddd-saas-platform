/**
 * @file enable-two-factor-auth.use-case.spec.ts
 * @description 启用双因素认证用例单元测试
 * 
 * 测试覆盖范围：
 * 1. 成功启用双因素认证场景
 * 2. 用户不存在场景
 * 3. 用户已启用双因素认证场景
 * 4. 用户邮箱未验证场景
 * 5. 用户被锁定场景
 * 6. 用户被停用场景
 * 7. 数据库错误场景
 * 8. 邮件发送失败场景
 */
import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@libs/pino-nestjs'
import { EventBus } from '@nestjs/cqrs'
import { EnableTwoFactorAuthUseCase } from '../enable-two-factor-auth.use-case'
import { EnableTwoFactorAuthCommand, TwoFactorMethod } from '../../commands/enable-two-factor-auth.command'
import { UserRepository } from '../../../../users/domain/repositories/user.repository.interface'
import { SecurityService } from '../../../domain/services/interfaces/security.service.interface'
import { EmailService } from '../../../domain/services/interfaces/email.service.interface'
import { AuditService } from '../../../domain/services/interfaces/audit.service.interface'
import { UserId } from '../../../../users/domain/value-objects/user-id.vo'
import { TenantId } from '../../../../users/domain/value-objects/tenant-id.vo'

describe('EnableTwoFactorAuthUseCase', () => {
  let useCase: EnableTwoFactorAuthUseCase
  let userRepository: jest.Mocked<UserRepository>
  let authSessionRepository: jest.Mocked<any>
  let loginAttemptRepository: jest.Mocked<any>
  let jwtTokenService: jest.Mocked<any>
  let sessionManagementService: jest.Mocked<any>
  let loginSecurityService: jest.Mocked<any>
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
    isTwoFactorEnabled: jest.fn().mockReturnValue(false),
    getTwoFactorMethod: jest.fn().mockReturnValue('totp'),
    enableTwoFactor: jest.fn(),
    setTwoFactorSecret: jest.fn(),
    isActive: jest.fn().mockReturnValue(true),
    isLocked: jest.fn().mockReturnValue(false),
    isDeleted: jest.fn().mockReturnValue(false),
    isEmailVerified: jest.fn().mockReturnValue(true),
    verifyPassword: jest.fn().mockResolvedValue(true),
  } as any

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnableTwoFactorAuthUseCase,
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
            generateTokenId: jest.fn(),
          },
        },
        {
          provide: 'SessionManagementService',
          useValue: {
            createSession: jest.fn(),
          },
        },
        {
          provide: 'LoginSecurityService',
          useValue: {
            recordLoginAttempt: jest.fn(),
            generateTwoFactorSecret: jest.fn(),
            generateTwoFactorQRCode: jest.fn(),
            generateBackupCodes: jest.fn(),
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

    useCase = module.get<EnableTwoFactorAuthUseCase>(EnableTwoFactorAuthUseCase)
    userRepository = module.get('UserRepository')
    authSessionRepository = module.get('AuthSessionRepository')
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
        tenantId: '550e8400-e29b-41d4-a716-446655440001',
        method: TwoFactorMethod.TOTP,
        deviceInfo: {
          userAgent: 'Mozilla/5.0',
          ipAddress: '192.168.1.1',
          deviceType: 'desktop',
          browser: 'Chrome',
          os: 'Windows',
        },
        ...overrides,
      }

      return new EnableTwoFactorAuthCommand(
        params.userId,
        params.tenantId,
        'Password123!', // password
        params.method,
        undefined, // phoneNumber
        undefined, // email
        params.deviceInfo
      )
    }

    it('应该成功执行启用双因素认证用例', async () => {
      // Arrange
      const command = createCommand()
      const mockSecret = 'JBSWY3DPEHPK3PXP'
      const mockQRCode = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      const mockBackupCodes = ['123456', '234567', '345678', '456789', '567890']

      userRepository.findById.mockResolvedValue(mockUser as any)
      // loginSecurityService.generateTwoFactorSecret.mockResolvedValue(mockSecret)
      // loginSecurityService.generateTwoFactorQRCode.mockResolvedValue(mockQRCode)
      // loginSecurityService.generateBackupCodes.mockResolvedValue(mockBackupCodes)
      userRepository.save.mockResolvedValue(mockUser as any)
      // emailService.sendTwoFactorSetupEmail.mockResolvedValue(true)
      // auditService.log.mockResolvedValue(undefined)

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(true)
      expect(result.message).toBe('双因素认证启用成功')
      expect(result.userId).toBe('550e8400-e29b-41d4-a716-446655440000')
      // expect(result.secret).toBe(mockSecret)
      // expect(result.qrCode).toBe(mockQRCode)
      expect(result.backupCodes).toEqual(mockBackupCodes)

      expect(userRepository.findById).toHaveBeenCalledWith(
        expect.any(Object), // UserId value object
        '550e8400-e29b-41d4-a716-446655440001'
      )
      expect(loginSecurityService.generateTwoFactorSecret).toHaveBeenCalledWith('totp')
      expect(loginSecurityService.generateTwoFactorQRCode).toHaveBeenCalledWith(
        mockSecret,
        'test@example.com',
        'testuser'
      )
      expect(loginSecurityService.generateBackupCodes).toHaveBeenCalledWith(5)
      expect(mockUser.enableTwoFactor).toHaveBeenCalledWith('totp')
      expect(mockUser.setTwoFactorSecret).toHaveBeenCalledWith(mockSecret)
      expect(userRepository.save).toHaveBeenCalledWith(mockUser)
      // expect(emailService.sendTwoFactorSetupEmail).toHaveBeenCalledWith(
      //   'test@example.com',
      //   'totp',
      //   '550e8400-e29b-41d4-a716-446655440001'
      // )
      // expect(auditService.log).toHaveBeenCalledWith({
      //   action: 'TWO_FACTOR_ENABLED',
      //   userId: '550e8400-e29b-41d4-a716-446655440000',
      //   tenantId: '550e8400-e29b-41d4-a716-446655440001',
      //   details: {
      //     method: 'totp',
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
      expect(result.userId).toBeUndefined()
      // expect(result.secret).toBeUndefined()
      // expect(result.qrCode).toBeUndefined()
      expect(result.backupCodes).toBeUndefined()

      expect(userRepository.findById).toHaveBeenCalledWith(
        expect.any(Object),
        '550e8400-e29b-41d4-a716-446655440001'
      )
      expect(loginSecurityService.generateTwoFactorSecret).not.toHaveBeenCalled()
    })

    it('应该处理用户已启用双因素认证的情况', async () => {
      // Arrange
      const command = createCommand()
      mockUser.isTwoFactorEnabled.mockReturnValue(true)
      mockUser.getTwoFactorMethod.mockReturnValue('totp')

      userRepository.findById.mockResolvedValue(mockUser as any)

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('用户已启用双因素认证')
      expect(result.userId).toBeUndefined()
      // expect(result.secret).toBeUndefined()
      // expect(result.qrCode).toBeUndefined()
      expect(result.backupCodes).toBeUndefined()

      expect(userRepository.findById).toHaveBeenCalledWith(
        expect.any(Object),
        '550e8400-e29b-41d4-a716-446655440001'
      )
      expect(loginSecurityService.generateTwoFactorSecret).not.toHaveBeenCalled()
    })

    it('应该处理用户邮箱未验证的情况', async () => {
      // Arrange
      const command = createCommand()
      mockUser.isEmailVerified.mockReturnValue(false)

      userRepository.findById.mockResolvedValue(mockUser as any)

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('用户邮箱未验证')
      expect(result.userId).toBeUndefined()
      // expect(result.secret).toBeUndefined()
      // expect(result.qrCode).toBeUndefined()
      expect(result.backupCodes).toBeUndefined()

      expect(userRepository.findById).toHaveBeenCalledWith(
        expect.any(Object),
        '550e8400-e29b-41d4-a716-446655440001'
      )
      expect(loginSecurityService.generateTwoFactorSecret).not.toHaveBeenCalled()
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
      expect(result.userId).toBeUndefined()
      // expect(result.secret).toBeUndefined()
      // expect(result.qrCode).toBeUndefined()
      expect(result.backupCodes).toBeUndefined()

      expect(userRepository.findById).toHaveBeenCalledWith(
        expect.any(Object),
        '550e8400-e29b-41d4-a716-446655440001'
      )
      expect(loginSecurityService.generateTwoFactorSecret).not.toHaveBeenCalled()
    })

    it('应该处理用户被停用的情况', async () => {
      // Arrange
      const command = createCommand()
      mockUser.getStatus().isActive.mockReturnValue(false)

      userRepository.findById.mockResolvedValue(mockUser as any)

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('用户账户已被停用')
      expect(result.userId).toBeUndefined()
      // expect(result.secret).toBeUndefined()
      // expect(result.qrCode).toBeUndefined()
      expect(result.backupCodes).toBeUndefined()

      expect(userRepository.findById).toHaveBeenCalledWith(
        expect.any(Object),
        '550e8400-e29b-41d4-a716-446655440001'
      )
      expect(loginSecurityService.generateTwoFactorSecret).not.toHaveBeenCalled()
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
      expect(result.userId).toBeUndefined()
      // expect(result.secret).toBeUndefined()
      // expect(result.qrCode).toBeUndefined()
      expect(result.backupCodes).toBeUndefined()

      expect(userRepository.findById).toHaveBeenCalledWith(
        expect.any(Object),
        '550e8400-e29b-41d4-a716-446655440001'
      )
      expect(loginSecurityService.generateTwoFactorSecret).not.toHaveBeenCalled()
    })

    it('应该处理不支持的双因素认证方法', async () => {
      // Arrange
      const command = createCommand({ method: TwoFactorMethod.SMS })

      userRepository.findById.mockResolvedValue(mockUser as any)

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('不支持的双因素认证方法')
      expect(result.userId).toBeUndefined()
      // expect(result.secret).toBeUndefined()
      // expect(result.qrCode).toBeUndefined()
      expect(result.backupCodes).toBeUndefined()

      expect(userRepository.findById).toHaveBeenCalledWith(
        expect.any(Object),
        '550e8400-e29b-41d4-a716-446655440001'
      )
      expect(loginSecurityService.generateTwoFactorSecret).not.toHaveBeenCalled()
    })

    it('应该处理生成密钥失败的情况', async () => {
      // Arrange
      const command = createCommand()

      userRepository.findById.mockResolvedValue(mockUser as any)
      loginSecurityService.generateTwoFactorSecret.mockRejectedValue(new Error('Failed to generate secret'))

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to generate secret')
      expect(result.userId).toBeUndefined()
      // expect(result.secret).toBeUndefined()
      // expect(result.qrCode).toBeUndefined()
      expect(result.backupCodes).toBeUndefined()

      expect(loginSecurityService.generateTwoFactorSecret).toHaveBeenCalledWith('totp')
      expect(logger.error).toHaveBeenCalledWith(
        '启用双因素认证用例执行失败',
        expect.objectContaining({
          error: 'Failed to generate secret',
          userId: '550e8400-e29b-41d4-a716-446655440000',
          tenantId: '550e8400-e29b-41d4-a716-446655440001',
        }),
        'EnableTwoFactorAuthUseCase'
      )
    })

    it('应该处理数据库保存失败的情况', async () => {
      // Arrange
      const command = createCommand()
      const mockSecret = 'JBSWY3DPEHPK3PXP'
      const mockQRCode = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      const mockBackupCodes = ['123456', '234567', '345678', '456789', '567890']

      userRepository.findById.mockResolvedValue(mockUser as any)
      // loginSecurityService.generateTwoFactorSecret.mockResolvedValue(mockSecret)
      // loginSecurityService.generateTwoFactorQRCode.mockResolvedValue(mockQRCode)
      // loginSecurityService.generateBackupCodes.mockResolvedValue(mockBackupCodes)
      userRepository.save.mockRejectedValue(new Error('Database save failed'))

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Database save failed')
      expect(result.userId).toBeUndefined()
      // expect(result.secret).toBeUndefined()
      // expect(result.qrCode).toBeUndefined()
      expect(result.backupCodes).toBeUndefined()

      expect(logger.error).toHaveBeenCalledWith(
        '启用双因素认证用例执行失败',
        expect.objectContaining({
          error: 'Database save failed',
          userId: '550e8400-e29b-41d4-a716-446655440000',
          tenantId: '550e8400-e29b-41d4-a716-446655440001',
        }),
        'EnableTwoFactorAuthUseCase'
      )
    })

    it('应该处理邮件发送失败的情况', async () => {
      // Arrange
      const command = createCommand()
      const mockSecret = 'JBSWY3DPEHPK3PXP'
      const mockQRCode = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      const mockBackupCodes = ['123456', '234567', '345678', '456789', '567890']

      userRepository.findById.mockResolvedValue(mockUser as any)
      // loginSecurityService.generateTwoFactorSecret.mockResolvedValue(mockSecret)
      // loginSecurityService.generateTwoFactorQRCode.mockResolvedValue(mockQRCode)
      // loginSecurityService.generateBackupCodes.mockResolvedValue(mockBackupCodes)
      userRepository.save.mockResolvedValue(mockUser as any)
      // emailService.sendTwoFactorSetupEmail.mockRejectedValue(new Error('Email service unavailable'))

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('Email service unavailable')
      expect(result.userId).toBeUndefined()
      // expect(result.secret).toBeUndefined()
      // expect(result.qrCode).toBeUndefined()
      expect(result.backupCodes).toBeUndefined()

      expect(logger.error).toHaveBeenCalledWith(
        '启用双因素认证用例执行失败',
        expect.objectContaining({
          error: 'Email service unavailable',
          userId: '550e8400-e29b-41d4-a716-446655440000',
          tenantId: '550e8400-e29b-41d4-a716-446655440001',
        }),
        'EnableTwoFactorAuthUseCase'
      )
    })

    it('应该处理审计日志记录失败的情况', async () => {
      // Arrange
      const command = createCommand()
      const mockSecret = 'JBSWY3DPEHPK3PXP'
      const mockQRCode = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      const mockBackupCodes = ['123456', '234567', '345678', '456789', '567890']

      userRepository.findById.mockResolvedValue(mockUser as any)
      // loginSecurityService.generateTwoFactorSecret.mockResolvedValue(mockSecret)
      // loginSecurityService.generateTwoFactorQRCode.mockResolvedValue(mockQRCode)
      // loginSecurityService.generateBackupCodes.mockResolvedValue(mockBackupCodes)
      userRepository.save.mockResolvedValue(mockUser as any)
      // emailService.sendTwoFactorSetupEmail.mockResolvedValue(true)
      // auditService.log.mockRejectedValue(new Error('Audit service unavailable'))

      // Act
      const result = await useCase.execute(command)

      // Assert
      expect(result.success).toBe(true)
      expect(result.message).toBe('双因素认证启用成功')
      expect(result.userId).toBe('550e8400-e29b-41d4-a716-446655440000')
      // expect(result.secret).toBe(mockSecret)
      // expect(result.qrCode).toBe(mockQRCode)
      expect(result.backupCodes).toEqual(mockBackupCodes)

      // 审计日志失败不应该影响启用流程
      // expect(auditService.log).toHaveBeenCalledWith({
      //   action: 'TWO_FACTOR_ENABLED',
      //   userId: '550e8400-e29b-41d4-a716-446655440000',
      //   tenantId: '550e8400-e29b-41d4-a716-446655440001',
      //   details: {
      //     method: 'totp',
      //     deviceInfo: command.deviceInfo,
      //   },
      // })

      expect(logger.warn).toHaveBeenCalledWith(
        '审计日志记录失败',
        expect.objectContaining({
          error: 'Audit service unavailable',
          userId: '550e8400-e29b-41d4-a716-446655440000',
        }),
        'EnableTwoFactorAuthUseCase'
      )
    })
  })
})

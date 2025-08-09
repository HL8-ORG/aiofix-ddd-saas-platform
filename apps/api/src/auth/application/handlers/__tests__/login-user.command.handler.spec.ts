/**
 * @file login-user.command.handler.spec.ts
 * @description 用户登录命令处理器单元测试
 * 
 * 测试覆盖范围：
 * 1. 成功处理登录命令场景
 * 2. 命令验证失败场景
 * 3. 用例执行失败场景
 * 4. 业务规则验证场景
 * 5. 错误处理和日志记录场景
 */
import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@libs/pino-nestjs'
import { LoginUserCommandHandler } from '../login-user.command.handler'
import { LoginUserUseCase } from '../../use-cases/login-user.use-case'
import { LoginUserCommand } from '../../commands/login-user.command'

describe('LoginUserCommandHandler', () => {
  let handler: LoginUserCommandHandler
  let loginUserUseCase: jest.Mocked<LoginUserUseCase>
  let logger: jest.Mocked<Logger>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUserCommandHandler,
        {
          provide: LoginUserUseCase,
          useValue: {
            execute: jest.fn(),
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

    handler = module.get<LoginUserCommandHandler>(LoginUserCommandHandler)
    loginUserUseCase = module.get(LoginUserUseCase)
    logger = module.get(Logger)
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

    it('应该成功处理用户登录命令', async () => {
      // Arrange
      const command = createCommand()
      const mockResult = {
        success: true,
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'test@example.com',
          username: 'testuser',
          firstName: 'John',
          lastName: 'Doe',
          status: 'active',
        },
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        sessionId: '550e8400-e29b-41d4-a716-446655440002',
        requiresTwoFactor: false,
      }

      loginUserUseCase.execute.mockResolvedValue(mockResult)

      // Act
      const result = await handler.execute(command)

      // Assert
      expect(result).toEqual(mockResult)
      expect(loginUserUseCase.execute).toHaveBeenCalledWith(command)
      expect(logger.log).toHaveBeenCalledWith(
        '开始处理用户登录命令',
        {
          email: 'test@example.com',
          tenantId: '550e8400-e29b-41d4-a716-446655440001',
        }
      )
      expect(logger.log).toHaveBeenCalledWith(
        '用户登录命令执行成功',
        {
          email: 'test@example.com',
          tenantId: '550e8400-e29b-41d4-a716-446655440001',
          success: true,
        }
      )
    })

    it('应该处理命令验证失败的情况', async () => {
      // Arrange
      const command = createCommand({ email: '' }) // 无效邮箱
      const validationError = new Error('邮箱地址不能为空')

      // Mock command validation to throw error
      jest.spyOn(command, 'validate').mockImplementation(() => {
        throw validationError
      })

      // Act
      const result = await handler.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('邮箱地址不能为空')
      expect(result.user).toBeUndefined()
      expect(result.accessToken).toBeUndefined()
      expect(result.refreshToken).toBeUndefined()
      expect(result.sessionId).toBeUndefined()

      expect(loginUserUseCase.execute).not.toHaveBeenCalled()
      expect(logger.error).toHaveBeenCalledWith(
        '用户登录命令执行失败',
        {
          error: '邮箱地址不能为空',
          email: '',
          tenantId: '550e8400-e29b-41d4-a716-446655440001',
        }
      )
    })

    it('应该处理业务规则验证失败的情况', async () => {
      // Arrange
      const command = createCommand({ email: 'invalid-email' })
      const validationError = new Error('邮箱地址格式无效')

      // Mock business rule validation to throw error
      jest.spyOn(handler as any, 'validateBusinessRules').mockImplementation(() => {
        throw validationError
      })

      // Act
      const result = await handler.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('邮箱地址格式无效')
      expect(result.user).toBeUndefined()
      expect(result.accessToken).toBeUndefined()
      expect(result.refreshToken).toBeUndefined()
      expect(result.sessionId).toBeUndefined()

      expect(loginUserUseCase.execute).not.toHaveBeenCalled()
      expect(logger.error).toHaveBeenCalledWith(
        '用户登录命令执行失败',
        {
          error: '邮箱地址格式无效',
          email: 'invalid-email',
          tenantId: '550e8400-e29b-41d4-a716-446655440001',
        }
      )
    })

    it('应该处理用例执行失败的情况', async () => {
      // Arrange
      const command = createCommand()
      const useCaseError = new Error('用户不存在或密码错误')

      loginUserUseCase.execute.mockRejectedValue(useCaseError)

      // Act
      const result = await handler.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('用户不存在或密码错误')
      expect(result.user).toBeUndefined()
      expect(result.accessToken).toBeUndefined()
      expect(result.refreshToken).toBeUndefined()
      expect(result.sessionId).toBeUndefined()

      expect(loginUserUseCase.execute).toHaveBeenCalledWith(command)
      expect(logger.error).toHaveBeenCalledWith(
        '用户登录命令执行失败',
        {
          error: '用户不存在或密码错误',
          email: 'test@example.com',
          tenantId: '550e8400-e29b-41d4-a716-446655440001',
        }
      )
    })

    it('应该处理用例返回失败结果的情况', async () => {
      // Arrange
      const command = createCommand()
      const mockResult = {
        success: false,
        error: '用户不存在或密码错误',
      }

      loginUserUseCase.execute.mockResolvedValue(mockResult)

      // Act
      const result = await handler.execute(command)

      // Assert
      expect(result).toEqual(mockResult)
      expect(loginUserUseCase.execute).toHaveBeenCalledWith(command)
      expect(logger.log).toHaveBeenCalledWith(
        '开始处理用户登录命令',
        {
          email: 'test@example.com',
          tenantId: '550e8400-e29b-41d4-a716-446655440001',
        }
      )
      expect(logger.warn).toHaveBeenCalledWith(
        '用户登录命令执行失败',
        {
          email: 'test@example.com',
          tenantId: '550e8400-e29b-41d4-a716-446655440001',
          error: '用户不存在或密码错误',
        }
      )
    })

    it('应该验证邮箱格式', () => {
      // Arrange
      const command = createCommand({ email: 'invalid-email' })

      // Act & Assert
      expect(() => {
        (handler as any).validateEmailFormat('invalid-email')
      }).toThrow('邮箱地址格式无效')

      expect(() => {
        (handler as any).validateEmailFormat('')
      }).toThrow('邮箱地址不能为空')

      expect(() => {
        (handler as any).validateEmailFormat('a'.repeat(255) + '@example.com')
      }).toThrow('邮箱地址长度不能超过254个字符')

      // 有效邮箱应该不抛出异常
      expect(() => {
        (handler as any).validateEmailFormat('test@example.com')
      }).not.toThrow()
    })

    it('应该验证密码格式', () => {
      // Arrange & Act & Assert
      expect(() => {
        (handler as any).validatePasswordFormat('')
      }).toThrow('密码不能为空')

      expect(() => {
        (handler as any).validatePasswordFormat('123')
      }).toThrow('密码长度不能少于8个字符')

      expect(() => {
        (handler as any).validatePasswordFormat('a'.repeat(129))
      }).toThrow('密码长度不能超过128个字符')

      // 有效密码应该不抛出异常
      expect(() => {
        (handler as any).validatePasswordFormat('Password123!')
      }).not.toThrow()
    })

    it('应该验证设备信息', () => {
      // Arrange & Act & Assert
      expect(() => {
        (handler as any).validateDeviceInfo({
          userAgent: '',
          ipAddress: '192.168.1.1',
        })
      }).toThrow('用户代理不能为空')

      expect(() => {
        (handler as any).validateDeviceInfo({
          userAgent: 'Mozilla/5.0',
          ipAddress: '',
        })
      }).toThrow('IP地址不能为空')

      expect(() => {
        (handler as any).validateDeviceInfo({
          userAgent: 'Mozilla/5.0',
          ipAddress: 'invalid-ip',
        })
      }).toThrow('IP地址格式无效')

      // 有效设备信息应该不抛出异常
      expect(() => {
        (handler as any).validateDeviceInfo({
          userAgent: 'Mozilla/5.0',
          ipAddress: '192.168.1.1',
          deviceType: 'desktop',
          browser: 'Chrome',
          os: 'Windows',
        })
      }).not.toThrow()
    })

    it('应该验证双因素认证码格式', () => {
      // Arrange & Act & Assert
      expect(() => {
        (handler as any).validateTwoFactorCodeFormat('')
      }).toThrow('验证码不能为空')

      expect(() => {
        (handler as any).validateTwoFactorCodeFormat('12345')
      }).toThrow('验证码必须是6位数字')

      expect(() => {
        (handler as any).validateTwoFactorCodeFormat('1234567')
      }).toThrow('验证码必须是6位数字')

      expect(() => {
        (handler as any).validateTwoFactorCodeFormat('abcdef')
      }).toThrow('验证码必须是6位数字')

      // 有效验证码应该不抛出异常
      expect(() => {
        (handler as any).validateTwoFactorCodeFormat('123456')
      }).not.toThrow()
    })

    it('应该验证租户ID格式', () => {
      // Arrange & Act & Assert
      expect(() => {
        (handler as any).validateTenantIdFormat('')
      }).toThrow('租户ID不能为空')

      expect(() => {
        (handler as any).validateTenantIdFormat('invalid-uuid')
      }).toThrow('租户ID必须是有效的UUID v4格式')

      // 有效UUID应该不抛出异常
      expect(() => {
        (handler as any).validateTenantIdFormat('550e8400-e29b-41d4-a716-446655440001')
      }).not.toThrow()
    })
  })
})

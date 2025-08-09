/**
 * @file register-user.command.handler.spec.ts
 * @description 用户注册命令处理器单元测试
 * 
 * 测试覆盖范围：
 * 1. 成功处理注册命令场景
 * 2. 命令验证失败场景
 * 3. 用例执行失败场景
 * 4. 业务规则验证场景
 * 5. 错误处理和日志记录场景
 */
import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@libs/pino-nestjs'
import { RegisterUserCommandHandler } from '../register-user.command.handler'
import { RegisterUserUseCase } from '../../use-cases/register-user.use-case'
import { RegisterUserCommand } from '../../commands/register-user.command'

describe('RegisterUserCommandHandler', () => {
  let handler: RegisterUserCommandHandler
  let registerUserUseCase: jest.Mocked<RegisterUserUseCase>
  let logger: jest.Mocked<Logger>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserCommandHandler,
        {
          provide: RegisterUserUseCase,
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

    handler = module.get<RegisterUserCommandHandler>(RegisterUserCommandHandler)
    registerUserUseCase = module.get(RegisterUserUseCase)
    logger = module.get(Logger)
  })

  describe('execute', () => {
    const createCommand = (overrides: Partial<any> = {}) => {
      const params = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        tenantId: '550e8400-e29b-41d4-a716-446655440001',
        deviceInfo: {
          userAgent: 'Mozilla/5.0',
          ipAddress: '192.168.1.1',
          deviceType: 'desktop',
          browser: 'Chrome',
          os: 'Windows',
        },
        ...overrides,
      }

      return new RegisterUserCommand(
        params.email,
        params.username,
        params.password,
        params.tenantId,
        params.deviceInfo,
        undefined, // phoneNumber
        params.firstName,
        params.lastName
      )
    }

    it('应该成功处理用户注册命令', async () => {
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
          createdAt: new Date('2024-01-01'),
        },
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        sessionId: '550e8400-e29b-41d4-a716-446655440002',
        requiresEmailVerification: true,
      }

      registerUserUseCase.execute.mockResolvedValue(mockResult)

      // Act
      const result = await handler.execute(command)

      // Assert
      expect(result).toEqual(mockResult)
      expect(registerUserUseCase.execute).toHaveBeenCalledWith(command)
      expect(logger.log).toHaveBeenCalledWith(
        '开始处理用户注册命令',
        {
          email: 'test@example.com',
          username: 'testuser',
          tenantId: '550e8400-e29b-41d4-a716-446655440001',
        }
      )
      expect(logger.log).toHaveBeenCalledWith(
        '用户注册命令执行成功',
        {
          email: 'test@example.com',
          username: 'testuser',
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

      expect(registerUserUseCase.execute).not.toHaveBeenCalled()
      expect(logger.error).toHaveBeenCalledWith(
        '用户注册命令执行失败',
        {
          error: '邮箱地址不能为空',
          email: '',
          username: 'testuser',
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

      expect(registerUserUseCase.execute).not.toHaveBeenCalled()
      expect(logger.error).toHaveBeenCalledWith(
        '用户注册命令执行失败',
        {
          error: '邮箱地址格式无效',
          email: 'invalid-email',
          username: 'testuser',
          tenantId: '550e8400-e29b-41d4-a716-446655440001',
        }
      )
    })

    it('应该处理用例执行失败的情况', async () => {
      // Arrange
      const command = createCommand()
      const useCaseError = new Error('邮箱地址已被注册')

      registerUserUseCase.execute.mockRejectedValue(useCaseError)

      // Act
      const result = await handler.execute(command)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('邮箱地址已被注册')
      expect(result.user).toBeUndefined()
      expect(result.accessToken).toBeUndefined()
      expect(result.refreshToken).toBeUndefined()
      expect(result.sessionId).toBeUndefined()

      expect(registerUserUseCase.execute).toHaveBeenCalledWith(command)
      expect(logger.error).toHaveBeenCalledWith(
        '用户注册命令执行失败',
        {
          error: '邮箱地址已被注册',
          email: 'test@example.com',
          username: 'testuser',
          tenantId: '550e8400-e29b-41d4-a716-446655440001',
        }
      )
    })

    it('应该处理用例返回失败结果的情况', async () => {
      // Arrange
      const command = createCommand()
      const mockResult = {
        success: false,
        error: '邮箱地址已被注册',
      }

      registerUserUseCase.execute.mockResolvedValue(mockResult)

      // Act
      const result = await handler.execute(command)

      // Assert
      expect(result).toEqual(mockResult)
      expect(registerUserUseCase.execute).toHaveBeenCalledWith(command)
      expect(logger.log).toHaveBeenCalledWith(
        '开始处理用户注册命令',
        {
          email: 'test@example.com',
          username: 'testuser',
          tenantId: '550e8400-e29b-41d4-a716-446655440001',
        }
      )
      expect(logger.warn).toHaveBeenCalledWith(
        '用户注册命令执行失败',
        {
          email: 'test@example.com',
          username: 'testuser',
          tenantId: '550e8400-e29b-41d4-a716-446655440001',
          error: '邮箱地址已被注册',
        }
      )
    })

    it('应该验证邮箱格式', () => {
      // Arrange & Act & Assert
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

    it('应该验证用户名格式', () => {
      // Arrange & Act & Assert
      expect(() => {
        (handler as any).validateUsernameFormat('')
      }).toThrow('用户名不能为空')

      expect(() => {
        (handler as any).validateUsernameFormat('a')
      }).toThrow('用户名长度不能少于3个字符')

      expect(() => {
        (handler as any).validateUsernameFormat('a'.repeat(31))
      }).toThrow('用户名长度不能超过30个字符')

      expect(() => {
        (handler as any).validateUsernameFormat('user@name')
      }).toThrow('用户名只能包含字母、数字和下划线')

      // 有效用户名应该不抛出异常
      expect(() => {
        (handler as any).validateUsernameFormat('testuser')
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

    it('应该验证姓名格式', () => {
      // Arrange & Act & Assert
      expect(() => {
        (handler as any).validateNameFormat('', 'firstName')
      }).toThrow('名字不能为空')

      expect(() => {
        (handler as any).validateNameFormat('a'.repeat(51), 'firstName')
      }).toThrow('名字长度不能超过50个字符')

      expect(() => {
        (handler as any).validateNameFormat('John@', 'firstName')
      }).toThrow('名字只能包含字母、空格和连字符')

      // 有效姓名应该不抛出异常
      expect(() => {
        (handler as any).validateNameFormat('John', 'firstName')
      }).not.toThrow()

      expect(() => {
        (handler as any).validateNameFormat('Doe', 'lastName')
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

    it('应该验证验证码格式', () => {
      // Arrange & Act & Assert
      expect(() => {
        (handler as any).validateVerificationCodeFormat('')
      }).toThrow('验证码不能为空')

      expect(() => {
        (handler as any).validateVerificationCodeFormat('12345')
      }).toThrow('验证码必须是6位数字')

      expect(() => {
        (handler as any).validateVerificationCodeFormat('1234567')
      }).toThrow('验证码必须是6位数字')

      expect(() => {
        (handler as any).validateVerificationCodeFormat('abcdef')
      }).toThrow('验证码必须是6位数字')

      // 有效验证码应该不抛出异常
      expect(() => {
        (handler as any).validateVerificationCodeFormat('123456')
      }).not.toThrow()

      // undefined 验证码应该不抛出异常
      expect(() => {
        (handler as any).validateVerificationCodeFormat(undefined)
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

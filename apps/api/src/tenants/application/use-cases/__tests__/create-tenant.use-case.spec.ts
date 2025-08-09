import 'reflect-metadata'
import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@libs/pino-nestjs'
import { CreateTenantUseCase, CreateTenantUseCaseResult } from '../create-tenant.use-case'
import { CreateTenantCommand } from '../../commands/create-tenant.command'
import { TenantValidator } from '../../validators/tenant-validator'
import { ITenantService, TENANT_SERVICE_TOKEN } from '../../services/interfaces/tenant-service.interface'

describe('CreateTenantUseCase', () => {
  let useCase: CreateTenantUseCase
  let mockTenantService: jest.Mocked<ITenantService>
  let mockTenantValidator: jest.Mocked<TenantValidator>
  let mockLogger: jest.Mocked<Logger>

  const validCommandData = {
    name: '测试租户',
    code: 'test_tenant',
    description: '这是一个测试租户',
    adminUserInfo: {
      username: 'admin',
      email: 'admin@test.com',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'User',
    },
    settings: {
      maxUsers: 100,
    },
    metadata: {
      source: 'web',
    },
    createdBy: '123e4567-e89b-12d3-a456-426614174002',
  }

  beforeEach(async () => {
    const mockTenantServiceObj = {
      createTenant: jest.fn(),
    }

    const mockTenantValidatorObj = {
      validateCreateTenant: jest.fn(),
    }

    const mockLoggerObj = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTenantUseCase,
        {
          provide: TENANT_SERVICE_TOKEN,
          useValue: mockTenantServiceObj,
        },
        {
          provide: TenantValidator,
          useValue: mockTenantValidatorObj,
        },
        {
          provide: Logger,
          useValue: mockLoggerObj,
        },
      ],
    }).compile()

    useCase = module.get<CreateTenantUseCase>(CreateTenantUseCase)
    mockTenantService = module.get(TENANT_SERVICE_TOKEN) as jest.Mocked<ITenantService>
    mockTenantValidator = module.get(TenantValidator) as jest.Mocked<TenantValidator>
    mockLogger = module.get(Logger) as jest.Mocked<Logger>
  })

  describe('execute', () => {
    it('应该成功执行创建租户用例', async () => {
      const command = new CreateTenantCommand(validCommandData)
      const expectedResult: CreateTenantUseCaseResult = {
        success: true,
        tenantId: '123e4567-e89b-12d3-a456-426614174000',
        adminUserId: '123e4567-e89b-12d3-a456-426614174001',
      }

      mockTenantValidator.validateCreateTenant.mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: [],
      })

      mockTenantService.createTenant.mockResolvedValue(expectedResult)

      const result = await useCase.execute(command)

      expect(result).toEqual(expectedResult)
      expect(mockTenantValidator.validateCreateTenant).toHaveBeenCalledWith({
        name: command.data.name,
        code: command.data.code,
        adminUserInfo: command.data.adminUserInfo,
      })
      expect(mockTenantService.createTenant).toHaveBeenCalledWith({
        name: command.data.name,
        code: command.data.code,
        description: command.data.description,
        adminUserInfo: command.data.adminUserInfo,
        settings: command.data.settings,
        metadata: command.data.metadata,
      })
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('开始执行创建租户用例'),
      )
    })

    it('应该在验证失败时返回错误', async () => {
      const command = new CreateTenantCommand(validCommandData)
      const validationErrors = ['租户名称不能为空', '租户编码格式不正确']

      mockTenantValidator.validateCreateTenant.mockResolvedValue({
        isValid: false,
        errors: validationErrors,
        warnings: [],
      })

      const result = await useCase.execute(command)

      expect(result.success).toBe(false)
      expect(result.error).toBe(validationErrors.join('; '))
      expect(mockTenantService.createTenant).not.toHaveBeenCalled()
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('创建租户验证失败'),
      )
    })

    it('应该在服务调用失败时返回错误', async () => {
      const command = new CreateTenantCommand(validCommandData)
      const serviceError = '数据库连接失败'

      mockTenantValidator.validateCreateTenant.mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: [],
      })

      mockTenantService.createTenant.mockResolvedValue({
        success: false,
        error: serviceError,
      })

      const result = await useCase.execute(command)

      expect(result.success).toBe(false)
      expect(result.error).toBe(serviceError)
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('租户创建失败'),
      )
    })

    it('应该在服务抛出异常时返回错误', async () => {
      const command = new CreateTenantCommand(validCommandData)
      const exception = new Error('数据库连接失败')

      mockTenantValidator.validateCreateTenant.mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: [],
      })

      mockTenantService.createTenant.mockRejectedValue(exception)

      const result = await useCase.execute(command)

      expect(result.success).toBe(false)
      expect(result.error).toBe('数据库连接失败')
      expect(mockLogger.error).toHaveBeenCalledWith(
        '创建租户用例执行失败',
        exception,
      )
    })

    it('应该在命令验证失败时返回错误', async () => {
      const invalidCommandData = { ...validCommandData, name: '' }
      const command = new CreateTenantCommand(invalidCommandData)

      const result = await useCase.execute(command)

      expect(result.success).toBe(false)
      expect(result.error).toContain('租户名称不能为空')
    })
  })
})

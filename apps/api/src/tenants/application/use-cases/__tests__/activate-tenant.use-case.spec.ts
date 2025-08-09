import 'reflect-metadata'
import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@libs/pino-nestjs'
import { ActivateTenantUseCase, ActivateTenantUseCaseResult } from '../activate-tenant.use-case'
import { ActivateTenantCommand } from '../../commands/activate-tenant.command'
import { TenantValidator } from '../../validators/tenant-validator'
import { ITenantService, TENANT_SERVICE_TOKEN } from '../../services/interfaces/tenant-service.interface'

describe('ActivateTenantUseCase', () => {
  let useCase: ActivateTenantUseCase
  let mockTenantService: jest.Mocked<ITenantService>
  let mockTenantValidator: jest.Mocked<TenantValidator>
  let mockLogger: jest.Mocked<Logger>

  const validCommandData = {
    tenantId: 'tenant-123',
    activatedBy: 'admin-456',
    reason: '租户申请通过，激活使用',
  }

  beforeEach(async () => {
    const mockTenantServiceObj = {
      activateTenant: jest.fn(),
    }

    const mockTenantValidatorObj = {
      validateActivateTenant: jest.fn(),
    }

    const mockLoggerObj = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivateTenantUseCase,
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

    useCase = module.get<ActivateTenantUseCase>(ActivateTenantUseCase)
    mockTenantService = module.get(TENANT_SERVICE_TOKEN) as jest.Mocked<ITenantService>
    mockTenantValidator = module.get(TenantValidator) as jest.Mocked<TenantValidator>
    mockLogger = module.get(Logger) as jest.Mocked<Logger>
  })

  describe('execute', () => {
    it('应该成功执行激活租户用例', async () => {
      const command = new ActivateTenantCommand(validCommandData)
      const expectedResult: ActivateTenantUseCaseResult = {
        success: true,
        tenantId: 'tenant-123',
        message: '租户激活成功',
      }

      mockTenantValidator.validateActivateTenant.mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: [],
      })

      mockTenantService.activateTenant.mockResolvedValue(expectedResult)

      const result = await useCase.execute(command)

      expect(result).toEqual(expectedResult)
      expect(mockTenantValidator.validateActivateTenant).toHaveBeenCalledWith({
        tenantId: command.data.tenantId,
        activatedBy: command.data.activatedBy,
        reason: command.data.reason,
      })
      expect(mockTenantService.activateTenant).toHaveBeenCalledWith({
        tenantId: command.data.tenantId,
        reason: command.data.reason,
        activatedBy: command.data.activatedBy,
      })
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('开始执行激活租户用例'),
      )
    })

    it('应该在验证失败时返回错误', async () => {
      const command = new ActivateTenantCommand(validCommandData)
      const validationErrors = ['租户ID不能为空', '激活者ID不能为空']

      mockTenantValidator.validateActivateTenant.mockResolvedValue({
        isValid: false,
        errors: validationErrors,
        warnings: [],
      })

      const result = await useCase.execute(command)

      expect(result.success).toBe(false)
      expect(result.error).toBe(validationErrors.join('; '))
      expect(mockTenantService.activateTenant).not.toHaveBeenCalled()
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('激活租户验证失败'),
      )
    })

    it('应该在服务调用失败时返回错误', async () => {
      const command = new ActivateTenantCommand(validCommandData)
      const serviceError = '租户不存在'

      mockTenantValidator.validateActivateTenant.mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: [],
      })

      mockTenantService.activateTenant.mockResolvedValue({
        success: false,
        error: serviceError,
      })

      const result = await useCase.execute(command)

      expect(result.success).toBe(false)
      expect(result.error).toBe(serviceError)
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('租户激活失败'),
      )
    })

    it('应该在服务抛出异常时返回错误', async () => {
      const command = new ActivateTenantCommand(validCommandData)
      const exception = new Error('数据库连接失败')

      mockTenantValidator.validateActivateTenant.mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: [],
      })

      mockTenantService.activateTenant.mockRejectedValue(exception)

      const result = await useCase.execute(command)

      expect(result.success).toBe(false)
      expect(result.error).toBe('数据库连接失败')
      expect(mockLogger.error).toHaveBeenCalledWith(
        '激活租户用例执行失败',
        exception,
      )
    })

    it('应该在命令验证失败时返回错误', async () => {
      const invalidCommandData = { ...validCommandData, tenantId: '' }
      const command = new ActivateTenantCommand(invalidCommandData)

      const result = await useCase.execute(command)

      expect(result.success).toBe(false)
      expect(result.error).toContain('租户ID不能为空')
    })
  })
})

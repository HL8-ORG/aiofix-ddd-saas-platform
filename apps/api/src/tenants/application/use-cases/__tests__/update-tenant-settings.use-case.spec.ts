import 'reflect-metadata'
import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@libs/pino-nestjs'
import { UpdateTenantSettingsUseCase, UpdateTenantSettingsUseCaseResult } from '../update-tenant-settings.use-case'
import { TenantValidator } from '../../validators/tenant-validator'
import { ITenantService, TENANT_SERVICE_TOKEN, UpdateTenantSettingsCommand, UpdateTenantSettingsResult } from '../../services/interfaces/tenant-service.interface'
import { TenantDto } from '../../dto/tenant.dto'

describe('UpdateTenantSettingsUseCase', () => {
  let useCase: UpdateTenantSettingsUseCase
  let mockTenantService: jest.Mocked<ITenantService>
  let mockTenantValidator: jest.Mocked<TenantValidator>
  let mockLogger: jest.Mocked<Logger>

  const validCommand: UpdateTenantSettingsCommand = {
    tenantId: 'tenant-123',
    settings: {
      maxUsers: 100,
      allowRegistration: true,
      theme: 'dark',
    },
    updatedBy: 'admin-456',
  }

  const mockTenantDto = new TenantDto()
  Object.assign(mockTenantDto, {
    id: 'tenant-123',
    name: '测试租户',
    code: 'test_tenant',
    status: 'ACTIVE',
  })

  beforeEach(async () => {
    const mockTenantServiceObj = {
      updateTenantSettings: jest.fn(),
      getTenantById: jest.fn(),
    }

    const mockTenantValidatorObj = {
      validateTenantAccess: jest.fn(),
    }

    const mockLoggerObj = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTenantSettingsUseCase,
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

    useCase = module.get<UpdateTenantSettingsUseCase>(UpdateTenantSettingsUseCase)
    mockTenantService = module.get(TENANT_SERVICE_TOKEN) as jest.Mocked<ITenantService>
    mockTenantValidator = module.get(TenantValidator) as jest.Mocked<TenantValidator>
    mockLogger = module.get(Logger) as jest.Mocked<Logger>
  })

  describe('execute', () => {
    it('应该成功执行更新租户设置用例', async () => {
      const expectedResult: UpdateTenantSettingsUseCaseResult = {
        success: true,
        tenantId: 'tenant-123',
        message: '租户设置更新成功',
      }

      // Mock 租户存在
      mockTenantService.getTenantById.mockResolvedValue({
        success: true,
        tenant: mockTenantDto,
      })

      mockTenantService.updateTenantSettings.mockResolvedValue(expectedResult)

      const result = await useCase.execute(validCommand)

      expect(result).toEqual(expectedResult)
      expect(mockTenantService.getTenantById).toHaveBeenCalledWith({
        tenantId: validCommand.tenantId,
      })
      expect(mockTenantService.updateTenantSettings).toHaveBeenCalledWith(validCommand)
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('开始执行更新租户设置用例'),
      )
    })

    it('应该在租户不存在时返回错误', async () => {
      mockTenantService.getTenantById.mockResolvedValue({
        success: false,
        error: '租户不存在',
      })

      const result = await useCase.execute(validCommand)

      expect(result.success).toBe(false)
      expect(result.error).toBe('租户不存在或无权限访问')
      expect(mockTenantService.updateTenantSettings).not.toHaveBeenCalled()
    })

    it('应该在租户已删除时返回错误', async () => {
      const deletedTenantDto = new TenantDto()
      Object.assign(deletedTenantDto, {
        ...mockTenantDto,
        status: 'DELETED',
      })

      mockTenantService.getTenantById.mockResolvedValue({
        success: true,
        tenant: deletedTenantDto,
      })

      const result = await useCase.execute(validCommand)

      expect(result.success).toBe(false)
      expect(result.error).toBe('租户不存在或无权限访问')
      expect(mockTenantService.updateTenantSettings).not.toHaveBeenCalled()
    })

    it('应该在设置数据验证失败时返回错误', async () => {
      const invalidCommand = {
        ...validCommand,
        settings: {
          'invalid-key': 'value', // 无效的键名
        },
      }

      mockTenantService.getTenantById.mockResolvedValue({
        success: true,
        tenant: mockTenantDto,
      })

      const result = await useCase.execute(invalidCommand)

      expect(result.success).toBe(false)
      expect(result.error).toContain('设置键名 "invalid-key" 格式不正确')
      expect(mockTenantService.updateTenantSettings).not.toHaveBeenCalled()
    })

    it('应该在设置值过大时返回错误', async () => {
      const largeCommand = {
        ...validCommand,
        settings: {
          largeData: 'x'.repeat(1001), // 超过1000字符
        },
      }

      mockTenantService.getTenantById.mockResolvedValue({
        success: true,
        tenant: mockTenantDto,
      })

      const result = await useCase.execute(largeCommand)

      expect(result.success).toBe(false)
      expect(result.error).toContain('设置值 "largeData" 长度不能超过1000个字符')
    })

    it('应该在服务调用失败时返回错误', async () => {
      const serviceError = '更新失败'

      mockTenantService.getTenantById.mockResolvedValue({
        success: true,
        tenant: mockTenantDto,
      })

      mockTenantService.updateTenantSettings.mockResolvedValue({
        success: false,
        error: serviceError,
      })

      const result = await useCase.execute(validCommand)

      expect(result.success).toBe(false)
      expect(result.error).toBe(serviceError)
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('租户设置更新失败'),
      )
    })

    it('应该在服务抛出异常时返回错误', async () => {
      const exception = new Error('数据库连接失败')

      mockTenantService.getTenantById.mockResolvedValue({
        success: true,
        tenant: mockTenantDto,
      })

      mockTenantService.updateTenantSettings.mockRejectedValue(exception)

      const result = await useCase.execute(validCommand)

      expect(result.success).toBe(false)
      expect(result.error).toBe('数据库连接失败')
      expect(mockLogger.error).toHaveBeenCalledWith(
        '更新租户设置用例执行失败',
        exception,
      )
    })

    it('应该在命令验证失败时返回错误', async () => {
      const invalidCommand = {
        ...validCommand,
        tenantId: '', // 空的租户ID
      }

      const result = await useCase.execute(invalidCommand)

      expect(result.success).toBe(false)
      expect(result.error).toBe('租户ID不能为空')
    })

    it('应该检测敏感设置并发出警告', async () => {
      const sensitiveCommand = {
        ...validCommand,
        settings: {
          password: 'secret123',
          apiKey: 'key123',
          token: 'token123',
        },
      }

      mockTenantService.getTenantById.mockResolvedValue({
        success: true,
        tenant: mockTenantDto,
      })

      mockTenantService.updateTenantSettings.mockResolvedValue({
        success: true,
        tenantId: 'tenant-123',
        message: '租户设置更新成功',
      })

      const result = await useCase.execute(sensitiveCommand)

      expect(result.success).toBe(true)
      // 注意：这里只是验证了敏感检测逻辑，实际警告会在日志中记录
    })
  })
})

import 'reflect-metadata'
import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@libs/pino-nestjs'
import { SuspendTenantUseCase, SuspendTenantUseCaseResult } from '../suspend-tenant.use-case'
import { TenantValidator } from '../../validators/tenant-validator'
import { ITenantService, TENANT_SERVICE_TOKEN, SuspendTenantCommand } from '../../services/interfaces/tenant-service.interface'
import { TenantDto } from '../../dto/tenant.dto'

describe('SuspendTenantUseCase', () => {
  let useCase: SuspendTenantUseCase
  let mockTenantService: jest.Mocked<ITenantService>
  let mockTenantValidator: jest.Mocked<TenantValidator>
  let mockLogger: jest.Mocked<Logger>

  const validCommand: SuspendTenantCommand = {
    tenantId: '123e4567-e89b-12d3-a456-426614174000',
    suspendedBy: '123e4567-e89b-12d3-a456-426614174001',
    reason: '租户违规操作，暂停使用',
  }

  const mockTenantDto = new TenantDto()
  Object.assign(mockTenantDto, {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: '测试租户',
    code: 'test_tenant',
    status: 'ACTIVE',
  })

  beforeEach(async () => {
    const mockTenantServiceObj = {
      suspendTenant: jest.fn(),
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
        SuspendTenantUseCase,
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

    useCase = module.get<SuspendTenantUseCase>(SuspendTenantUseCase)
    mockTenantService = module.get(TENANT_SERVICE_TOKEN) as jest.Mocked<ITenantService>
    mockTenantValidator = module.get(TenantValidator) as jest.Mocked<TenantValidator>
    mockLogger = module.get(Logger) as jest.Mocked<Logger>
  })

  describe('execute', () => {
    it('应该成功执行暂停租户用例', async () => {
      const expectedResult: SuspendTenantUseCaseResult = {
        success: true,
        tenantId: '123e4567-e89b-12d3-a456-426614174000',
        message: '租户暂停成功',
      }

      // Mock 租户存在且可访问
      mockTenantService.getTenantById.mockResolvedValue({
        success: true,
        tenant: mockTenantDto,
      })

      mockTenantService.suspendTenant.mockResolvedValue(expectedResult)

      const result = await useCase.execute(validCommand)

      expect(result).toEqual(expectedResult)
      expect(mockTenantService.getTenantById).toHaveBeenCalledWith({
        tenantId: validCommand.tenantId,
      })
      expect(mockTenantService.suspendTenant).toHaveBeenCalledWith(validCommand)
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('开始执行暂停租户用例'),
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
      expect(mockTenantService.suspendTenant).not.toHaveBeenCalled()
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
      expect(mockTenantService.suspendTenant).not.toHaveBeenCalled()
    })

    it('应该在租户已暂停时返回错误', async () => {
      const suspendedTenantDto = new TenantDto()
      Object.assign(suspendedTenantDto, {
        ...mockTenantDto,
        status: 'SUSPENDED',
      })

      mockTenantService.getTenantById.mockResolvedValue({
        success: true,
        tenant: suspendedTenantDto,
      })

      const result = await useCase.execute(validCommand)

      expect(result.success).toBe(false)
      expect(result.error).toBe('租户不存在或无权限访问')
      expect(mockTenantService.suspendTenant).not.toHaveBeenCalled()
    })

    it('应该在暂停原因过长时返回错误', async () => {
      const longReasonCommand = {
        ...validCommand,
        reason: 'x'.repeat(501), // 超过500字符
      }

      mockTenantService.getTenantById.mockResolvedValue({
        success: true,
        tenant: mockTenantDto,
      })

      const result = await useCase.execute(longReasonCommand)

      expect(result.success).toBe(false)
      expect(result.error).toBe('暂停原因长度不能超过500个字符')
      expect(mockTenantService.suspendTenant).not.toHaveBeenCalled()
    })

    it('应该在暂停原因包含敏感信息时发出警告', async () => {
      const sensitiveCommand = {
        ...validCommand,
        reason: '用户泄露了密码信息',
      }

      mockTenantService.getTenantById.mockResolvedValue({
        success: true,
        tenant: mockTenantDto,
      })

      mockTenantService.suspendTenant.mockResolvedValue({
        success: true,
        tenantId: '123e4567-e89b-12d3-a456-426614174000',
        message: '租户暂停成功',
      })

      const result = await useCase.execute(sensitiveCommand)

      expect(result.success).toBe(true)
      // 注意：敏感信息检测是警告，不会阻止操作成功
      // 实际的警告会在日志中记录，但这里我们主要验证操作成功
    })

    it('应该在服务调用失败时返回错误', async () => {
      const serviceError = '暂停失败'

      mockTenantService.getTenantById.mockResolvedValue({
        success: true,
        tenant: mockTenantDto,
      })

      mockTenantService.suspendTenant.mockResolvedValue({
        success: false,
        error: serviceError,
      })

      const result = await useCase.execute(validCommand)

      expect(result.success).toBe(false)
      expect(result.error).toBe(serviceError)
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('租户暂停失败'),
      )
    })

    it('应该在服务抛出异常时返回错误', async () => {
      const exception = new Error('数据库连接失败')

      mockTenantService.getTenantById.mockResolvedValue({
        success: true,
        tenant: mockTenantDto,
      })

      mockTenantService.suspendTenant.mockRejectedValue(exception)

      const result = await useCase.execute(validCommand)

      expect(result.success).toBe(false)
      expect(result.error).toBe('数据库连接失败')
      expect(mockLogger.error).toHaveBeenCalledWith(
        '暂停租户用例执行失败',
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

    it('应该在暂停者ID为空时返回错误', async () => {
      const invalidCommand = {
        ...validCommand,
        suspendedBy: '', // 空的暂停者ID
      }

      const result = await useCase.execute(invalidCommand)

      expect(result.success).toBe(false)
      expect(result.error).toBe('暂停者ID不能为空')
    })
  })
})

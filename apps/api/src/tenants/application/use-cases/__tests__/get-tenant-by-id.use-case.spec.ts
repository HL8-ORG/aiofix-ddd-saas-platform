import 'reflect-metadata'
import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@libs/pino-nestjs'
import { GetTenantByIdUseCase, GetTenantByIdUseCaseResult } from '../get-tenant-by-id.use-case'
import { GetTenantByIdQuery } from '../../queries/get-tenant-by-id.query'
import { TenantValidator } from '../../validators/tenant-validator'
import { ITenantService, TENANT_SERVICE_TOKEN } from '../../services/interfaces/tenant-service.interface'
import { TenantDto } from '../../dto/tenant.dto'

describe('GetTenantByIdUseCase', () => {
  let useCase: GetTenantByIdUseCase
  let mockTenantService: jest.Mocked<ITenantService>
  let mockTenantValidator: jest.Mocked<TenantValidator>
  let mockLogger: jest.Mocked<Logger>

  const validQueryData = {
    tenantId: 'tenant-123',
    requestedBy: 'user-456',
    includeAdminUser: true,
    includeSettings: true,
    includeStatistics: false,
  }

  beforeEach(async () => {
    const mockTenantServiceObj = {
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
        GetTenantByIdUseCase,
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

    useCase = module.get<GetTenantByIdUseCase>(GetTenantByIdUseCase)
    mockTenantService = module.get(TENANT_SERVICE_TOKEN) as jest.Mocked<ITenantService>
    mockTenantValidator = module.get(TenantValidator) as jest.Mocked<TenantValidator>
    mockLogger = module.get(Logger) as jest.Mocked<Logger>
  })

  describe('execute', () => {
    it('应该成功执行查询租户用例', async () => {
      const query = new GetTenantByIdQuery(validQueryData)
      const mockTenantDto = new TenantDto()
      Object.assign(mockTenantDto, {
        id: 'tenant-123',
        name: '测试租户',
        code: 'test_tenant',
        status: 'ACTIVE',
      })

      const expectedResult: GetTenantByIdUseCaseResult = {
        success: true,
        tenant: mockTenantDto,
      }

      // Mock 第一次调用（获取租户信息）
      mockTenantService.getTenantById.mockResolvedValueOnce({
        success: true,
        tenant: mockTenantDto,
      })

      // Mock 第二次调用（实际查询）
      mockTenantService.getTenantById.mockResolvedValueOnce(expectedResult)

      mockTenantValidator.validateTenantAccess.mockReturnValue({
        isValid: true,
        errors: [],
        warnings: [],
      })

      const result = await useCase.execute(query)

      expect(result).toEqual(expectedResult)
      expect(mockTenantValidator.validateTenantAccess).toHaveBeenCalledWith(
        mockTenantDto,
        query.data.requestedBy,
      )
      expect(mockTenantService.getTenantById).toHaveBeenCalledWith({
        tenantId: query.data.tenantId,
      })
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('开始执行查询租户用例'),
      )
    })

    it('应该在访问权限验证失败时返回错误', async () => {
      const query = new GetTenantByIdQuery(validQueryData)
      const accessErrors = ['无权访问此租户']
      const mockTenantDto = new TenantDto()
      Object.assign(mockTenantDto, {
        id: 'tenant-123',
        name: '测试租户',
        code: 'test_tenant',
        status: 'ACTIVE',
      })

      mockTenantService.getTenantById.mockResolvedValue({
        success: true,
        tenant: mockTenantDto,
      })

      mockTenantValidator.validateTenantAccess.mockReturnValue({
        isValid: false,
        errors: accessErrors,
        warnings: [],
      })

      const result = await useCase.execute(query)

      expect(result.success).toBe(false)
      expect(result.error).toBe(accessErrors.join('; '))
      expect(mockTenantService.getTenantById).toHaveBeenCalledTimes(1)
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('租户访问权限验证失败'),
      )
    })

    it('应该在服务调用失败时返回错误', async () => {
      const query = new GetTenantByIdQuery(validQueryData)
      const serviceError = '租户不存在'

      mockTenantService.getTenantById.mockResolvedValue({
        success: false,
        error: serviceError,
      })

      const result = await useCase.execute(query)

      expect(result.success).toBe(false)
      expect(result.error).toBe('租户不存在')
      // 当服务返回失败时，代码直接返回，不会记录错误日志
    })

    it('应该在服务抛出异常时返回错误', async () => {
      const query = new GetTenantByIdQuery(validQueryData)
      const exception = new Error('数据库连接失败')

      mockTenantService.getTenantById.mockRejectedValue(exception)

      const result = await useCase.execute(query)

      expect(result.success).toBe(false)
      expect(result.error).toBe('数据库连接失败')
      expect(mockLogger.error).toHaveBeenCalledWith(
        '查询租户用例执行失败',
        exception,
      )
    })

    it('应该在查询验证失败时返回错误', async () => {
      const invalidQueryData = { ...validQueryData, tenantId: '' }
      const query = new GetTenantByIdQuery(invalidQueryData)

      const result = await useCase.execute(query)

      expect(result.success).toBe(false)
      expect(result.error).toContain('租户ID不能为空')
    })
  })
})

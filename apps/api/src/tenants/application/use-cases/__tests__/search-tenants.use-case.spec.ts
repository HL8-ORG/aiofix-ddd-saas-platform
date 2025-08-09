import 'reflect-metadata'
import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@libs/pino-nestjs'
import { SearchTenantsUseCase, SearchTenantsUseCaseResult } from '../search-tenants.use-case'
import { TenantValidator } from '../../validators/tenant-validator'
import { ITenantService, TENANT_SERVICE_TOKEN, SearchTenantsQuery } from '../../services/interfaces/tenant-service.interface'
import { TenantDto } from '../../dto/tenant.dto'

describe('SearchTenantsUseCase', () => {
  let useCase: SearchTenantsUseCase
  let mockTenantService: jest.Mocked<ITenantService>
  let mockTenantValidator: jest.Mocked<TenantValidator>
  let mockLogger: jest.Mocked<Logger>

  const validQuery: SearchTenantsQuery = {
    page: 1,
    size: 10,
    status: 'ACTIVE',
    search: '测试',
    sortBy: 'name',
    sortOrder: 'asc',
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
      searchTenants: jest.fn(),
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
        SearchTenantsUseCase,
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

    useCase = module.get<SearchTenantsUseCase>(SearchTenantsUseCase)
    mockTenantService = module.get(TENANT_SERVICE_TOKEN) as jest.Mocked<ITenantService>
    mockTenantValidator = module.get(TenantValidator) as jest.Mocked<TenantValidator>
    mockLogger = module.get(Logger) as jest.Mocked<Logger>
  })

  describe('execute', () => {
    it('应该成功执行搜索租户用例', async () => {
      const requestedBy = 'user-456'
      const expectedResult: SearchTenantsUseCaseResult = {
        success: true,
        tenants: [mockTenantDto],
        pagination: {
          page: 1,
          size: 10,
          total: 1,
          totalPages: 1,
        },
      }

      mockTenantService.searchTenants.mockResolvedValue(expectedResult)

      const result = await useCase.execute(validQuery, requestedBy)

      expect(result).toEqual(expectedResult)
      expect(mockTenantService.searchTenants).toHaveBeenCalledWith(validQuery)
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('开始执行搜索租户用例'),
      )
    })

    it('应该在权限验证失败时返回错误', async () => {
      const requestedBy = 'user-456'

      // Mock 权限验证失败
      jest.spyOn(useCase as any, 'validateSearchPermission').mockResolvedValue(false)

      const result = await useCase.execute(validQuery, requestedBy)

      expect(result.success).toBe(false)
      expect(result.error).toBe('没有搜索租户的权限')
      expect(mockTenantService.searchTenants).not.toHaveBeenCalled()
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('用户 user-456 没有搜索租户的权限'),
      )
    })

    it('应该在服务调用失败时返回错误', async () => {
      const requestedBy = 'user-456'
      const serviceError = '搜索失败'

      mockTenantService.searchTenants.mockResolvedValue({
        success: false,
        error: serviceError,
      })

      const result = await useCase.execute(validQuery, requestedBy)

      expect(result.success).toBe(false)
      expect(result.error).toBe(serviceError)
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('租户搜索失败'),
      )
    })

    it('应该在服务抛出异常时返回错误', async () => {
      const requestedBy = 'user-456'
      const exception = new Error('数据库连接失败')

      mockTenantService.searchTenants.mockRejectedValue(exception)

      const result = await useCase.execute(validQuery, requestedBy)

      expect(result.success).toBe(false)
      expect(result.error).toBe('数据库连接失败')
      expect(mockLogger.error).toHaveBeenCalledWith(
        '搜索租户用例执行失败',
        exception,
      )
    })

    it('应该在查询参数验证失败时返回错误', async () => {
      const requestedBy = 'user-456'
      const invalidQuery = { ...validQuery, page: -1 }

      const result = await useCase.execute(invalidQuery, requestedBy)

      expect(result.success).toBe(false)
      expect(result.error).toBe('页码必须是大于0的整数')
    })

    it('应该验证分页参数', async () => {
      const requestedBy = 'user-456'
      const invalidQueries = [
        { ...validQuery, page: 0 },
        { ...validQuery, page: 1.5 },
        { ...validQuery, size: 0 },
        { ...validQuery, size: 101 },
        { ...validQuery, size: 10.5 },
      ]

      for (const invalidQuery of invalidQueries) {
        const result = await useCase.execute(invalidQuery, requestedBy)
        expect(result.success).toBe(false)
        expect(result.error).toBeTruthy()
      }
    })

    it('应该验证排序参数', async () => {
      const requestedBy = 'user-456'
      const invalidQuery = { ...validQuery, sortOrder: 'invalid' as any }

      const result = await useCase.execute(invalidQuery, requestedBy)

      expect(result.success).toBe(false)
      expect(result.error).toBe('排序方向必须是 asc 或 desc')
    })
  })
})

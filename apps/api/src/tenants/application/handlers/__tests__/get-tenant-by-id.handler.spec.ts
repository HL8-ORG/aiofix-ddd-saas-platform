import 'reflect-metadata'
import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@libs/pino-nestjs'
import { GetTenantByIdHandler } from '../get-tenant-by-id.handler'
import { GetTenantByIdQuery } from '../../queries/get-tenant-by-id.query'
import { GetTenantByIdUseCase, GetTenantByIdUseCaseResult } from '../../use-cases/get-tenant-by-id.use-case'
import { TenantDto } from '../../dto/tenant.dto'

describe('GetTenantByIdHandler', () => {
  let handler: GetTenantByIdHandler
  let mockGetTenantByIdUseCase: jest.Mocked<GetTenantByIdUseCase>
  let mockLogger: jest.Mocked<Logger>

  const validQueryData = {
    tenantId: 'tenant-123',
    requestedBy: 'user-456',
    includeAdminUser: true,
    includeSettings: true,
    includeStatistics: false,
  }

  beforeEach(async () => {
    const mockGetTenantByIdUseCaseObj = {
      execute: jest.fn(),
    }

    const mockLoggerObj = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTenantByIdHandler,
        {
          provide: GetTenantByIdUseCase,
          useValue: mockGetTenantByIdUseCaseObj,
        },
        {
          provide: Logger,
          useValue: mockLoggerObj,
        },
      ],
    }).compile()

    handler = module.get<GetTenantByIdHandler>(GetTenantByIdHandler)
    mockGetTenantByIdUseCase = module.get(GetTenantByIdUseCase) as jest.Mocked<GetTenantByIdUseCase>
    mockLogger = module.get(Logger) as jest.Mocked<Logger>
  })

  describe('execute', () => {
    it('应该成功执行查询租户命令', async () => {
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

      mockGetTenantByIdUseCase.execute.mockResolvedValue(expectedResult)

      const result = await handler.execute(query)

      expect(result).toEqual(expectedResult)
      expect(mockGetTenantByIdUseCase.execute).toHaveBeenCalledWith(query)
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('开始处理查询租户命令'),
      )
    })

    it('应该在用例执行失败时返回错误', async () => {
      const query = new GetTenantByIdQuery(validQueryData)
      const useCaseError = '租户不存在'

      mockGetTenantByIdUseCase.execute.mockResolvedValue({
        success: false,
        error: useCaseError,
      })

      const result = await handler.execute(query)

      expect(result.success).toBe(false)
      expect(result.error).toBe(useCaseError)
      expect(mockGetTenantByIdUseCase.execute).toHaveBeenCalledWith(query)
    })

    it('应该在用例抛出异常时返回错误', async () => {
      const query = new GetTenantByIdQuery(validQueryData)
      const exception = new Error('数据库连接失败')

      mockGetTenantByIdUseCase.execute.mockRejectedValue(exception)

      const result = await handler.execute(query)

      expect(result.success).toBe(false)
      expect(result.error).toBe('数据库连接失败')
      expect(mockLogger.error).toHaveBeenCalledWith(
        '查询租户命令处理失败',
        exception,
      )
    })

    it('应该记录查询处理结果', async () => {
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

      mockGetTenantByIdUseCase.execute.mockResolvedValue(expectedResult)

      await handler.execute(query)

      expect(mockLogger.log).toHaveBeenCalledWith(
        '查询租户命令处理成功',
        expect.objectContaining({
          queryId: query.queryId,
          tenantId: 'tenant-123',
          requestedBy: 'user-456',
          success: true,
          hasTenant: true,
        }),
      )
    })

    it('应该记录失败的查询处理结果', async () => {
      const query = new GetTenantByIdQuery(validQueryData)
      const failedResult: GetTenantByIdUseCaseResult = {
        success: false,
        error: '租户不存在',
      }

      mockGetTenantByIdUseCase.execute.mockResolvedValue(failedResult)

      await handler.execute(query)

      expect(mockLogger.error).toHaveBeenCalledWith(
        '查询租户命令处理失败',
        expect.objectContaining({
          queryId: query.queryId,
          tenantId: 'tenant-123',
          requestedBy: 'user-456',
          success: false,
          hasTenant: false,
          error: '租户不存在',
        }),
      )
    })
  })
})

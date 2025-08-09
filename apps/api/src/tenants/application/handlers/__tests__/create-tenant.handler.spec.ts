import 'reflect-metadata'
import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@libs/pino-nestjs'
import { CreateTenantHandler } from '../create-tenant.handler'
import { CreateTenantCommand } from '../../commands/create-tenant.command'
import { CreateTenantUseCase, CreateTenantUseCaseResult } from '../../use-cases/create-tenant.use-case'

describe('CreateTenantHandler', () => {
  let handler: CreateTenantHandler
  let mockCreateTenantUseCase: jest.Mocked<CreateTenantUseCase>
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
    createdBy: 'system',
  }

  beforeEach(async () => {
    const mockCreateTenantUseCaseObj = {
      execute: jest.fn(),
    }

    const mockLoggerObj = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTenantHandler,
        {
          provide: CreateTenantUseCase,
          useValue: mockCreateTenantUseCaseObj,
        },
        {
          provide: Logger,
          useValue: mockLoggerObj,
        },
      ],
    }).compile()

    handler = module.get<CreateTenantHandler>(CreateTenantHandler)
    mockCreateTenantUseCase = module.get(CreateTenantUseCase) as jest.Mocked<CreateTenantUseCase>
    mockLogger = module.get(Logger) as jest.Mocked<Logger>
  })

  describe('execute', () => {
    it('应该成功执行创建租户命令', async () => {
      const command = new CreateTenantCommand(validCommandData)
      const expectedResult: CreateTenantUseCaseResult = {
        success: true,
        tenantId: 'tenant-123',
        adminUserId: 'admin-456',
      }

      mockCreateTenantUseCase.execute.mockResolvedValue(expectedResult)

      const result = await handler.execute(command)

      expect(result).toEqual(expectedResult)
      expect(mockCreateTenantUseCase.execute).toHaveBeenCalledWith(command)
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('开始处理创建租户命令'),
      )
    })

    it('应该在用例执行失败时返回错误', async () => {
      const command = new CreateTenantCommand(validCommandData)
      const useCaseError = '业务规则验证失败'

      mockCreateTenantUseCase.execute.mockResolvedValue({
        success: false,
        error: useCaseError,
      })

      const result = await handler.execute(command)

      expect(result.success).toBe(false)
      expect(result.error).toBe(useCaseError)
      expect(mockCreateTenantUseCase.execute).toHaveBeenCalledWith(command)
    })

    it('应该在用例抛出异常时返回错误', async () => {
      const command = new CreateTenantCommand(validCommandData)
      const exception = new Error('数据库连接失败')

      mockCreateTenantUseCase.execute.mockRejectedValue(exception)

      const result = await handler.execute(command)

      expect(result.success).toBe(false)
      expect(result.error).toBe('数据库连接失败')
      expect(mockLogger.error).toHaveBeenCalledWith(
        '创建租户命令处理失败',
        exception,
      )
    })

    it('应该记录命令处理结果', async () => {
      const command = new CreateTenantCommand(validCommandData)
      const expectedResult: CreateTenantUseCaseResult = {
        success: true,
        tenantId: 'tenant-123',
        adminUserId: 'admin-456',
      }

      mockCreateTenantUseCase.execute.mockResolvedValue(expectedResult)

      await handler.execute(command)

      expect(mockLogger.log).toHaveBeenCalledWith(
        '创建租户命令处理成功',
        expect.objectContaining({
          commandId: command.commandId,
          tenantName: '测试租户',
          tenantCode: 'test_tenant',
          success: true,
          tenantId: 'tenant-123',
          adminUserId: 'admin-456',
        }),
      )
    })

    it('应该记录失败的命令处理结果', async () => {
      const command = new CreateTenantCommand(validCommandData)
      const failedResult: CreateTenantUseCaseResult = {
        success: false,
        error: '租户编码已存在',
      }

      mockCreateTenantUseCase.execute.mockResolvedValue(failedResult)

      await handler.execute(command)

      expect(mockLogger.error).toHaveBeenCalledWith(
        '创建租户命令处理失败',
        expect.objectContaining({
          commandId: command.commandId,
          tenantName: '测试租户',
          tenantCode: 'test_tenant',
          success: false,
          error: '租户编码已存在',
        }),
      )
    })
  })
})

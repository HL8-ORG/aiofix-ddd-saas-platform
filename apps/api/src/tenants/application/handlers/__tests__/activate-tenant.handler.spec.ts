import 'reflect-metadata'
import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@libs/pino-nestjs'
import { ActivateTenantHandler } from '../activate-tenant.handler'
import { ActivateTenantCommand } from '../../commands/activate-tenant.command'
import { ActivateTenantUseCase, ActivateTenantUseCaseResult } from '../../use-cases/activate-tenant.use-case'

describe('ActivateTenantHandler', () => {
  let handler: ActivateTenantHandler
  let mockActivateTenantUseCase: jest.Mocked<ActivateTenantUseCase>
  let mockLogger: jest.Mocked<Logger>

  const validCommandData = {
    tenantId: 'tenant-123',
    activatedBy: 'admin-456',
    reason: '租户申请通过，激活使用',
  }

  beforeEach(async () => {
    const mockActivateTenantUseCaseObj = {
      execute: jest.fn(),
    }

    const mockLoggerObj = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivateTenantHandler,
        {
          provide: ActivateTenantUseCase,
          useValue: mockActivateTenantUseCaseObj,
        },
        {
          provide: Logger,
          useValue: mockLoggerObj,
        },
      ],
    }).compile()

    handler = module.get<ActivateTenantHandler>(ActivateTenantHandler)
    mockActivateTenantUseCase = module.get(ActivateTenantUseCase) as jest.Mocked<ActivateTenantUseCase>
    mockLogger = module.get(Logger) as jest.Mocked<Logger>
  })

  describe('execute', () => {
    it('应该成功执行激活租户命令', async () => {
      const command = new ActivateTenantCommand(validCommandData)
      const expectedResult: ActivateTenantUseCaseResult = {
        success: true,
        tenantId: 'tenant-123',
        message: '租户激活成功',
      }

      mockActivateTenantUseCase.execute.mockResolvedValue(expectedResult)

      const result = await handler.execute(command)

      expect(result).toEqual(expectedResult)
      expect(mockActivateTenantUseCase.execute).toHaveBeenCalledWith(command)
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('开始处理激活租户命令'),
      )
    })

    it('应该在用例执行失败时返回错误', async () => {
      const command = new ActivateTenantCommand(validCommandData)
      const useCaseError = '租户不存在'

      mockActivateTenantUseCase.execute.mockResolvedValue({
        success: false,
        error: useCaseError,
      })

      const result = await handler.execute(command)

      expect(result.success).toBe(false)
      expect(result.error).toBe(useCaseError)
      expect(mockActivateTenantUseCase.execute).toHaveBeenCalledWith(command)
    })

    it('应该在用例抛出异常时返回错误', async () => {
      const command = new ActivateTenantCommand(validCommandData)
      const exception = new Error('数据库连接失败')

      mockActivateTenantUseCase.execute.mockRejectedValue(exception)

      const result = await handler.execute(command)

      expect(result.success).toBe(false)
      expect(result.error).toBe('数据库连接失败')
      expect(mockLogger.error).toHaveBeenCalledWith(
        '激活租户命令处理失败',
        exception,
      )
    })

    it('应该记录命令处理结果', async () => {
      const command = new ActivateTenantCommand(validCommandData)
      const expectedResult: ActivateTenantUseCaseResult = {
        success: true,
        tenantId: 'tenant-123',
        message: '租户激活成功',
      }

      mockActivateTenantUseCase.execute.mockResolvedValue(expectedResult)

      await handler.execute(command)

      expect(mockLogger.log).toHaveBeenCalledWith(
        '激活租户命令处理成功',
        expect.objectContaining({
          commandId: command.commandId,
          tenantId: 'tenant-123',
          activatedBy: 'admin-456',
          reason: '租户申请通过，激活使用',
          success: true,
          message: '租户激活成功',
        }),
      )
    })

    it('应该记录失败的命令处理结果', async () => {
      const command = new ActivateTenantCommand(validCommandData)
      const failedResult: ActivateTenantUseCaseResult = {
        success: false,
        error: '租户不存在',
      }

      mockActivateTenantUseCase.execute.mockResolvedValue(failedResult)

      await handler.execute(command)

      expect(mockLogger.error).toHaveBeenCalledWith(
        '激活租户命令处理失败',
        expect.objectContaining({
          commandId: command.commandId,
          tenantId: 'tenant-123',
          activatedBy: 'admin-456',
          reason: '租户申请通过，激活使用',
          success: false,
          error: '租户不存在',
        }),
      )
    })
  })
})

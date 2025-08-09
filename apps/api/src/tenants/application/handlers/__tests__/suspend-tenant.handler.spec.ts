import 'reflect-metadata'
import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@libs/pino-nestjs'
import { SuspendTenantHandler } from '../suspend-tenant.handler'
import { SuspendTenantCommand } from '../../commands/suspend-tenant.command'
import { SuspendTenantUseCase, SuspendTenantUseCaseResult } from '../../use-cases/suspend-tenant.use-case'

describe('SuspendTenantHandler', () => {
  let handler: SuspendTenantHandler
  let mockSuspendTenantUseCase: jest.Mocked<SuspendTenantUseCase>
  let mockLogger: jest.Mocked<Logger>

  const validCommandData = {
    tenantId: '123e4567-e89b-41d3-a456-426614174000',
    suspendedBy: '123e4567-e89b-41d3-a456-426614174001',
    reason: '租户违规操作，暂停使用',
  }

  beforeEach(async () => {
    const mockSuspendTenantUseCaseObj = {
      execute: jest.fn(),
    }

    const mockLoggerObj = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuspendTenantHandler,
        {
          provide: SuspendTenantUseCase,
          useValue: mockSuspendTenantUseCaseObj,
        },
        {
          provide: Logger,
          useValue: mockLoggerObj,
        },
      ],
    }).compile()

    handler = module.get<SuspendTenantHandler>(SuspendTenantHandler)
    mockSuspendTenantUseCase = module.get(SuspendTenantUseCase) as jest.Mocked<SuspendTenantUseCase>
    mockLogger = module.get(Logger) as jest.Mocked<Logger>
  })

  describe('execute', () => {
    it('应该成功执行暂停租户命令', async () => {
      const command = new SuspendTenantCommand(validCommandData)
      const expectedResult: SuspendTenantUseCaseResult = {
        success: true,
        tenantId: '123e4567-e89b-41d3-a456-426614174000',
        message: '租户暂停成功',
      }

      mockSuspendTenantUseCase.execute.mockResolvedValue(expectedResult)

      const result = await handler.execute(command)

      expect(result).toEqual(expectedResult)
      expect(mockSuspendTenantUseCase.execute).toHaveBeenCalledWith(command.data)
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('开始处理暂停租户命令'),
      )
    })

    it('应该在用例执行失败时返回错误', async () => {
      const command = new SuspendTenantCommand(validCommandData)
      const useCaseError = '租户不存在'

      mockSuspendTenantUseCase.execute.mockResolvedValue({
        success: false,
        error: useCaseError,
      })

      const result = await handler.execute(command)

      expect(result.success).toBe(false)
      expect(result.error).toBe(useCaseError)
      expect(mockSuspendTenantUseCase.execute).toHaveBeenCalledWith(command.data)
    })

    it('应该在用例抛出异常时返回错误', async () => {
      const command = new SuspendTenantCommand(validCommandData)
      const exception = new Error('数据库连接失败')

      mockSuspendTenantUseCase.execute.mockRejectedValue(exception)

      const result = await handler.execute(command)

      expect(result.success).toBe(false)
      expect(result.error).toBe('数据库连接失败')
      expect(mockLogger.error).toHaveBeenCalledWith(
        '暂停租户命令处理失败',
        expect.objectContaining({
          commandId: command.commandId,
          tenantId: '123e4567-e89b-41d3-a456-426614174000',
          suspendedBy: '123e4567-e89b-41d3-a456-426614174001',
          reason: '租户违规操作，暂停使用',
          success: false,
          error: '数据库连接失败',
        }),
      )
    })

    it('应该在命令验证失败时返回错误', async () => {
      const invalidCommandData = {
        ...validCommandData,
        tenantId: '', // 空的租户ID
      }
      const command = new SuspendTenantCommand(invalidCommandData)

      const result = await handler.execute(command)

      expect(result.success).toBe(false)
      expect(result.error).toBe('租户ID不能为空')
      expect(mockSuspendTenantUseCase.execute).not.toHaveBeenCalled()
    })

    it('应该记录命令处理结果', async () => {
      const command = new SuspendTenantCommand(validCommandData)
      const expectedResult: SuspendTenantUseCaseResult = {
        success: true,
        tenantId: '123e4567-e89b-41d3-a456-426614174000',
        message: '租户暂停成功',
      }

      mockSuspendTenantUseCase.execute.mockResolvedValue(expectedResult)

      await handler.execute(command)

      expect(mockLogger.log).toHaveBeenCalledWith(
        '暂停租户命令处理成功',
        expect.objectContaining({
          commandId: command.commandId,
          tenantId: '123e4567-e89b-41d3-a456-426614174000',
          suspendedBy: '123e4567-e89b-41d3-a456-426614174001',
          reason: '租户违规操作，暂停使用',
          success: true,
          message: '租户暂停成功',
        }),
      )
    })

    it('应该记录失败的命令处理结果', async () => {
      const command = new SuspendTenantCommand(validCommandData)
      const failedResult: SuspendTenantUseCaseResult = {
        success: false,
        error: '租户不存在',
      }

      mockSuspendTenantUseCase.execute.mockResolvedValue(failedResult)

      await handler.execute(command)

      expect(mockLogger.error).toHaveBeenCalledWith(
        '暂停租户命令处理失败',
        expect.objectContaining({
          commandId: command.commandId,
          tenantId: '123e4567-e89b-41d3-a456-426614174000',
          suspendedBy: '123e4567-e89b-41d3-a456-426614174001',
          reason: '租户违规操作，暂停使用',
          success: false,
          error: '租户不存在',
        }),
      )
    })
  })
})

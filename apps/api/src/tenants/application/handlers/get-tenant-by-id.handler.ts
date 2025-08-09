/**
 * @class GetTenantByIdHandler
 * @description
 * 根据ID查询租户的查询处理器，实现CQRS模式中的查询处理器。该处理器负责
 * 处理查询租户的命令，返回租户的详细信息。
 * 
 * 主要原理与机制：
 * 1. 查询处理：接收并处理查询租户的查询
 * 2. 权限验证：验证用户是否有权限访问指定租户
 * 3. 数据转换：将领域实体转换为DTO
 * 4. 缓存策略：支持查询结果的缓存
 * 5. 审计日志：记录查询操作的审计信息
 * 6. 异常处理：统一的异常处理机制
 */
import { Injectable, Inject } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { GetTenantByIdQuery } from '../queries/get-tenant-by-id.query'
import { GetTenantByIdUseCase, GetTenantByIdUseCaseResult } from '../use-cases/get-tenant-by-id.use-case'

/**
 * @interface IQueryHandler
 * @description 查询处理器接口
 */
export interface IQueryHandler<T> {
  execute(query: T): Promise<any>
}

/**
 * @interface GetTenantByIdHandlerDependencies
 * @description 查询租户处理器依赖项
 */
export interface GetTenantByIdHandlerDependencies {
  getTenantByIdUseCase: GetTenantByIdUseCase
  logger: Logger
}

/**
 * @class GetTenantByIdHandler
 * @description 根据ID查询租户命令处理器
 * 
 * 该处理器负责接收和分发查询租户命令，将具体的业务逻辑委托给用例。
 * 
 * 主要原理与机制：
 * - 遵循单一职责原则，专注于查询的接收和分发
 * - 通过依赖注入获取用例实例
 * - 提供统一的查询处理接口
 * - 包含基本的错误处理和日志记录
 */
@Injectable()
export class GetTenantByIdHandler implements IQueryHandler<GetTenantByIdQuery> {
  constructor(
    private readonly getTenantByIdUseCase: GetTenantByIdUseCase,
    @Inject(Logger)
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行查询租户命令
   * @param query 查询租户命令
   * @returns Promise<GetTenantByIdUseCaseResult> 执行结果
   */
  async execute(query: GetTenantByIdQuery): Promise<GetTenantByIdUseCaseResult> {
    try {
      this.logger.log(`开始处理查询租户命令: ${query.queryId}`)

      // 委托给用例执行具体的业务逻辑
      const result = await this.getTenantByIdUseCase.execute(query)

      // 记录查询处理结果
      this.logQueryExecution(query, result)

      return result
    } catch (error) {
      this.logger.error('查询租户命令处理失败', error)
      return {
        success: false,
        error: (error as Error).message,
      }
    }
  }

  /**
   * @method logQueryExecution
   * @description 记录查询执行日志
   * @param query 查询租户命令
   * @param result 执行结果
   */
  private logQueryExecution(query: GetTenantByIdQuery, result: GetTenantByIdUseCaseResult): void {
    const logData = {
      queryId: query.queryId,
      tenantId: query.data.tenantId,
      requestedBy: query.data.requestedBy,
      success: result.success,
      hasTenant: !!result.tenant,
      error: result.error,
      timestamp: new Date().toISOString(),
    }

    if (result.success) {
      this.logger.log('查询租户命令处理成功', logData)
    } else {
      this.logger.error('查询租户命令处理失败', logData)
    }
  }
}

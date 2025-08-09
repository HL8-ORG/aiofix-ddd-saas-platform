import { Injectable, Inject } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { TenantValidator } from '../validators/tenant-validator'
import { TENANT_SERVICE_TOKEN } from '../services/interfaces/tenant-service.interface'
import type { ITenantService, SearchTenantsQuery, SearchTenantsResult } from '../services/interfaces/tenant-service.interface'
import { TenantDto } from '../dto/tenant.dto'

/**
 * @interface SearchTenantsUseCaseResult
 * @description 搜索租户用例的执行结果
 */
export interface SearchTenantsUseCaseResult {
  success: boolean
  tenants?: TenantDto[]
  pagination?: {
    page: number
    size: number
    total: number
    totalPages: number
  }
  error?: string
  warnings?: string[]
}

/**
 * @class SearchTenantsUseCase
 * @description 搜索租户用例
 * 
 * 该用例负责协调搜索租户的完整业务流程，包括：
 * 1. 验证搜索参数
 * 2. 检查用户权限
 * 3. 执行搜索租户业务逻辑
 * 4. 处理结果和异常
 * 
 * 主要原理与机制：
 * - 遵循单一职责原则，专注于搜索租户的业务逻辑
 * - 通过依赖注入获取所需的服务和验证器
 * - 提供清晰的输入输出接口
 * - 包含完整的错误处理和日志记录
 */
@Injectable()
export class SearchTenantsUseCase {
  constructor(
    @Inject(TENANT_SERVICE_TOKEN)
    private readonly tenantService: ITenantService,
    private readonly tenantValidator: TenantValidator,
    @Inject(Logger)
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行搜索租户用例
   * @param query 搜索租户查询
   * @param requestedBy 请求者ID
   * @returns Promise<SearchTenantsUseCaseResult> 执行结果
   */
  async execute(query: SearchTenantsQuery, requestedBy: string): Promise<SearchTenantsUseCaseResult> {
    try {
      this.logger.log(`开始执行搜索租户用例: ${requestedBy}`)

      // 1. 验证搜索参数
      this.validateSearchQuery(query)

      // 2. 检查用户权限（这里可以添加权限验证逻辑）
      const hasPermission = await this.validateSearchPermission(requestedBy)
      if (!hasPermission) {
        this.logger.warn(`用户 ${requestedBy} 没有搜索租户的权限`)
        return {
          success: false,
          error: '没有搜索租户的权限',
        }
      }

      // 3. 执行搜索租户业务逻辑
      const result: SearchTenantsResult = await this.tenantService.searchTenants(query)

      // 4. 记录成功日志
      if (result.success && result.tenants) {
        this.logger.log(`租户搜索成功: 找到 ${result.tenants.length} 个租户`)
      } else {
        this.logger.error(`租户搜索失败: ${result.error}`)
      }

      return result
    } catch (error) {
      // 5. 异常处理
      this.logger.error('搜索租户用例执行失败', error)
      return {
        success: false,
        error: (error as Error).message,
      }
    }
  }

  /**
   * @method validateSearchQuery
   * @description 验证搜索查询参数
   * @param query 搜索查询
   */
  private validateSearchQuery(query: SearchTenantsQuery): void {
    const errors: string[] = []

    // 验证分页参数
    if (query.page !== undefined && (query.page < 1 || !Number.isInteger(query.page))) {
      errors.push('页码必须是大于0的整数')
    }

    if (query.size !== undefined && (query.size < 1 || query.size > 100 || !Number.isInteger(query.size))) {
      errors.push('页面大小必须是1-100之间的整数')
    }

    // 验证排序参数
    if (query.sortOrder && !['asc', 'desc'].includes(query.sortOrder)) {
      errors.push('排序方向必须是 asc 或 desc')
    }

    if (errors.length > 0) {
      throw new Error(errors.join('; '))
    }
  }

  /**
   * @method validateSearchPermission
   * @description 验证搜索权限
   * @param requestedBy 请求者ID
   * @returns Promise<boolean> 是否有权限
   */
  private async validateSearchPermission(requestedBy: string): Promise<boolean> {
    // TODO: 实现具体的权限验证逻辑
    // 这里可以检查用户角色、权限等
    return true
  }

  /**
   * @method logUseCaseExecution
   * @description 记录用例执行日志
   * @param query 搜索查询
   * @param result 执行结果
   * @param requestedBy 请求者ID
   */
  private logUseCaseExecution(query: SearchTenantsQuery, result: SearchTenantsUseCaseResult, requestedBy: string): void {
    const logData = {
      requestedBy,
      query,
      success: result.success,
      tenantCount: result.tenants?.length || 0,
      pagination: result.pagination,
      error: result.error,
      timestamp: new Date().toISOString(),
    }

    if (result.success) {
      this.logger.log('搜索租户用例执行成功', logData)
    } else {
      this.logger.error('搜索租户用例执行失败', logData)
    }
  }
}

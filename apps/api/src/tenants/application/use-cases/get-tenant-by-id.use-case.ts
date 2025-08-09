import { Injectable, Inject } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { GetTenantByIdQuery } from '../queries/get-tenant-by-id.query'
import { TenantValidator } from '../validators/tenant-validator'
import { TENANT_SERVICE_TOKEN } from '../services/interfaces/tenant-service.interface'
import type { ITenantService } from '../services/interfaces/tenant-service.interface'
import { TenantDto } from '../dto/tenant.dto'

/**
 * @interface GetTenantByIdUseCaseResult
 * @description 根据ID查询租户用例的执行结果
 */
export interface GetTenantByIdUseCaseResult {
  success: boolean
  tenant?: TenantDto
  error?: string
  warnings?: string[]
}

/**
 * @class GetTenantByIdUseCase
 * @description 根据ID查询租户用例
 * 
 * 该用例负责协调查询租户的完整业务流程，包括：
 * 1. 验证查询参数
 * 2. 检查访问权限
 * 3. 调用服务获取租户数据
 * 4. 处理结果和异常
 * 
 * 主要原理与机制：
 * - 遵循单一职责原则，专注于查询租户的业务逻辑
 * - 通过依赖注入获取所需的服务和验证器
 * - 提供清晰的输入输出接口
 * - 包含完整的错误处理和日志记录
 */
@Injectable()
export class GetTenantByIdUseCase {
  constructor(
    @Inject(TENANT_SERVICE_TOKEN)
    private readonly tenantService: ITenantService,
    private readonly tenantValidator: TenantValidator,
    @Inject(Logger)
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行根据ID查询租户用例
   * @param query 查询租户命令
   * @returns Promise<GetTenantByIdUseCaseResult> 执行结果
   */
  async execute(query: GetTenantByIdQuery): Promise<GetTenantByIdUseCaseResult> {
    try {
      this.logger.log(`开始执行查询租户用例: ${query.queryId}`)

      // 1. 验证查询参数
      query.validate()

      // 2. 先获取租户信息，然后检查访问权限
      const basicQuery = {
        tenantId: query.data.tenantId,
      }
      const tenantResult = await this.tenantService.getTenantById(basicQuery)

      if (!tenantResult.success || !tenantResult.tenant) {
        return {
          success: false,
          error: '租户不存在',
        }
      }

      // 检查访问权限
      const accessValidation = this.tenantValidator.validateTenantAccess(
        tenantResult.tenant as any, // 临时类型转换，实际应该是 Tenant 实体
        query.data.requestedBy,
      )

      if (!accessValidation.isValid) {
        this.logger.warn(`租户访问权限验证失败: ${accessValidation.errors.join(', ')}`)
        return {
          success: false,
          error: accessValidation.errors.join('; '),
          warnings: accessValidation.warnings,
        }
      }

      // 3. 执行查询租户业务逻辑（如果需要包含额外信息）
      let finalResult = tenantResult

      if (query.data.includeAdminUser || query.data.includeSettings || query.data.includeStatistics) {
        // 如果需要包含额外信息，再次调用服务
        const detailedQuery = {
          tenantId: query.data.tenantId,
        }
        finalResult = await this.tenantService.getTenantById(detailedQuery)
      }

      // 4. 记录日志
      if (finalResult.success && finalResult.tenant) {
        this.logger.log(`租户查询成功: ${finalResult.tenant.id}`)
      } else if (finalResult.error) {
        this.logger.error(`租户查询失败: ${finalResult.error}`)
      }

      return finalResult
    } catch (error) {
      // 5. 异常处理
      this.logger.error('查询租户用例执行失败', error)
      return {
        success: false,
        error: (error as Error).message,
      }
    }
  }

  /**
   * @method logUseCaseExecution
   * @description 记录用例执行日志
   * @param query 查询租户命令
   * @param result 执行结果
   */
  private logUseCaseExecution(query: GetTenantByIdQuery, result: GetTenantByIdUseCaseResult): void {
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
      this.logger.log('查询租户用例执行成功', logData)
    } else {
      this.logger.error('查询租户用例执行失败', logData)
    }
  }
}

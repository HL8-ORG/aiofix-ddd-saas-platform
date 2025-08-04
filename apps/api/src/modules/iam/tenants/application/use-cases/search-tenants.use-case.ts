import { Injectable, Inject } from '@nestjs/common'
import type { Tenant } from '../../domain/entities/tenant.entity'
import type { TenantRepository } from '../../domain/repositories/tenant.repository'
import { TenantStatus } from '../../domain/value-objects/tenant-status.value-object'

/**
 * @class SearchTenantsUseCase
 * @description
 * 搜索租户用例，实现租户搜索的具体业务逻辑。
 *
 * 主要原理与机制：
 * 1. 遵循Clean Architecture的Use Case模式
 * 2. 协调领域对象和基础设施服务
 * 3. 实现具体的业务用例逻辑
 * 4. 处理租户搜索的业务规则验证
 * 5. 提供清晰的接口边界
 */
@Injectable()
export class SearchTenantsUseCase {
  constructor(
    @Inject('TenantRepository')
    private readonly tenantRepository: TenantRepository,
  ) { }

  /**
   * @method execute
   * @description 基础搜索租户
   *
   * @param searchTerm - 搜索关键词
   * @param limit - 结果数量限制
   * @returns 搜索结果
   */
  async execute(searchTerm: string, limit?: number): Promise<Tenant[]> {
    return await this.tenantRepository.findBySearch(searchTerm, limit)
  }

  /**
   * @method executeAdvancedSearch
   * @description 高级搜索租户（分页）
   *
   * @param searchCriteria - 搜索条件
   * @param page - 页码
   * @param limit - 每页数量
   * @returns 搜索结果和分页信息
   */
  async executeAdvancedSearch(
    searchCriteria: {
      keyword?: string
      status?: string
      adminUserId?: string
      dateRange?: {
        startDate: Date
        endDate: Date
      }
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    },
    page = 1,
    limit = 10,
  ): Promise<{
    tenants: Tenant[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    // 转换状态字符串为TenantStatus枚举
    const statusFilter = searchCriteria.status
      ? TenantStatus[searchCriteria.status.toUpperCase() as keyof typeof TenantStatus]
      : undefined

    return await this.tenantRepository.findWithPagination(
      page,
      limit,
      {
        status: statusFilter,
        adminUserId: searchCriteria.adminUserId,
        search: searchCriteria.keyword,
      },
      searchCriteria.sortBy && searchCriteria.sortOrder
        ? {
          field: searchCriteria.sortBy as any,
          order: searchCriteria.sortOrder,
        }
        : undefined,
    )
  }

  /**
   * @method executeGetTenantSuggestions
   * @description 获取租户建议
   *
   * @param query - 查询关键词
   * @param limit - 建议数量限制
   * @returns 租户建议列表
   */
  async executeGetTenantSuggestions(
    query: string,
    limit = 5,
  ): Promise<
    Array<{ id: string; name: string; code: string; status: string }>
  > {
    const tenants = await this.tenantRepository.findBySearch(query, limit)
    return tenants.map((tenant) => ({
      id: tenant.id,
      name: tenant.getName(),
      code: tenant.getCode(),
      status: tenant.getStatus(),
    }))
  }

  /**
   * @method executeSearchByName
   * @description 根据名称搜索租户
   *
   * @param name - 租户名称
   * @returns 搜索结果
   */
  async executeSearchByName(name: string): Promise<Tenant[]> {
    return await this.tenantRepository.findByName(name)
  }

  /**
   * @method executeSearchByCode
   * @description 根据编码搜索租户
   *
   * @param code - 租户编码
   * @returns 搜索结果
   */
  async executeSearchByCode(code: string): Promise<Tenant | null> {
    return await this.tenantRepository.findByCodeString(code)
  }

  /**
   * @method executeSearchByStatus
   * @description 根据状态搜索租户
   *
   * @param status - 租户状态
   * @returns 搜索结果
   */
  async executeSearchByStatus(status: string): Promise<Tenant[]> {
    const statusFilter = TenantStatus[status.toUpperCase() as keyof typeof TenantStatus]
    return await this.tenantRepository.findByStatus(statusFilter)
  }

  /**
   * @method executeSearchByAdminUserId
   * @description 根据管理员用户ID搜索租户
   *
   * @param adminUserId - 管理员用户ID
   * @returns 搜索结果
   */
  async executeSearchByAdminUserId(adminUserId: string): Promise<Tenant[]> {
    return await this.tenantRepository.findByAdminUserId(adminUserId)
  }
}

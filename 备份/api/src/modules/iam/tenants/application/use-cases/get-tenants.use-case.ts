import { Injectable, Inject } from '@nestjs/common'
import type { Tenant } from '../../domain/entities/tenant.entity'
import type { TenantRepository } from '../../domain/repositories/tenant.repository'
import { TenantStatus } from '../../domain/value-objects/tenant-status.value-object'

/**
 * @class GetTenantsUseCase
 * @description
 * 获取租户列表用例，实现租户列表获取的具体业务逻辑。
 *
 * 主要原理与机制：
 * 1. 遵循Clean Architecture的Use Case模式
 * 2. 协调领域对象和基础设施服务
 * 3. 实现具体的业务用例逻辑
 * 4. 处理租户列表查询的业务规则验证
 * 5. 提供清晰的接口边界
 */
@Injectable()
export class GetTenantsUseCase {
  constructor(
    @Inject('TenantRepository')
    private readonly tenantRepository: TenantRepository,
  ) { }

  /**
   * @method execute
   * @description 获取租户列表（分页）
   *
   * @param page - 页码
   * @param limit - 每页数量
   * @param filters - 过滤条件
   * @param sort - 排序条件
   * @returns 租户列表和分页信息
   */
  async execute(
    page = 1,
    limit = 10,
    filters?: {
      status?: string
      adminUserId?: string
      search?: string
    },
    sort?: {
      field: 'name' | 'code' | 'status' | 'createdAt' | 'updatedAt'
      order: 'asc' | 'desc'
    },
  ): Promise<{
    tenants: Tenant[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    // 转换状态字符串为TenantStatus枚举
    const statusFilter = filters?.status
      ? TenantStatus[filters.status.toUpperCase() as keyof typeof TenantStatus]
      : undefined

    return await this.tenantRepository.findWithPagination(
      page,
      limit,
      {
        status: statusFilter,
        adminUserId: filters?.adminUserId,
        search: filters?.search,
      },
      sort,
    )
  }

  /**
   * @method executeAllTenants
   * @description 获取所有租户
   *
   * @returns 所有租户列表
   */
  async executeAllTenants(): Promise<Tenant[]> {
    return await this.tenantRepository.findAll()
  }

  /**
   * @method executeActiveTenants
   * @description 获取所有激活状态的租户
   *
   * @returns 激活状态的租户列表
   */
  async executeActiveTenants(): Promise<Tenant[]> {
    return await this.tenantRepository.findByStatus(TenantStatus.ACTIVE)
  }

  /**
   * @method executePendingTenants
   * @description 获取所有待激活状态的租户
   *
   * @returns 待激活状态的租户列表
   */
  async executePendingTenants(): Promise<Tenant[]> {
    return await this.tenantRepository.findByStatus(TenantStatus.PENDING)
  }

  /**
   * @method executeSuspendedTenants
   * @description 获取所有禁用状态的租户
   *
   * @returns 禁用状态的租户列表
   */
  async executeSuspendedTenants(): Promise<Tenant[]> {
    return await this.tenantRepository.findByStatus(TenantStatus.SUSPENDED)
  }

  /**
   * @method executeDeletedTenants
   * @description 获取所有已删除状态的租户
   *
   * @returns 已删除状态的租户列表
   */
  async executeDeletedTenants(): Promise<Tenant[]> {
    return await this.tenantRepository.findByStatus(TenantStatus.DELETED)
  }

  /**
   * @method executeRecentTenants
   * @description 获取最近创建的租户
   *
   * @param limit - 数量限制
   * @returns 最近创建的租户列表
   */
  async executeRecentTenants(limit = 10): Promise<Tenant[]> {
    return await this.tenantRepository.findRecent(limit)
  }

  /**
   * @method executeByDateRange
   * @description 根据日期范围获取租户
   *
   * @param startDate - 开始日期
   * @param endDate - 结束日期
   * @returns 指定日期范围内的租户列表
   */
  async executeByDateRange(startDate: Date, endDate: Date): Promise<Tenant[]> {
    return await this.tenantRepository.findByDateRange(startDate, endDate)
  }
}

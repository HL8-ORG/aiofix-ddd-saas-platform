import { Inject, Injectable } from '@nestjs/common'
import type { Tenant } from '../domain/entities/tenant.entity'
import type { TenantRepository } from '../domain/repositories/tenant.repository'
import { CreateTenantUseCase } from './use-cases/create-tenant.use-case'
import { DeleteTenantUseCase } from './use-cases/delete-tenant.use-case'
import { GetTenantStatisticsUseCase } from './use-cases/get-tenant-statistics.use-case'
import { GetTenantUseCase } from './use-cases/get-tenant.use-case'
import { GetTenantsUseCase } from './use-cases/get-tenants.use-case'
import { SearchTenantsUseCase } from './use-cases/search-tenants.use-case'
import { UpdateTenantStatusUseCase } from './use-cases/update-tenant-status.use-case'
import { UpdateTenantUseCase } from './use-cases/update-tenant.use-case'

/**
 * @class TenantsService
 * @description
 * 租户应用服务，负责协调领域对象完成业务用例。
 * 这是应用层的核心服务，连接表现层和领域层。
 *
 * 主要原理与机制：
 * 1. 遵循Clean Architecture的应用服务模式
 * 2. 委托业务逻辑给专门的Use Case
 * 3. 提供统一的接口给表现层
 * 4. 处理跨Use Case的协调工作
 * 5. 确保业务规则的一致性
 */
@Injectable()
export class TenantsService {
  constructor(
    @Inject('TenantRepository')
    private readonly tenantRepository: TenantRepository,
    private readonly createTenantUseCase: CreateTenantUseCase,
    private readonly getTenantUseCase: GetTenantUseCase,
    private readonly getTenantsUseCase: GetTenantsUseCase,
    private readonly updateTenantUseCase: UpdateTenantUseCase,
    private readonly updateTenantStatusUseCase: UpdateTenantStatusUseCase,
    private readonly deleteTenantUseCase: DeleteTenantUseCase,
    private readonly searchTenantsUseCase: SearchTenantsUseCase,
    private readonly getTenantStatisticsUseCase: GetTenantStatisticsUseCase,
  ) { }

  /**
   * @method createTenant
   * @description 创建新租户
   */
  async createTenant(
    name: string,
    code: string,
    adminUserId: string,
    description?: string,
    settings?: Record<string, unknown>,
  ): Promise<Tenant> {
    return await this.createTenantUseCase.execute({
      name,
      code,
      adminUserId,
      description,
      settings,
    })
  }

  /**
   * @method getTenantById
   * @description 根据ID获取租户
   */
  async getTenantById(id: string): Promise<Tenant> {
    return await this.getTenantUseCase.execute(id)
  }

  /**
   * @method getTenantByCode
   * @description 根据编码获取租户
   */
  async getTenantByCode(code: string): Promise<Tenant> {
    return await this.getTenantUseCase.executeByCode(code)
  }

  /**
   * @method getTenantByName
   * @description 根据名称获取租户列表
   */
  async getTenantByName(name: string): Promise<Tenant[]> {
    return await this.getTenantUseCase.executeByName(name)
  }

  /**
   * @method getTenantByAdminUserId
   * @description 根据管理员用户ID获取租户列表
   */
  async getTenantByAdminUserId(adminUserId: string): Promise<Tenant[]> {
    return await this.getTenantUseCase.executeByAdminUserId(adminUserId)
  }

  /**
   * @method getAllTenants
   * @description 获取所有租户
   */
  async getAllTenants(): Promise<Tenant[]> {
    return await this.getTenantsUseCase.executeAllTenants()
  }

  /**
   * @method getActiveTenants
   * @description 获取所有激活状态的租户
   */
  async getActiveTenants(): Promise<Tenant[]> {
    return await this.getTenantsUseCase.executeActiveTenants()
  }

  /**
   * @method getPendingTenants
   * @description 获取所有待激活状态的租户
   */
  async getPendingTenants(): Promise<Tenant[]> {
    return await this.getTenantsUseCase.executePendingTenants()
  }

  /**
   * @method getSuspendedTenants
   * @description 获取所有禁用状态的租户
   */
  async getSuspendedTenants(): Promise<Tenant[]> {
    return await this.getTenantsUseCase.executeSuspendedTenants()
  }

  /**
   * @method getDeletedTenants
   * @description 获取所有已删除的租户
   */
  async getDeletedTenants(): Promise<Tenant[]> {
    return await this.getTenantsUseCase.executeDeletedTenants()
  }

  /**
   * @method getTenantsWithPagination
   * @description 分页获取租户列表
   */
  async getTenantsWithPagination(
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
    return await this.getTenantsUseCase.execute(page, limit, filters, sort)
  }

  /**
   * @method activateTenant
   * @description 激活租户
   */
  async activateTenant(id: string): Promise<Tenant> {
    return await this.updateTenantStatusUseCase.executeActivate(id)
  }

  /**
   * @method suspendTenant
   * @description 禁用租户
   */
  async suspendTenant(id: string, reason?: string): Promise<Tenant> {
    return await this.updateTenantStatusUseCase.executeSuspend(id)
  }

  /**
   * @method updateTenantStatus
   * @description 更新租户状态
   */
  async updateTenantStatus(id: string, status: string): Promise<Tenant> {
    return await this.updateTenantStatusUseCase.executeUpdateStatus(id, status)
  }

  /**
   * @method updateTenantInfo
   * @description 更新租户基本信息
   */
  async updateTenantInfo(
    id: string,
    updateData: {
      name?: string
      code?: string
      description?: string
    },
  ): Promise<Tenant> {
    return await this.updateTenantUseCase.execute(id, updateData)
  }

  /**
   * @method updateTenantSettings
   * @description 更新租户设置
   */
  async updateTenantSettings(
    id: string,
    settings: Record<string, unknown>,
  ): Promise<Tenant> {
    return await this.updateTenantUseCase.executeSettings(id, settings)
  }

  /**
   * @method updateTenantPartialSettings
   * @description 部分更新租户设置
   */
  async updateTenantPartialSettings(
    id: string,
    settings: Record<string, unknown>,
  ): Promise<Tenant> {
    return await this.updateTenantUseCase.executePartialSettings(id, settings)
  }

  /**
   * @method deleteTenant
   * @description 删除租户（软删除）
   */
  async deleteTenant(id: string): Promise<boolean> {
    return await this.deleteTenantUseCase.execute(id)
  }

  /**
   * @method hardDeleteTenant
   * @description 硬删除租户
   */
  async hardDeleteTenant(id: string): Promise<boolean> {
    return await this.deleteTenantUseCase.executeHardDelete(id)
  }

  /**
   * @method restoreTenant
   * @description 恢复已删除的租户
   */
  async restoreTenant(id: string): Promise<boolean> {
    return await this.deleteTenantUseCase.executeRestore(id)
  }

  /**
   * @method batchDeleteTenants
   * @description 批量删除租户
   */
  async batchDeleteTenants(
    ids: string[],
  ): Promise<{ success: string[]; failed: string[] }> {
    return await this.deleteTenantUseCase.executeBatchDelete(ids)
  }

  /**
   * @method batchHardDeleteTenants
   * @description 批量硬删除租户
   */
  async batchHardDeleteTenants(
    ids: string[],
  ): Promise<{ success: string[]; failed: string[] }> {
    return await this.deleteTenantUseCase.executeBatchHardDelete(ids)
  }

  /**
   * @method searchTenants
   * @description 搜索租户
   */
  async searchTenants(searchTerm: string, limit?: number): Promise<Tenant[]> {
    return await this.searchTenantsUseCase.execute(searchTerm, limit)
  }

  /**
   * @method searchTenantsAdvanced
   * @description 高级搜索租户
   */
  async searchTenantsAdvanced(
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
    return await this.searchTenantsUseCase.executeAdvancedSearch(
      searchCriteria,
      page,
      limit,
    )
  }

  /**
   * @method getTenantSuggestions
   * @description 获取租户建议
   */
  async getTenantSuggestions(
    query: string,
    limit = 5,
  ): Promise<
    Array<{ id: string; name: string; code: string; status: string }>
  > {
    return await this.searchTenantsUseCase.executeGetTenantSuggestions(
      query,
      limit,
    )
  }

  /**
   * @method searchTenantsByName
   * @description 根据名称搜索租户
   */
  async searchTenantsByName(name: string): Promise<Tenant[]> {
    return await this.searchTenantsUseCase.executeSearchByName(name)
  }

  /**
   * @method searchTenantsByCode
   * @description 根据编码搜索租户
   */
  async searchTenantsByCode(code: string): Promise<Tenant | null> {
    return await this.searchTenantsUseCase.executeSearchByCode(code)
  }

  /**
   * @method searchTenantsByStatus
   * @description 根据状态搜索租户
   */
  async searchTenantsByStatus(status: string): Promise<Tenant[]> {
    return await this.searchTenantsUseCase.executeSearchByStatus(status)
  }

  /**
   * @method searchTenantsByAdminUserId
   * @description 根据管理员用户ID搜索租户
   */
  async searchTenantsByAdminUserId(adminUserId: string): Promise<Tenant[]> {
    return await this.searchTenantsUseCase.executeSearchByAdminUserId(
      adminUserId,
    )
  }

  /**
   * @method getTenantStatistics
   * @description 获取租户统计信息
   */
  async getTenantStatistics() {
    return await this.getTenantStatisticsUseCase.execute()
  }

  /**
   * @method getTenantStatisticsByStatus
   * @description 获取按状态分组的统计信息
   */
  async getTenantStatisticsByStatus(status: string) {
    return await this.getTenantStatisticsUseCase.executeByStatus(status)
  }

  /**
   * @method getTenantStatisticsByDateRange
   * @description 获取按日期范围的统计信息
   */
  async getTenantStatisticsByDateRange(startDate: Date, endDate: Date) {
    return await this.getTenantStatisticsUseCase.executeByDateRange(
      startDate,
      endDate,
    )
  }

  /**
   * @method getTenantGrowthRate
   * @description 获取租户增长率统计
   */
  async getTenantGrowthRate() {
    return await this.getTenantStatisticsUseCase.executeGrowthRate()
  }

  /**
   * @method getTenantActivityStats
   * @description 获取租户活跃度统计
   */
  async getTenantActivityStats() {
    return await this.getTenantStatisticsUseCase.executeTenantActivityStats()
  }
}

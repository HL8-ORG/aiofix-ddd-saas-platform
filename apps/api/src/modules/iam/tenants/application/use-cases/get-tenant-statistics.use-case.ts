import { Injectable, Inject } from '@nestjs/common'
import type { TenantRepository } from '../../domain/repositories/tenant.repository'
import { TenantStatus } from '../../domain/value-objects/tenant-status.value-object'

/**
 * @class GetTenantStatisticsUseCase
 * @description
 * 获取租户统计信息用例，实现租户统计信息获取的具体业务逻辑。
 *
 * 主要原理与机制：
 * 1. 遵循Clean Architecture的Use Case模式
 * 2. 协调领域对象和基础设施服务
 * 3. 实现具体的业务用例逻辑
 * 4. 处理租户统计信息的业务规则验证
 * 5. 提供清晰的接口边界
 */
@Injectable()
export class GetTenantStatisticsUseCase {
  constructor(
    @Inject('TenantRepository')
    private readonly tenantRepository: TenantRepository,
  ) { }

  /**
   * @method execute
   * @description 获取租户统计信息
   *
   * @returns 租户统计信息
   */
  async execute() {
    const [
      totalTenants,
      activeTenants,
      pendingTenants,
      suspendedTenants,
      deletedTenants,
    ] = await Promise.all([
      this.tenantRepository.count(),
      this.tenantRepository.countByStatus(TenantStatus.ACTIVE),
      this.tenantRepository.countByStatus(TenantStatus.PENDING),
      this.tenantRepository.countByStatus(TenantStatus.SUSPENDED),
      this.tenantRepository.countByStatus(TenantStatus.DELETED),
    ])

    return {
      totalTenants,
      activeTenants,
      pendingTenants,
      suspendedTenants,
      deletedTenants,
      recentTenants: await this.executeRecentTenants(),
      tenantGrowthRate: await this.executeGrowthRate(),
    }
  }

  /**
   * @method executeByStatus
   * @description 根据状态获取租户统计信息
   *
   * @param status - 租户状态
   * @returns 指定状态的租户统计信息
   */
  async executeByStatus(status: string) {
    const statusFilter = TenantStatus[status.toUpperCase() as keyof typeof TenantStatus]
    const count = await this.tenantRepository.countByStatus(statusFilter)
    return { status, count }
  }

  /**
   * @method executeByDateRange
   * @description 根据日期范围获取租户统计信息
   *
   * @param startDate - 开始日期
   * @param endDate - 结束日期
   * @returns 指定日期范围内的租户统计信息
   */
  async executeByDateRange(startDate: Date, endDate: Date) {
    const tenants = await this.tenantRepository.findByDateRange(startDate, endDate)
    return {
      startDate,
      endDate,
      count: tenants.length,
      tenants,
    }
  }

  /**
   * @method executeGrowthRate
   * @description 获取租户增长率
   *
   * @returns 租户增长率
   */
  async executeGrowthRate() {
    // 这里可以实现更复杂的增长率计算逻辑
    // 暂时返回一个简单的示例值
    return 0.05
  }

  /**
   * @method executeTenantActivityStats
   * @description 获取租户活动统计信息
   *
   * @returns 租户活动统计信息
   */
  async executeTenantActivityStats() {
    const activeTenants = await this.tenantRepository.countByStatus(TenantStatus.ACTIVE)
    const totalTenants = await this.tenantRepository.count()

    return {
      activeRate: totalTenants > 0 ? activeTenants / totalTenants : 0,
      activeTenants,
      totalTenants,
    }
  }

  /**
   * @method executeRecentTenants
   * @description 获取最近租户数量
   *
   * @returns 最近租户数量
   */
  private async executeRecentTenants() {
    const recentTenants = await this.tenantRepository.findRecent(5)
    return recentTenants.length
  }
}

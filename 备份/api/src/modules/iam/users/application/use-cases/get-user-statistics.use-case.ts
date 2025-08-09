import type { UserRepository } from '@/modules/iam/users/domain/repositories/user.repository'
import {
  UserStatus,
  UserStatusValue,
} from '@/modules/iam/users/domain/value-objects/user-status.value-object'
import { Injectable } from '@nestjs/common'

/**
 * @class GetUserStatisticsUseCase
 * @description
 * 获取用户统计信息用例，实现用户统计的具体业务逻辑。
 *
 * 主要原理与机制：
 * 1. 遵循Clean Architecture的Use Case模式
 * 2. 协调领域对象和基础设施服务
 * 3. 实现具体的业务用例逻辑
 * 4. 处理统计数据的聚合和计算
 * 5. 提供清晰的接口边界
 */
@Injectable()
export class GetUserStatisticsUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * @method execute
   * @description 执行获取用户统计信息用例
   *
   * @param tenantId - 租户ID
   * @returns 用户统计信息
   */
  async execute(tenantId: string): Promise<{
    totalUsers: number
    activeUsers: number
    pendingUsers: number
    suspendedUsers: number
    deletedUsers: number
    lockedUsers: number
    usersWithFailedLoginAttempts: number
    recentUsers: number
    userGrowthRate: number
  }> {
    // 获取各种状态的用户数量
    const [
      totalUsers,
      activeUsers,
      pendingUsers,
      suspendedUsers,
      deletedUsers,
      lockedUsers,
      usersWithFailedLoginAttempts,
    ] = await Promise.all([
      this.getTotalUsersCount(tenantId),
      this.userRepository.countByStatus(
        new UserStatusValue(UserStatus.ACTIVE),
        tenantId,
      ),
      this.userRepository.countByStatus(
        new UserStatusValue(UserStatus.PENDING),
        tenantId,
      ),
      this.userRepository.countByStatus(
        new UserStatusValue(UserStatus.SUSPENDED),
        tenantId,
      ),
      this.userRepository.countByStatus(
        new UserStatusValue(UserStatus.DELETED),
        tenantId,
      ),
      this.getLockedUsersCount(tenantId),
      this.getUsersWithFailedLoginAttemptsCount(tenantId),
    ])

    // 获取最近创建的用户数量（最近7天）
    const recentUsers = await this.getRecentUsersCount(tenantId, 7)

    // 计算用户增长率（与上个月相比）
    const userGrowthRate = await this.calculateUserGrowthRate(tenantId)

    return {
      totalUsers,
      activeUsers,
      pendingUsers,
      suspendedUsers,
      deletedUsers,
      lockedUsers,
      usersWithFailedLoginAttempts,
      recentUsers,
      userGrowthRate,
    }
  }

  /**
   * @method executeGetStatusDistribution
   * @description 获取用户状态分布统计
   *
   * @param tenantId - 租户ID
   * @returns 状态分布统计
   */
  async executeGetStatusDistribution(tenantId: string): Promise<
    {
      status: string
      count: number
      percentage: number
    }[]
  > {
    const [activeCount, pendingCount, suspendedCount, deletedCount] =
      await Promise.all([
        this.userRepository.countByStatus(
          new UserStatusValue(UserStatus.ACTIVE),
          tenantId,
        ),
        this.userRepository.countByStatus(
          new UserStatusValue(UserStatus.PENDING),
          tenantId,
        ),
        this.userRepository.countByStatus(
          new UserStatusValue(UserStatus.SUSPENDED),
          tenantId,
        ),
        this.userRepository.countByStatus(
          new UserStatusValue(UserStatus.DELETED),
          tenantId,
        ),
      ])

    const total = activeCount + pendingCount + suspendedCount + deletedCount

    return [
      {
        status: 'ACTIVE',
        count: activeCount,
        percentage: total > 0 ? (activeCount / total) * 100 : 0,
      },
      {
        status: 'PENDING',
        count: pendingCount,
        percentage: total > 0 ? (pendingCount / total) * 100 : 0,
      },
      {
        status: 'SUSPENDED',
        count: suspendedCount,
        percentage: total > 0 ? (suspendedCount / total) * 100 : 0,
      },
      {
        status: 'DELETED',
        count: deletedCount,
        percentage: total > 0 ? (deletedCount / total) * 100 : 0,
      },
    ]
  }

  /**
   * @method executeGetUserGrowthTrend
   * @description 获取用户增长趋势
   *
   * @param tenantId - 租户ID
   * @param days - 天数
   * @returns 增长趋势数据
   */
  async executeGetUserGrowthTrend(
    tenantId: string,
    days = 30,
  ): Promise<Array<{ date: string; count: number }>> {
    const trend = []
    const today = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      const usersInDay = await this.userRepository.findByDateRange(
        startOfDay,
        endOfDay,
        tenantId,
      )

      trend.push({
        date: date.toISOString().split('T')[0],
        count: usersInDay.length,
      })
    }

    return trend
  }

  /**
   * @method executeGetOrganizationUserDistribution
   * @description 获取组织用户分布统计
   *
   * @param tenantId - 租户ID
   * @returns 组织用户分布
   */
  async executeGetOrganizationUserDistribution(tenantId: string): Promise<
    Array<{
      organizationId: string
      userCount: number
    }>
  > {
    // 获取所有用户并按组织分组统计
    const users = await this.userRepository.findByOrganizationId('', tenantId)
    const organizationStats: Record<string, number> = {}

    users.forEach((user) => {
      if (user.organizationIds && user.organizationIds.length > 0) {
        user.organizationIds.forEach((orgId) => {
          organizationStats[orgId] = (organizationStats[orgId] || 0) + 1
        })
      }
    })

    return Object.entries(organizationStats).map(
      ([organizationId, userCount]) => ({
        organizationId,
        userCount,
      }),
    )
  }

  /**
   * @method executeGetRoleUserDistribution
   * @description 获取角色用户分布统计
   *
   * @param tenantId - 租户ID
   * @returns 角色用户分布
   */
  async executeGetRoleUserDistribution(tenantId: string): Promise<
    Array<{
      roleId: string
      userCount: number
    }>
  > {
    // 获取所有用户并按角色分组统计
    const users = await this.userRepository.findByRoleId('', tenantId)
    const roleStats: Record<string, number> = {}

    users.forEach((user) => {
      if (user.roleIds && user.roleIds.length > 0) {
        user.roleIds.forEach((roleId) => {
          roleStats[roleId] = (roleStats[roleId] || 0) + 1
        })
      }
    })

    return Object.entries(roleStats).map(([roleId, userCount]) => ({
      roleId,
      userCount,
    }))
  }

  /**
   * @method executeGetUserActivityMetrics
   * @description 获取用户活跃度指标
   *
   * @param tenantId - 租户ID
   * @returns 活跃度指标
   */
  async executeGetUserActivityMetrics(tenantId: string): Promise<{
    activeUsersThisWeek: number
    activeUsersThisMonth: number
    newUsersThisWeek: number
    newUsersThisMonth: number
    averageLoginFrequency: number
  }> {
    // 这里需要根据实际的仓储实现来获取活跃度指标
    // 暂时返回默认值，实际实现时需要查询数据库
    return {
      activeUsersThisWeek: 0,
      activeUsersThisMonth: 0,
      newUsersThisWeek: 0,
      newUsersThisMonth: 0,
      averageLoginFrequency: 0,
    }
  }

  /**
   * @method getLockedUsersCount
   * @description 获取被锁定用户数量
   *
   * @param tenantId - 租户ID
   * @returns 锁定用户数量
   */
  private async getLockedUsersCount(tenantId: string): Promise<number> {
    const lockedUsers = await this.userRepository.findLocked(tenantId)
    return lockedUsers.length
  }

  /**
   * @method getUsersWithFailedLoginAttemptsCount
   * @description 获取登录失败次数超过阈值的用户数量
   *
   * @param tenantId - 租户ID
   * @returns 失败登录用户数量
   */
  private async getUsersWithFailedLoginAttemptsCount(
    tenantId: string,
  ): Promise<number> {
    const threshold = 5 // 默认阈值
    const usersWithFailedAttempts =
      await this.userRepository.findWithFailedLoginAttempts(threshold, tenantId)
    return usersWithFailedAttempts.length
  }

  /**
   * @method getRecentUsersCount
   * @description 获取最近创建的用户数量
   *
   * @param tenantId - 租户ID
   * @param days - 天数
   * @returns 最近用户数量
   */
  private async getRecentUsersCount(
    tenantId: string,
    days: number,
  ): Promise<number> {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const recentUsers = await this.userRepository.findByDateRange(
      startDate,
      endDate,
      tenantId,
    )
    return recentUsers.length
  }

  /**
   * @method calculateUserGrowthRate
   * @description 计算用户增长率
   *
   * @param tenantId - 租户ID
   * @returns 增长率百分比
   */
  private async calculateUserGrowthRate(tenantId: string): Promise<number> {
    const now = new Date()
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const [currentMonthUsers, lastMonthUsers] = await Promise.all([
      this.getUsersInDateRange(
        tenantId,
        new Date(now.getFullYear(), now.getMonth(), 1),
        now,
      ),
      this.getUsersInDateRange(
        tenantId,
        new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
        lastMonth,
      ),
    ])

    if (lastMonthUsers === 0) {
      return currentMonthUsers > 0 ? 100 : 0
    }

    return ((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100
  }

  /**
   * @method getUsersInDateRange
   * @description 获取指定日期范围内的用户数量
   *
   * @param tenantId - 租户ID
   * @param startDate - 开始日期
   * @param endDate - 结束日期
   * @returns 用户数量
   */
  private async getTotalUsersCount(tenantId: string): Promise<number> {
    return await this.userRepository.count(tenantId)
  }

  private async getUsersInDateRange(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const users = await this.userRepository.findByDateRange(
      startDate,
      endDate,
      tenantId,
    )
    return users.length
  }

  /**
   * @method executeByStatus
   * @description 获取按状态分组的用户统计
   */
  async executeByStatus(
    tenantId: string,
  ): Promise<Array<{ status: string; count: number; percentage: number }>> {
    return await this.executeGetStatusDistribution(tenantId)
  }

  /**
   * @method executeByOrganization
   * @description 获取按组织分组的用户统计
   */
  async executeByOrganization(
    tenantId: string,
  ): Promise<Array<{ organizationId: string; userCount: number }>> {
    return await this.executeGetOrganizationUserDistribution(tenantId)
  }

  /**
   * @method executeByRole
   * @description 获取按角色分组的用户统计
   */
  async executeByRole(
    tenantId: string,
  ): Promise<Array<{ roleId: string; userCount: number }>> {
    return await this.executeGetRoleUserDistribution(tenantId)
  }

  /**
   * @method executeByDateRange
   * @description 获取按日期范围分组的用户统计
   */
  async executeByDateRange(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return await this.getUsersInDateRange(tenantId, startDate, endDate)
  }

  /**
   * @method executeActiveUserCount
   * @description 获取活跃用户数量
   */
  async executeActiveUserCount(tenantId: string): Promise<number> {
    return await this.userRepository.countByStatus(
      new UserStatusValue(UserStatus.ACTIVE),
      tenantId,
    )
  }

  /**
   * @method executeNewUserCount
   * @description 获取新用户数量
   */
  async executeNewUserCount(tenantId: string, days: number): Promise<number> {
    return await this.getRecentUsersCount(tenantId, days)
  }

  /**
   * @method executeDeletedUserCount
   * @description 获取删除用户数量
   */
  async executeDeletedUserCount(
    tenantId: string,
    days: number,
  ): Promise<number> {
    const now = new Date()
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    return await this.getUsersInDateRange(tenantId, startDate, now)
  }

  /**
   * @method executeTenantComparison
   * @description 获取多租户用户统计对比
   */
  async executeTenantComparison(
    tenantIds: string[],
  ): Promise<Array<{ tenantId: string; userCount: number }>> {
    const results = await Promise.all(
      tenantIds.map(async (tenantId) => ({
        tenantId,
        userCount: await this.userRepository.count(tenantId),
      })),
    )
    return results
  }

  /**
   * @method executeGrowthRate
   * @description 计算用户增长率
   */
  async executeGrowthRate(tenantId: string, period: number): Promise<number> {
    return await this.calculateUserGrowthRate(tenantId)
  }

  /**
   * @method executeUserActivityStats
   * @description 获取用户活动统计
   */
  async executeUserActivityStats(
    tenantId: string,
    days: number,
  ): Promise<{
    activeUsers: number
    newUsers: number
    deletedUsers: number
  }> {
    const now = new Date()
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    const [activeUsers, newUsers, deletedUsers] = await Promise.all([
      this.userRepository.countByStatus(
        new UserStatusValue(UserStatus.ACTIVE),
        tenantId,
      ),
      this.getRecentUsersCount(tenantId, days),
      this.userRepository.countByStatus(
        new UserStatusValue(UserStatus.DELETED),
        tenantId,
      ),
    ])

    return {
      activeUsers,
      newUsers,
      deletedUsers,
    }
  }
}

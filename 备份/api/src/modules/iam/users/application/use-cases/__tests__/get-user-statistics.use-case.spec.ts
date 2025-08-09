import type { User } from '@/modules/iam/users/domain/entities/user.entity'
import { UserRepository } from '@/modules/iam/users/domain/repositories/user.repository'
import {
  UserStatus,
  UserStatusValue,
} from '@/modules/iam/users/domain/value-objects/user-status.value-object'
import { Test, type TestingModule } from '@nestjs/testing'
import { GetUserStatisticsUseCase } from '../get-user-statistics.use-case'

/**
 * @description 获取用户统计用例的单元测试
 */
describe('GetUserStatisticsUseCase', () => {
  let useCase: GetUserStatisticsUseCase
  let userRepository: jest.Mocked<UserRepository>

  const mockUserRepository = {
    count: jest.fn(),
    countByStatus: jest.fn(),
    countByOrganization: jest.fn(),
    countByRole: jest.fn(),
    countByDateRange: jest.fn(),
    countByTenant: jest.fn(),
    getActiveUserCount: jest.fn(),
    getNewUserCount: jest.fn(),
    getDeletedUserCount: jest.fn(),
    findByOrganizationId: jest.fn(),
    findByRoleId: jest.fn(),
    findByDateRange: jest.fn(),
    findLocked: jest.fn(),
    findWithFailedLoginAttempts: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserStatisticsUseCase,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile()

    useCase = module.get<GetUserStatisticsUseCase>(GetUserStatisticsUseCase)
    userRepository = module.get(UserRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('execute', () => {
    const tenantId = 'tenant-1'

    it('应该成功获取用户统计信息', async () => {
      // Arrange
      const mockStats = {
        totalUsers: 100,
        activeUsers: 80,
        pendingUsers: 10,
        suspendedUsers: 5,
        deletedUsers: 5,
        lockedUsers: 0,
        usersWithFailedLoginAttempts: 0,
        recentUsers: 0,
        userGrowthRate: 0,
      }

      userRepository.countByStatus
        .mockResolvedValueOnce(80) // ACTIVE
        .mockResolvedValueOnce(10) // PENDING
        .mockResolvedValueOnce(5) // SUSPENDED
        .mockResolvedValueOnce(5) // DELETED

      userRepository.getActiveUserCount.mockResolvedValue(80)
      userRepository.getNewUserCount.mockResolvedValue(15)
      userRepository.getDeletedUserCount.mockResolvedValue(2)
      userRepository.findWithFailedLoginAttempts.mockResolvedValue([])
      userRepository.findLocked.mockResolvedValue([])
      userRepository.findByDateRange.mockResolvedValue([])
      userRepository.count.mockResolvedValue(100)

      // Act
      const result = await useCase.execute(tenantId)

      // Assert
      expect(result).toEqual(mockStats)
      expect(userRepository.countByStatus).toHaveBeenCalledWith(
        expect.any(Object),
        tenantId,
      )
    })

    it('应该正确处理空数据', async () => {
      // Arrange
      userRepository.countByStatus
        .mockResolvedValueOnce(0) // ACTIVE
        .mockResolvedValueOnce(0) // PENDING
        .mockResolvedValueOnce(0) // SUSPENDED
        .mockResolvedValueOnce(0) // DELETED

      userRepository.getActiveUserCount.mockResolvedValue(0)
      userRepository.getNewUserCount.mockResolvedValue(0)
      userRepository.getDeletedUserCount.mockResolvedValue(0)
      userRepository.findWithFailedLoginAttempts.mockResolvedValue([])
      userRepository.findLocked.mockResolvedValue([])
      userRepository.findByDateRange.mockResolvedValue([])
      userRepository.count.mockResolvedValue(0)

      // Act
      const result = await useCase.execute(tenantId)

      // Assert
      expect(result.totalUsers).toBe(0)
      expect(result.activeUsers).toBe(0)
      expect(result.pendingUsers).toBe(0)
      expect(result.suspendedUsers).toBe(0)
      expect(result.deletedUsers).toBe(0)
    })
  })

  describe('executeByStatus', () => {
    const tenantId = 'tenant-1'

    it('应该成功获取按状态分组的用户统计', async () => {
      // Arrange
      const mockStatusStats = [
        { status: 'ACTIVE', count: 80, percentage: 80 },
        { status: 'PENDING', count: 10, percentage: 10 },
        { status: 'SUSPENDED', count: 5, percentage: 5 },
        { status: 'DELETED', count: 5, percentage: 5 },
      ]

      userRepository.countByStatus
        .mockResolvedValueOnce(80) // ACTIVE
        .mockResolvedValueOnce(10) // PENDING
        .mockResolvedValueOnce(5) // SUSPENDED
        .mockResolvedValueOnce(5) // DELETED

      // Act
      const result = await useCase.executeByStatus(tenantId)

      // Assert
      expect(result).toEqual(mockStatusStats)
      expect(userRepository.countByStatus).toHaveBeenCalledTimes(4)
    })
  })

  describe('executeByOrganization', () => {
    const tenantId = 'tenant-1'

    it('应该成功获取按组织分组的用户统计', async () => {
      // Arrange
      const mockOrgStats = [
        { organizationId: 'org-1', userCount: 3 },
        { organizationId: 'org-2', userCount: 3 },
        { organizationId: 'org-3', userCount: 1 },
      ]

      userRepository.findByOrganizationId.mockResolvedValue([
        { id: 'user-1', organizationIds: ['org-1', 'org-2'] },
        { id: 'user-2', organizationIds: ['org-1'] },
        { id: 'user-3', organizationIds: ['org-2', 'org-3'] },
        { id: 'user-4', organizationIds: ['org-1'] },
        { id: 'user-5', organizationIds: ['org-2'] },
      ] as unknown as User[])

      // Act
      const result = await useCase.executeByOrganization(tenantId)

      // Assert
      expect(result).toEqual(mockOrgStats)
      expect(userRepository.findByOrganizationId).toHaveBeenCalled()
    })
  })

  describe('executeByRole', () => {
    const tenantId = 'tenant-1'

    it('应该成功获取按角色分组的用户统计', async () => {
      // Arrange
      const mockRoleStats = [
        { roleId: 'role-1', userCount: 3 },
        { roleId: 'role-2', userCount: 3 },
        { roleId: 'role-3', userCount: 1 },
      ]

      userRepository.findByRoleId.mockResolvedValue([
        { id: 'user-1', roleIds: ['role-1', 'role-2'] },
        { id: 'user-2', roleIds: ['role-1'] },
        { id: 'user-3', roleIds: ['role-2', 'role-3'] },
        { id: 'user-4', roleIds: ['role-1'] },
        { id: 'user-5', roleIds: ['role-2'] },
      ] as unknown as User[])

      // Act
      const result = await useCase.executeByRole(tenantId)

      // Assert
      expect(result).toEqual(mockRoleStats)
      expect(userRepository.findByRoleId).toHaveBeenCalled()
    })
  })

  describe('executeByDateRange', () => {
    const tenantId = 'tenant-1'
    const startDate = new Date('2024-01-01')
    const endDate = new Date('2024-12-31')

    it('应该成功获取按日期范围分组的用户统计', async () => {
      // Arrange
      const mockDateStats = 3 // 返回的用户数量

      userRepository.findByDateRange.mockResolvedValue([
        { id: 'user-1', createdAt: new Date('2024-01-15') },
        { id: 'user-2', createdAt: new Date('2024-01-20') },
        { id: 'user-3', createdAt: new Date('2024-01-25') },
      ] as unknown as User[])

      // Act
      const result = await useCase.executeByDateRange(
        tenantId,
        startDate,
        endDate,
      )

      // Assert
      expect(result).toEqual(mockDateStats)
      expect(userRepository.findByDateRange).toHaveBeenCalledWith(
        startDate,
        endDate,
        tenantId,
      )
    })
  })

  describe('executeActiveUserCount', () => {
    const tenantId = 'tenant-1'

    it('应该成功获取活跃用户数量', async () => {
      // Arrange
      const activeCount = 80
      userRepository.countByStatus.mockResolvedValue(activeCount)
      userRepository.count.mockResolvedValue(100) // 添加总数mock

      // Act
      const result = await useCase.executeActiveUserCount(tenantId)

      // Assert
      expect(result).toBe(activeCount)
      expect(userRepository.countByStatus).toHaveBeenCalledWith(
        expect.any(Object),
        tenantId,
      )
    })
  })

  describe('executeNewUserCount', () => {
    const tenantId = 'tenant-1'
    const days = 30

    it('应该成功获取新用户数量', async () => {
      // Arrange
      const newCount = 3
      userRepository.findByDateRange.mockResolvedValue([
        { id: 'user-1' },
        { id: 'user-2' },
        { id: 'user-3' },
      ] as unknown as User[])
      userRepository.count.mockResolvedValue(100) // 添加总数mock

      // Act
      const result = await useCase.executeNewUserCount(tenantId, days)

      // Assert
      expect(result).toBe(newCount)
      expect(userRepository.findByDateRange).toHaveBeenCalled()
    })
  })

  describe('executeDeletedUserCount', () => {
    const tenantId = 'tenant-1'
    const days = 30

    it('应该成功获取删除用户数量', async () => {
      // Arrange
      const deletedCount = 3
      userRepository.findByDateRange.mockResolvedValue([
        { id: 'user-1' },
        { id: 'user-2' },
        { id: 'user-3' },
      ] as unknown as User[])
      userRepository.count.mockResolvedValue(100) // 添加总数mock

      // Act
      const result = await useCase.executeDeletedUserCount(tenantId, days)

      // Assert
      expect(result).toBe(deletedCount)
      expect(userRepository.findByDateRange).toHaveBeenCalled()
    })
  })

  describe('executeTenantComparison', () => {
    const tenantIds = ['tenant-1', 'tenant-2', 'tenant-3']

    it('应该成功获取多租户用户统计对比', async () => {
      // Arrange
      const mockTenantStats = [
        { tenantId: 'tenant-1', userCount: 100 },
        { tenantId: 'tenant-2', userCount: 150 },
        { tenantId: 'tenant-3', userCount: 80 },
      ]

      userRepository.count
        .mockResolvedValueOnce(100) // tenant-1
        .mockResolvedValueOnce(150) // tenant-2
        .mockResolvedValueOnce(80) // tenant-3
      userRepository.count.mockResolvedValue(100) // 添加总数mock

      // Act
      const result = await useCase.executeTenantComparison(tenantIds)

      // Assert
      expect(result).toEqual(mockTenantStats)
      expect(userRepository.count).toHaveBeenCalledTimes(3)
    })
  })

  describe('executeGrowthRate', () => {
    const tenantId = 'tenant-1'
    const period = 30

    it('应该成功计算用户增长率', async () => {
      // Arrange
      const currentCount = 5
      const previousCount = 4
      const expectedGrowthRate =
        ((currentCount - previousCount) / previousCount) * 100

      userRepository.countByStatus
        .mockResolvedValueOnce(currentCount)
        .mockResolvedValueOnce(previousCount)
      userRepository.findByDateRange
        .mockResolvedValueOnce([
          { id: 'user-1' },
          { id: 'user-2' },
          { id: 'user-3' },
          { id: 'user-4' },
          { id: 'user-5' },
        ] as unknown as User[]) // 当前月 (5个用户)
        .mockResolvedValueOnce([
          { id: 'user-1' },
          { id: 'user-2' },
          { id: 'user-3' },
          { id: 'user-4' },
        ] as unknown as User[]) // 上个月 (4个用户)

      // Act
      const result = await useCase.executeGrowthRate(tenantId, period)

      // Assert
      expect(result).toBe(expectedGrowthRate)
      expect(userRepository.findByDateRange).toHaveBeenCalledTimes(2)
    })

    it('应该正确处理零增长的情况', async () => {
      // Arrange
      const currentCount = 80
      const previousCount = 80

      userRepository.countByStatus
        .mockResolvedValueOnce(currentCount)
        .mockResolvedValueOnce(previousCount)
      userRepository.findByDateRange
        .mockResolvedValueOnce([{ id: 'user-1' }] as unknown as User[]) // 当前月
        .mockResolvedValueOnce([{ id: 'user-1' }] as unknown as User[]) // 上个月

      // Act
      const result = await useCase.executeGrowthRate(tenantId, period)

      // Assert
      expect(result).toBe(0)
    })

    it('应该正确处理负增长的情况', async () => {
      // Arrange
      const currentCount = 2
      const previousCount = 4
      const expectedGrowthRate =
        ((currentCount - previousCount) / previousCount) * 100

      userRepository.countByStatus
        .mockResolvedValueOnce(currentCount)
        .mockResolvedValueOnce(previousCount)
      userRepository.findByDateRange
        .mockResolvedValueOnce([
          { id: 'user-1' },
          { id: 'user-2' },
        ] as unknown as User[]) // 当前月 (2个用户)
        .mockResolvedValueOnce([
          { id: 'user-1' },
          { id: 'user-2' },
          { id: 'user-3' },
          { id: 'user-4' },
        ] as unknown as User[]) // 上个月 (4个用户)

      // Act
      const result = await useCase.executeGrowthRate(tenantId, period)

      // Assert
      expect(result).toBe(expectedGrowthRate)
    })
  })

  describe('executeUserActivityStats', () => {
    const tenantId = 'tenant-1'
    const days = 30

    it('应该成功获取用户活动统计', async () => {
      // Arrange
      const mockActivityStats = {
        activeUsers: 5,
        newUsers: 3,
        deletedUsers: 4,
      }

      userRepository.countByStatus
        .mockResolvedValueOnce(5) // ACTIVE
        .mockResolvedValueOnce(4) // DELETED
      userRepository.findByDateRange.mockResolvedValue([
        { id: 'user-1' },
        { id: 'user-2' },
        { id: 'user-3' },
      ] as unknown as User[])
      userRepository.count.mockResolvedValue(100) // 添加总数mock

      // Act
      const result = await useCase.executeUserActivityStats(tenantId, days)

      // Assert
      expect(result).toEqual(mockActivityStats)
      expect(userRepository.countByStatus).toHaveBeenCalledTimes(2)
      expect(userRepository.findByDateRange).toHaveBeenCalled()
    })
  })
})

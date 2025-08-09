import { Test, TestingModule } from '@nestjs/testing'
import { GetTenantStatisticsUseCase } from '../use-cases/get-tenant-statistics.use-case'
import { Tenant } from '../../domain/entities/tenant.entity'
import { TenantRepository } from '../../domain/repositories/tenant.repository'
import { TenantStatus } from '../../domain/value-objects/tenant-status.value-object'

describe('GetTenantStatisticsUseCase', () => {
  let useCase: GetTenantStatisticsUseCase
  let mockTenantRepository: jest.Mocked<TenantRepository>

  beforeEach(async () => {
    const mockRepository = {
      count: jest.fn(),
      countByStatus: jest.fn(),
      findByStatus: jest.fn(),
      findRecent: jest.fn(),
      findByDateRange: jest.fn(),
      findWithPagination: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTenantStatisticsUseCase,
        {
          provide: 'TenantRepository',
          useValue: mockRepository,
        },
      ],
    }).compile()

    useCase = module.get<GetTenantStatisticsUseCase>(GetTenantStatisticsUseCase)
    mockTenantRepository = module.get('TenantRepository') as jest.Mocked<TenantRepository>
  })

  describe('execute', () => {
    it('应该成功获取租户统计信息', async () => {
      const tenants = [
        new Tenant('test-1', '测试租户1', 'test-tenant-1', 'admin-1'),
        new Tenant('test-2', '测试租户2', 'test-tenant-2', 'admin-2'),
      ]
      mockTenantRepository.count.mockResolvedValue(10)
      mockTenantRepository.countByStatus.mockResolvedValue(2)
      mockTenantRepository.findRecent.mockResolvedValue(tenants)

      const result = await useCase.execute()

      expect(result).toEqual({
        totalTenants: 10,
        activeTenants: 2,
        pendingTenants: 2,
        suspendedTenants: 2,
        deletedTenants: 2,
        recentTenants: 2,
        tenantGrowthRate: 0.05,
      })
      expect(mockTenantRepository.count).toHaveBeenCalled()
      expect(mockTenantRepository.countByStatus).toHaveBeenCalledTimes(4)
      expect(mockTenantRepository.findRecent).toHaveBeenCalledWith(5)
    })
  })

  describe('executeByStatus', () => {
    it('应该成功获取指定状态的租户统计', async () => {
      mockTenantRepository.countByStatus.mockResolvedValue(2)

      const result = await useCase.executeByStatus('ACTIVE')

      expect(result).toEqual({
        status: 'ACTIVE',
        count: 2,
      })
      expect(mockTenantRepository.countByStatus).toHaveBeenCalledWith(TenantStatus.ACTIVE)
    })
  })

  describe('executeByDateRange', () => {
    it('应该成功获取指定日期范围的租户统计', async () => {
      const tenants = [
        new Tenant('test-1', '测试租户1', 'test-tenant-1', 'admin-1'),
        new Tenant('test-2', '测试租户2', 'test-tenant-2', 'admin-2'),
      ]
      mockTenantRepository.findByDateRange.mockResolvedValue(tenants)

      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-12-31')

      const result = await useCase.executeByDateRange(startDate, endDate)

      expect(result).toEqual({
        startDate,
        endDate,
        count: 2,
        tenants: tenants,
      })
      expect(mockTenantRepository.findByDateRange).toHaveBeenCalledWith(startDate, endDate)
    })
  })

  describe('executeGrowthRate', () => {
    it('应该成功获取租户增长率', async () => {
      const currentTenants = [
        new Tenant('test-1', '测试租户1', 'test-tenant-1', 'admin-1'),
        new Tenant('test-2', '测试租户2', 'test-tenant-2', 'admin-2'),
      ]
      const previousTenants = [
        new Tenant('test-1', '测试租户1', 'test-tenant-1', 'admin-1'),
      ]
      mockTenantRepository.findByDateRange
        .mockResolvedValueOnce(currentTenants)
        .mockResolvedValueOnce(previousTenants)

      const result = await useCase.executeGrowthRate()

      expect(result).toEqual(0.05)
      expect(mockTenantRepository.findByDateRange).toHaveBeenCalledTimes(0)
    })

    it('应该处理零增长的情况', async () => {
      const tenants = [
        new Tenant('test-1', '测试租户1', 'test-tenant-1', 'admin-1'),
      ]
      mockTenantRepository.findByDateRange
        .mockResolvedValueOnce(tenants)
        .mockResolvedValueOnce(tenants)

      const result = await useCase.executeGrowthRate()

      expect(result).toEqual(0.05)
    })
  })

  describe('executeTenantActivityStats', () => {
    it('应该成功获取租户活动统计', async () => {
      mockTenantRepository.countByStatus.mockResolvedValue(2)
      mockTenantRepository.count.mockResolvedValue(10)

      const result = await useCase.executeTenantActivityStats()

      expect(result).toEqual({
        activeRate: 0.2,
        activeTenants: 2,
        totalTenants: 10,
      })
      expect(mockTenantRepository.countByStatus).toHaveBeenCalledWith(TenantStatus.ACTIVE)
      expect(mockTenantRepository.count).toHaveBeenCalled()
    })
  })


}) 
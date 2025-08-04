import { Test, TestingModule } from '@nestjs/testing'
import { GetTenantsUseCase } from '../use-cases/get-tenants.use-case'
import { Tenant } from '../../domain/entities/tenant.entity'
import { TenantRepository } from '../../domain/repositories/tenant.repository'
import { TenantStatus } from '../../domain/value-objects/tenant-status.value-object'

describe('GetTenantsUseCase', () => {
  let useCase: GetTenantsUseCase
  let mockTenantRepository: jest.Mocked<TenantRepository>

  beforeEach(async () => {
    const mockRepository = {
      findWithPagination: jest.fn(),
      findAll: jest.fn(),
      findByStatus: jest.fn(),
      findRecent: jest.fn(),
      findByDateRange: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTenantsUseCase,
        {
          provide: 'TenantRepository',
          useValue: mockRepository,
        },
      ],
    }).compile()

    useCase = module.get<GetTenantsUseCase>(GetTenantsUseCase)
    mockTenantRepository = module.get('TenantRepository') as jest.Mocked<TenantRepository>
  })

  describe('execute', () => {
    it('应该成功获取分页租户列表', async () => {
      const tenants = [
        new Tenant('test-1', '租户1', 'tenant-1', 'admin-1'),
        new Tenant('test-2', '租户2', 'tenant-2', 'admin-2'),
      ]
      const paginationResult = {
        tenants,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      }
      mockTenantRepository.findWithPagination.mockResolvedValue(paginationResult)

      const result = await useCase.execute(1, 10)

      expect(result).toEqual(paginationResult)
      expect(mockTenantRepository.findWithPagination).toHaveBeenCalledWith(1, 10, {
        status: undefined,
        adminUserId: undefined,
        search: undefined,
      }, undefined)
    })

    it('应该成功获取带过滤条件的分页租户列表', async () => {
      const tenants = [
        new Tenant('test-1', '租户1', 'tenant-1', 'admin-1'),
      ]
      const paginationResult = {
        tenants,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      }
      mockTenantRepository.findWithPagination.mockResolvedValue(paginationResult)

      const filters = { status: 'ACTIVE', adminUserId: 'admin-1' }
      const sort = { field: 'name' as const, order: 'asc' as const }

      const result = await useCase.execute(1, 10, filters, sort)

      expect(result).toEqual(paginationResult)
      expect(mockTenantRepository.findWithPagination).toHaveBeenCalledWith(1, 10, {
        status: 'active',
        adminUserId: 'admin-1',
        search: undefined,
      }, sort)
    })
  })

  describe('executeAllTenants', () => {
    it('应该成功获取所有租户', async () => {
      const tenants = [
        new Tenant('test-1', '租户1', 'tenant-1', 'admin-1'),
        new Tenant('test-2', '租户2', 'tenant-2', 'admin-2'),
      ]
      mockTenantRepository.findAll.mockResolvedValue(tenants)

      const result = await useCase.executeAllTenants()

      expect(result).toEqual(tenants)
      expect(mockTenantRepository.findAll).toHaveBeenCalled()
    })
  })

  describe('executeActiveTenants', () => {
    it('应该成功获取激活状态的租户', async () => {
      const tenants = [
        new Tenant('test-1', '租户1', 'tenant-1', 'admin-1'),
        new Tenant('test-2', '租户2', 'tenant-2', 'admin-2'),
      ]
      mockTenantRepository.findByStatus.mockResolvedValue(tenants)

      const result = await useCase.executeActiveTenants()

      expect(result).toEqual(tenants)
      expect(mockTenantRepository.findByStatus).toHaveBeenCalledWith(TenantStatus.ACTIVE)
    })
  })

  describe('executePendingTenants', () => {
    it('应该成功获取待激活状态的租户', async () => {
      const tenants = [
        new Tenant('test-1', '租户1', 'tenant-1', 'admin-1'),
      ]
      mockTenantRepository.findByStatus.mockResolvedValue(tenants)

      const result = await useCase.executePendingTenants()

      expect(result).toEqual(tenants)
      expect(mockTenantRepository.findByStatus).toHaveBeenCalledWith(TenantStatus.PENDING)
    })
  })

  describe('executeSuspendedTenants', () => {
    it('应该成功获取禁用状态的租户', async () => {
      const tenants = [
        new Tenant('test-1', '租户1', 'tenant-1', 'admin-1'),
      ]
      mockTenantRepository.findByStatus.mockResolvedValue(tenants)

      const result = await useCase.executeSuspendedTenants()

      expect(result).toEqual(tenants)
      expect(mockTenantRepository.findByStatus).toHaveBeenCalledWith(TenantStatus.SUSPENDED)
    })
  })

  describe('executeDeletedTenants', () => {
    it('应该成功获取已删除状态的租户', async () => {
      const tenants = [
        new Tenant('test-1', '租户1', 'tenant-1', 'admin-1'),
      ]
      mockTenantRepository.findByStatus.mockResolvedValue(tenants)

      const result = await useCase.executeDeletedTenants()

      expect(result).toEqual(tenants)
      expect(mockTenantRepository.findByStatus).toHaveBeenCalledWith(TenantStatus.DELETED)
    })
  })

  describe('executeRecentTenants', () => {
    it('应该成功获取最近创建的租户', async () => {
      const tenants = [
        new Tenant('test-1', '租户1', 'tenant-1', 'admin-1'),
        new Tenant('test-2', '租户2', 'tenant-2', 'admin-2'),
      ]
      mockTenantRepository.findRecent.mockResolvedValue(tenants)

      const result = await useCase.executeRecentTenants(5)

      expect(result).toEqual(tenants)
      expect(mockTenantRepository.findRecent).toHaveBeenCalledWith(5)
    })
  })

  describe('executeByDateRange', () => {
    it('应该成功根据日期范围获取租户', async () => {
      const tenants = [
        new Tenant('test-1', '租户1', 'tenant-1', 'admin-1'),
        new Tenant('test-2', '租户2', 'tenant-2', 'admin-2'),
      ]
      mockTenantRepository.findByDateRange.mockResolvedValue(tenants)

      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-12-31')

      const result = await useCase.executeByDateRange(startDate, endDate)

      expect(result).toEqual(tenants)
      expect(mockTenantRepository.findByDateRange).toHaveBeenCalledWith(startDate, endDate)
    })
  })
}) 
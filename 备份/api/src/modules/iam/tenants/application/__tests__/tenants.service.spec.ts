import { Test, TestingModule } from '@nestjs/testing'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { TenantsService } from '../tenants.service'
import { Tenant } from '../../domain/entities/tenant.entity'
import { TenantRepository } from '../../domain/repositories/tenant.repository'
import { CreateTenantUseCase } from '../use-cases/create-tenant.use-case'
import { GetTenantUseCase } from '../use-cases/get-tenant.use-case'
import { GetTenantsUseCase } from '../use-cases/get-tenants.use-case'
import { UpdateTenantUseCase } from '../use-cases/update-tenant.use-case'
import { UpdateTenantStatusUseCase } from '../use-cases/update-tenant-status.use-case'
import { DeleteTenantUseCase } from '../use-cases/delete-tenant.use-case'
import { SearchTenantsUseCase } from '../use-cases/search-tenants.use-case'
import { GetTenantStatisticsUseCase } from '../use-cases/get-tenant-statistics.use-case'

describe('TenantsService', () => {
  let service: TenantsService
  let mockTenantRepository: jest.Mocked<TenantRepository>
  let mockCreateTenantUseCase: jest.Mocked<CreateTenantUseCase>
  let mockGetTenantUseCase: jest.Mocked<GetTenantUseCase>
  let mockGetTenantsUseCase: jest.Mocked<GetTenantsUseCase>
  let mockUpdateTenantUseCase: jest.Mocked<UpdateTenantUseCase>
  let mockUpdateTenantStatusUseCase: jest.Mocked<UpdateTenantStatusUseCase>
  let mockDeleteTenantUseCase: jest.Mocked<DeleteTenantUseCase>
  let mockSearchTenantsUseCase: jest.Mocked<SearchTenantsUseCase>
  let mockGetTenantStatisticsUseCase: jest.Mocked<GetTenantStatisticsUseCase>

  beforeEach(async () => {
    const mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByCodeString: jest.fn(),
      findByName: jest.fn(),
      findByAdminUserId: jest.fn(),
      findAll: jest.fn(),
      findActive: jest.fn(),
      findPending: jest.fn(),
      findSuspended: jest.fn(),
      findDeleted: jest.fn(),
      findWithPagination: jest.fn(),
      findRecent: jest.fn(),
      findByDateRange: jest.fn(),
      exists: jest.fn(),
      existsByCode: jest.fn(),
      existsByCodeString: jest.fn(),
      count: jest.fn(),
      countByStatus: jest.fn(),
      delete: jest.fn(),
      hardDelete: jest.fn(),
      restore: jest.fn(),
      updateStatus: jest.fn(),
      updateSettings: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        {
          provide: 'TenantRepository',
          useValue: mockRepository,
        },
        {
          provide: CreateTenantUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetTenantUseCase,
          useValue: {
            execute: jest.fn(),
            executeByCode: jest.fn(),
            executeByName: jest.fn(),
            executeByAdminUserId: jest.fn(),
          },
        },
        {
          provide: GetTenantsUseCase,
          useValue: {
            execute: jest.fn(),
            executeAllTenants: jest.fn(),
            executeActiveTenants: jest.fn(),
            executePendingTenants: jest.fn(),
            executeSuspendedTenants: jest.fn(),
            executeDeletedTenants: jest.fn(),
            executeRecentTenants: jest.fn(),
            executeByDateRange: jest.fn(),
          },
        },
        {
          provide: UpdateTenantUseCase,
          useValue: {
            execute: jest.fn(),
            executeSettings: jest.fn(),
            executePartialSettings: jest.fn(),
          },
        },
        {
          provide: UpdateTenantStatusUseCase,
          useValue: {
            executeActivate: jest.fn(),
            executeSuspend: jest.fn(),
            executeUpdateStatus: jest.fn(),
          },
        },
        {
          provide: DeleteTenantUseCase,
          useValue: {
            execute: jest.fn(),
            executeHardDelete: jest.fn(),
            executeRestore: jest.fn(),
            executeBatchDelete: jest.fn(),
            executeBatchHardDelete: jest.fn(),
          },
        },
        {
          provide: SearchTenantsUseCase,
          useValue: {
            execute: jest.fn(),
            executeAdvancedSearch: jest.fn(),
            executeGetTenantSuggestions: jest.fn(),
            executeSearchByName: jest.fn(),
            executeSearchByCode: jest.fn(),
            executeSearchByStatus: jest.fn(),
            executeSearchByAdminUserId: jest.fn(),
          },
        },
        {
          provide: GetTenantStatisticsUseCase,
          useValue: {
            execute: jest.fn(),
            executeByStatus: jest.fn(),
            executeByDateRange: jest.fn(),
            executeGrowthRate: jest.fn(),
            executeTenantActivityStats: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<TenantsService>(TenantsService)
    mockTenantRepository = module.get('TenantRepository') as jest.Mocked<TenantRepository>
    mockCreateTenantUseCase = module.get(CreateTenantUseCase) as jest.Mocked<CreateTenantUseCase>
    mockGetTenantUseCase = module.get(GetTenantUseCase) as jest.Mocked<GetTenantUseCase>
    mockGetTenantsUseCase = module.get(GetTenantsUseCase) as jest.Mocked<GetTenantsUseCase>
    mockUpdateTenantUseCase = module.get(UpdateTenantUseCase) as jest.Mocked<UpdateTenantUseCase>
    mockUpdateTenantStatusUseCase = module.get(UpdateTenantStatusUseCase) as jest.Mocked<UpdateTenantStatusUseCase>
    mockDeleteTenantUseCase = module.get(DeleteTenantUseCase) as jest.Mocked<DeleteTenantUseCase>
    mockSearchTenantsUseCase = module.get(SearchTenantsUseCase) as jest.Mocked<SearchTenantsUseCase>
    mockGetTenantStatisticsUseCase = module.get(GetTenantStatisticsUseCase) as jest.Mocked<GetTenantStatisticsUseCase>
  })

  describe('createTenant', () => {
    it('应该成功创建租户', async () => {
      const tenant = new Tenant(
        'test-id',
        '测试租户',
        'test-tenant',
        'admin-id',
      )
      mockCreateTenantUseCase.execute.mockResolvedValue(tenant)

      const result = await service.createTenant(
        '测试租户',
        'test-tenant',
        'admin-id',
      )

      expect(result).toBeInstanceOf(Tenant)
      expect(result.getName()).toBe('测试租户')
      expect(result.getCode()).toBe('test-tenant')
      expect(mockCreateTenantUseCase.execute).toHaveBeenCalledWith({
        name: '测试租户',
        code: 'test-tenant',
        adminUserId: 'admin-id',
      })
    })

    it('应该拒绝创建重复编码的租户', async () => {
      mockCreateTenantUseCase.execute.mockRejectedValue(new ConflictException('Tenant with code "test-tenant" already exists'))

      await expect(
        service.createTenant('测试租户', 'test-tenant', 'admin-id'),
      ).rejects.toThrow(ConflictException)
    })
  })

  describe('getTenantById', () => {
    it('应该成功获取租户', async () => {
      const tenant = new Tenant(
        'test-id',
        '测试租户',
        'test-tenant',
        'admin-id',
      )
      mockGetTenantUseCase.execute.mockResolvedValue(tenant)

      const result = await service.getTenantById('test-id')

      expect(result).toBe(tenant)
      expect(mockGetTenantUseCase.execute).toHaveBeenCalledWith('test-id')
    })

    it('应该抛出异常当租户不存在时', async () => {
      mockGetTenantUseCase.execute.mockRejectedValue(new NotFoundException('Tenant not found'))

      await expect(service.getTenantById('test-id')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('getTenantByCode', () => {
    it('应该成功根据编码获取租户', async () => {
      const tenant = new Tenant(
        'test-id',
        '测试租户',
        'test-tenant',
        'admin-id',
      )
      mockGetTenantUseCase.executeByCode.mockResolvedValue(tenant)

      const result = await service.getTenantByCode('test-tenant')

      expect(result).toBe(tenant)
      expect(mockGetTenantUseCase.executeByCode).toHaveBeenCalledWith(
        'test-tenant',
      )
    })

    it('应该抛出异常当租户不存在时', async () => {
      mockGetTenantUseCase.executeByCode.mockRejectedValue(new NotFoundException('Tenant not found'))

      await expect(service.getTenantByCode('test-tenant')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('getAllTenants', () => {
    it('应该返回所有租户', async () => {
      const tenants = [
        new Tenant('test-1', '租户1', 'tenant-1', 'admin-1'),
        new Tenant('test-2', '租户2', 'tenant-2', 'admin-2'),
      ]
      mockGetTenantsUseCase.executeAllTenants.mockResolvedValue(tenants)

      const result = await service.getAllTenants()

      expect(result).toEqual(tenants)
      expect(mockGetTenantsUseCase.executeAllTenants).toHaveBeenCalled()
    })
  })

  describe('getActiveTenants', () => {
    it('应该返回激活状态的租户', async () => {
      const tenants = [
        new Tenant('test-1', '租户1', 'tenant-1', 'admin-1'),
        new Tenant('test-2', '租户2', 'tenant-2', 'admin-2'),
      ]
      mockGetTenantsUseCase.executeActiveTenants.mockResolvedValue(tenants)

      const result = await service.getActiveTenants()

      expect(result).toEqual(tenants)
      expect(mockGetTenantsUseCase.executeActiveTenants).toHaveBeenCalled()
    })
  })

  describe('activateTenant', () => {
    it('应该成功激活租户', async () => {
      const tenant = new Tenant(
        'test-id',
        '测试租户',
        'test-tenant',
        'admin-id',
      )
      mockUpdateTenantStatusUseCase.executeActivate.mockResolvedValue(tenant)

      const result = await service.activateTenant('test-id')

      expect(result).toBe(tenant)
      expect(mockUpdateTenantStatusUseCase.executeActivate).toHaveBeenCalledWith('test-id')
    })

    it('应该抛出异常当租户不存在时', async () => {
      mockUpdateTenantStatusUseCase.executeActivate.mockRejectedValue(new NotFoundException('Tenant not found'))

      await expect(service.activateTenant('test-id')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('suspendTenant', () => {
    it('应该成功禁用租户', async () => {
      const tenant = new Tenant(
        'test-id',
        '测试租户',
        'test-tenant',
        'admin-id',
      )
      mockUpdateTenantStatusUseCase.executeSuspend.mockResolvedValue(tenant)

      const result = await service.suspendTenant('test-id')

      expect(result).toBe(tenant)
      expect(mockUpdateTenantStatusUseCase.executeSuspend).toHaveBeenCalledWith('test-id')
    })

    it('应该抛出异常当租户不存在时', async () => {
      mockUpdateTenantStatusUseCase.executeSuspend.mockRejectedValue(new NotFoundException('Tenant not found'))

      await expect(service.suspendTenant('test-id')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('updateTenantSettings', () => {
    it('应该成功更新租户配置', async () => {
      const tenant = new Tenant(
        'test-id',
        '测试租户',
        'test-tenant',
        'admin-id',
      )
      const newSettings = { theme: 'dark', language: 'zh-CN' }
      mockUpdateTenantUseCase.executeSettings.mockResolvedValue(tenant)

      const result = await service.updateTenantSettings('test-id', newSettings)

      expect(result).toBe(tenant)
      expect(mockUpdateTenantUseCase.executeSettings).toHaveBeenCalledWith('test-id', newSettings)
    })

    it('应该抛出异常当租户不存在时', async () => {
      mockUpdateTenantUseCase.executeSettings.mockRejectedValue(new NotFoundException('Tenant not found'))

      await expect(
        service.updateTenantSettings('test-id', { theme: 'dark' }),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('deleteTenant', () => {
    it('应该成功删除租户', async () => {
      mockDeleteTenantUseCase.execute.mockResolvedValue(true)

      const result = await service.deleteTenant('test-id')

      expect(result).toBe(true)
      expect(mockDeleteTenantUseCase.execute).toHaveBeenCalledWith('test-id')
    })

    it('应该抛出异常当租户不存在时', async () => {
      mockDeleteTenantUseCase.execute.mockRejectedValue(new NotFoundException('Tenant not found'))

      await expect(service.deleteTenant('test-id')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('getTenantStatistics', () => {
    it('应该返回租户统计信息', async () => {
      mockGetTenantStatisticsUseCase.execute.mockResolvedValue({
        totalTenants: 100,
        activeTenants: 50,
        pendingTenants: 20,
        suspendedTenants: 20,
        deletedTenants: 10,
        recentTenants: 5,
        tenantGrowthRate: 0.05,
      })

      const result = await service.getTenantStatistics()

      expect(result).toEqual({
        totalTenants: 100,
        activeTenants: 50,
        pendingTenants: 20,
        suspendedTenants: 20,
        deletedTenants: 10,
        recentTenants: 5,
        tenantGrowthRate: 0.05,
      })

      expect(mockGetTenantStatisticsUseCase.execute).toHaveBeenCalled()
    })
  })
})

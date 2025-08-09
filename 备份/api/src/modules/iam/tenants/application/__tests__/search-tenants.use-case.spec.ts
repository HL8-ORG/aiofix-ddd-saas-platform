import { Test, TestingModule } from '@nestjs/testing'
import { SearchTenantsUseCase } from '../use-cases/search-tenants.use-case'
import { Tenant } from '../../domain/entities/tenant.entity'
import { TenantRepository } from '../../domain/repositories/tenant.repository'

describe('SearchTenantsUseCase', () => {
  let useCase: SearchTenantsUseCase
  let mockTenantRepository: jest.Mocked<TenantRepository>

  beforeEach(async () => {
    const mockRepository = {
      findBySearch: jest.fn(),
      findWithPagination: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchTenantsUseCase,
        {
          provide: 'TenantRepository',
          useValue: mockRepository,
        },
      ],
    }).compile()

    useCase = module.get<SearchTenantsUseCase>(SearchTenantsUseCase)
    mockTenantRepository = module.get('TenantRepository') as jest.Mocked<TenantRepository>
  })

  describe('execute', () => {
    it('应该成功搜索租户', async () => {
      const tenants = [
        new Tenant('test-1', '测试租户1', 'test-tenant-1', 'admin-1'),
        new Tenant('test-2', '测试租户2', 'test-tenant-2', 'admin-2'),
      ]
      mockTenantRepository.findBySearch.mockResolvedValue(tenants)

      const result = await useCase.execute('测试')

      expect(result).toEqual(tenants)
      expect(mockTenantRepository.findBySearch).toHaveBeenCalledWith('测试', undefined)
    })

    it('应该返回空数组当没有搜索结果时', async () => {
      mockTenantRepository.findBySearch.mockResolvedValue([])

      const result = await useCase.execute('不存在的租户')

      expect(result).toEqual([])
      expect(mockTenantRepository.findBySearch).toHaveBeenCalledWith('不存在的租户', undefined)
    })
  })

  describe('executeAdvancedSearch', () => {
    it('应该成功执行高级搜索', async () => {
      const tenants = [
        new Tenant('test-1', '测试租户1', 'test-tenant-1', 'admin-1'),
        new Tenant('test-2', '测试租户2', 'test-tenant-2', 'admin-2'),
      ]
      const paginationResult = {
        tenants,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      }
      mockTenantRepository.findWithPagination.mockResolvedValue(paginationResult)

      const searchCriteria = {
        keyword: '测试',
        status: 'ACTIVE',
        adminUserId: 'admin-1',
        sortBy: 'name',
        sortOrder: 'asc' as const,
      }

      const result = await useCase.executeAdvancedSearch(searchCriteria, 1, 10)

      expect(result).toEqual(paginationResult)
      expect(mockTenantRepository.findWithPagination).toHaveBeenCalledWith(1, 10, {
        search: '测试',
        status: 'active',
        adminUserId: 'admin-1',
      }, {
        field: 'name',
        order: 'asc',
      })
    })

    it('应该成功执行带部分条件的高级搜索', async () => {
      const tenants = [
        new Tenant('test-1', '测试租户1', 'test-tenant-1', 'admin-1'),
      ]
      const paginationResult = {
        tenants,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      }
      mockTenantRepository.findWithPagination.mockResolvedValue(paginationResult)

      const searchCriteria = {
        keyword: '测试',
        status: 'PENDING',
      }

      const result = await useCase.executeAdvancedSearch(searchCriteria, 1, 10)

      expect(result).toEqual(paginationResult)
      expect(mockTenantRepository.findWithPagination).toHaveBeenCalledWith(1, 10, {
        search: '测试',
        status: 'pending',
        adminUserId: undefined,
      }, undefined)
    })

    it('应该处理空搜索条件', async () => {
      const tenants = [
        new Tenant('test-1', '测试租户1', 'test-tenant-1', 'admin-1'),
      ]
      const paginationResult = {
        tenants,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      }
      mockTenantRepository.findWithPagination.mockResolvedValue(paginationResult)

      const result = await useCase.executeAdvancedSearch({}, 1, 10)

      expect(result).toEqual(paginationResult)
      expect(mockTenantRepository.findWithPagination).toHaveBeenCalledWith(1, 10, {
        search: undefined,
        status: undefined,
        adminUserId: undefined,
      }, undefined)
    })
  })
}) 
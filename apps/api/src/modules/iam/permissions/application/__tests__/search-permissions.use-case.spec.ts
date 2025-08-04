import { Test, TestingModule } from '@nestjs/testing'
import { SearchPermissionsUseCase, type SearchPermissionsRequest, type AdvancedSearchRequest } from '../use-cases/search-permissions.use-case'
import type { PermissionRepository } from '../../domain/repositories/permission.repository'

describe('SearchPermissionsUseCase', () => {
  let useCase: SearchPermissionsUseCase
  let mockPermissionRepository: jest.Mocked<PermissionRepository>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchPermissionsUseCase,
        {
          provide: 'PermissionRepository',
          useValue: {
            search: jest.fn(),
            findAll: jest.fn(),
            findByName: jest.fn(),
            findByCode: jest.fn(),
            findByStatus: jest.fn(),
            findByType: jest.fn(),
            findByAction: jest.fn(),
            findByResource: jest.fn(),
            findByModule: jest.fn(),
            findByRoleId: jest.fn(),
          },
        },
      ],
    }).compile()

    useCase = module.get<SearchPermissionsUseCase>(SearchPermissionsUseCase)
    mockPermissionRepository = module.get('PermissionRepository')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('execute', () => {
    it('应该执行简单搜索权限', async () => {
      const mockPermissions = [
        {
          id: 'permission-1',
          getName: jest.fn().mockReturnValue('测试权限1'),
        },
        {
          id: 'permission-2',
          getName: jest.fn().mockReturnValue('测试权限2'),
        },
      ]

      mockPermissionRepository.search.mockResolvedValue({
        permissions: mockPermissions as any,
        total: 2,
      })

      const result = await useCase.execute('测试', 'test-tenant-id', 'test-org-id', 10)

      expect(result).toBe(mockPermissions)
      expect(mockPermissionRepository.search).toHaveBeenCalledWith('测试', 'test-tenant-id', 'test-org-id', 1, 10)
    })
  })

  describe('executeAdvancedSearch', () => {
    it('应该执行高级搜索权限', async () => {
      const request: AdvancedSearchRequest = {
        searchCriteria: {
          keyword: '测试',
          type: 'api',
          status: 'active',
          action: 'read',
          sortBy: 'name',
          sortOrder: 'asc',
        },
        tenantId: 'test-tenant-id',
        organizationId: 'test-org-id',
        page: 1,
        limit: 10,
      }

      const mockPermissions = [
        {
          id: 'permission-1',
          getName: jest.fn().mockReturnValue('测试权限1'),
          getCode: jest.fn().mockReturnValue('PERMISSION_1'),
          getType: jest.fn().mockReturnValue('api'),
          getStatus: jest.fn().mockReturnValue('active'),
          getAction: jest.fn().mockReturnValue('read'),
          description: '测试权限1描述',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'permission-2',
          getName: jest.fn().mockReturnValue('测试权限2'),
          getCode: jest.fn().mockReturnValue('PERMISSION_2'),
          getType: jest.fn().mockReturnValue('api'),
          getStatus: jest.fn().mockReturnValue('active'),
          getAction: jest.fn().mockReturnValue('write'),
          description: '测试权限2描述',
          createdAt: new Date('2024-01-02'),
        },
      ]

      mockPermissionRepository.findAll.mockResolvedValue({
        permissions: mockPermissions as any,
        total: 2,
      })

      const result = await useCase.executeAdvancedSearch(request)

      expect(result).toEqual({
        permissions: mockPermissions,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      })
    })
  })

  describe('executeGetPermissionSuggestions', () => {
    it('应该获取权限建议', async () => {
      const mockPermissions = [
        {
          id: 'permission-1',
          getName: jest.fn().mockReturnValue('测试权限1'),
          getCode: jest.fn().mockReturnValue('PERMISSION_1'),
          getType: jest.fn().mockReturnValue('api'),
          getStatus: jest.fn().mockReturnValue('active'),
        },
        {
          id: 'permission-2',
          getName: jest.fn().mockReturnValue('测试权限2'),
          getCode: jest.fn().mockReturnValue('PERMISSION_2'),
          getType: jest.fn().mockReturnValue('api'),
          getStatus: jest.fn().mockReturnValue('active'),
        },
      ]

      mockPermissionRepository.search.mockResolvedValue({
        permissions: mockPermissions as any,
        total: 2,
      })

      const result = await useCase.executeGetPermissionSuggestions('测试', 'test-tenant-id', 5)

      expect(result).toEqual([
        {
          id: 'permission-1',
          name: '测试权限1',
          code: 'PERMISSION_1',
          type: 'api',
          status: 'active',
        },
        {
          id: 'permission-2',
          name: '测试权限2',
          code: 'PERMISSION_2',
          type: 'api',
          status: 'active',
        },
      ])
    })
  })

  describe('executeSearchByName', () => {
    it('应该根据名称搜索权限', async () => {
      const mockPermission = {
        id: 'permission-1',
        getName: jest.fn().mockReturnValue('测试权限'),
      }

      mockPermissionRepository.findByName.mockResolvedValue(mockPermission as any)

      const result = await useCase.executeSearchByName('测试权限', 'test-tenant-id')

      expect(result).toEqual([mockPermission])
      expect(mockPermissionRepository.findByName).toHaveBeenCalledWith('测试权限', 'test-tenant-id')
    })

    it('应该返回空数组当权限不存在', async () => {
      mockPermissionRepository.findByName.mockResolvedValue(null)

      const result = await useCase.executeSearchByName('不存在的权限', 'test-tenant-id')

      expect(result).toEqual([])
    })
  })

  describe('executeSearchByCode', () => {
    it('应该根据代码搜索权限', async () => {
      const mockPermission = {
        id: 'permission-1',
        getCode: jest.fn().mockReturnValue('TEST_PERMISSION'),
      }

      mockPermissionRepository.findByCode.mockResolvedValue(mockPermission as any)

      const result = await useCase.executeSearchByCode('TEST_PERMISSION', 'test-tenant-id')

      expect(result).toBe(mockPermission)
      expect(mockPermissionRepository.findByCode).toHaveBeenCalledWith('TEST_PERMISSION', 'test-tenant-id')
    })
  })

  describe('executeSearchByStatus', () => {
    it('应该根据状态搜索权限', async () => {
      const mockPermissions = [
        {
          id: 'permission-1',
          getStatus: jest.fn().mockReturnValue('active'),
        },
      ]

      mockPermissionRepository.findByStatus.mockResolvedValue(mockPermissions as any)

      const result = await useCase.executeSearchByStatus('active', 'test-tenant-id')

      expect(result).toBe(mockPermissions)
      expect(mockPermissionRepository.findByStatus).toHaveBeenCalledWith('active', 'test-tenant-id')
    })
  })

  describe('executeSearchByType', () => {
    it('应该根据类型搜索权限', async () => {
      const mockPermissions = [
        {
          id: 'permission-1',
          getType: jest.fn().mockReturnValue('api'),
        },
      ]

      mockPermissionRepository.findByType.mockResolvedValue(mockPermissions as any)

      const result = await useCase.executeSearchByType('api', 'test-tenant-id')

      expect(result).toBe(mockPermissions)
      expect(mockPermissionRepository.findByType).toHaveBeenCalledWith('api', 'test-tenant-id')
    })
  })

  describe('executeSearchByAction', () => {
    it('应该根据操作搜索权限', async () => {
      const mockPermissions = [
        {
          id: 'permission-1',
          getAction: jest.fn().mockReturnValue('read'),
        },
      ]

      mockPermissionRepository.findByAction.mockResolvedValue(mockPermissions as any)

      const result = await useCase.executeSearchByAction('read', 'test-tenant-id')

      expect(result).toBe(mockPermissions)
      expect(mockPermissionRepository.findByAction).toHaveBeenCalledWith('read', 'test-tenant-id')
    })
  })

  describe('executeSearchByResource', () => {
    it('应该根据资源搜索权限', async () => {
      const mockPermissions = [
        {
          id: 'permission-1',
          getName: jest.fn().mockReturnValue('用户管理'),
        },
      ]

      mockPermissionRepository.findByResource.mockResolvedValue(mockPermissions as any)

      const result = await useCase.executeSearchByResource('user', 'test-tenant-id')

      expect(result).toBe(mockPermissions)
      expect(mockPermissionRepository.findByResource).toHaveBeenCalledWith('user', 'test-tenant-id')
    })
  })

  describe('executeSearchByModule', () => {
    it('应该根据模块搜索权限', async () => {
      const mockPermissions = [
        {
          id: 'permission-1',
          getName: jest.fn().mockReturnValue('系统管理'),
        },
      ]

      mockPermissionRepository.findByModule.mockResolvedValue(mockPermissions as any)

      const result = await useCase.executeSearchByModule('system', 'test-tenant-id')

      expect(result).toBe(mockPermissions)
      expect(mockPermissionRepository.findByModule).toHaveBeenCalledWith('system', 'test-tenant-id')
    })
  })

  describe('executeSearchByRoleId', () => {
    it('应该根据角色ID搜索权限', async () => {
      const mockPermissions = [
        {
          id: 'permission-1',
          getName: jest.fn().mockReturnValue('管理员权限'),
        },
      ]

      mockPermissionRepository.findByRoleId.mockResolvedValue(mockPermissions as any)

      const result = await useCase.executeSearchByRoleId('admin-role-id', 'test-tenant-id')

      expect(result).toBe(mockPermissions)
      expect(mockPermissionRepository.findByRoleId).toHaveBeenCalledWith('admin-role-id', 'test-tenant-id')
    })
  })
}) 
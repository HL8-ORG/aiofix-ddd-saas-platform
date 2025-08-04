import { Test, TestingModule } from '@nestjs/testing'
import { GetPermissionsUseCase, type GetPermissionsRequest } from '../use-cases/get-permissions.use-case'
import type { PermissionRepository } from '../../domain/repositories/permission.repository'

describe('GetPermissionsUseCase', () => {
  let useCase: GetPermissionsUseCase
  let mockPermissionRepository: jest.Mocked<PermissionRepository>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPermissionsUseCase,
        {
          provide: 'PermissionRepository',
          useValue: {
            findAll: jest.fn(),
            search: jest.fn(),
            findActivePermissions: jest.fn(),
            findSystemPermissions: jest.fn(),
            findDefaultPermissions: jest.fn(),
            countByTenant: jest.fn(),
          },
        },
      ],
    }).compile()

    useCase = module.get<GetPermissionsUseCase>(GetPermissionsUseCase)
    mockPermissionRepository = module.get('PermissionRepository')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('execute', () => {
    it('应该获取权限列表', async () => {
      const request: GetPermissionsRequest = {
        tenantId: 'test-tenant-id',
        organizationId: 'test-org-id',
        page: 1,
        limit: 10,
      }

      const mockPermissions = [
        {
          id: 'permission-1',
          name: '测试权限1',
          code: 'PERMISSION_1',
          type: 'api',
          status: 'active',
          action: 'read',
        },
        {
          id: 'permission-2',
          name: '测试权限2',
          code: 'PERMISSION_2',
          type: 'api',
          status: 'active',
          action: 'write',
        },
      ]

      mockPermissionRepository.findAll.mockResolvedValue({
        permissions: mockPermissions as any,
        total: 2,
      })

      const result = await useCase.execute(request)

      expect(result).toEqual({
        permissions: mockPermissions,
        total: 2,
      })
      expect(mockPermissionRepository.findAll).toHaveBeenCalledWith('test-tenant-id', 'test-org-id', 1, 10)
    })

    it('应该处理空结果', async () => {
      const request: GetPermissionsRequest = {
        tenantId: 'test-tenant-id',
        organizationId: 'test-org-id',
        page: 1,
        limit: 10,
      }

      mockPermissionRepository.findAll.mockResolvedValue({
        permissions: [],
        total: 0,
      })

      const result = await useCase.execute(request)

      expect(result).toEqual({
        permissions: [],
        total: 0,
      })
    })

    it('应该使用搜索方法当有搜索条件', async () => {
      const request: GetPermissionsRequest = {
        tenantId: 'test-tenant-id',
        organizationId: 'test-org-id',
        page: 1,
        limit: 10,
        filters: {
          search: '测试',
        },
      }

      const mockPermissions = [
        {
          id: 'permission-1',
          name: '测试权限1',
        },
      ]

      mockPermissionRepository.search.mockResolvedValue({
        permissions: mockPermissions as any,
        total: 1,
      })

      const result = await useCase.execute(request)

      expect(result).toEqual({
        permissions: mockPermissions,
        total: 1,
      })
      expect(mockPermissionRepository.search).toHaveBeenCalledWith('测试', 'test-tenant-id', 'test-org-id', 1, 10)
    })
  })

  describe('executeAllPermissions', () => {
    it('应该获取所有权限', async () => {
      const mockPermissions = [
        {
          id: 'permission-1',
          name: '测试权限1',
        },
        {
          id: 'permission-2',
          name: '测试权限2',
        },
      ]

      mockPermissionRepository.findAll.mockResolvedValue({
        permissions: mockPermissions as any,
        total: 2,
      })

      const result = await useCase.executeAllPermissions('test-tenant-id', 'test-org-id')

      expect(result).toBe(mockPermissions)
      expect(mockPermissionRepository.findAll).toHaveBeenCalledWith('test-tenant-id', 'test-org-id')
    })
  })

  describe('executeActivePermissions', () => {
    it('应该获取激活权限列表', async () => {
      const mockPermissions = [
        {
          id: 'permission-1',
          name: '激活权限1',
        },
        {
          id: 'permission-2',
          name: '激活权限2',
        },
      ]

      mockPermissionRepository.findActivePermissions.mockResolvedValue(mockPermissions as any)

      const result = await useCase.executeActivePermissions('test-tenant-id', 'test-org-id')

      expect(result).toBe(mockPermissions)
      expect(mockPermissionRepository.findActivePermissions).toHaveBeenCalledWith('test-tenant-id', 'test-org-id')
    })
  })

  describe('executeSystemPermissions', () => {
    it('应该获取系统权限列表', async () => {
      const mockPermissions = [
        {
          id: 'system-permission-1',
          name: '系统权限1',
        },
        {
          id: 'system-permission-2',
          name: '系统权限2',
        },
      ]

      mockPermissionRepository.findSystemPermissions.mockResolvedValue(mockPermissions as any)

      const result = await useCase.executeSystemPermissions('test-tenant-id')

      expect(result).toBe(mockPermissions)
      expect(mockPermissionRepository.findSystemPermissions).toHaveBeenCalledWith('test-tenant-id')
    })
  })

  describe('executeDefaultPermissions', () => {
    it('应该获取默认权限列表', async () => {
      const mockPermissions = [
        {
          id: 'default-permission-1',
          name: '默认权限1',
        },
        {
          id: 'default-permission-2',
          name: '默认权限2',
        },
      ]

      mockPermissionRepository.findDefaultPermissions.mockResolvedValue(mockPermissions as any)

      const result = await useCase.executeDefaultPermissions('test-tenant-id')

      expect(result).toBe(mockPermissions)
      expect(mockPermissionRepository.findDefaultPermissions).toHaveBeenCalledWith('test-tenant-id')
    })
  })
}) 
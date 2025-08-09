import { Test, TestingModule } from '@nestjs/testing'
import { PermissionsService } from '../permissions.service'
import type { PermissionRepository } from '../../domain/repositories/permission.repository'
import { CreatePermissionUseCase } from '../use-cases/create-permission.use-case'
import { GetPermissionUseCase } from '../use-cases/get-permission.use-case'
import { GetPermissionsUseCase } from '../use-cases/get-permissions.use-case'
import { UpdatePermissionUseCase } from '../use-cases/update-permission.use-case'
import { UpdatePermissionStatusUseCase } from '../use-cases/update-permission-status.use-case'
import { DeletePermissionUseCase } from '../use-cases/delete-permission.use-case'
import { SearchPermissionsUseCase } from '../use-cases/search-permissions.use-case'
import { GetPermissionStatisticsUseCase } from '../use-cases/get-permission-statistics.use-case'
import { PermissionType } from '../../domain/value-objects/permission-type.value-object'
import { PermissionAction } from '../../domain/value-objects/permission-action.value-object'

describe('PermissionsService', () => {
  let service: PermissionsService
  let mockPermissionRepository: jest.Mocked<PermissionRepository>
  let mockCreatePermissionUseCase: jest.Mocked<CreatePermissionUseCase>
  let mockGetPermissionUseCase: jest.Mocked<GetPermissionUseCase>
  let mockGetPermissionsUseCase: jest.Mocked<GetPermissionsUseCase>
  let mockUpdatePermissionUseCase: jest.Mocked<UpdatePermissionUseCase>
  let mockUpdatePermissionStatusUseCase: jest.Mocked<UpdatePermissionStatusUseCase>
  let mockDeletePermissionUseCase: jest.Mocked<DeletePermissionUseCase>
  let mockSearchPermissionsUseCase: jest.Mocked<SearchPermissionsUseCase>
  let mockGetPermissionStatisticsUseCase: jest.Mocked<GetPermissionStatisticsUseCase>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        {
          provide: 'PermissionRepository',
          useValue: {
            save: jest.fn(),
            findById: jest.fn(),
            findByCode: jest.fn(),
            findAll: jest.fn(),
          },
        },
        {
          provide: CreatePermissionUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetPermissionUseCase,
          useValue: {
            execute: jest.fn(),
            executeByCode: jest.fn(),
          },
        },
        {
          provide: GetPermissionsUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: UpdatePermissionUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: UpdatePermissionStatusUseCase,
          useValue: {
            executeActivate: jest.fn(),
            executeSuspend: jest.fn(),
          },
        },
        {
          provide: DeletePermissionUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: SearchPermissionsUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetPermissionStatisticsUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<PermissionsService>(PermissionsService)
    mockPermissionRepository = module.get('PermissionRepository')
    mockCreatePermissionUseCase = module.get(CreatePermissionUseCase)
    mockGetPermissionUseCase = module.get(GetPermissionUseCase)
    mockGetPermissionsUseCase = module.get(GetPermissionsUseCase)
    mockUpdatePermissionUseCase = module.get(UpdatePermissionUseCase)
    mockUpdatePermissionStatusUseCase = module.get(UpdatePermissionStatusUseCase)
    mockDeletePermissionUseCase = module.get(DeletePermissionUseCase)
    mockSearchPermissionsUseCase = module.get(SearchPermissionsUseCase)
    mockGetPermissionStatisticsUseCase = module.get(GetPermissionStatisticsUseCase)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createPermission', () => {
    it('应该成功创建权限', async () => {
      const request = {
        name: '测试权限',
        code: 'test:permission',
        type: PermissionType.API,
        action: PermissionAction.READ,
        tenantId: 'test-tenant-id',
        adminUserId: 'test-admin-id',
      }

      const mockPermission = {
        id: 'test-permission-id',
        getName: jest.fn().mockReturnValue('测试权限'),
      }

      mockCreatePermissionUseCase.execute.mockResolvedValue(mockPermission as any)

      const result = await service.createPermission(request)

      expect(result).toBe(mockPermission)
      expect(mockCreatePermissionUseCase.execute).toHaveBeenCalledWith(request)
    })
  })

  describe('getPermissionById', () => {
    it('应该根据ID获取权限', async () => {
      const mockPermission = {
        id: 'test-permission-id',
        getName: jest.fn().mockReturnValue('测试权限'),
      }

      mockGetPermissionUseCase.execute.mockResolvedValue(mockPermission as any)

      const result = await service.getPermissionById('test-permission-id', 'test-tenant-id')

      expect(result).toBe(mockPermission)
      expect(mockGetPermissionUseCase.execute).toHaveBeenCalledWith('test-permission-id', 'test-tenant-id')
    })
  })

  describe('getPermissionByCode', () => {
    it('应该根据代码获取权限', async () => {
      const mockPermission = {
        id: 'test-permission-id',
        getCode: jest.fn().mockReturnValue('test:permission'),
      }

      mockGetPermissionUseCase.executeByCode.mockResolvedValue(mockPermission as any)

      const result = await service.getPermissionByCode('test:permission', 'test-tenant-id')

      expect(result).toBe(mockPermission)
      expect(mockGetPermissionUseCase.executeByCode).toHaveBeenCalledWith('test:permission', 'test-tenant-id')
    })
  })

  describe('getPermissionsWithPagination', () => {
    it('应该分页获取权限列表', async () => {
      const request = {
        tenantId: 'test-tenant-id',
        page: 1,
        limit: 10,
      }

      const mockResult = {
        permissions: [
          { id: 'permission-1', getName: jest.fn().mockReturnValue('权限1') },
          { id: 'permission-2', getName: jest.fn().mockReturnValue('权限2') },
        ],
        total: 2,
      }

      mockGetPermissionsUseCase.execute.mockResolvedValue(mockResult as any)

      const result = await service.getPermissionsWithPagination(request)

      expect(result).toBe(mockResult)
      expect(mockGetPermissionsUseCase.execute).toHaveBeenCalledWith(request)
    })
  })

  describe('activatePermission', () => {
    it('应该成功激活权限', async () => {
      const mockPermission = {
        id: 'test-permission-id',
        getStatus: jest.fn().mockReturnValue('active'),
      }

      mockUpdatePermissionStatusUseCase.executeActivate.mockResolvedValue(mockPermission as any)

      const result = await service.activatePermission('test-permission-id', 'test-tenant-id')

      expect(result).toBe(mockPermission)
      expect(mockUpdatePermissionStatusUseCase.executeActivate).toHaveBeenCalledWith('test-permission-id', 'test-tenant-id')
    })
  })

  describe('suspendPermission', () => {
    it('应该成功禁用权限', async () => {
      const mockPermission = {
        id: 'test-permission-id',
        getStatus: jest.fn().mockReturnValue('suspended'),
      }

      mockUpdatePermissionStatusUseCase.executeSuspend.mockResolvedValue(mockPermission as any)

      const result = await service.suspendPermission('test-permission-id', 'test-tenant-id')

      expect(result).toBe(mockPermission)
      expect(mockUpdatePermissionStatusUseCase.executeSuspend).toHaveBeenCalledWith('test-permission-id', 'test-tenant-id')
    })
  })

  describe('updatePermissionInfo', () => {
    it('应该成功更新权限信息', async () => {
      const request = {
        name: '更新后的权限',
        code: 'updated:permission',
      }

      const mockPermission = {
        id: 'test-permission-id',
        getName: jest.fn().mockReturnValue('更新后的权限'),
      }

      mockUpdatePermissionUseCase.execute.mockResolvedValue(mockPermission as any)

      const result = await service.updatePermissionInfo('test-permission-id', request, 'test-tenant-id')

      expect(result).toBe(mockPermission)
      expect(mockUpdatePermissionUseCase.execute).toHaveBeenCalledWith('test-permission-id', request, 'test-tenant-id')
    })
  })

  describe('deletePermission', () => {
    it('应该成功删除权限', async () => {
      mockDeletePermissionUseCase.execute.mockResolvedValue(true)

      const result = await service.deletePermission('test-permission-id', 'test-tenant-id')

      expect(result).toBe(true)
      expect(mockDeletePermissionUseCase.execute).toHaveBeenCalledWith('test-permission-id', 'test-tenant-id')
    })
  })

  describe('searchPermissions', () => {
    it('应该成功搜索权限', async () => {
      const mockPermissions = [
        { id: 'permission-1', getName: jest.fn().mockReturnValue('测试权限1') },
        { id: 'permission-2', getName: jest.fn().mockReturnValue('测试权限2') },
      ]

      mockSearchPermissionsUseCase.execute.mockResolvedValue(mockPermissions as any)

      const result = await service.searchPermissions('测试', 'test-tenant-id')

      expect(result).toBe(mockPermissions)
      expect(mockSearchPermissionsUseCase.execute).toHaveBeenCalledWith('测试', 'test-tenant-id', undefined, undefined)
    })
  })

  describe('getPermissionStatistics', () => {
    it('应该返回权限统计信息', async () => {
      const mockStatistics = {
        totalPermissions: 10,
        activePermissions: 8,
        suspendedPermissions: 2,
        deletedPermissions: 0,
        systemPermissions: 3,
        defaultPermissions: 5,
        expiredPermissions: 0,
        permissionsWithConditions: 2,
        permissionsWithFields: 1,
      }

      mockGetPermissionStatisticsUseCase.execute.mockResolvedValue(mockStatistics)

      const result = await service.getPermissionStatistics('test-tenant-id')

      expect(result).toBe(mockStatistics)
      expect(mockGetPermissionStatisticsUseCase.execute).toHaveBeenCalledWith('test-tenant-id', undefined)
    })
  })
}) 
import { Test, TestingModule } from '@nestjs/testing'
import { GetPermissionStatisticsUseCase } from '../../use-cases/get-permission-statistics.use-case'
import type { PermissionRepository } from '../../../domain/repositories/permission.repository'

describe('GetPermissionStatisticsUseCase', () => {
  let useCase: GetPermissionStatisticsUseCase
  let mockPermissionRepository: jest.Mocked<PermissionRepository>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPermissionStatisticsUseCase,
        {
          provide: 'PermissionRepository',
          useValue: {
            findAll: jest.fn(),
            findByStatus: jest.fn(),
            findByType: jest.fn(),
            findByAction: jest.fn(),
            findWithConditions: jest.fn(),
            findWithFields: jest.fn(),
            findSystemPermissions: jest.fn(),
            findDefaultPermissions: jest.fn(),
            findExpiredPermissions: jest.fn(),
            findActivePermissions: jest.fn(),
            count: jest.fn(),
            countByTenant: jest.fn(),
            countByStatus: jest.fn(),
            countByType: jest.fn(),
            countByAction: jest.fn(),
          },
        },
      ],
    }).compile()

    useCase = module.get<GetPermissionStatisticsUseCase>(GetPermissionStatisticsUseCase)
    mockPermissionRepository = module.get('PermissionRepository')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('execute', () => {
    it('应该返回完整的权限统计信息', async () => {
      const mockPermissions = [
        {
          id: 'permission-1',
          getStatus: jest.fn().mockReturnValue('active'),
          getName: jest.fn().mockReturnValue('权限1'),
          getCode: jest.fn().mockReturnValue('PERMISSION_1'),
          getType: jest.fn().mockReturnValue('api'),
          getAction: jest.fn().mockReturnValue('read'),
        },
        {
          id: 'permission-2',
          getStatus: jest.fn().mockReturnValue('suspended'),
          getName: jest.fn().mockReturnValue('权限2'),
          getCode: jest.fn().mockReturnValue('PERMISSION_2'),
          getType: jest.fn().mockReturnValue('api'),
          getAction: jest.fn().mockReturnValue('write'),
        },
      ]

      mockPermissionRepository.findAll.mockResolvedValue({
        permissions: mockPermissions as any,
        total: 2,
      })
      mockPermissionRepository.findSystemPermissions.mockResolvedValue([mockPermissions[0]] as any)
      mockPermissionRepository.findDefaultPermissions.mockResolvedValue([mockPermissions[1]] as any)
      mockPermissionRepository.findExpiredPermissions.mockResolvedValue([] as any)
      mockPermissionRepository.findWithConditions.mockResolvedValue([mockPermissions[0]] as any)
      mockPermissionRepository.findWithFields.mockResolvedValue([mockPermissions[1]] as any)
      mockPermissionRepository.countByTenant.mockResolvedValue(2)
      mockPermissionRepository.countByStatus.mockResolvedValue(1)

      const result = await useCase.execute('test-tenant-id')

      expect(result).toEqual({
        totalPermissions: 2,
        activePermissions: 1,
        suspendedPermissions: 1,
        deletedPermissions: 1,
        systemPermissions: undefined,
        defaultPermissions: undefined,
        expiredPermissions: undefined,
        permissionsWithConditions: undefined,
        permissionsWithFields: undefined,
      })
    })
  })

  describe('executeByStatus', () => {
    it('应该返回按状态分组的统计信息', async () => {
      const mockPermissions = [
        {
          id: 'permission-1',
          getStatus: jest.fn().mockReturnValue('active'),
          getName: jest.fn().mockReturnValue('权限1'),
          getCode: jest.fn().mockReturnValue('PERMISSION_1'),
          getType: jest.fn().mockReturnValue('api'),
          getAction: jest.fn().mockReturnValue('read'),
        },
        {
          id: 'permission-2',
          getStatus: jest.fn().mockReturnValue('active'),
          getName: jest.fn().mockReturnValue('权限2'),
          getCode: jest.fn().mockReturnValue('PERMISSION_2'),
          getType: jest.fn().mockReturnValue('api'),
          getAction: jest.fn().mockReturnValue('write'),
        },
      ]

      mockPermissionRepository.findByStatus.mockResolvedValue(mockPermissions as any)

      const result = await useCase.executeByStatus('active', 'test-tenant-id')

      expect(result).toEqual({
        count: 2,
        permissions: [
          {
            id: 'permission-1',
            name: '权限1',
            code: 'PERMISSION_1',
            type: 'api',
            status: 'active',
            action: 'read',
          },
          {
            id: 'permission-2',
            name: '权限2',
            code: 'PERMISSION_2',
            type: 'api',
            status: 'active',
            action: 'write',
          },
        ],
      })
      expect(mockPermissionRepository.findByStatus).toHaveBeenCalledWith('active', 'test-tenant-id', undefined)
    })
  })

  describe('executeByDateRange', () => {
    it('应该返回按日期范围的统计信息', async () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-12-31')
      const mockPermissions = [
        {
          id: 'permission-1',
          createdAt: new Date('2024-06-01'),
          getName: jest.fn().mockReturnValue('权限1'),
          getCode: jest.fn().mockReturnValue('PERMISSION_1'),
          getType: jest.fn().mockReturnValue('api'),
          getStatus: jest.fn().mockReturnValue('active'),
          getAction: jest.fn().mockReturnValue('read'),
        },
        {
          id: 'permission-2',
          createdAt: new Date('2024-07-01'),
          getName: jest.fn().mockReturnValue('权限2'),
          getCode: jest.fn().mockReturnValue('PERMISSION_2'),
          getType: jest.fn().mockReturnValue('api'),
          getStatus: jest.fn().mockReturnValue('active'),
          getAction: jest.fn().mockReturnValue('write'),
        },
      ]

      mockPermissionRepository.findAll.mockResolvedValue({
        permissions: mockPermissions as any,
        total: 2,
      })

      const result = await useCase.executeByDateRange(startDate, endDate, 'test-tenant-id')

      expect(result).toEqual({
        count: 2,
        permissions: [
          {
            id: 'permission-1',
            name: '权限1',
            code: 'PERMISSION_1',
            type: 'api',
            status: 'active',
            action: 'read',
            createdAt: new Date('2024-06-01'),
          },
          {
            id: 'permission-2',
            name: '权限2',
            code: 'PERMISSION_2',
            type: 'api',
            status: 'active',
            action: 'write',
            createdAt: new Date('2024-07-01'),
          },
        ],
      })
    })
  })

  describe('executeGrowthRate', () => {
    it('应该返回权限增长率', async () => {
      mockPermissionRepository.countByTenant.mockResolvedValue(10)
      mockPermissionRepository.countByStatus.mockResolvedValue(8)

      const result = await useCase.executeGrowthRate('test-tenant-id')

      expect(result).toBe(0.05) // 实际增长率
    })
  })

  describe('executePermissionActivityStats', () => {
    it('应该返回权限活跃度统计', async () => {
      const mockPermissions = [
        {
          id: 'permission-1',
          getStatus: jest.fn().mockReturnValue('active'),
          getName: jest.fn().mockReturnValue('权限1'),
        },
        {
          id: 'permission-2',
          getStatus: jest.fn().mockReturnValue('active'),
          getName: jest.fn().mockReturnValue('权限2'),
        },
        {
          id: 'permission-3',
          getStatus: jest.fn().mockReturnValue('suspended'),
          getName: jest.fn().mockReturnValue('权限3'),
        },
      ]

      mockPermissionRepository.findAll.mockResolvedValue({
        permissions: mockPermissions as any,
        total: 3,
      })
      mockPermissionRepository.countByTenant.mockResolvedValue(3)
      mockPermissionRepository.countByStatus.mockResolvedValue(2)

      const result = await useCase.executePermissionActivityStats('test-tenant-id')

      expect(result).toEqual({
        activeRate: 0.6666666666666666,
        activePermissions: 2,
        totalPermissions: 3,
      })
    })
  })

  describe('executeByType', () => {
    it('应该返回按类型分组的统计信息', async () => {
      const mockPermissions = [
        {
          id: 'permission-1',
          getType: jest.fn().mockReturnValue('api'),
          getName: jest.fn().mockReturnValue('权限1'),
          getCode: jest.fn().mockReturnValue('PERMISSION_1'),
          getStatus: jest.fn().mockReturnValue('active'),
          getAction: jest.fn().mockReturnValue('read'),
        },
        {
          id: 'permission-2',
          getType: jest.fn().mockReturnValue('api'),
          getName: jest.fn().mockReturnValue('权限2'),
          getCode: jest.fn().mockReturnValue('PERMISSION_2'),
          getStatus: jest.fn().mockReturnValue('active'),
          getAction: jest.fn().mockReturnValue('write'),
        },
      ]

      mockPermissionRepository.findByType.mockResolvedValue(mockPermissions as any)

      const result = await useCase.executeByType('api', 'test-tenant-id')

      expect(result).toEqual({
        count: 2,
        permissions: [
          {
            id: 'permission-1',
            name: '权限1',
            code: 'PERMISSION_1',
            type: 'api',
            status: 'active',
            action: 'read',
          },
          {
            id: 'permission-2',
            name: '权限2',
            code: 'PERMISSION_2',
            type: 'api',
            status: 'active',
            action: 'write',
          },
        ],
      })
      expect(mockPermissionRepository.findByType).toHaveBeenCalledWith('api', 'test-tenant-id', undefined)
    })
  })

  describe('executeByAction', () => {
    it('应该返回按操作分组的统计信息', async () => {
      const mockPermissions = [
        {
          id: 'permission-1',
          getAction: jest.fn().mockReturnValue('read'),
          getName: jest.fn().mockReturnValue('权限1'),
          getCode: jest.fn().mockReturnValue('PERMISSION_1'),
          getStatus: jest.fn().mockReturnValue('active'),
          getType: jest.fn().mockReturnValue('api'),
        },
        {
          id: 'permission-2',
          getAction: jest.fn().mockReturnValue('read'),
          getName: jest.fn().mockReturnValue('权限2'),
          getCode: jest.fn().mockReturnValue('PERMISSION_2'),
          getStatus: jest.fn().mockReturnValue('active'),
          getType: jest.fn().mockReturnValue('api'),
        },
      ]

      mockPermissionRepository.findByAction.mockResolvedValue(mockPermissions as any)

      const result = await useCase.executeByAction('read', 'test-tenant-id')

      expect(result).toEqual({
        count: 2,
        permissions: [
          {
            id: 'permission-1',
            name: '权限1',
            code: 'PERMISSION_1',
            type: 'api',
            status: 'active',
            action: 'read',
          },
          {
            id: 'permission-2',
            name: '权限2',
            code: 'PERMISSION_2',
            type: 'api',
            status: 'active',
            action: 'read',
          },
        ],
      })
      expect(mockPermissionRepository.findByAction).toHaveBeenCalledWith('read', 'test-tenant-id', undefined)
    })
  })

  describe('executeRecentPermissions', () => {
    it('应该返回最近权限列表', async () => {
      const mockPermissions = [
        {
          id: 'permission-1',
          createdAt: new Date('2024-12-01'),
          getName: jest.fn().mockReturnValue('权限1'),
          getCode: jest.fn().mockReturnValue('PERMISSION_1'),
          getType: jest.fn().mockReturnValue('api'),
          getStatus: jest.fn().mockReturnValue('active'),
          getAction: jest.fn().mockReturnValue('read'),
        },
        {
          id: 'permission-2',
          createdAt: new Date('2024-11-01'),
          getName: jest.fn().mockReturnValue('权限2'),
          getCode: jest.fn().mockReturnValue('PERMISSION_2'),
          getType: jest.fn().mockReturnValue('api'),
          getStatus: jest.fn().mockReturnValue('active'),
          getAction: jest.fn().mockReturnValue('write'),
        },
      ]

      mockPermissionRepository.findAll.mockResolvedValue({
        permissions: mockPermissions as any,
        total: 2,
      })

      const result = await useCase.executeRecentPermissions('test-tenant-id', undefined, 10)

      expect(result).toEqual([
        {
          id: 'permission-1',
          name: '权限1',
          code: 'PERMISSION_1',
          type: 'api',
          status: 'active',
          action: 'read',
          createdAt: new Date('2024-12-01'),
        },
        {
          id: 'permission-2',
          name: '权限2',
          code: 'PERMISSION_2',
          type: 'api',
          status: 'active',
          action: 'write',
          createdAt: new Date('2024-11-01'),
        },
      ])
      expect(mockPermissionRepository.findAll).toHaveBeenCalledWith('test-tenant-id', undefined, 1, 10)
    })
  })
}) 
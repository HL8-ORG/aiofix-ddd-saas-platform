import { Test, TestingModule } from '@nestjs/testing'
import { GetPermissionUseCase } from '../use-cases/get-permission.use-case'
import type { PermissionRepository } from '../../domain/repositories/permission.repository'
import { PermissionType } from '../../domain/value-objects/permission-type.value-object'
import { PermissionAction } from '../../domain/value-objects/permission-action.value-object'
import { PermissionStatus } from '../../domain/value-objects/permission-status.value-object'

describe('GetPermissionUseCase', () => {
  let useCase: GetPermissionUseCase
  let mockPermissionRepository: jest.Mocked<PermissionRepository>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPermissionUseCase,
        {
          provide: 'PermissionRepository',
          useValue: {
            findById: jest.fn(),
            findByCode: jest.fn(),
            findByName: jest.fn(),
            findByType: jest.fn(),
            findByStatus: jest.fn(),
            findByAction: jest.fn(),
            findByResource: jest.fn(),
            findByModule: jest.fn(),
            findByRoleId: jest.fn(),
            findByParentPermissionId: jest.fn(),
            findSystemPermissions: jest.fn(),
            findDefaultPermissions: jest.fn(),
            findExpiredPermissions: jest.fn(),
            findActivePermissions: jest.fn(),
          },
        },
      ],
    }).compile()

    useCase = module.get<GetPermissionUseCase>(GetPermissionUseCase)
    mockPermissionRepository = module.get('PermissionRepository')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('execute', () => {
    it('应该根据ID获取权限', async () => {
      const mockPermission = {
        id: 'test-permission-id',
        getName: jest.fn().mockReturnValue('测试权限'),
        getCode: jest.fn().mockReturnValue('test:permission'),
      }

      mockPermissionRepository.findById.mockResolvedValue(mockPermission as any)

      const result = await useCase.execute('test-permission-id', 'test-tenant-id')

      expect(result).toBe(mockPermission)
      expect(mockPermissionRepository.findById).toHaveBeenCalledWith('test-permission-id', 'test-tenant-id')
    })

    it('应该抛出错误当权限不存在', async () => {
      mockPermissionRepository.findById.mockResolvedValue(null)

      await expect(useCase.execute('non-existent-id', 'test-tenant-id')).rejects.toThrow('权限 "non-existent-id" 不存在')
      expect(mockPermissionRepository.findById).toHaveBeenCalledWith('non-existent-id', 'test-tenant-id')
    })
  })

  describe('executeByCode', () => {
    it('应该根据代码获取权限', async () => {
      const mockPermission = {
        id: 'test-permission-id',
        getCode: jest.fn().mockReturnValue('test:permission'),
      }

      mockPermissionRepository.findByCode.mockResolvedValue(mockPermission as any)

      const result = await useCase.executeByCode('test:permission', 'test-tenant-id')

      expect(result).toBe(mockPermission)
      expect(mockPermissionRepository.findByCode).toHaveBeenCalledWith('test:permission', 'test-tenant-id')
    })
  })

  describe('executeByType', () => {
    it('应该根据类型获取权限列表', async () => {
      const mockPermissions = [
        { id: 'permission-1', getType: jest.fn().mockReturnValue('api') },
        { id: 'permission-2', getType: jest.fn().mockReturnValue('api') },
      ]

      mockPermissionRepository.findByType.mockResolvedValue(mockPermissions as any)

      const result = await useCase.executeByType('api', 'test-tenant-id')

      expect(result).toBe(mockPermissions)
      expect(mockPermissionRepository.findByType).toHaveBeenCalledWith('api', 'test-tenant-id', undefined)
    })
  })

  describe('executeByStatus', () => {
    it('应该根据状态获取权限列表', async () => {
      const mockPermissions = [
        { id: 'permission-1', getStatus: jest.fn().mockReturnValue('active') },
        { id: 'permission-2', getStatus: jest.fn().mockReturnValue('active') },
      ]

      mockPermissionRepository.findByStatus.mockResolvedValue(mockPermissions as any)

      const result = await useCase.executeByStatus('active', 'test-tenant-id')

      expect(result).toBe(mockPermissions)
      expect(mockPermissionRepository.findByStatus).toHaveBeenCalledWith('active', 'test-tenant-id', undefined)
    })
  })

  describe('executeByAction', () => {
    it('应该根据操作获取权限列表', async () => {
      const mockPermissions = [
        { id: 'permission-1', getAction: jest.fn().mockReturnValue('read') },
        { id: 'permission-2', getAction: jest.fn().mockReturnValue('read') },
      ]

      mockPermissionRepository.findByAction.mockResolvedValue(mockPermissions as any)

      const result = await useCase.executeByAction('read', 'test-tenant-id')

      expect(result).toBe(mockPermissions)
      expect(mockPermissionRepository.findByAction).toHaveBeenCalledWith('read', 'test-tenant-id', undefined)
    })
  })

  describe('executeSystemPermissions', () => {
    it('应该获取系统权限列表', async () => {
      const mockPermissions = [
        { id: 'system-permission-1', getIsSystemPermission: jest.fn().mockReturnValue(true) },
        { id: 'system-permission-2', getIsSystemPermission: jest.fn().mockReturnValue(true) },
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
        { id: 'default-permission-1', getIsDefaultPermission: jest.fn().mockReturnValue(true) },
        { id: 'default-permission-2', getIsDefaultPermission: jest.fn().mockReturnValue(true) },
      ]

      mockPermissionRepository.findDefaultPermissions.mockResolvedValue(mockPermissions as any)

      const result = await useCase.executeDefaultPermissions('test-tenant-id')

      expect(result).toBe(mockPermissions)
      expect(mockPermissionRepository.findDefaultPermissions).toHaveBeenCalledWith('test-tenant-id')
    })
  })

  describe('executeActivePermissions', () => {
    it('应该获取激活权限列表', async () => {
      const mockPermissions = [
        { id: 'active-permission-1', getStatus: jest.fn().mockReturnValue('active') },
        { id: 'active-permission-2', getStatus: jest.fn().mockReturnValue('active') },
      ]

      mockPermissionRepository.findActivePermissions.mockResolvedValue(mockPermissions as any)

      const result = await useCase.executeActivePermissions('test-tenant-id')

      expect(result).toBe(mockPermissions)
      expect(mockPermissionRepository.findActivePermissions).toHaveBeenCalledWith('test-tenant-id', undefined)
    })
  })
}) 
import { Test, TestingModule } from '@nestjs/testing'
import { DeletePermissionUseCase } from '../use-cases/delete-permission.use-case'
import type { PermissionRepository } from '../../domain/repositories/permission.repository'

describe('DeletePermissionUseCase', () => {
  let useCase: DeletePermissionUseCase
  let mockPermissionRepository: jest.Mocked<PermissionRepository>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeletePermissionUseCase,
        {
          provide: 'PermissionRepository',
          useValue: {
            findById: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            deleteByTenant: jest.fn(),
            deleteByOrganization: jest.fn(),
          },
        },
      ],
    }).compile()

    useCase = module.get<DeletePermissionUseCase>(DeletePermissionUseCase)
    mockPermissionRepository = module.get('PermissionRepository')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('execute', () => {
    it('应该成功软删除权限', async () => {
      const mockPermission = {
        id: 'test-permission-id',
        getIsSystemPermission: jest.fn().mockReturnValue(false),
        markAsDeleted: jest.fn(),
      }

      mockPermissionRepository.findById.mockResolvedValue(mockPermission as any)
      mockPermissionRepository.save.mockResolvedValue(mockPermission as any)

      const result = await useCase.execute('test-permission-id', 'test-tenant-id')

      expect(result).toBe(true)
      expect(mockPermissionRepository.findById).toHaveBeenCalledWith('test-permission-id', 'test-tenant-id')
      expect(mockPermission.getIsSystemPermission).toHaveBeenCalled()
      expect(mockPermission.markAsDeleted).toHaveBeenCalled()
      expect(mockPermissionRepository.save).toHaveBeenCalledWith(mockPermission)
    })

    it('应该抛出错误当权限不存在', async () => {
      mockPermissionRepository.findById.mockResolvedValue(null)

      await expect(useCase.execute('non-existent-id', 'test-tenant-id')).rejects.toThrow('权限 "non-existent-id" 不存在')
      expect(mockPermissionRepository.findById).toHaveBeenCalledWith('non-existent-id', 'test-tenant-id')
      expect(mockPermissionRepository.save).not.toHaveBeenCalled()
    })

    it('应该抛出错误当尝试删除系统权限', async () => {
      const mockPermission = {
        id: 'system-permission-id',
        getIsSystemPermission: jest.fn().mockReturnValue(true),
      }

      mockPermissionRepository.findById.mockResolvedValue(mockPermission as any)

      await expect(useCase.execute('system-permission-id', 'test-tenant-id')).rejects.toThrow('系统权限不允许删除')
      expect(mockPermission.getIsSystemPermission).toHaveBeenCalled()
      expect(mockPermissionRepository.save).not.toHaveBeenCalled()
    })
  })

  describe('executeHardDelete', () => {
    it('应该成功硬删除权限', async () => {
      const mockPermission = {
        id: 'test-permission-id',
        getIsSystemPermission: jest.fn().mockReturnValue(false),
      }

      mockPermissionRepository.findById.mockResolvedValue(mockPermission as any)
      mockPermissionRepository.delete.mockResolvedValue(true)

      const result = await useCase.executeHardDelete('test-permission-id', 'test-tenant-id')

      expect(result).toBe(true)
      expect(mockPermissionRepository.findById).toHaveBeenCalledWith('test-permission-id', 'test-tenant-id')
      expect(mockPermission.getIsSystemPermission).toHaveBeenCalled()
      expect(mockPermissionRepository.delete).toHaveBeenCalledWith('test-permission-id', 'test-tenant-id')
    })

    it('应该抛出错误当尝试硬删除系统权限', async () => {
      const mockPermission = {
        id: 'system-permission-id',
        getIsSystemPermission: jest.fn().mockReturnValue(true),
      }

      mockPermissionRepository.findById.mockResolvedValue(mockPermission as any)

      await expect(useCase.executeHardDelete('system-permission-id', 'test-tenant-id')).rejects.toThrow('系统权限不允许删除')
      expect(mockPermission.getIsSystemPermission).toHaveBeenCalled()
      expect(mockPermissionRepository.delete).not.toHaveBeenCalled()
    })
  })

  describe('executeRestore', () => {
    it('应该成功恢复权限', async () => {
      const mockPermission = {
        id: 'test-permission-id',
        restore: jest.fn(),
      }

      mockPermissionRepository.findById.mockResolvedValue(mockPermission as any)
      mockPermissionRepository.save.mockResolvedValue(mockPermission as any)

      const result = await useCase.executeRestore('test-permission-id', 'test-tenant-id')

      expect(result).toBe(true)
      expect(mockPermissionRepository.findById).toHaveBeenCalledWith('test-permission-id', 'test-tenant-id')
      expect(mockPermission.restore).toHaveBeenCalled()
      expect(mockPermissionRepository.save).toHaveBeenCalledWith(mockPermission)
    })

    it('应该抛出错误当权限不存在', async () => {
      mockPermissionRepository.findById.mockResolvedValue(null)

      await expect(useCase.executeRestore('non-existent-id', 'test-tenant-id')).rejects.toThrow('权限 "non-existent-id" 不存在')
      expect(mockPermissionRepository.findById).toHaveBeenCalledWith('non-existent-id', 'test-tenant-id')
      expect(mockPermissionRepository.save).not.toHaveBeenCalled()
    })
  })

  describe('executeBatchDelete', () => {
    it('应该成功批量删除权限', async () => {
      const mockPermission = {
        id: 'test-permission-id',
        getIsSystemPermission: jest.fn().mockReturnValue(false),
        markAsDeleted: jest.fn(),
      }

      mockPermissionRepository.findById.mockResolvedValue(mockPermission as any)
      mockPermissionRepository.save.mockResolvedValue(mockPermission as any)

      const result = await useCase.executeBatchDelete(['permission-1', 'permission-2'], 'test-tenant-id')

      expect(result).toEqual({
        success: ['permission-1', 'permission-2'],
        failed: [],
      })
      expect(mockPermissionRepository.findById).toHaveBeenCalledTimes(2)
      expect(mockPermissionRepository.save).toHaveBeenCalledTimes(2)
    })

    it('应该处理批量删除中的部分失败', async () => {
      const mockPermission = {
        id: 'test-permission-id',
        getIsSystemPermission: jest.fn().mockReturnValue(false),
        markAsDeleted: jest.fn(),
      }

      mockPermissionRepository.findById
        .mockResolvedValueOnce(mockPermission as any)
        .mockResolvedValueOnce(null)
      mockPermissionRepository.save.mockResolvedValue(mockPermission as any)

      const result = await useCase.executeBatchDelete(['permission-1', 'permission-2'], 'test-tenant-id')

      expect(result).toEqual({
        success: ['permission-1'],
        failed: ['permission-2'],
      })
    })
  })

  describe('executeByTenant', () => {
    it('应该成功删除租户的所有权限', async () => {
      mockPermissionRepository.deleteByTenant.mockResolvedValue(5)

      const result = await useCase.executeByTenant('test-tenant-id')

      expect(result).toBe(5)
      expect(mockPermissionRepository.deleteByTenant).toHaveBeenCalledWith('test-tenant-id')
    })
  })

  describe('executeByOrganization', () => {
    it('应该成功删除组织的所有权限', async () => {
      mockPermissionRepository.deleteByOrganization.mockResolvedValue(3)

      const result = await useCase.executeByOrganization('test-org-id', 'test-tenant-id')

      expect(result).toBe(3)
      expect(mockPermissionRepository.deleteByOrganization).toHaveBeenCalledWith('test-org-id', 'test-tenant-id')
    })
  })
}) 
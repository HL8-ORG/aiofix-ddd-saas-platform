import { Test, TestingModule } from '@nestjs/testing'
import { UpdatePermissionStatusUseCase } from '../../use-cases/update-permission-status.use-case'
import type { PermissionRepository } from '../../../domain/repositories/permission.repository'

describe('UpdatePermissionStatusUseCase', () => {
  let useCase: UpdatePermissionStatusUseCase
  let mockPermissionRepository: jest.Mocked<PermissionRepository>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePermissionStatusUseCase,
        {
          provide: 'PermissionRepository',
          useValue: {
            findById: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile()

    useCase = module.get<UpdatePermissionStatusUseCase>(UpdatePermissionStatusUseCase)
    mockPermissionRepository = module.get('PermissionRepository')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('executeActivate', () => {
    it('应该成功激活权限', async () => {
      const mockPermission = {
        id: 'test-permission-id',
        activate: jest.fn(),
      }

      mockPermissionRepository.findById.mockResolvedValue(mockPermission as any)
      mockPermissionRepository.save.mockResolvedValue(mockPermission as any)

      const result = await useCase.executeActivate('test-permission-id', 'test-tenant-id')

      expect(result).toBe(mockPermission)
      expect(mockPermissionRepository.findById).toHaveBeenCalledWith('test-permission-id', 'test-tenant-id')
      expect(mockPermission.activate).toHaveBeenCalled()
      expect(mockPermissionRepository.save).toHaveBeenCalledWith(mockPermission)
    })

    it('应该抛出错误当权限不存在', async () => {
      mockPermissionRepository.findById.mockResolvedValue(null)

      await expect(useCase.executeActivate('non-existent-id', 'test-tenant-id')).rejects.toThrow('权限 "non-existent-id" 不存在')
      expect(mockPermissionRepository.findById).toHaveBeenCalledWith('non-existent-id', 'test-tenant-id')
      expect(mockPermissionRepository.save).not.toHaveBeenCalled()
    })
  })

  describe('executeSuspend', () => {
    it('应该成功禁用权限', async () => {
      const mockPermission = {
        id: 'test-permission-id',
        suspend: jest.fn(),
      }

      mockPermissionRepository.findById.mockResolvedValue(mockPermission as any)
      mockPermissionRepository.save.mockResolvedValue(mockPermission as any)

      const result = await useCase.executeSuspend('test-permission-id', 'test-tenant-id')

      expect(result).toBe(mockPermission)
      expect(mockPermissionRepository.findById).toHaveBeenCalledWith('test-permission-id', 'test-tenant-id')
      expect(mockPermission.suspend).toHaveBeenCalled()
      expect(mockPermissionRepository.save).toHaveBeenCalledWith(mockPermission)
    })

    it('应该抛出错误当权限不存在', async () => {
      mockPermissionRepository.findById.mockResolvedValue(null)

      await expect(useCase.executeSuspend('non-existent-id', 'test-tenant-id')).rejects.toThrow('权限 "non-existent-id" 不存在')
      expect(mockPermissionRepository.findById).toHaveBeenCalledWith('non-existent-id', 'test-tenant-id')
      expect(mockPermissionRepository.save).not.toHaveBeenCalled()
    })
  })

  describe('executeUpdateStatus', () => {
    it('应该成功更新权限状态为active', async () => {
      const mockPermission = {
        id: 'test-permission-id',
        activate: jest.fn(),
      }

      mockPermissionRepository.findById.mockResolvedValue(mockPermission as any)
      mockPermissionRepository.save.mockResolvedValue(mockPermission as any)

      const result = await useCase.executeUpdateStatus('test-permission-id', 'active', 'test-tenant-id')

      expect(result).toBe(mockPermission)
      expect(mockPermission.activate).toHaveBeenCalled()
      expect(mockPermissionRepository.save).toHaveBeenCalledWith(mockPermission)
    })

    it('应该成功更新权限状态为suspended', async () => {
      const mockPermission = {
        id: 'test-permission-id',
        suspend: jest.fn(),
      }

      mockPermissionRepository.findById.mockResolvedValue(mockPermission as any)
      mockPermissionRepository.save.mockResolvedValue(mockPermission as any)

      const result = await useCase.executeUpdateStatus('test-permission-id', 'suspended', 'test-tenant-id')

      expect(result).toBe(mockPermission)
      expect(mockPermission.suspend).toHaveBeenCalled()
      expect(mockPermissionRepository.save).toHaveBeenCalledWith(mockPermission)
    })

    it('应该成功更新权限状态为deleted', async () => {
      const mockPermission = {
        id: 'test-permission-id',
        markAsDeleted: jest.fn(),
      }

      mockPermissionRepository.findById.mockResolvedValue(mockPermission as any)
      mockPermissionRepository.save.mockResolvedValue(mockPermission as any)

      const result = await useCase.executeUpdateStatus('test-permission-id', 'deleted', 'test-tenant-id')

      expect(result).toBe(mockPermission)
      expect(mockPermission.markAsDeleted).toHaveBeenCalled()
      expect(mockPermissionRepository.save).toHaveBeenCalledWith(mockPermission)
    })

    it('应该抛出错误当状态无效', async () => {
      const mockPermission = {
        id: 'test-permission-id',
      }

      mockPermissionRepository.findById.mockResolvedValue(mockPermission as any)

      await expect(useCase.executeUpdateStatus('test-permission-id', 'invalid-status', 'test-tenant-id')).rejects.toThrow('无效的权限状态: invalid-status')
      expect(mockPermissionRepository.save).not.toHaveBeenCalled()
    })

    it('应该抛出错误当权限不存在', async () => {
      mockPermissionRepository.findById.mockResolvedValue(null)

      await expect(useCase.executeUpdateStatus('non-existent-id', 'active', 'test-tenant-id')).rejects.toThrow('权限 "non-existent-id" 不存在')
      expect(mockPermissionRepository.save).not.toHaveBeenCalled()
    })
  })
}) 
import { Test, TestingModule } from '@nestjs/testing'
import { UpdatePermissionUseCase, type UpdatePermissionRequest } from '../../use-cases/update-permission.use-case'
import type { PermissionRepository } from '../../../domain/repositories/permission.repository'
import { PermissionType } from '../../../domain/value-objects/permission-type.value-object'
import { PermissionAction } from '../../../domain/value-objects/permission-action.value-object'
import type { PermissionConditionData } from '../../../domain/value-objects/permission-condition.value-object'

describe('UpdatePermissionUseCase', () => {
  let useCase: UpdatePermissionUseCase
  let mockPermissionRepository: jest.Mocked<PermissionRepository>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePermissionUseCase,
        {
          provide: 'PermissionRepository',
          useValue: {
            findById: jest.fn(),
            findByName: jest.fn(),
            findByCode: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile()

    useCase = module.get<UpdatePermissionUseCase>(UpdatePermissionUseCase)
    mockPermissionRepository = module.get('PermissionRepository')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('execute', () => {
    const mockPermission = {
      id: 'test-permission-id',
      getName: jest.fn().mockReturnValue('测试权限'),
      getCode: jest.fn().mockReturnValue('TEST_PERMISSION'),
      updateInfo: jest.fn(),
      updateAction: jest.fn(),
      setConditions: jest.fn(),
      setFields: jest.fn(),
      setParentPermission: jest.fn(),
      removeParentPermission: jest.fn(),
    }

    it('应该成功更新权限信息', async () => {
      const request: UpdatePermissionRequest = {
        name: '更新后的权限',
        code: 'UPDATED_PERMISSION',
        description: '更新后的描述',
        resource: 'updated-resource',
        module: 'updated-module',
      }

      mockPermissionRepository.findById.mockResolvedValue(mockPermission as any)
      mockPermissionRepository.findByName.mockResolvedValue(null)
      mockPermissionRepository.findByCode.mockResolvedValue(null)
      mockPermissionRepository.save.mockResolvedValue(mockPermission as any)

      const result = await useCase.execute('test-permission-id', request, 'test-tenant-id')

      expect(result).toBe(mockPermission)
      expect(mockPermission.updateInfo).toHaveBeenCalledWith(
        '更新后的权限',
        'UPDATED_PERMISSION',
        '更新后的描述',
        'updated-resource',
        'updated-module'
      )
      expect(mockPermissionRepository.save).toHaveBeenCalledWith(mockPermission)
    })

    it('应该成功更新权限操作', async () => {
      const request: UpdatePermissionRequest = {
        action: PermissionAction.UPDATE,
      }

      mockPermissionRepository.findById.mockResolvedValue(mockPermission as any)
      mockPermissionRepository.save.mockResolvedValue(mockPermission as any)

      const result = await useCase.execute('test-permission-id', request, 'test-tenant-id')

      expect(result).toBe(mockPermission)
      expect(mockPermission.updateAction).toHaveBeenCalledWith(PermissionAction.UPDATE)
      expect(mockPermissionRepository.save).toHaveBeenCalledWith(mockPermission)
    })

    it('应该成功更新权限条件', async () => {
      const conditions: PermissionConditionData[] = [
        { field: 'userId', operator: 'eq', value: 'user123' }
      ]

      const request: UpdatePermissionRequest = {
        conditions,
      }

      mockPermissionRepository.findById.mockResolvedValue(mockPermission as any)
      mockPermissionRepository.save.mockResolvedValue(mockPermission as any)

      const result = await useCase.execute('test-permission-id', request, 'test-tenant-id')

      expect(result).toBe(mockPermission)
      expect(mockPermission.setConditions).toHaveBeenCalledWith(conditions)
      expect(mockPermissionRepository.save).toHaveBeenCalledWith(mockPermission)
    })

    it('应该成功更新字段权限', async () => {
      const fields = ['name', 'email', 'phone']

      const request: UpdatePermissionRequest = {
        fields,
      }

      mockPermissionRepository.findById.mockResolvedValue(mockPermission as any)
      mockPermissionRepository.save.mockResolvedValue(mockPermission as any)

      const result = await useCase.execute('test-permission-id', request, 'test-tenant-id')

      expect(result).toBe(mockPermission)
      expect(mockPermission.setFields).toHaveBeenCalledWith(fields)
      expect(mockPermissionRepository.save).toHaveBeenCalledWith(mockPermission)
    })

    it('应该成功设置父权限', async () => {
      const request: UpdatePermissionRequest = {
        parentPermissionId: 'parent-permission-id',
      }

      const mockParentPermission = {
        id: 'parent-permission-id',
        getStatus: jest.fn().mockReturnValue('active'),
      }

      mockPermissionRepository.findById.mockResolvedValue(mockPermission as any)
      mockPermissionRepository.findById.mockResolvedValueOnce(mockPermission as any)
      mockPermissionRepository.findById.mockResolvedValueOnce(mockParentPermission as any)
      mockPermissionRepository.save.mockResolvedValue(mockPermission as any)

      const result = await useCase.execute('test-permission-id', request, 'test-tenant-id')

      expect(result).toBe(mockPermission)
      expect(mockPermission.setParentPermission).toHaveBeenCalledWith('parent-permission-id')
      expect(mockPermissionRepository.save).toHaveBeenCalledWith(mockPermission)
    })

    it('应该成功移除父权限', async () => {
      const request: UpdatePermissionRequest = {
        parentPermissionId: null,
      }

      mockPermissionRepository.findById.mockResolvedValue(mockPermission as any)
      mockPermissionRepository.save.mockResolvedValue(mockPermission as any)

      const result = await useCase.execute('test-permission-id', request, 'test-tenant-id')

      expect(result).toBe(mockPermission)
      expect(mockPermission.removeParentPermission).toHaveBeenCalled()
      expect(mockPermissionRepository.save).toHaveBeenCalledWith(mockPermission)
    })

    it('应该抛出错误当权限不存在', async () => {
      const request: UpdatePermissionRequest = {
        name: '更新后的权限',
      }

      mockPermissionRepository.findById.mockResolvedValue(null)

      await expect(useCase.execute('non-existent-id', request, 'test-tenant-id')).rejects.toThrow('权限 "non-existent-id" 不存在')
      expect(mockPermissionRepository.save).not.toHaveBeenCalled()
    })

    it('应该抛出错误当权限名称已存在', async () => {
      const request: UpdatePermissionRequest = {
        name: '已存在的权限名称',
      }

      const existingPermission = {
        id: 'existing-permission-id',
        getName: jest.fn().mockReturnValue('已存在的权限名称'),
      }

      mockPermissionRepository.findById.mockResolvedValue(mockPermission as any)
      mockPermissionRepository.findByName.mockResolvedValue(existingPermission as any)

      await expect(useCase.execute('test-permission-id', request, 'test-tenant-id')).rejects.toThrow('权限名称 "已存在的权限名称" 在租户内已存在')
      expect(mockPermissionRepository.save).not.toHaveBeenCalled()
    })

    it('应该抛出错误当权限代码已存在', async () => {
      const request: UpdatePermissionRequest = {
        code: 'EXISTING_PERMISSION_CODE',
      }

      const existingPermission = {
        id: 'existing-permission-id',
        getCode: jest.fn().mockReturnValue('EXISTING_PERMISSION_CODE'),
      }

      mockPermissionRepository.findById.mockResolvedValue(mockPermission as any)
      mockPermissionRepository.findByCode.mockResolvedValue(existingPermission as any)

      await expect(useCase.execute('test-permission-id', request, 'test-tenant-id')).rejects.toThrow('权限代码 "EXISTING_PERMISSION_CODE" 在租户内已存在')
      expect(mockPermissionRepository.save).not.toHaveBeenCalled()
    })
  })

  describe('executeSettings', () => {
    const mockPermission = {
      id: 'test-permission-id',
      getName: jest.fn().mockReturnValue('测试权限'),
    }

    it('应该成功更新权限设置', async () => {
      const settings = {
        allowGuestAccess: false,
        requireApproval: true,
        maxUsageCount: 100,
      }

      mockPermissionRepository.findById.mockResolvedValue(mockPermission as any)
      mockPermissionRepository.save.mockResolvedValue(mockPermission as any)

      const result = await useCase.executeSettings('test-permission-id', settings, 'test-tenant-id')

      expect(result).toBe(mockPermission)
      expect(mockPermissionRepository.findById).toHaveBeenCalledWith('test-permission-id', 'test-tenant-id')
      expect(mockPermissionRepository.save).toHaveBeenCalledWith(mockPermission)
    })

    it('应该抛出错误当权限不存在', async () => {
      const settings = { allowGuestAccess: false }

      mockPermissionRepository.findById.mockResolvedValue(null)

      await expect(useCase.executeSettings('non-existent-id', settings, 'test-tenant-id')).rejects.toThrow('权限 "non-existent-id" 不存在')
      expect(mockPermissionRepository.save).not.toHaveBeenCalled()
    })
  })

  describe('executePartialSettings', () => {
    const mockPermission = {
      id: 'test-permission-id',
      getName: jest.fn().mockReturnValue('测试权限'),
    }

    it('应该成功部分更新权限设置', async () => {
      const settings = {
        allowGuestAccess: true,
      }

      mockPermissionRepository.findById.mockResolvedValue(mockPermission as any)
      mockPermissionRepository.save.mockResolvedValue(mockPermission as any)

      const result = await useCase.executePartialSettings('test-permission-id', settings, 'test-tenant-id')

      expect(result).toBe(mockPermission)
      expect(mockPermissionRepository.findById).toHaveBeenCalledWith('test-permission-id', 'test-tenant-id')
      expect(mockPermissionRepository.save).toHaveBeenCalledWith(mockPermission)
    })

    it('应该抛出错误当权限不存在', async () => {
      const settings = { allowGuestAccess: true }

      mockPermissionRepository.findById.mockResolvedValue(null)

      await expect(useCase.executePartialSettings('non-existent-id', settings, 'test-tenant-id')).rejects.toThrow('权限 "non-existent-id" 不存在')
      expect(mockPermissionRepository.save).not.toHaveBeenCalled()
    })
  })
})
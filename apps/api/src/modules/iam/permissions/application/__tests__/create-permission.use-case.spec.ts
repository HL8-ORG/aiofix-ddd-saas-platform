import { Test, TestingModule } from '@nestjs/testing'
import { CreatePermissionUseCase, type CreatePermissionRequest } from '../use-cases/create-permission.use-case'
import type { PermissionRepository } from '../../domain/repositories/permission.repository'
import { PermissionType } from '../../domain/value-objects/permission-type.value-object'
import { PermissionAction } from '../../domain/value-objects/permission-action.value-object'

describe('CreatePermissionUseCase', () => {
  let useCase: CreatePermissionUseCase
  let mockPermissionRepository: jest.Mocked<PermissionRepository>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePermissionUseCase,
        {
          provide: 'PermissionRepository',
          useValue: {
            save: jest.fn(),
            findByName: jest.fn(),
            findByCode: jest.fn(),
            findById: jest.fn(),
          },
        },
      ],
    }).compile()

    useCase = module.get<CreatePermissionUseCase>(CreatePermissionUseCase)
    mockPermissionRepository = module.get('PermissionRepository')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('execute', () => {
    const validRequest: CreatePermissionRequest = {
      name: '测试权限',
      code: 'TEST_PERMISSION',
      type: PermissionType.API,
      action: PermissionAction.READ,
      tenantId: 'test-tenant-id',
      adminUserId: 'test-admin-id',
      description: '测试权限描述',
      organizationId: 'test-org-id',
      resource: 'test-resource',
      module: 'test-module',
      isSystemPermission: false,
      isDefaultPermission: false,
      conditions: [],
      fields: [],
      expiresAt: null,
      parentPermissionId: null,
      tags: 'test',
    }

    it('应该成功创建权限', async () => {
      const mockPermission = {
        id: 'test-permission-id',
        getName: jest.fn().mockReturnValue('测试权限'),
        getCode: jest.fn().mockReturnValue('TEST_PERMISSION'),
      }

      mockPermissionRepository.findByName.mockResolvedValue(null)
      mockPermissionRepository.findByCode.mockResolvedValue(null)
      mockPermissionRepository.save.mockResolvedValue(mockPermission as any)

      const result = await useCase.execute(validRequest)

      expect(result).toBe(mockPermission)
      expect(mockPermissionRepository.findByName).toHaveBeenCalledWith('测试权限', 'test-tenant-id')
      expect(mockPermissionRepository.findByCode).toHaveBeenCalledWith('TEST_PERMISSION', 'test-tenant-id')
      expect(mockPermissionRepository.save).toHaveBeenCalledTimes(1)
    })

    it('应该抛出错误当权限名称已存在', async () => {
      const existingPermission = {
        id: 'existing-permission-id',
        getName: jest.fn().mockReturnValue('测试权限'),
      }

      mockPermissionRepository.findByName.mockResolvedValue(existingPermission as any)

      await expect(useCase.execute(validRequest)).rejects.toThrow('权限名称 "测试权限" 在租户内已存在')
      expect(mockPermissionRepository.findByName).toHaveBeenCalledWith('测试权限', 'test-tenant-id')
      expect(mockPermissionRepository.save).not.toHaveBeenCalled()
    })

    it('应该抛出错误当权限代码已存在', async () => {
      const existingPermission = {
        id: 'existing-permission-id',
        getCode: jest.fn().mockReturnValue('TEST_PERMISSION'),
      }

      mockPermissionRepository.findByName.mockResolvedValue(null)
      mockPermissionRepository.findByCode.mockResolvedValue(existingPermission as any)

      await expect(useCase.execute(validRequest)).rejects.toThrow('权限代码 "TEST_PERMISSION" 在租户内已存在')
      expect(mockPermissionRepository.findByCode).toHaveBeenCalledWith('TEST_PERMISSION', 'test-tenant-id')
      expect(mockPermissionRepository.save).not.toHaveBeenCalled()
    })
  })
}) 
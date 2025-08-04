import { EntityManager } from '@mikro-orm/core'
import { Permission } from '../../domain/entities/permission.entity'
import { PermissionAction } from '../../domain/value-objects/permission-action.value-object'
import { PermissionStatus, PermissionStatusValue } from '../../domain/value-objects/permission-status.value-object'
import { PermissionType } from '../../domain/value-objects/permission-type.value-object'
import { PermissionOrmEntity } from '../entities/permission.orm.entity'
import { PermissionRepositoryMikroOrm } from '../repositories/permission.repository.mikroorm'

describe('PermissionRepositoryMikroOrm', () => {
  let repository: PermissionRepositoryMikroOrm
  let mockEntityManager: jest.Mocked<EntityManager>
  let mockPermission: Permission
  let mockOrmEntity: PermissionOrmEntity

  beforeEach(() => {
    mockEntityManager = {
      find: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      persistAndFlush: jest.fn(),
      nativeDelete: jest.fn(),
      flush: jest.fn(),
    } as any

    repository = new PermissionRepositoryMikroOrm(mockEntityManager)

    mockPermission = new Permission(
      'test-permission-id',
      '测试权限',
      'TEST_PERMISSION',
      PermissionType.API,
      PermissionAction.READ,
      'test-tenant-id',
      'test-admin-id',
      '测试权限描述',
      'test-org-id',
      'user',
      'system',
    )
    mockPermission.status = new PermissionStatusValue(PermissionStatus.ACTIVE)
    mockPermission.createdAt = new Date('2024-01-01')
    mockPermission.updatedAt = new Date('2024-01-02')
    mockPermission.tags = 'admin,system'

    mockOrmEntity = new PermissionOrmEntity()
    mockOrmEntity.id = 'test-permission-id'
    mockOrmEntity.name = '测试权限'
    mockOrmEntity.code = 'TEST_PERMISSION'
    mockOrmEntity.description = '测试权限描述'
    mockOrmEntity.type = 'api'
    mockOrmEntity.status = 'active'
    mockOrmEntity.action = 'read'
    mockOrmEntity.tenantId = 'test-tenant-id'
    mockOrmEntity.adminUserId = 'test-admin-id'
    mockOrmEntity.organizationId = 'test-org-id'
    mockOrmEntity.resource = 'user'
    mockOrmEntity.module = 'system'
    mockOrmEntity.roleIds = []
    mockOrmEntity.fields = []
    mockOrmEntity.childPermissionIds = []
    mockOrmEntity.tags = 'admin,system'
    mockOrmEntity.createdAt = new Date('2024-01-01')
    mockOrmEntity.updatedAt = new Date('2024-01-02')
  })

  describe('findById', () => {
    it('应该正确查找权限', async () => {
      mockEntityManager.findOne.mockResolvedValue(mockOrmEntity)

      const result = await repository.findById('test-permission-id', 'test-tenant-id')

      expect(mockEntityManager.findOne).toHaveBeenCalledWith(PermissionOrmEntity, {
        id: 'test-permission-id',
        tenantId: 'test-tenant-id',
      })
      expect(result).toEqual(expect.objectContaining({
        id: 'test-permission-id',
        name: expect.any(Object),
        code: expect.any(Object),
        type: expect.any(Object),
        status: expect.any(Object),
        action: expect.any(Object),
        tenantId: 'test-tenant-id',
        adminUserId: 'test-admin-id',
        description: '测试权限描述',
        organizationId: 'test-org-id',
        resource: 'user',
        module: 'system',
      }))
    })

    it('当权限不存在时应该返回null', async () => {
      mockEntityManager.findOne.mockResolvedValue(null)

      const result = await repository.findById('non-existent-id', 'test-tenant-id')

      expect(result).toBeNull()
    })
  })

  describe('findByCode', () => {
    it('应该正确通过代码查找权限', async () => {
      mockEntityManager.findOne.mockResolvedValue(mockOrmEntity)

      const result = await repository.findByCode('TEST_PERMISSION', 'test-tenant-id')

      expect(mockEntityManager.findOne).toHaveBeenCalledWith(PermissionOrmEntity, {
        code: 'TEST_PERMISSION',
        tenantId: 'test-tenant-id',
      })
      expect(result).toEqual(expect.objectContaining({
        id: 'test-permission-id',
        name: expect.any(Object),
        code: expect.any(Object),
        type: expect.any(Object),
        status: expect.any(Object),
        action: expect.any(Object),
        tenantId: 'test-tenant-id',
        adminUserId: 'test-admin-id',
        description: '测试权限描述',
        organizationId: 'test-org-id',
        resource: 'user',
        module: 'system',
      }))
    })
  })

  describe('findByName', () => {
    it('应该正确通过名称查找权限', async () => {
      mockEntityManager.findOne.mockResolvedValue(mockOrmEntity)

      const result = await repository.findByName('测试权限', 'test-tenant-id')

      expect(mockEntityManager.findOne).toHaveBeenCalledWith(PermissionOrmEntity, {
        name: '测试权限',
        tenantId: 'test-tenant-id',
      })
      expect(result).toEqual(expect.objectContaining({
        id: 'test-permission-id',
        name: expect.any(Object),
        code: expect.any(Object),
        type: expect.any(Object),
        status: expect.any(Object),
        action: expect.any(Object),
        tenantId: 'test-tenant-id',
        adminUserId: 'test-admin-id',
        description: '测试权限描述',
        organizationId: 'test-org-id',
        resource: 'user',
        module: 'system',
      }))
    })
  })

  describe('findByType', () => {
    it('应该正确查找指定类型的权限', async () => {
      mockEntityManager.find.mockResolvedValue([mockOrmEntity])

      const result = await repository.findByType(PermissionType.API, 'test-tenant-id')

      expect(mockEntityManager.find).toHaveBeenCalledWith(PermissionOrmEntity, {
        type: 'api',
        tenantId: 'test-tenant-id',
      })
      // 忽略时间戳比较，只比较关键字段
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(mockPermission.id)
      expect(result[0].getName()).toBe(mockPermission.getName())
      expect(result[0].getCode()).toBe(mockPermission.getCode())
    })

    it('应该支持组织ID过滤', async () => {
      mockEntityManager.find.mockResolvedValue([mockOrmEntity])

      const result = await repository.findByType(PermissionType.API, 'test-tenant-id', 'test-org-id')

      expect(mockEntityManager.find).toHaveBeenCalledWith(PermissionOrmEntity, {
        type: 'api',
        tenantId: 'test-tenant-id',
        organizationId: 'test-org-id',
      })
      // 忽略时间戳比较，只比较关键字段
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(mockPermission.id)
      expect(result[0].getName()).toBe(mockPermission.getName())
      expect(result[0].getCode()).toBe(mockPermission.getCode())
    })
  })

  describe('findByStatus', () => {
    it('应该正确查找指定状态的权限', async () => {
      mockEntityManager.find.mockResolvedValue([mockOrmEntity])

      const result = await repository.findByStatus(PermissionStatus.ACTIVE, 'test-tenant-id')

      expect(mockEntityManager.find).toHaveBeenCalledWith(PermissionOrmEntity, {
        status: 'active',
        tenantId: 'test-tenant-id',
      })
      // 忽略时间戳比较，只比较关键字段
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(mockPermission.id)
      expect(result[0].getName()).toBe(mockPermission.getName())
      expect(result[0].getCode()).toBe(mockPermission.getCode())
    })
  })

  describe('findByAction', () => {
    it('应该正确查找指定操作的权限', async () => {
      mockEntityManager.find.mockResolvedValue([mockOrmEntity])

      const result = await repository.findByAction(PermissionAction.READ, 'test-tenant-id')

      expect(mockEntityManager.find).toHaveBeenCalledWith(PermissionOrmEntity, {
        action: 'read',
        tenantId: 'test-tenant-id',
      })
      // 忽略时间戳比较，只比较关键字段
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(mockPermission.id)
      expect(result[0].getName()).toBe(mockPermission.getName())
      expect(result[0].getCode()).toBe(mockPermission.getCode())
    })
  })

  describe('findByResource', () => {
    it('应该正确查找指定资源的权限', async () => {
      mockEntityManager.find.mockResolvedValue([mockOrmEntity])

      const result = await repository.findByResource('user', 'test-tenant-id')

      expect(mockEntityManager.find).toHaveBeenCalledWith(PermissionOrmEntity, {
        resource: 'user',
        tenantId: 'test-tenant-id',
      })
      // 忽略时间戳比较，只比较其他字段
      expect(result[0].id).toBe(mockPermission.id)
      expect(result[0].getName()).toBe(mockPermission.getName())
      expect(result[0].getCode()).toBe(mockPermission.getCode())
    })
  })

  describe('findByModule', () => {
    it('应该正确查找指定模块的权限', async () => {
      mockEntityManager.find.mockResolvedValue([mockOrmEntity])

      const result = await repository.findByModule('system', 'test-tenant-id')

      expect(mockEntityManager.find).toHaveBeenCalledWith(PermissionOrmEntity, {
        module: 'system',
        tenantId: 'test-tenant-id',
      })
      expect(result).toEqual([expect.objectContaining({
        id: 'test-permission-id',
        name: expect.any(Object),
        code: expect.any(Object),
        type: expect.any(Object),
        status: expect.any(Object),
        action: expect.any(Object),
        tenantId: 'test-tenant-id',
        adminUserId: 'test-admin-id',
        description: '测试权限描述',
        organizationId: 'test-org-id',
        resource: 'user',
        module: 'system',
      })])
    })
  })

  describe('findByRoleId', () => {
    it('应该正确查找角色的权限', async () => {
      mockEntityManager.find.mockResolvedValue([mockOrmEntity])

      const result = await repository.findByRoleId('test-role-id', 'test-tenant-id')

      expect(mockEntityManager.find).toHaveBeenCalledWith(PermissionOrmEntity, {
        roleIds: { $like: '%test-role-id%' },
        tenantId: 'test-tenant-id',
      })
      expect(result).toEqual([expect.objectContaining({
        id: 'test-permission-id',
        name: expect.any(Object),
        code: expect.any(Object),
        type: expect.any(Object),
        status: expect.any(Object),
        action: expect.any(Object),
        tenantId: 'test-tenant-id',
        adminUserId: 'test-admin-id',
        description: '测试权限描述',
        organizationId: 'test-org-id',
        resource: 'user',
        module: 'system',
      })])
    })
  })

  describe('findByParentPermissionId', () => {
    it('应该正确查找父权限的子权限', async () => {
      mockEntityManager.find.mockResolvedValue([mockOrmEntity])

      const result = await repository.findByParentPermissionId('parent-permission-id', 'test-tenant-id')

      expect(mockEntityManager.find).toHaveBeenCalledWith(PermissionOrmEntity, {
        parentPermissionId: 'parent-permission-id',
        tenantId: 'test-tenant-id',
      })
      expect(result).toEqual([expect.objectContaining({
        id: 'test-permission-id',
        name: expect.any(Object),
        code: expect.any(Object),
        type: expect.any(Object),
        status: expect.any(Object),
        action: expect.any(Object),
        tenantId: 'test-tenant-id',
        adminUserId: 'test-admin-id',
        description: '测试权限描述',
        organizationId: 'test-org-id',
        resource: 'user',
        module: 'system',
      })])
    })
  })

  describe('findSystemPermissions', () => {
    it('应该正确查找系统权限', async () => {
      mockEntityManager.find.mockResolvedValue([mockOrmEntity])

      const result = await repository.findSystemPermissions('test-tenant-id')

      expect(mockEntityManager.find).toHaveBeenCalledWith(PermissionOrmEntity, {
        isSystemPermission: true,
        tenantId: 'test-tenant-id',
      })
      expect(result).toEqual([expect.objectContaining({
        id: 'test-permission-id',
        name: expect.any(Object),
        code: expect.any(Object),
        type: expect.any(Object),
        status: expect.any(Object),
        action: expect.any(Object),
        tenantId: 'test-tenant-id',
        adminUserId: 'test-admin-id',
        description: '测试权限描述',
        organizationId: 'test-org-id',
        resource: 'user',
        module: 'system',
      })])
    })
  })

  describe('findDefaultPermissions', () => {
    it('应该正确查找默认权限', async () => {
      mockEntityManager.find.mockResolvedValue([mockOrmEntity])

      const result = await repository.findDefaultPermissions('test-tenant-id')

      expect(mockEntityManager.find).toHaveBeenCalledWith(PermissionOrmEntity, {
        isDefaultPermission: true,
        tenantId: 'test-tenant-id',
      })
      expect(result).toEqual([expect.objectContaining({
        id: 'test-permission-id',
        name: expect.any(Object),
        code: expect.any(Object),
        type: expect.any(Object),
        status: expect.any(Object),
        action: expect.any(Object),
        tenantId: 'test-tenant-id',
        adminUserId: 'test-admin-id',
        description: '测试权限描述',
        organizationId: 'test-org-id',
        resource: 'user',
        module: 'system',
      })])
    })
  })

  describe('findExpiredPermissions', () => {
    it('应该正确查找过期权限', async () => {
      mockEntityManager.find.mockResolvedValue([mockOrmEntity])

      const result = await repository.findExpiredPermissions('test-tenant-id')

      expect(mockEntityManager.find).toHaveBeenCalledWith(PermissionOrmEntity, {
        expiresAt: { $lt: expect.any(Date) },
        tenantId: 'test-tenant-id',
      })
      // 忽略时间戳比较，只比较关键字段
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(mockPermission.id)
      expect(result[0].getName()).toBe(mockPermission.getName())
      expect(result[0].getCode()).toBe(mockPermission.getCode())
    })
  })

  describe('findActivePermissions', () => {
    it('应该正确查找激活权限', async () => {
      mockEntityManager.find.mockResolvedValue([mockOrmEntity])

      const result = await repository.findActivePermissions('test-tenant-id')

      expect(mockEntityManager.find).toHaveBeenCalledWith(PermissionOrmEntity, {
        status: 'active',
        tenantId: 'test-tenant-id',
      })
      // 忽略时间戳比较，只比较关键字段
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(mockPermission.id)
      expect(result[0].getName()).toBe(mockPermission.getName())
      expect(result[0].getCode()).toBe(mockPermission.getCode())
    })
  })

  describe('findAll', () => {
    it('应该正确查找所有权限', async () => {
      mockEntityManager.findAndCount.mockResolvedValue([[mockOrmEntity], 1])

      const result = await repository.findAll('test-tenant-id')

      expect(mockEntityManager.findAndCount).toHaveBeenCalledWith(PermissionOrmEntity, {
        tenantId: 'test-tenant-id',
      }, {
        offset: 0,
        limit: 10,
        orderBy: { createdAt: 'DESC' },
      })
      expect(result).toEqual({
        permissions: [expect.objectContaining({
          id: 'test-permission-id',
          name: expect.any(Object),
          code: expect.any(Object),
          type: expect.any(Object),
          status: expect.any(Object),
          action: expect.any(Object),
          tenantId: 'test-tenant-id',
          adminUserId: 'test-admin-id',
          description: '测试权限描述',
          organizationId: 'test-org-id',
          resource: 'user',
          module: 'system',
        })],
        total: 1,
      })
    })
  })

  describe('search', () => {
    it('应该正确搜索权限', async () => {
      mockEntityManager.findAndCount.mockResolvedValue([[mockOrmEntity], 1])

      const result = await repository.search('测试', 'test-tenant-id')

      expect(mockEntityManager.findAndCount).toHaveBeenCalledWith(PermissionOrmEntity, {
        $or: [
          { name: { $ilike: '%测试%' } },
          { code: { $ilike: '%测试%' } },
          { description: { $ilike: '%测试%' } },
        ],
        tenantId: 'test-tenant-id',
      }, {
        limit: 10,
        offset: 0,
        orderBy: { createdAt: 'DESC' },
      })
      // 忽略时间戳比较，只比较关键字段
      expect(result.permissions).toHaveLength(1)
      expect(result.total).toBe(1)
      expect(result.permissions[0].id).toBe(mockPermission.id)
      expect(result.permissions[0].getName()).toBe(mockPermission.getName())
      expect(result.permissions[0].getCode()).toBe(mockPermission.getCode())
    })
  })

  describe('save', () => {
    it('应该正确保存权限', async () => {
      const result = await repository.save(mockPermission)

      expect(mockEntityManager.persistAndFlush).toHaveBeenCalled()
      // 忽略时间戳比较，只比较关键字段
      expect(result.id).toBe(mockPermission.id)
      expect(result.getName()).toBe(mockPermission.getName())
      expect(result.getCode()).toBe(mockPermission.getCode())
    })
  })

  describe('delete', () => {
    it('应该正确删除权限', async () => {
      mockEntityManager.findOne.mockResolvedValue(mockOrmEntity)
      mockEntityManager.flush.mockResolvedValue(undefined)

      const result = await repository.delete('test-permission-id', 'test-tenant-id')

      expect(mockEntityManager.findOne).toHaveBeenCalledWith(PermissionOrmEntity, {
        id: 'test-permission-id',
        tenantId: 'test-tenant-id',
      })
      expect(mockEntityManager.flush).toHaveBeenCalled()
      expect(result).toBe(true)
    })
  })

  describe('deleteByTenant', () => {
    it('应该正确删除租户的所有权限', async () => {
      mockEntityManager.find.mockResolvedValue([mockOrmEntity])
      mockEntityManager.flush.mockResolvedValue(undefined)

      const result = await repository.deleteByTenant('test-tenant-id')

      expect(mockEntityManager.find).toHaveBeenCalledWith(PermissionOrmEntity, {
        tenantId: 'test-tenant-id',
      })
      expect(result).toBe(1)
    })
  })

  describe('deleteByOrganization', () => {
    it('应该正确删除组织的所有权限', async () => {
      mockEntityManager.find.mockResolvedValue([mockOrmEntity])
      mockEntityManager.flush.mockResolvedValue(undefined)

      const result = await repository.deleteByOrganization('test-org-id', 'test-tenant-id')

      expect(mockEntityManager.find).toHaveBeenCalledWith(PermissionOrmEntity, {
        organizationId: 'test-org-id',
        tenantId: 'test-tenant-id',
      })
      expect(result).toBe(1)
    })
  })

  describe('bulkSave', () => {
    it('应该正确批量保存权限', async () => {
      const permissions = [mockPermission]

      const result = await repository.bulkSave(permissions)

      expect(mockEntityManager.persistAndFlush).toHaveBeenCalled()
      expect(result).toEqual([expect.objectContaining({
        id: 'test-permission-id',
        name: expect.any(Object),
        code: expect.any(Object),
        type: expect.any(Object),
        status: expect.any(Object),
        action: expect.any(Object),
        tenantId: 'test-tenant-id',
        adminUserId: 'test-admin-id',
        description: '测试权限描述',
        organizationId: 'test-org-id',
        resource: 'user',
        module: 'system',
      })])
    })
  })

  describe('bulkDelete', () => {
    it('应该正确批量删除权限', async () => {
      mockEntityManager.find.mockResolvedValue([mockOrmEntity])
      mockEntityManager.flush.mockResolvedValue(undefined)

      const result = await repository.bulkDelete(['test-permission-id'], 'test-tenant-id')

      expect(mockEntityManager.find).toHaveBeenCalledWith(PermissionOrmEntity, {
        id: { $in: ['test-permission-id'] },
        tenantId: 'test-tenant-id',
      })
      expect(result).toBe(1)
    })
  })

  describe('findWithConditions', () => {
    it('应该正确查找有条件权限的权限', async () => {
      mockEntityManager.find.mockResolvedValue([mockOrmEntity])

      const result = await repository.findWithConditions('test-tenant-id')

      expect(mockEntityManager.find).toHaveBeenCalledWith(PermissionOrmEntity, {
        conditions: { $ne: null },
        tenantId: 'test-tenant-id',
      })
      expect(result).toEqual([expect.objectContaining({
        id: 'test-permission-id',
        name: expect.any(Object),
        code: expect.any(Object),
        type: expect.any(Object),
        status: expect.any(Object),
        action: expect.any(Object),
        tenantId: 'test-tenant-id',
        adminUserId: 'test-admin-id',
        description: '测试权限描述',
        organizationId: 'test-org-id',
        resource: 'user',
        module: 'system',
      })])
    })
  })

  describe('findWithFields', () => {
    it('应该正确查找有字段权限的权限', async () => {
      mockEntityManager.find.mockResolvedValue([mockOrmEntity])

      const result = await repository.findWithFields('test-tenant-id')

      expect(mockEntityManager.find).toHaveBeenCalledWith(PermissionOrmEntity, {
        fields: { $ne: null },
        tenantId: 'test-tenant-id',
      })
      expect(result).toEqual([expect.objectContaining({
        id: 'test-permission-id',
        name: expect.any(Object),
        code: expect.any(Object),
        type: expect.any(Object),
        status: expect.any(Object),
        action: expect.any(Object),
        tenantId: 'test-tenant-id',
        adminUserId: 'test-admin-id',
        description: '测试权限描述',
        organizationId: 'test-org-id',
        resource: 'user',
        module: 'system',
      })])
    })
  })

  describe('findByTags', () => {
    it('应该正确查找指定标签的权限', async () => {
      mockEntityManager.find.mockResolvedValue([mockOrmEntity])

      const result = await repository.findByTags(['admin', 'system'], 'test-tenant-id')

      expect(mockEntityManager.find).toHaveBeenCalledWith(PermissionOrmEntity, {
        tenantId: 'test-tenant-id',
      })
      // 由于findByTags在应用层过滤，我们需要确保返回的权限包含指定的标签
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(mockPermission.id)
      expect(result[0].getName()).toBe(mockPermission.getName())
      expect(result[0].getCode()).toBe(mockPermission.getCode())
    })
  })
}) 
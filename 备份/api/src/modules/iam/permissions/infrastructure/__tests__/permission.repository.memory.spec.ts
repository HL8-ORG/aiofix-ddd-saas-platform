import { Permission } from '../../domain/entities/permission.entity'
import { PermissionAction } from '../../domain/value-objects/permission-action.value-object'
import { PermissionStatus, PermissionStatusValue } from '../../domain/value-objects/permission-status.value-object'
import { PermissionType } from '../../domain/value-objects/permission-type.value-object'
import { PermissionRepositoryMemory } from '../repositories/permission.repository.memory'

describe('PermissionRepositoryMemory', () => {
  let repository: PermissionRepositoryMemory
  let mockPermission: Permission

  beforeEach(() => {
    repository = new PermissionRepositoryMemory()
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
  })

  describe('save', () => {
    it('应该正确保存权限', async () => {
      await repository.save(mockPermission)

      const savedPermission = await repository.findById(mockPermission.id, mockPermission.tenantId)
      expect(savedPermission).toEqual(mockPermission)
    })

    it('应该更新已存在的权限', async () => {
      await repository.save(mockPermission)

      mockPermission.updateInfo('更新后的权限', 'UPDATED_PERMISSION', '更新后的描述')
      await repository.save(mockPermission)

      const updatedPermission = await repository.findById(mockPermission.id, mockPermission.tenantId)
      expect(updatedPermission?.getName()).toBe('更新后的权限')
      expect(updatedPermission?.getCode()).toBe('UPDATED_PERMISSION')
    })
  })

  describe('findById', () => {
    it('应该正确查找权限', async () => {
      await repository.save(mockPermission)

      const foundPermission = await repository.findById(mockPermission.id, mockPermission.tenantId)

      expect(foundPermission).toEqual(mockPermission)
    })

    it('当权限不存在时应该返回null', async () => {
      const foundPermission = await repository.findById('non-existent-id', 'test-tenant-id')

      expect(foundPermission).toBeNull()
    })

    it('应该基于租户ID进行隔离', async () => {
      await repository.save(mockPermission)

      const otherTenantPermission = await repository.findById(mockPermission.id, 'other-tenant-id')

      expect(otherTenantPermission).toBeNull()
    })
  })

  describe('findByCode', () => {
    it('应该正确通过代码查找权限', async () => {
      await repository.save(mockPermission)

      const foundPermission = await repository.findByCode(mockPermission.getCode(), mockPermission.tenantId)

      expect(foundPermission).toEqual(mockPermission)
    })

    it('当权限不存在时应该返回null', async () => {
      const foundPermission = await repository.findByCode('NON_EXISTENT_CODE', 'test-tenant-id')

      expect(foundPermission).toBeNull()
    })

    it('应该基于租户ID进行隔离', async () => {
      await repository.save(mockPermission)

      const otherTenantPermission = await repository.findByCode(mockPermission.getCode(), 'other-tenant-id')

      expect(otherTenantPermission).toBeNull()
    })
  })

  describe('findByName', () => {
    it('应该正确通过名称查找权限', async () => {
      await repository.save(mockPermission)

      const foundPermission = await repository.findByName(mockPermission.getName(), mockPermission.tenantId)

      expect(foundPermission).toEqual(mockPermission)
    })

    it('当权限不存在时应该返回null', async () => {
      const foundPermission = await repository.findByName('不存在的权限', 'test-tenant-id')

      expect(foundPermission).toBeNull()
    })
  })

  describe('findByTenant', () => {
    it('应该正确查找租户的所有权限', async () => {
      const permission2 = new Permission(
        'test-permission-2',
        '测试权限2',
        'TEST_PERMISSION_2',
        PermissionType.MENU,
        PermissionAction.UPDATE,
        'test-tenant-id',
        'test-admin-id',
      )
      permission2.status = new PermissionStatusValue(PermissionStatus.ACTIVE)
      permission2.createdAt = new Date('2024-01-01')
      permission2.updatedAt = new Date('2024-01-02')

      mockPermission.createdAt = new Date('2024-01-01')
      mockPermission.updatedAt = new Date('2024-01-02')

      await repository.save(mockPermission)
      await repository.save(permission2)

      const result = await repository.findAll(mockPermission.tenantId)

      expect(result.permissions).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.permissions).toContainEqual(mockPermission)
      expect(result.permissions).toContainEqual(permission2)
    })

    it('当租户没有权限时应该返回空数组', async () => {
      const result = await repository.findAll('empty-tenant-id')

      expect(result.permissions).toEqual([])
      expect(result.total).toBe(0)
    })
  })

  describe('findByRole', () => {
    it('应该正确查找角色的权限', async () => {
      mockPermission.assignToRole('test-role-id')
      await repository.save(mockPermission)

      const permissions = await repository.findByRoleId('test-role-id', mockPermission.tenantId)

      expect(permissions).toHaveLength(1)
      expect(permissions[0]).toEqual(mockPermission)
    })

    it('当角色没有权限时应该返回空数组', async () => {
      const permissions = await repository.findByRoleId('empty-role-id', 'test-tenant-id')

      expect(permissions).toEqual([])
    })
  })

  describe('findByType', () => {
    it('应该正确查找指定类型的权限', async () => {
      const menuPermission = new Permission(
        'menu-permission-id',
        '菜单权限',
        'MENU_PERMISSION',
        PermissionType.MENU,
        PermissionAction.READ,
        'test-tenant-id',
        'test-admin-id',
      )
      menuPermission.status = new PermissionStatusValue(PermissionStatus.ACTIVE)

      await repository.save(mockPermission)
      await repository.save(menuPermission)

      const apiPermissions = await repository.findByType(PermissionType.API, 'test-tenant-id')
      const menuPermissions = await repository.findByType(PermissionType.MENU, 'test-tenant-id')

      expect(apiPermissions).toHaveLength(1)
      expect(apiPermissions[0]).toEqual(mockPermission)
      expect(menuPermissions).toHaveLength(1)
      expect(menuPermissions[0]).toEqual(menuPermission)
    })
  })

  describe('findTree', () => {
    it('应该正确查找权限树', async () => {
      const parentPermission = new Permission(
        'parent-permission-id',
        '父权限',
        'PARENT_PERMISSION',
        PermissionType.MENU,
        PermissionAction.READ,
        'test-tenant-id',
        'test-admin-id',
      )
      parentPermission.status = new PermissionStatusValue(PermissionStatus.ACTIVE)
      parentPermission.createdAt = new Date('2024-01-01')
      parentPermission.updatedAt = new Date('2024-01-02')

      mockPermission.setParentPermission('parent-permission-id')
      parentPermission.addChildPermission(mockPermission.id)
      mockPermission.createdAt = new Date('2024-01-01')
      mockPermission.updatedAt = new Date('2024-01-02')

      await repository.save(parentPermission)
      await repository.save(mockPermission)

      const result = await repository.findAll('test-tenant-id')

      expect(result.permissions).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.permissions).toContainEqual(parentPermission)
      expect(result.permissions).toContainEqual(mockPermission)
    })
  })

  describe('delete', () => {
    it('应该正确删除权限', async () => {
      await repository.save(mockPermission)

      await repository.delete(mockPermission.id, mockPermission.tenantId)

      const deletedPermission = await repository.findById(mockPermission.id, mockPermission.tenantId)
      expect(deletedPermission).toBeNull()
    })

    it('应该基于租户ID进行隔离删除', async () => {
      await repository.save(mockPermission)

      await repository.delete(mockPermission.id, 'other-tenant-id')

      const permission = await repository.findById(mockPermission.id, mockPermission.tenantId)
      expect(permission).toEqual(mockPermission)
    })
  })

  describe('exists', () => {
    it('应该正确检查权限是否存在', async () => {
      expect(await repository.exists(mockPermission.id, mockPermission.tenantId)).toBe(false)

      await repository.save(mockPermission)

      expect(await repository.exists(mockPermission.id, mockPermission.tenantId)).toBe(true)
    })

    it('应该基于租户ID进行隔离检查', async () => {
      await repository.save(mockPermission)

      expect(await repository.exists(mockPermission.id, 'other-tenant-id')).toBe(false)
    })
  })

  describe('countByTenant', () => {
    it('应该正确统计租户的权限数量', async () => {
      expect(await repository.countByTenant('test-tenant-id')).toBe(0)

      await repository.save(mockPermission)

      expect(await repository.countByTenant('test-tenant-id')).toBe(1)

      const permission2 = new Permission(
        'test-permission-2',
        '测试权限2',
        'TEST_PERMISSION_2',
        PermissionType.MENU,
        PermissionAction.UPDATE,
        'test-tenant-id',
        'test-admin-id',
      )
      permission2.status = new PermissionStatusValue(PermissionStatus.ACTIVE)
      await repository.save(permission2)

      expect(await repository.countByTenant('test-tenant-id')).toBe(2)
    })

    it('应该只统计指定租户的权限', async () => {
      await repository.save(mockPermission)

      expect(await repository.countByTenant('other-tenant-id')).toBe(0)
    })
  })

  describe('findAll', () => {
    it('应该正确查找所有权限', async () => {
      const permission2 = new Permission(
        'test-permission-2',
        '测试权限2',
        'TEST_PERMISSION_2',
        PermissionType.MENU,
        PermissionAction.UPDATE,
        'test-tenant-id',
        'test-admin-id',
      )
      permission2.status = new PermissionStatusValue(PermissionStatus.ACTIVE)
      permission2.createdAt = new Date('2024-01-01')
      permission2.updatedAt = new Date('2024-01-02')

      mockPermission.createdAt = new Date('2024-01-01')
      mockPermission.updatedAt = new Date('2024-01-02')

      await repository.save(mockPermission)
      await repository.save(permission2)

      const result = await repository.findAll('test-tenant-id')

      expect(result.permissions).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.permissions).toContainEqual(mockPermission)
      expect(result.permissions).toContainEqual(permission2)
    })
  })

  describe('findByStatus', () => {
    it('应该正确查找指定状态的权限', async () => {
      const suspendedPermission = new Permission(
        'suspended-permission-id',
        '暂停权限',
        'SUSPENDED_PERMISSION',
        PermissionType.API,
        PermissionAction.READ,
        'test-tenant-id',
        'test-admin-id',
      )
      suspendedPermission.suspend()

      await repository.save(mockPermission)
      await repository.save(suspendedPermission)

      const activePermissions = await repository.findByStatus(PermissionStatus.ACTIVE, 'test-tenant-id')
      const suspendedPermissions = await repository.findByStatus(PermissionStatus.SUSPENDED, 'test-tenant-id')

      expect(activePermissions).toHaveLength(1)
      expect(activePermissions[0]).toEqual(mockPermission)
      expect(suspendedPermissions).toHaveLength(1)
      expect(suspendedPermissions[0]).toEqual(suspendedPermission)
    })
  })

  describe('findByResource', () => {
    it('应该正确查找指定资源的权限', async () => {
      const userPermission = new Permission(
        'user-permission-id',
        '用户权限',
        'USER_PERMISSION',
        PermissionType.API,
        PermissionAction.READ,
        'test-tenant-id',
        'test-admin-id',
        undefined,
        undefined,
        'user',
      )
      userPermission.status = new PermissionStatusValue(PermissionStatus.ACTIVE)

      const rolePermission = new Permission(
        'role-permission-id',
        '角色权限',
        'ROLE_PERMISSION',
        PermissionType.API,
        PermissionAction.READ,
        'test-tenant-id',
        'test-admin-id',
        undefined,
        undefined,
        'role',
      )
      rolePermission.status = new PermissionStatusValue(PermissionStatus.ACTIVE)

      await repository.save(userPermission)
      await repository.save(rolePermission)

      const userPermissions = await repository.findByResource('user', 'test-tenant-id')
      const rolePermissions = await repository.findByResource('role', 'test-tenant-id')

      expect(userPermissions).toHaveLength(1)
      expect(userPermissions[0]).toEqual(userPermission)
      expect(rolePermissions).toHaveLength(1)
      expect(rolePermissions[0]).toEqual(rolePermission)
    })
  })
}) 
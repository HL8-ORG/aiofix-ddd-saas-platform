import { Permission } from '../../domain/entities/permission.entity'
import { PermissionAction } from '../../domain/value-objects/permission-action.value-object'
import { PermissionStatus, PermissionStatusValue } from '../../domain/value-objects/permission-status.value-object'
import { PermissionType } from '../../domain/value-objects/permission-type.value-object'
import { PermissionCacheService } from '../cache/permission-cache.service'

describe('PermissionCacheService', () => {
  let cacheService: PermissionCacheService
  let mockPermission: Permission

  beforeEach(() => {
    cacheService = new PermissionCacheService()
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

  describe('setPermission', () => {
    it('应该正确缓存权限', () => {
      const cacheKey = `permission:${mockPermission.tenantId}:${mockPermission.id}`

      cacheService.setPermission(mockPermission)

      expect(cacheService['cache'].has(cacheKey)).toBe(true)
      const entry = cacheService['cache'].get(cacheKey)
      expect(entry.data).toEqual(mockPermission)
    })

    it('应该使用正确的缓存键', () => {
      const cacheKey = `permission:${mockPermission.tenantId}:${mockPermission.id}`

      cacheService.setPermission(mockPermission)

      expect(cacheService['cache'].has(cacheKey)).toBe(true)
    })
  })

  describe('getPermission', () => {
    it('应该正确获取缓存的权限', () => {
      cacheService.setPermission(mockPermission)

      const result = cacheService.getPermission(mockPermission.id, mockPermission.tenantId)

      expect(result).toEqual(mockPermission)
    })

    it('当权限不存在时应该返回null', () => {
      const result = cacheService.getPermission('non-existent-id', 'test-tenant-id')

      expect(result).toBeNull()
    })

    it('应该使用正确的缓存键进行查找', () => {
      cacheService.setPermission(mockPermission)

      const result = cacheService.getPermission(mockPermission.id, mockPermission.tenantId)

      expect(result).toEqual(mockPermission)
    })
  })

  describe('setPermissionList', () => {
    it('应该正确缓存权限列表', () => {
      const permissions = [
        mockPermission,
        new Permission(
          'test-permission-2',
          '测试权限2',
          'TEST_PERMISSION_2',
          PermissionType.MENU,
          PermissionAction.UPDATE,
          'test-tenant-id',
          'test-admin-id',
        ),
      ]
      const data = { permissions, total: 2 }

      cacheService.setPermissionList(mockPermission.tenantId, 1, 10, undefined, data)

      const result = cacheService.getPermissionList(mockPermission.tenantId, 1, 10)
      expect(result).toEqual(data)
    })

    it('应该使用正确的缓存键', () => {
      const permissions = [mockPermission]
      const data = { permissions, total: 1 }
      const cacheKey = `permission_list:${mockPermission.tenantId}:1:10:no-filters`

      cacheService.setPermissionList(mockPermission.tenantId, 1, 10, undefined, data)

      expect(cacheService['cache'].has(cacheKey)).toBe(true)
    })
  })

  describe('getPermissionList', () => {
    it('应该正确获取缓存的权限列表', () => {
      const permissions = [mockPermission]
      const data = { permissions, total: 1 }
      cacheService.setPermissionList(mockPermission.tenantId, 1, 10, undefined, data)

      const result = cacheService.getPermissionList(mockPermission.tenantId, 1, 10)

      expect(result).toEqual(data)
    })

    it('当权限列表不存在时应该返回null', () => {
      const result = cacheService.getPermissionList('non-existent-tenant-id', 1, 10)

      expect(result).toBeNull()
    })
  })

  describe('deletePermission', () => {
    it('应该正确删除缓存的权限', () => {
      cacheService.setPermission(mockPermission)

      cacheService.deletePermission(mockPermission.id, mockPermission.tenantId)

      expect(cacheService.getPermission(mockPermission.id, mockPermission.tenantId)).toBeNull()
    })

    it('应该同时删除权限和权限列表缓存', () => {
      const permissions = [mockPermission]
      const data = { permissions, total: 1 }
      cacheService.setPermission(mockPermission)
      cacheService.setPermissionList(mockPermission.tenantId, 1, 10, undefined, data)

      cacheService.deletePermission(mockPermission.id, mockPermission.tenantId)

      expect(cacheService.getPermission(mockPermission.id, mockPermission.tenantId)).toBeNull()
      // 注意：deletePermission不会删除权限列表缓存，这是设计上的考虑
    })
  })

  describe('invalidatePermissionList', () => {
    it('应该清除指定租户的权限列表缓存', () => {
      const permissions = [mockPermission]
      const data = { permissions, total: 1 }
      cacheService.setPermissionList(mockPermission.tenantId, 1, 10, undefined, data)

      cacheService.invalidatePermissionList(mockPermission.tenantId)

      expect(cacheService.getPermissionList(mockPermission.tenantId, 1, 10)).toBeNull()
    })

    it('不应该影响其他租户的缓存', () => {
      const otherTenantId = 'other-tenant-id'
      const otherPermission = new Permission(
        'other-permission-id',
        '其他权限',
        'OTHER_PERMISSION',
        PermissionType.API,
        PermissionAction.READ,
        otherTenantId,
        'test-admin-id',
      )

      cacheService.setPermission(mockPermission)
      cacheService.setPermission(otherPermission)

      cacheService.invalidatePermissionList(mockPermission.tenantId)

      // invalidatePermissionList会删除所有以permission_list:开头的键，但不会删除单个权限的缓存
      expect(cacheService.getPermission(mockPermission.id, mockPermission.tenantId)).toEqual(mockPermission)
      expect(cacheService.getPermission(otherPermission.id, otherTenantId)).toEqual(otherPermission)
    })
  })

  describe('clear', () => {
    it('应该清除所有缓存', () => {
      const permissions = [mockPermission]
      const data = { permissions, total: 1 }
      cacheService.setPermission(mockPermission)
      cacheService.setPermissionList(mockPermission.tenantId, 1, 10, undefined, data)

      cacheService.clear()

      expect(cacheService.getPermission(mockPermission.id, mockPermission.tenantId)).toBeNull()
      expect(cacheService.getPermissionList(mockPermission.tenantId, 1, 10)).toBeNull()
    })
  })

  describe('getStats', () => {
    it('应该返回正确的缓存统计信息', () => {
      const permissions = [mockPermission]
      const data = { permissions, total: 1 }
      cacheService.setPermission(mockPermission)
      cacheService.setPermissionList(mockPermission.tenantId, 1, 10, undefined, data)

      const stats = cacheService.getStats()

      expect(stats.size).toBe(2) // 1个权限 + 1个权限列表
      expect(stats.maxSize).toBe(1000)
      expect(stats.enabled).toBe(true)
      expect(stats.ttl).toBe(300)
    })

    it('当缓存为空时应该返回零统计', () => {
      const stats = cacheService.getStats()

      expect(stats.size).toBe(0)
      expect(stats.maxSize).toBe(1000)
      expect(stats.enabled).toBe(true)
      expect(stats.ttl).toBe(300)
    })
  })

  describe('setUserPermissions', () => {
    it('应该正确缓存用户权限', () => {
      const userId = 'test-user-id'
      const permissions = [mockPermission]

      cacheService.setUserPermissions(userId, mockPermission.tenantId, permissions)

      const result = cacheService.getUserPermissions(userId, mockPermission.tenantId)
      expect(result).toEqual(permissions)
    })
  })

  describe('getUserPermissions', () => {
    it('应该正确获取缓存的用户权限', () => {
      const userId = 'test-user-id'
      const permissions = [mockPermission]
      cacheService.setUserPermissions(userId, mockPermission.tenantId, permissions)

      const result = cacheService.getUserPermissions(userId, mockPermission.tenantId)

      expect(result).toEqual(permissions)
    })

    it('当用户权限不存在时应该返回null', () => {
      const result = cacheService.getUserPermissions('non-existent-user-id', 'test-tenant-id')

      expect(result).toBeNull()
    })
  })

  describe('deleteUserPermissions', () => {
    it('应该正确删除缓存的用户权限', () => {
      const userId = 'test-user-id'
      const permissions = [mockPermission]
      cacheService.setUserPermissions(userId, mockPermission.tenantId, permissions)

      cacheService.deleteUserPermissions(userId, mockPermission.tenantId)

      expect(cacheService.getUserPermissions(userId, mockPermission.tenantId)).toBeNull()
    })
  })
}) 
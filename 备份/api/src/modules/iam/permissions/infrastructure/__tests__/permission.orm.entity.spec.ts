import { PermissionOrmEntity } from '../entities/permission.orm.entity'
import type { PermissionConditionData } from '../../domain/value-objects/permission-condition.value-object'

describe('PermissionOrmEntity', () => {
  let ormEntity: PermissionOrmEntity

  beforeEach(() => {
    ormEntity = new PermissionOrmEntity()
  })

  describe('基本属性', () => {
    it('应该正确设置基本属性', () => {
      ormEntity.id = 'test-permission-id'
      ormEntity.name = '测试权限'
      ormEntity.code = 'TEST_PERMISSION'
      ormEntity.description = '测试权限描述'
      ormEntity.type = 'api'
      ormEntity.status = 'active'
      ormEntity.action = 'read'
      ormEntity.tenantId = 'test-tenant-id'
      ormEntity.adminUserId = 'test-admin-id'

      expect(ormEntity.id).toBe('test-permission-id')
      expect(ormEntity.name).toBe('测试权限')
      expect(ormEntity.code).toBe('TEST_PERMISSION')
      expect(ormEntity.description).toBe('测试权限描述')
      expect(ormEntity.type).toBe('api')
      expect(ormEntity.status).toBe('active')
      expect(ormEntity.action).toBe('read')
      expect(ormEntity.tenantId).toBe('test-tenant-id')
      expect(ormEntity.adminUserId).toBe('test-admin-id')
    })

    it('应该正确处理可选属性', () => {
      ormEntity.organizationId = 'test-org-id'
      ormEntity.roleIds = ['role1', 'role2']
      ormEntity.isSystemPermission = true
      ormEntity.isDefaultPermission = false
      ormEntity.conditions = [{ field: 'userId', operator: 'eq', value: 'user123' }]
      ormEntity.fields = ['name', 'email']
      ormEntity.expiresAt = new Date('2024-12-31')
      ormEntity.parentPermissionId = 'parent-permission-id'
      ormEntity.childPermissionIds = ['child1', 'child2']
      ormEntity.resource = 'user'
      ormEntity.module = 'system'
      ormEntity.tags = 'admin,system'
      ormEntity.createdAt = new Date('2024-01-01')
      ormEntity.updatedAt = new Date('2024-01-02')
      ormEntity.deletedAt = null

      expect(ormEntity.organizationId).toBe('test-org-id')
      expect(ormEntity.roleIds).toEqual(['role1', 'role2'])
      expect(ormEntity.isSystemPermission).toBe(true)
      expect(ormEntity.isDefaultPermission).toBe(false)
      expect(ormEntity.conditions).toEqual([{ field: 'userId', operator: 'eq', value: 'user123' }])
      expect(ormEntity.fields).toEqual(['name', 'email'])
      expect(ormEntity.expiresAt).toEqual(new Date('2024-12-31'))
      expect(ormEntity.parentPermissionId).toBe('parent-permission-id')
      expect(ormEntity.childPermissionIds).toEqual(['child1', 'child2'])
      expect(ormEntity.resource).toBe('user')
      expect(ormEntity.module).toBe('system')
      expect(ormEntity.tags).toBe('admin,system')
      expect(ormEntity.createdAt).toEqual(new Date('2024-01-01'))
      expect(ormEntity.updatedAt).toEqual(new Date('2024-01-02'))
      expect(ormEntity.deletedAt).toBeNull()
    })
  })

  describe('JSON字段处理', () => {
    it('应该正确处理roleIds JSON字段', () => {
      ormEntity.roleIds = ['role1', 'role2', 'role3']

      expect(ormEntity.roleIds).toEqual(['role1', 'role2', 'role3'])
      expect(Array.isArray(ormEntity.roleIds)).toBe(true)
    })

    it('应该正确处理conditions JSON字段', () => {
      const conditions: PermissionConditionData[] = [
        { field: 'userId', operator: 'eq', value: 'user123' },
        { field: 'status', operator: 'in', value: ['active', 'pending'] },
      ]

      ormEntity.conditions = conditions

      expect(ormEntity.conditions).toEqual(conditions)
      expect(Array.isArray(ormEntity.conditions)).toBe(true)
    })

    it('应该正确处理fields JSON字段', () => {
      ormEntity.fields = ['name', 'email', 'phone']

      expect(ormEntity.fields).toEqual(['name', 'email', 'phone'])
      expect(Array.isArray(ormEntity.fields)).toBe(true)
    })

    it('应该正确处理childPermissionIds JSON字段', () => {
      ormEntity.childPermissionIds = ['child1', 'child2', 'child3']

      expect(ormEntity.childPermissionIds).toEqual(['child1', 'child2', 'child3'])
      expect(Array.isArray(ormEntity.childPermissionIds)).toBe(true)
    })
  })

  describe('日期字段处理', () => {
    it('应该正确处理日期字段', () => {
      const now = new Date()
      ormEntity.createdAt = now
      ormEntity.updatedAt = now
      ormEntity.expiresAt = new Date('2024-12-31')
      ormEntity.deletedAt = null

      expect(ormEntity.createdAt).toEqual(now)
      expect(ormEntity.updatedAt).toEqual(now)
      expect(ormEntity.expiresAt).toEqual(new Date('2024-12-31'))
      expect(ormEntity.deletedAt).toBeNull()
    })

    it('应该正确处理软删除日期', () => {
      const deletedAt = new Date('2024-01-15')
      ormEntity.deletedAt = deletedAt

      expect(ormEntity.deletedAt).toEqual(deletedAt)
    })
  })

  describe('布尔字段处理', () => {
    it('应该正确处理系统权限标识', () => {
      ormEntity.isSystemPermission = true
      expect(ormEntity.isSystemPermission).toBe(true)

      ormEntity.isSystemPermission = false
      expect(ormEntity.isSystemPermission).toBe(false)
    })

    it('应该正确处理默认权限标识', () => {
      ormEntity.isDefaultPermission = true
      expect(ormEntity.isDefaultPermission).toBe(true)

      ormEntity.isDefaultPermission = false
      expect(ormEntity.isDefaultPermission).toBe(false)
    })
  })

  describe('字符串字段长度限制', () => {
    it('应该正确处理name字段长度', () => {
      const longName = 'a'.repeat(100) // 最大长度
      ormEntity.name = longName
      expect(ormEntity.name).toBe(longName)
    })

    it('应该正确处理code字段长度', () => {
      const longCode = 'A'.repeat(50) // 最大长度
      ormEntity.code = longCode
      expect(ormEntity.code).toBe(longCode)
    })

    it('应该正确处理resource字段长度', () => {
      const longResource = 'a'.repeat(100) // 最大长度
      ormEntity.resource = longResource
      expect(ormEntity.resource).toBe(longResource)
    })

    it('应该正确处理module字段长度', () => {
      const longModule = 'a'.repeat(50) // 最大长度
      ormEntity.module = longModule
      expect(ormEntity.module).toBe(longModule)
    })

    it('应该正确处理tags字段长度', () => {
      const longTags = 'tag,'.repeat(100) // 接近最大长度
      ormEntity.tags = longTags
      expect(ormEntity.tags).toBe(longTags)
    })
  })

  describe('UUID字段处理', () => {
    it('应该正确处理UUID字段', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000'

      ormEntity.id = uuid
      ormEntity.tenantId = uuid
      ormEntity.adminUserId = uuid
      ormEntity.organizationId = uuid
      ormEntity.parentPermissionId = uuid

      expect(ormEntity.id).toBe(uuid)
      expect(ormEntity.tenantId).toBe(uuid)
      expect(ormEntity.adminUserId).toBe(uuid)
      expect(ormEntity.organizationId).toBe(uuid)
      expect(ormEntity.parentPermissionId).toBe(uuid)
    })
  })

  describe('枚举值处理', () => {
    it('应该正确处理type枚举值', () => {
      const validTypes = ['api', 'menu', 'button', 'data']

      validTypes.forEach(type => {
        ormEntity.type = type
        expect(ormEntity.type).toBe(type)
      })
    })

    it('应该正确处理status枚举值', () => {
      const validStatuses = ['active', 'inactive', 'suspended', 'expired']

      validStatuses.forEach(status => {
        ormEntity.status = status
        expect(ormEntity.status).toBe(status)
      })
    })

    it('应该正确处理action枚举值', () => {
      const validActions = ['create', 'read', 'update', 'delete', 'manage']

      validActions.forEach(action => {
        ormEntity.action = action
        expect(ormEntity.action).toBe(action)
      })
    })
  })

  describe('实体完整性', () => {
    it('应该能够创建完整的实体实例', () => {
      const completeEntity = new PermissionOrmEntity()

      // 设置所有必需字段
      completeEntity.id = 'test-id'
      completeEntity.name = '测试权限'
      completeEntity.code = 'TEST_PERMISSION'
      completeEntity.type = 'api'
      completeEntity.status = 'active'
      completeEntity.action = 'read'
      completeEntity.tenantId = 'test-tenant-id'
      completeEntity.adminUserId = 'test-admin-id'
      completeEntity.createdAt = new Date()
      completeEntity.updatedAt = new Date()

      expect(completeEntity).toBeInstanceOf(PermissionOrmEntity)
      expect(completeEntity.id).toBe('test-id')
      expect(completeEntity.name).toBe('测试权限')
      expect(completeEntity.code).toBe('TEST_PERMISSION')
      expect(completeEntity.type).toBe('api')
      expect(completeEntity.status).toBe('active')
      expect(completeEntity.action).toBe('read')
      expect(completeEntity.tenantId).toBe('test-tenant-id')
      expect(completeEntity.adminUserId).toBe('test-admin-id')
    })

    it('应该支持部分字段的实体实例', () => {
      const partialEntity = new PermissionOrmEntity()

      // 只设置必需字段
      partialEntity.id = 'test-id'
      partialEntity.name = '测试权限'
      partialEntity.code = 'TEST_PERMISSION'
      partialEntity.type = 'api'
      partialEntity.status = 'active'
      partialEntity.action = 'read'
      partialEntity.tenantId = 'test-tenant-id'
      partialEntity.adminUserId = 'test-admin-id'
      partialEntity.createdAt = new Date()
      partialEntity.updatedAt = new Date()

      expect(partialEntity).toBeInstanceOf(PermissionOrmEntity)
      expect(partialEntity.description).toBeUndefined()
      expect(partialEntity.organizationId).toBeUndefined()
      expect(partialEntity.roleIds).toBeUndefined()
      expect(partialEntity.conditions).toBeUndefined()
      expect(partialEntity.fields).toBeUndefined()
      expect(partialEntity.expiresAt).toBeUndefined()
      expect(partialEntity.parentPermissionId).toBeUndefined()
      expect(partialEntity.childPermissionIds).toBeUndefined()
      expect(partialEntity.resource).toBeUndefined()
      expect(partialEntity.module).toBeUndefined()
      expect(partialEntity.tags).toBeUndefined()
      expect(partialEntity.deletedAt).toBeUndefined()
    })
  })

  describe('数据验证', () => {
    it('应该正确处理空值', () => {
      ormEntity.description = null as any
      ormEntity.organizationId = null as any
      ormEntity.roleIds = null as any
      ormEntity.conditions = null as any
      ormEntity.fields = null as any
      ormEntity.expiresAt = null as any
      ormEntity.parentPermissionId = null as any
      ormEntity.childPermissionIds = null as any
      ormEntity.resource = null as any
      ormEntity.module = null as any
      ormEntity.tags = null as any
      ormEntity.deletedAt = null as any

      expect(ormEntity.description).toBeNull()
      expect(ormEntity.organizationId).toBeNull()
      expect(ormEntity.roleIds).toBeNull()
      expect(ormEntity.conditions).toBeNull()
      expect(ormEntity.fields).toBeNull()
      expect(ormEntity.expiresAt).toBeNull()
      expect(ormEntity.parentPermissionId).toBeNull()
      expect(ormEntity.childPermissionIds).toBeNull()
      expect(ormEntity.resource).toBeNull()
      expect(ormEntity.module).toBeNull()
      expect(ormEntity.tags).toBeNull()
      expect(ormEntity.deletedAt).toBeNull()
    })

    it('应该正确处理空数组', () => {
      ormEntity.roleIds = []
      ormEntity.fields = []
      ormEntity.childPermissionIds = []

      expect(ormEntity.roleIds).toEqual([])
      expect(ormEntity.fields).toEqual([])
      expect(ormEntity.childPermissionIds).toEqual([])
    })

    it('应该正确处理空数组条件', () => {
      ormEntity.conditions = []

      expect(ormEntity.conditions).toEqual([])
    })
  })
}) 
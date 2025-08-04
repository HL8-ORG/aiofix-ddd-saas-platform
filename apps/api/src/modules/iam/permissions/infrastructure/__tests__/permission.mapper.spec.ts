import { Permission } from '../../domain/entities/permission.entity'
import { PermissionAction } from '../../domain/value-objects/permission-action.value-object'
import { PermissionStatus, PermissionStatusValue } from '../../domain/value-objects/permission-status.value-object'
import { PermissionType } from '../../domain/value-objects/permission-type.value-object'
import { PermissionCondition } from '../../domain/value-objects/permission-condition.value-object'
import { PermissionOrmEntity } from '../entities/permission.orm.entity'
import { PermissionMapper } from '../mappers/permission.mapper'

describe('PermissionMapper', () => {
  describe('toDomain', () => {
    it('应该正确将数据库实体转换为领域实体', () => {
      const ormEntity = new PermissionOrmEntity()
      ormEntity.id = 'test-permission-id'
      ormEntity.name = '测试权限'
      ormEntity.code = 'TEST_PERMISSION'
      ormEntity.description = '测试权限描述'
      ormEntity.type = 'api'
      ormEntity.status = 'active'
      ormEntity.action = 'read'
      ormEntity.tenantId = 'test-tenant-id'
      ormEntity.organizationId = 'test-org-id'
      ormEntity.adminUserId = 'test-admin-id'
      ormEntity.roleIds = ['role1', 'role2']
      ormEntity.isSystemPermission = false
      ormEntity.isDefaultPermission = true
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

      const permission = PermissionMapper.toDomain(ormEntity)

      expect(permission.id).toBe('test-permission-id')
      expect(permission.getName()).toBe('测试权限')
      expect(permission.getCode()).toBe('TEST_PERMISSION')
      expect(permission.description).toBe('测试权限描述')
      expect(permission.getType()).toBe('api')
      expect(permission.getStatus()).toBe('active')
      expect(permission.getAction()).toBe('read')
      expect(permission.tenantId).toBe('test-tenant-id')
      expect(permission.organizationId).toBe('test-org-id')
      expect(permission.adminUserId).toBe('test-admin-id')
      expect(permission.roleIds).toEqual(['role1', 'role2'])
      expect(permission.getIsSystemPermission()).toBe(false)
      expect(permission.getIsDefaultPermission()).toBe(true)
      expect(permission.conditions?.getValue()).toEqual([{ field: 'userId', operator: 'eq', value: 'user123' }])
      expect(permission.fields).toEqual(['name', 'email'])
      expect(permission.expiresAt).toEqual(new Date('2024-12-31'))
      expect(permission.parentPermissionId).toBe('parent-permission-id')
      expect(permission.childPermissionIds).toEqual(['child1', 'child2'])
      expect(permission.resource).toBe('user')
      expect(permission.module).toBe('system')
      expect(permission.tags).toBe('admin,system')
      expect(permission.createdAt).toEqual(new Date('2024-01-01'))
      expect(permission.updatedAt).toEqual(new Date('2024-01-02'))
      expect(permission.deletedAt).toBeUndefined()
    })

    it('应该正确处理可选字段为空的情况', () => {
      const ormEntity = new PermissionOrmEntity()
      ormEntity.id = 'test-permission-id'
      ormEntity.name = '测试权限'
      ormEntity.code = 'TEST_PERMISSION'
      ormEntity.type = 'api'
      ormEntity.status = 'active'
      ormEntity.action = 'read'
      ormEntity.tenantId = 'test-tenant-id'
      ormEntity.adminUserId = 'test-admin-id'
      ormEntity.createdAt = new Date('2024-01-01')
      ormEntity.updatedAt = new Date('2024-01-02')

      const permission = PermissionMapper.toDomain(ormEntity)

      expect(permission.description).toBeUndefined()
      expect(permission.organizationId).toBeUndefined()
      expect(permission.roleIds).toEqual([])
      expect(permission.conditions).toBeUndefined()
      expect(permission.fields).toEqual([])
      expect(permission.expiresAt).toBeUndefined()
      expect(permission.parentPermissionId).toBeUndefined()
      expect(permission.childPermissionIds).toEqual([])
      expect(permission.resource).toBeUndefined()
      expect(permission.module).toBeUndefined()
      expect(permission.tags).toBeUndefined()
      expect(permission.deletedAt).toBeUndefined()
    })
  })

  describe('toOrm', () => {
    it('应该正确将领域实体转换为数据库实体', () => {
      const permission = new Permission(
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
        false,
        true,
        [{ field: 'userId', operator: 'eq', value: 'user123' }],
        ['name', 'email'],
        new Date('2024-12-31'),
        'parent-permission-id',
      )

      permission.status = new PermissionStatusValue(PermissionStatus.ACTIVE)
      permission.roleIds = ['role1', 'role2']
      permission.childPermissionIds = ['child1', 'child2']
      permission.tags = 'admin,system'
      permission.createdAt = new Date('2024-01-01')
      permission.updatedAt = new Date('2024-01-02')
      permission.deletedAt = null

      const ormEntity = PermissionMapper.toOrm(permission)

      expect(ormEntity.id).toBe('test-permission-id')
      expect(ormEntity.name).toBe('测试权限')
      expect(ormEntity.code).toBe('TEST_PERMISSION')
      expect(ormEntity.description).toBe('测试权限描述')
      expect(ormEntity.type).toBe('api')
      expect(ormEntity.status).toBe('active')
      expect(ormEntity.action).toBe('read')
      expect(ormEntity.tenantId).toBe('test-tenant-id')
      expect(ormEntity.organizationId).toBe('test-org-id')
      expect(ormEntity.adminUserId).toBe('test-admin-id')
      expect(ormEntity.roleIds).toEqual(['role1', 'role2'])
      expect(ormEntity.isSystemPermission).toBe(false)
      expect(ormEntity.isDefaultPermission).toBe(true)
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

  describe('updateOrm', () => {
    it('应该正确更新数据库实体', () => {
      const ormEntity = new PermissionOrmEntity()
      ormEntity.id = 'test-permission-id'
      ormEntity.name = '旧权限名称'
      ormEntity.code = 'OLD_PERMISSION'
      ormEntity.type = 'menu'
      ormEntity.status = 'suspended'
      ormEntity.action = 'write'
      ormEntity.tenantId = 'test-tenant-id'
      ormEntity.adminUserId = 'test-admin-id'
      ormEntity.createdAt = new Date('2024-01-01')
      ormEntity.updatedAt = new Date('2024-01-02')

      const permission = new Permission(
        'test-permission-id',
        '新权限名称',
        'NEW_PERMISSION',
        PermissionType.API,
        PermissionAction.READ,
        'test-tenant-id',
        'test-admin-id',
        '新权限描述',
        'new-org-id',
        'new-resource',
        'new-module',
      )

      permission.status = new PermissionStatusValue(PermissionStatus.ACTIVE)
      permission.roleIds = ['new-role1']
      permission.conditions = new PermissionCondition([{ field: 'newField', operator: 'eq', value: 'newValue' }])
      permission.fields = ['newField1', 'newField2']
      permission.expiresAt = new Date('2025-12-31')
      permission.parentPermissionId = 'new-parent-id'
      permission.childPermissionIds = ['new-child1']
      permission.resource = 'new-resource'
      permission.module = 'new-module'
      permission.tags = 'new-tag'
      permission.updatedAt = new Date('2024-01-03')
      permission.deletedAt = null

      PermissionMapper.updateOrm(ormEntity, permission)

      expect(ormEntity.name).toBe('新权限名称')
      expect(ormEntity.code).toBe('NEW_PERMISSION')
      expect(ormEntity.description).toBe('新权限描述')
      expect(ormEntity.type).toBe('api')
      expect(ormEntity.status).toBe('active')
      expect(ormEntity.action).toBe('read')
      expect(ormEntity.organizationId).toBe('new-org-id')
      expect(ormEntity.roleIds).toEqual(['new-role1'])
      expect(ormEntity.conditions).toEqual([{ field: 'newField', operator: 'eq', value: 'newValue' }])
      expect(ormEntity.fields).toEqual(['newField1', 'newField2'])
      expect(ormEntity.expiresAt).toEqual(new Date('2025-12-31'))
      expect(ormEntity.parentPermissionId).toBe('new-parent-id')
      expect(ormEntity.childPermissionIds).toEqual(['new-child1'])
      expect(ormEntity.resource).toBe('new-resource')
      expect(ormEntity.module).toBe('new-module')
      expect(ormEntity.tags).toBe('new-tag')
      expect(ormEntity.updatedAt).toEqual(new Date('2024-01-03'))
      expect(ormEntity.deletedAt).toBeNull()
    })
  })

  describe('toDomainList', () => {
    it('应该正确批量转换数据库实体列表', () => {
      const ormEntities = [
        {
          id: 'permission-1',
          name: '权限1',
          code: 'PERMISSION_1',
          type: 'api',
          status: 'active',
          action: 'read',
          tenantId: 'test-tenant-id',
          adminUserId: 'test-admin-id',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
        } as PermissionOrmEntity,
        {
          id: 'permission-2',
          name: '权限2',
          code: 'PERMISSION_2',
          type: 'menu',
          status: 'suspended',
          action: 'update',
          tenantId: 'test-tenant-id',
          adminUserId: 'test-admin-id',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
        } as PermissionOrmEntity,
      ]

      const permissions = PermissionMapper.toDomainList(ormEntities)

      expect(permissions).toHaveLength(2)
      expect(permissions[0].getName()).toBe('权限1')
      expect(permissions[0].getCode()).toBe('PERMISSION_1')
      expect(permissions[0].getType()).toBe('api')
      expect(permissions[0].getStatus()).toBe('active')
      expect(permissions[1].getName()).toBe('权限2')
      expect(permissions[1].getCode()).toBe('PERMISSION_2')
      expect(permissions[1].getType()).toBe('menu')
      expect(permissions[1].getStatus()).toBe('suspended')
    })
  })

  describe('toOrmList', () => {
    it('应该正确批量转换领域实体列表', () => {
      const permissions = [
        new Permission(
          'permission-1',
          '权限1',
          'PERMISSION_1',
          PermissionType.API,
          PermissionAction.READ,
          'test-tenant-id',
          'test-admin-id',
        ),
        new Permission(
          'permission-2',
          '权限2',
          'PERMISSION_2',
          PermissionType.MENU,
          PermissionAction.UPDATE,
          'test-tenant-id',
          'test-admin-id',
        ),
      ]

      const ormEntities = PermissionMapper.toOrmList(permissions)

      expect(ormEntities).toHaveLength(2)
      expect(ormEntities[0].name).toBe('权限1')
      expect(ormEntities[0].code).toBe('PERMISSION_1')
      expect(ormEntities[0].type).toBe('api')
      expect(ormEntities[0].action).toBe('read')
      expect(ormEntities[1].name).toBe('权限2')
      expect(ormEntities[1].code).toBe('PERMISSION_2')
      expect(ormEntities[1].type).toBe('menu')
      expect(ormEntities[1].action).toBe('update')
    })
  })

  describe('toPartialOrm', () => {
    it('应该正确转换为部分数据库实体', () => {
      const permission = new Permission(
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

      permission.status = new PermissionStatusValue(PermissionStatus.ACTIVE)
      permission.roleIds = ['role1']
      permission.conditions = new PermissionCondition([{ field: 'userId', operator: 'eq', value: 'user123' }])
      permission.fields = ['name', 'email']
      permission.updatedAt = new Date('2024-01-02')

      const partialOrm = PermissionMapper.toPartialOrm(permission)

      expect(partialOrm.name).toBe('测试权限')
      expect(partialOrm.code).toBe('TEST_PERMISSION')
      expect(partialOrm.description).toBe('测试权限描述')
      expect(partialOrm.type).toBe('api')
      expect(partialOrm.status).toBe('active')
      expect(partialOrm.action).toBe('read')
      expect(partialOrm.organizationId).toBe('test-org-id')
      expect(partialOrm.roleIds).toEqual(['role1'])
      expect(partialOrm.conditions).toEqual([{ field: 'userId', operator: 'eq', value: 'user123' }])
      expect(partialOrm.fields).toEqual(['name', 'email'])
      expect(partialOrm.resource).toBe('user')
      expect(partialOrm.module).toBe('system')
      expect(partialOrm.updatedAt).toEqual(new Date('2024-01-02'))
    })
  })

  describe('validateOrmEntity', () => {
    it('应该正确验证有效的数据库实体', () => {
      const ormEntity = new PermissionOrmEntity()
      ormEntity.id = 'test-permission-id'
      ormEntity.name = '测试权限'
      ormEntity.code = 'TEST_PERMISSION'
      ormEntity.type = 'api'
      ormEntity.status = 'active'
      ormEntity.action = 'read'
      ormEntity.tenantId = 'test-tenant-id'
      ormEntity.adminUserId = 'test-admin-id'

      const isValid = PermissionMapper.validateOrmEntity(ormEntity)

      expect(isValid).toBe(true)
    })

    it('应该正确验证无效的数据库实体', () => {
      const ormEntity = new PermissionOrmEntity()
      ormEntity.id = 'test-permission-id'
      // 缺少必要字段

      const isValid = PermissionMapper.validateOrmEntity(ormEntity)

      expect(isValid).toBe(false)
    })
  })

  describe('validateDomainEntity', () => {
    it('应该正确验证有效的领域实体', () => {
      const permission = new Permission(
        'test-permission-id',
        '测试权限',
        'TEST_PERMISSION',
        PermissionType.API,
        PermissionAction.READ,
        'test-tenant-id',
        'test-admin-id',
      )

      const isValid = PermissionMapper.validateDomainEntity(permission)

      expect(isValid).toBe(true)
    })

    it('应该正确验证无效的领域实体', () => {
      const permission = new Permission(
        '', // 无效ID
        '测试权限',
        'TEST_PERMISSION',
        PermissionType.API,
        PermissionAction.READ,
        'test-tenant-id',
        'test-admin-id',
      )

      const isValid = PermissionMapper.validateDomainEntity(permission)

      expect(isValid).toBe(false)
    })
  })
}) 
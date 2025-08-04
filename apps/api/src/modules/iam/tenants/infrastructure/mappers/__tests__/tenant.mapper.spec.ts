import { Tenant } from '../../../domain/entities/tenant.entity'
import {
  TenantStatus,
  TenantStatusValue,
} from '../../../domain/value-objects/tenant-status.value-object'
import { TenantOrmEntity } from '../../entities/tenant.orm.entity'
import { TenantMapper } from '../tenant.mapper'

/**
 * @description TenantMapper单元测试
 *
 * 测试TenantMapper的各种映射功能，包括：
 * 1. 数据库实体到领域实体的转换
 * 2. 领域实体到数据库实体的转换
 * 3. 批量映射操作
 * 4. 验证功能
 */
describe('TenantMapper', () => {
  let mockTenant: Tenant
  let mockOrmEntity: TenantOrmEntity

  beforeEach(() => {
    // 创建测试用的领域实体
    mockTenant = new Tenant(
      'test-id',
      'Test Tenant',
      'test-tenant',
      'admin-user-id',
      'Test tenant description',
      { theme: 'dark', language: 'zh-CN' },
    )
    mockTenant.status = new TenantStatusValue(TenantStatus.ACTIVE)
    mockTenant.createdAt = new Date('2024-01-01T00:00:00Z')
    mockTenant.updatedAt = new Date('2024-01-02T00:00:00Z')

    // 创建测试用的数据库实体
    mockOrmEntity = new TenantOrmEntity()
    mockOrmEntity.id = 'test-id'
    mockOrmEntity.name = 'Test Tenant'
    mockOrmEntity.code = 'test-tenant'
    mockOrmEntity.status = TenantStatus.ACTIVE
    mockOrmEntity.adminUserId = 'admin-user-id'
    mockOrmEntity.description = 'Test tenant description'
    mockOrmEntity.settings = { theme: 'dark', language: 'zh-CN' }
    mockOrmEntity.createdAt = new Date('2024-01-01T00:00:00Z')
    mockOrmEntity.updatedAt = new Date('2024-01-02T00:00:00Z')
  })

  describe('toDomain', () => {
    it('应该正确将数据库实体转换为领域实体', () => {
      const result = TenantMapper.toDomain(mockOrmEntity)

      expect(result).toBeInstanceOf(Tenant)
      expect(result.id).toBe(mockOrmEntity.id)
      expect(result.getName()).toBe(mockOrmEntity.name)
      expect(result.getCode()).toBe(mockOrmEntity.code)
      expect(result.getStatus()).toBe(mockOrmEntity.status)
      expect(result.adminUserId).toBe(mockOrmEntity.adminUserId)
      expect(result.description).toBe(mockOrmEntity.description)
      expect(result.settings).toEqual(mockOrmEntity.settings)
      expect(result.createdAt).toEqual(mockOrmEntity.createdAt)
      expect(result.updatedAt).toEqual(mockOrmEntity.updatedAt)
    })

    it('应该正确处理软删除的实体', () => {
      mockOrmEntity.deletedAt = new Date('2024-01-03T00:00:00Z')
      const result = TenantMapper.toDomain(mockOrmEntity)

      expect(result.deletedAt).toEqual(mockOrmEntity.deletedAt)
    })

    it('应该正确处理空的可选字段', () => {
      mockOrmEntity.description = undefined
      mockOrmEntity.settings = undefined
      mockOrmEntity.deletedAt = undefined

      const result = TenantMapper.toDomain(mockOrmEntity)

      expect(result.description).toBeUndefined()
      expect(result.settings).toEqual({}) // Tenant构造函数会将undefined转换为空对象
      expect(result.deletedAt).toBeUndefined()
    })
  })

  describe('toOrm', () => {
    it('应该正确将领域实体转换为数据库实体', () => {
      const result = TenantMapper.toOrm(mockTenant)

      expect(result).toBeInstanceOf(TenantOrmEntity)
      expect(result.id).toBe(mockTenant.id)
      expect(result.name).toBe(mockTenant.getName())
      expect(result.code).toBe(mockTenant.getCode())
      expect(result.status).toBe(mockTenant.getStatus())
      expect(result.adminUserId).toBe(mockTenant.adminUserId)
      expect(result.description).toBe(mockTenant.description)
      expect(result.settings).toEqual(mockTenant.settings)
      expect(result.createdAt).toEqual(mockTenant.createdAt)
      expect(result.updatedAt).toEqual(mockTenant.updatedAt)
    })

    it('应该正确处理软删除的实体', () => {
      mockTenant.deletedAt = new Date('2024-01-03T00:00:00Z')
      const result = TenantMapper.toOrm(mockTenant)

      expect(result.deletedAt).toEqual(mockTenant.deletedAt)
    })
  })

  describe('updateOrm', () => {
    it('应该正确更新数据库实体', () => {
      const ormEntity = new TenantOrmEntity()
      ormEntity.id = 'test-id'
      ormEntity.name = 'Old Name'
      ormEntity.code = 'old-code'
      ormEntity.status = TenantStatus.PENDING
      ormEntity.adminUserId = 'old-admin-id'
      ormEntity.description = 'Old description'
      ormEntity.settings = { old: 'settings' }
      ormEntity.createdAt = new Date('2024-01-01T00:00:00Z')
      ormEntity.updatedAt = new Date('2024-01-01T00:00:00Z')

      TenantMapper.updateOrm(ormEntity, mockTenant)

      expect(ormEntity.name).toBe(mockTenant.getName())
      expect(ormEntity.code).toBe(mockTenant.getCode())
      expect(ormEntity.status).toBe(mockTenant.getStatus())
      expect(ormEntity.adminUserId).toBe(mockTenant.adminUserId)
      expect(ormEntity.description).toBe(mockTenant.description)
      expect(ormEntity.settings).toEqual(mockTenant.settings)
      expect(ormEntity.updatedAt).toEqual(mockTenant.updatedAt)
      expect(ormEntity.id).toBe('test-id') // ID不应该被更新
      expect(ormEntity.createdAt).toEqual(new Date('2024-01-01T00:00:00Z')) // createdAt不应该被更新
    })
  })

  describe('toDomainList', () => {
    it('应该正确批量转换数据库实体列表', () => {
      const ormEntities = [mockOrmEntity, { ...mockOrmEntity, id: 'test-id-2' }]
      const result = TenantMapper.toDomainList(ormEntities)

      expect(result).toHaveLength(2)
      expect(result[0]).toBeInstanceOf(Tenant)
      expect(result[1]).toBeInstanceOf(Tenant)
      expect(result[0].id).toBe('test-id')
      expect(result[1].id).toBe('test-id-2')
    })

    it('应该正确处理空列表', () => {
      const result = TenantMapper.toDomainList([])

      expect(result).toHaveLength(0)
    })
  })

  describe('toOrmList', () => {
    it('应该正确批量转换领域实体列表', () => {
      const secondTenant = new Tenant(
        'test-id-2',
        'Test Tenant 2',
        'test-tenant-2',
        'admin-user-id-2',
        'Test tenant description 2',
        { theme: 'light', language: 'en-US' },
      )
      secondTenant.status = new TenantStatusValue(TenantStatus.ACTIVE)
      secondTenant.createdAt = new Date('2024-01-01T00:00:00Z')
      secondTenant.updatedAt = new Date('2024-01-02T00:00:00Z')

      const tenants = [mockTenant, secondTenant]
      const result = TenantMapper.toOrmList(tenants)

      expect(result).toHaveLength(2)
      expect(result[0]).toBeInstanceOf(TenantOrmEntity)
      expect(result[1]).toBeInstanceOf(TenantOrmEntity)
      expect(result[0].id).toBe('test-id')
      expect(result[1].id).toBe('test-id-2')
    })

    it('应该正确处理空列表', () => {
      const result = TenantMapper.toOrmList([])

      expect(result).toHaveLength(0)
    })
  })

  describe('toPartialOrm', () => {
    it('应该正确转换为部分数据库实体', () => {
      const result = TenantMapper.toPartialOrm(mockTenant)

      expect(result).not.toHaveProperty('id')
      expect(result).not.toHaveProperty('createdAt')
      expect(result.name).toBe(mockTenant.getName())
      expect(result.code).toBe(mockTenant.getCode())
      expect(result.status).toBe(mockTenant.getStatus())
      expect(result.adminUserId).toBe(mockTenant.adminUserId)
      expect(result.description).toBe(mockTenant.description)
      expect(result.settings).toEqual(mockTenant.settings)
      expect(result.updatedAt).toEqual(mockTenant.updatedAt)
    })
  })

  describe('validateOrmEntity', () => {
    it('应该验证有效的数据库实体', () => {
      const result = TenantMapper.validateOrmEntity(mockOrmEntity)

      expect(result).toBe(true)
    })

    it('应该拒绝无效的数据库实体', () => {
      const invalidEntity = new TenantOrmEntity()
      const result = TenantMapper.validateOrmEntity(invalidEntity)

      expect(result).toBe(false)
    })

    it('应该拒绝缺少必需字段的数据库实体', () => {
      const invalidEntity = { ...mockOrmEntity, id: undefined }
      const result = TenantMapper.validateOrmEntity(invalidEntity as any)

      expect(result).toBe(false)
    })
  })

  describe('validateDomainEntity', () => {
    it('应该验证有效的领域实体', () => {
      const result = TenantMapper.validateDomainEntity(mockTenant)

      expect(result).toBe(true)
    })

    it('应该拒绝无效的领域实体', () => {
      let invalidTenant: Tenant
      try {
        // 尝试创建无效的Tenant实体
        invalidTenant = new Tenant('', '', '', '', '', {})
      } catch (error) {
        // 如果构造函数抛出异常，说明实体无效
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain('租户名称不能为空')
        return
      }

      // 如果构造函数没有抛出异常，则测试validateDomainEntity
      const result = TenantMapper.validateDomainEntity(invalidTenant!)
      expect(result).toBe(false)
    })
  })

  describe('映射一致性', () => {
    it('应该保持toDomain和toOrm的一致性', () => {
      const ormEntity = TenantMapper.toOrm(mockTenant)
      const domainEntity = TenantMapper.toDomain(ormEntity)

      expect(domainEntity.id).toBe(mockTenant.id)
      expect(domainEntity.getName()).toBe(mockTenant.getName())
      expect(domainEntity.getCode()).toBe(mockTenant.getCode())
      expect(domainEntity.getStatus()).toBe(mockTenant.getStatus())
      expect(domainEntity.adminUserId).toBe(mockTenant.adminUserId)
      expect(domainEntity.description).toBe(mockTenant.description)
      expect(domainEntity.settings).toEqual(mockTenant.settings)
      expect(domainEntity.createdAt).toEqual(mockTenant.createdAt)
      expect(domainEntity.updatedAt).toEqual(mockTenant.updatedAt)
    })

    it('应该正确处理所有状态类型', () => {
      const statuses = [
        TenantStatus.PENDING,
        TenantStatus.ACTIVE,
        TenantStatus.SUSPENDED,
        TenantStatus.DELETED,
      ]

      statuses.forEach((status) => {
        mockTenant.status = new TenantStatusValue(status)
        const ormEntity = TenantMapper.toOrm(mockTenant)
        const domainEntity = TenantMapper.toDomain(ormEntity)

        expect(domainEntity.getStatus()).toBe(status)
      })
    })
  })
})

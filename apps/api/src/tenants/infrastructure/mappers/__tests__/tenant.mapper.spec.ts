import { TenantMapper } from '../mikro/tenant.mapper.mikro'
import { TenantEntity } from '../../entities/mikro/tenant.entity.mikro'
import { Tenant as TenantDomain } from '@/tenants/domain/entities/tenant.entity'
import { TenantName } from '@/tenants/domain/value-objects/tenant-name.vo'
import { TenantCode } from '@/tenants/domain/value-objects/tenant-code.vo'

describe('TenantMapper', () => {
  let mapper: TenantMapper

  beforeEach(() => {
    mapper = new TenantMapper()
  })
  describe('toDomain', () => {
    it('应该正确将数据库实体转换为领域实体', () => {
      // 准备测试数据
      const entity = new TenantEntity()
      entity.id = '123e4567-e89b-12d3-a456-426614174000'
      entity.name = '测试租户'
      entity.code = 'test_tenant'
      entity.description = '测试租户描述'
      entity.adminUserId = '123e4567-e89b-12d3-a456-426614174001'
      entity.status = 'PENDING'
      entity.settings = { theme: 'dark', language: 'zh-CN' }
      entity.createdAt = new Date('2024-01-01T00:00:00Z')
      entity.updatedAt = new Date('2024-01-02T00:00:00Z')
      entity.createdBy = '123e4567-e89b-12d3-a456-426614174002'
      entity.updatedBy = '123e4567-e89b-12d3-a456-426614174003'
      entity.version = 2

      // 执行转换
      const domain = mapper.toDomain(entity)

      // 验证结果
      expect(domain).toBeInstanceOf(TenantDomain)
      expect(domain.id).toBe(entity.id)
      expect(domain.name).toBeInstanceOf(TenantName)
      expect(domain.name.getValue()).toBe(entity.name)
      expect(domain.code).toBeInstanceOf(TenantCode)
      expect(domain.code.getValue()).toBe(entity.code)
      expect(domain.description).toBe(entity.description)
      expect(domain.adminUserId).toBe(entity.adminUserId)
      expect(domain.status).toBe(entity.status)
      expect(domain.settings).toEqual(entity.settings)
      expect(domain.createdAt).toEqual(entity.createdAt)
      expect(domain.updatedAt).toEqual(entity.updatedAt)
      expect(domain.createdBy).toBe(entity.createdBy)
      expect(domain.updatedBy).toBe(entity.updatedBy)
      expect(domain.version).toBe(entity.version)
    })

    it('应该处理可选字段', () => {
      // 准备测试数据 - 最小化实体
      const entity = new TenantEntity()
      entity.id = '123e4567-e89b-12d3-a456-426614174000'
      entity.name = '测试租户'
      entity.code = 'test_tenant'
      entity.adminUserId = '123e4567-e89b-12d3-a456-426614174001'
      entity.status = 'PENDING'

      // 执行转换
      const domain = mapper.toDomain(entity)

      // 验证结果
      expect(domain).toBeInstanceOf(TenantDomain)
      expect(domain.id).toBe(entity.id)
      expect(domain.name.getValue()).toBe(entity.name)
      expect(domain.code.getValue()).toBe(entity.code)
      expect(domain.adminUserId).toBe(entity.adminUserId)
      expect(domain.status).toBe(entity.status)
      expect(domain.description).toBeUndefined()
      expect(domain.settings).toEqual({})
    })
  })

  describe('toEntity', () => {
    it('应该正确将领域实体转换为数据库实体', () => {
      // 准备测试数据
      const domain = new TenantDomain(
        '123e4567-e89b-12d3-a456-426614174000',
        new TenantName('测试租户'),
        new TenantCode('test_tenant'),
        '123e4567-e89b-12d3-a456-426614174001',
        '测试租户描述',
        { theme: 'dark', language: 'zh-CN' },
      )
      domain.createdAt = new Date('2024-01-01T00:00:00Z')
      domain.updatedAt = new Date('2024-01-02T00:00:00Z')
      domain.createdBy = '123e4567-e89b-12d3-a456-426614174002'
      domain.updatedBy = '123e4567-e89b-12d3-a456-426614174003'
      domain.version = 2

      // 执行转换
      const entity = mapper.toEntity(domain)

      // 验证结果
      expect(entity).toBeInstanceOf(TenantEntity)
      expect(entity.id).toBe(domain.id)
      expect(entity.name).toBe(domain.name.getValue())
      expect(entity.code).toBe(domain.code.getValue())
      expect(entity.description).toBe(domain.description)
      expect(entity.adminUserId).toBe(domain.adminUserId)
      expect(entity.status).toBe(domain.status)
      expect(entity.settings).toEqual(domain.settings)
      expect(entity.createdAt).toEqual(domain.createdAt)
      expect(entity.updatedAt).toEqual(domain.updatedAt)
      expect(entity.createdBy).toBe(domain.createdBy)
      expect(entity.updatedBy).toBe(domain.updatedBy)
      expect(entity.version).toBe(domain.version)
    })
  })

  describe('toDomainList', () => {
    it('应该正确批量转换数据库实体列表', () => {
      // 准备测试数据
      const entities = [
        new TenantEntity(),
        new TenantEntity(),
      ]
      entities[0].id = '123e4567-e89b-12d3-a456-426614174000'
      entities[0].name = '租户1'
      entities[0].code = 'tenant1'
      entities[0].adminUserId = '123e4567-e89b-12d3-a456-426614174001'
      entities[0].status = 'ACTIVE'

      entities[1].id = '123e4567-e89b-12d3-a456-426614174002'
      entities[1].name = '租户2'
      entities[1].code = 'tenant2'
      entities[1].adminUserId = '123e4567-e89b-12d3-a456-426614174003'
      entities[1].status = 'PENDING'

      // 执行转换
      const domains = mapper.toDomainList(entities)

      // 验证结果
      expect(domains).toHaveLength(2)
      expect(domains[0]).toBeInstanceOf(TenantDomain)
      expect(domains[1]).toBeInstanceOf(TenantDomain)
      expect(domains[0].id).toBe(entities[0].id)
      expect(domains[1].id).toBe(entities[1].id)
    })
  })

  describe('toEntityList', () => {
    it('应该正确批量转换领域实体列表', () => {
      // 准备测试数据
      const domains = [
        new TenantDomain(
          '123e4567-e89b-12d3-a456-426614174000',
          new TenantName('租户1'),
          new TenantCode('tenant1'),
          '123e4567-e89b-12d3-a456-426614174001',
        ),
        new TenantDomain(
          '123e4567-e89b-12d3-a456-426614174002',
          new TenantName('租户2'),
          new TenantCode('tenant2'),
          '123e4567-e89b-12d3-a456-426614174003',
        ),
      ]

      // 执行转换
      const entities = mapper.toEntityList(domains)

      // 验证结果
      expect(entities).toHaveLength(2)
      expect(entities[0]).toBeInstanceOf(TenantEntity)
      expect(entities[1]).toBeInstanceOf(TenantEntity)
      expect(entities[0].id).toBe(domains[0].id)
      expect(entities[1].id).toBe(domains[1].id)
    })
  })
})

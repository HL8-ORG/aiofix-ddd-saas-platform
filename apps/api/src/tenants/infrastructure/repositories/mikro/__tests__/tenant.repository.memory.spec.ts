import 'reflect-metadata'
import { TenantRepositoryMemory } from '../tenant.repository.memory'
import { Tenant as TenantDomain } from '@/tenants/domain/entities/tenant.entity'
import { TenantName } from '@/tenants/domain/value-objects/tenant-name.vo'
import { TenantCode } from '@/tenants/domain/value-objects/tenant-code.vo'
import { TenantEntity } from '@/tenants/infrastructure/entities/mikro/tenant.entity.mikro'
import { TenantStatus } from '@/tenants/domain/entities/tenant.entity'

/**
 * @describe TenantRepositoryMemory Unit Tests
 * @description
 * 内存租户仓储单元测试，测试内存存储的CRUD操作和业务查询。
 * 
 * 主要测试内容：
 * 1. 基本的CRUD操作
 * 2. 业务查询方法
 * 3. 分页和过滤功能
 * 4. 数据隔离和清理
 * 5. 边界条件和错误处理
 */
describe('TenantRepositoryMemory Unit Tests', () => {
  let repository: TenantRepositoryMemory

  beforeEach(() => {
    repository = new TenantRepositoryMemory()
  })

  afterEach(() => {
    repository.clear()
  })

  describe('CRUD Operations', () => {
    it('should save and find tenant by ID', async () => {
      const tenant = new TenantDomain(
        'test-tenant-1',
        new TenantName('Test Tenant 1'),
        new TenantCode('TEST001'),
        'admin-user-1',
        'Test tenant description',
        { maxUsers: 100 },
      )

      const savedTenant = await repository.save(tenant)
      expect(savedTenant).toBeDefined()
      expect(savedTenant.id).toBe('test-tenant-1')

      const foundTenant = await repository.findById('test-tenant-1')
      expect(foundTenant).toBeDefined()
      expect(foundTenant?.id).toBe('test-tenant-1')
    })

    it('should find tenant by code', async () => {
      const tenant = new TenantDomain(
        'test-tenant-2',
        new TenantName('Test Tenant 2'),
        new TenantCode('TEST002'),
        'admin-user-2',
        'Test tenant description',
      )

      await repository.save(tenant)
      const foundTenant = await repository.findByCode(new TenantCode('TEST002'))
      expect(foundTenant).toBeDefined()
      expect(foundTenant?.id).toBe('test-tenant-2')
    })

    it('should find tenant by name', async () => {
      const tenant = new TenantDomain(
        'test-tenant-3',
        new TenantName('Test Tenant 3'),
        new TenantCode('TEST003'),
        'admin-user-3',
        'Test tenant description',
      )

      await repository.save(tenant)
      const foundTenant = await repository.findByName(new TenantName('Test Tenant 3'))
      expect(foundTenant).toBeDefined()
      expect(foundTenant?.id).toBe('test-tenant-3')
    })

    it('should update tenant', async () => {
      const tenant = new TenantDomain(
        'test-tenant-4',
        new TenantName('Test Tenant 4'),
        new TenantCode('TEST004'),
        'admin-user-4',
        'Original description',
      )

      await repository.save(tenant)
      tenant.updateSettings({ maxUsers: 200 }, 'admin-user-4')
      const updatedTenant = await repository.update(tenant)

      expect(updatedTenant.settings).toEqual({ maxUsers: 200 })

      const foundTenant = await repository.findById('test-tenant-4')
      expect(foundTenant?.settings).toEqual({ maxUsers: 200 })
    })

    it('should delete tenant', async () => {
      const tenant = new TenantDomain(
        'test-tenant-5',
        new TenantName('Test Tenant 5'),
        new TenantCode('TEST005'),
        'admin-user-5',
        'Test tenant description',
      )

      await repository.save(tenant)
      expect(await repository.exists('test-tenant-5')).toBe(true)

      await repository.delete('test-tenant-5')
      expect(await repository.exists('test-tenant-5')).toBe(false)
      expect(await repository.findById('test-tenant-5')).toBeNull()
    })

    it('should check tenant existence', async () => {
      const tenant = new TenantDomain(
        'test-tenant-6',
        new TenantName('Test Tenant 6'),
        new TenantCode('TEST006'),
        'admin-user-6',
        'Test tenant description',
      )

      await repository.save(tenant)
      expect(await repository.exists('test-tenant-6')).toBe(true)
      expect(await repository.exists('non-existent-tenant')).toBe(false)
    })

    it('should count tenants', async () => {
      expect(await repository.count()).toBe(0)

      const tenant1 = new TenantDomain(
        'test-tenant-9',
        new TenantName('Test Tenant 9'),
        new TenantCode('TEST009'),
        'admin-user-9',
        'Test tenant description',
      )

      const tenant2 = new TenantDomain(
        'test-tenant-10',
        new TenantName('Test Tenant 10'),
        new TenantCode('TEST010'),
        'admin-user-10',
        'Test tenant description',
      )

      await repository.save(tenant1)
      await repository.save(tenant2)

      expect(await repository.count()).toBe(2)
    })
  })

  describe('Business Queries', () => {
    beforeEach(async () => {
      const tenants = [
        new TenantDomain(
          'active-tenant-1',
          new TenantName('Active Tenant 1'),
          new TenantCode('ACTIVE001'),
          'admin-user-1',
          'Active tenant',
        ),
        new TenantDomain(
          'pending-tenant-1',
          new TenantName('Pending Tenant 1'),
          new TenantCode('PENDING001'),
          'admin-user-2',
          'Pending tenant',
        ),
        new TenantDomain(
          'suspended-tenant-1',
          new TenantName('Suspended Tenant 1'),
          new TenantCode('SUSPENDED001'),
          'admin-user-3',
          'Suspended tenant',
        ),
      ]

      tenants[0].activate('admin-user-1')
      tenants[2].suspend('admin-user-3')

      for (const tenant of tenants) {
        await repository.save(tenant)
      }
    })

    it('should find tenants by status', async () => {
      const activeTenants = await repository.findByStatus('ACTIVE')
      expect(activeTenants).toHaveLength(1)

      const pendingTenants = await repository.findByStatus('PENDING')
      expect(pendingTenants).toHaveLength(1)

      const suspendedTenants = await repository.findByStatus('SUSPENDED')
      expect(suspendedTenants).toHaveLength(1)
    })

    it('should find all tenants', async () => {
      const allTenants = await repository.findAll()
      expect(allTenants).toHaveLength(3)
    })

    it('should find active tenants', async () => {
      const activeTenants = await repository.findActiveTenants()
      expect(activeTenants).toHaveLength(1)
      expect(activeTenants.every(tenant => tenant.status === TenantStatus.ACTIVE)).toBe(true)
    })
  })

  describe('Pagination and Filtering', () => {
    beforeEach(async () => {
      for (let i = 1; i <= 5; i++) {
        const tenant = new TenantDomain(
          `tenant-${i}`,
          new TenantName(`Tenant ${i}`),
          new TenantCode(`TENANT${i.toString().padStart(3, '0')}`),
          `admin-user-${i}`,
          `Description for tenant ${i}`,
        )

        if (i <= 2) {
          tenant.activate(`admin-user-${i}`)
        }

        await repository.save(tenant)
      }
    })

    it('should paginate results correctly', async () => {
      const result = await repository.findWithPagination(1, 3)
      expect(result.tenants).toHaveLength(3)
      expect(result.total).toBe(5)
    })

    it('should filter by status', async () => {
      const result = await repository.findWithPagination(1, 10, { status: 'ACTIVE' })
      expect(result.tenants).toHaveLength(2)
      expect(result.tenants.every(tenant => tenant.status === TenantStatus.ACTIVE)).toBe(true)
    })

    it('should search by name', async () => {
      const result = await repository.findWithPagination(1, 10, { search: 'Tenant 1' })
      expect(result.tenants).toHaveLength(1)
      expect(result.tenants[0].name.getValue()).toBe('Tenant 1')
    })
  })

  describe('Data Isolation and Cleanup', () => {
    it('should clear all data', async () => {
      const tenant = new TenantDomain(
        'test-tenant-clear',
        new TenantName('Test Tenant Clear'),
        new TenantCode('CLEAR001'),
        'admin-user-clear',
        'Test tenant for clearing',
      )

      await repository.save(tenant)
      expect(await repository.count()).toBe(1)

      repository.clear()
      expect(await repository.count()).toBe(0)
    })

    it('should seed test data', async () => {
      const testEntities = [
        {
          id: 'seed-tenant-1',
          name: 'Seed Tenant 1',
          code: 'SEED001',
          adminUserId: 'admin-seed-1',
          description: 'Seeded tenant 1',
          status: 'ACTIVE',
          settings: { maxUsers: 100 },
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
        } as TenantEntity,
      ]

      repository.seed(testEntities)
      expect(await repository.count()).toBe(1)

      const tenant1 = await repository.findById('seed-tenant-1')
      expect(tenant1).toBeDefined()
      expect(tenant1?.name.getValue()).toBe('Seed Tenant 1')
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should return null for non-existent tenant by ID', async () => {
      const tenant = await repository.findById('non-existent-id')
      expect(tenant).toBeNull()
    })

    it('should return empty array for non-existent status', async () => {
      const tenants = await repository.findByStatus('NON_EXISTENT_STATUS')
      expect(tenants).toEqual([])
    })

    it('should handle empty pagination result', async () => {
      const result = await repository.findWithPagination(1, 10)
      expect(result.tenants).toEqual([])
      expect(result.total).toBe(0)
    })
  })
})

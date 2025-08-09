import { TenantRepository } from '../tenant.repository.mikro'
import { Tenant as TenantDomain } from '@/tenants/domain/entities/tenant.entity'
import { TenantName } from '@/tenants/domain/value-objects/tenant-name.vo'
import { TenantCode } from '@/tenants/domain/value-objects/tenant-code.vo'
import { EntityManager } from '@mikro-orm/core'
import { TenantEntity } from '@/tenants/infrastructure/entities/mikro/tenant.entity.mikro'

/**
 * @describe TenantRepositoryMikro Unit Tests
 * @description
 * MikroORM租户仓储单元测试，使用模拟的EntityManager测试仓储实现。
 * 
 * 主要测试内容：
 * 1. 仓储方法的正确性
 * 2. 数据转换和映射
 * 3. 错误处理和边界情况
 * 4. 业务逻辑的正确性
 */
describe('TenantRepositoryMikro Unit Tests', () => {
  let repository: TenantRepository
  let mockEntityManager: jest.Mocked<EntityManager>

  beforeEach(async () => {
    mockEntityManager = {
      findOne: jest.fn(),
      find: jest.fn(),
      persistAndFlush: jest.fn(),
      removeAndFlush: jest.fn(),
      nativeDelete: jest.fn(),
      count: jest.fn(),
      findAndCount: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as any

    repository = new TenantRepository(mockEntityManager)
  })

  describe('CRUD Operations', () => {
    it('should find tenant by ID', async () => {
      const mockEntity = new TenantEntity()
      mockEntity.id = 'test-tenant-1'
      mockEntity.name = 'Test Tenant 1'
      mockEntity.code = 'TEST001'
      mockEntity.adminUserId = 'admin-user-1'
      mockEntity.description = 'Test tenant description'
      mockEntity.status = 'ACTIVE'
      mockEntity.settings = { maxUsers: 100 }

      mockEntityManager.findOne.mockResolvedValue(mockEntity)

      const result = await repository.findById('test-tenant-1')

      expect(result).toBeDefined()
      expect(result?.id).toBe('test-tenant-1')
      expect(result?.name.getValue()).toBe('Test Tenant 1')
      expect(mockEntityManager.findOne).toHaveBeenCalledWith(TenantEntity, { id: 'test-tenant-1' })
    })

    it('should find tenant by code', async () => {
      const mockEntity = new TenantEntity()
      mockEntity.id = 'test-tenant-2'
      mockEntity.name = 'Test Tenant 2'
      mockEntity.code = 'TEST002'
      mockEntity.adminUserId = 'admin-user-2'
      mockEntity.status = 'ACTIVE'

      mockEntityManager.findOne.mockResolvedValue(mockEntity)

      const result = await repository.findByCode(new TenantCode('TEST002'))

      expect(result).toBeDefined()
      expect(result?.id).toBe('test-tenant-2')
      expect(mockEntityManager.findOne).toHaveBeenCalledWith(TenantEntity, { code: 'test002' })
    })

    it('should find tenant by name', async () => {
      const mockEntity = new TenantEntity()
      mockEntity.id = 'test-tenant-3'
      mockEntity.name = 'Test Tenant 3'
      mockEntity.code = 'TEST003'
      mockEntity.adminUserId = 'admin-user-3'
      mockEntity.status = 'ACTIVE'

      mockEntityManager.findOne.mockResolvedValue(mockEntity)

      const result = await repository.findByName(new TenantName('Test Tenant 3'))

      expect(result).toBeDefined()
      expect(result?.code.getValue()).toBe('test003')
      expect(mockEntityManager.findOne).toHaveBeenCalledWith(TenantEntity, { name: 'Test Tenant 3' })
    })

    it('should save tenant', async () => {
      const tenant = new TenantDomain(
        'test-tenant-4',
        new TenantName('Test Tenant 4'),
        new TenantCode('TEST004'),
        'admin-user-4',
        'Test tenant description',
        { maxUsers: 400 },
      )

      mockEntityManager.persistAndFlush.mockResolvedValue(undefined)

      const result = await repository.save(tenant)

      expect(result).toBeDefined()
      expect(result.id).toBe('test-tenant-4')
      expect(mockEntityManager.persistAndFlush).toHaveBeenCalled()
    })

    it('should delete tenant', async () => {
      mockEntityManager.nativeDelete.mockResolvedValue(1)

      await repository.delete('test-tenant-5')

      expect(mockEntityManager.nativeDelete).toHaveBeenCalledWith(TenantEntity, { id: 'test-tenant-5' })
    })

    it('should check tenant existence', async () => {
      mockEntityManager.count.mockResolvedValue(1)

      const existsById = await repository.exists('test-tenant-6')
      const existsByCode = await repository.existsByCode(new TenantCode('TEST006'))
      const existsByName = await repository.existsByName(new TenantName('Test Tenant 6'))

      expect(existsById).toBe(true)
      expect(existsByCode).toBe(true)
      expect(existsByName).toBe(true)
    })

    it('should find tenants by status', async () => {
      const mockEntities = [
        { id: 'test-tenant-7', name: 'Active Tenant', code: 'ACTIVE001', adminUserId: 'admin-7', status: 'ACTIVE' },
        { id: 'test-tenant-8', name: 'Pending Tenant', code: 'PENDING001', adminUserId: 'admin-8', status: 'PENDING' },
      ]

      mockEntityManager.find.mockResolvedValue(mockEntities as any)

      const result = await repository.findByStatus('ACTIVE')

      expect(result).toBeDefined()
      expect(result.length).toBe(2)
      expect(mockEntityManager.find).toHaveBeenCalledWith(TenantEntity, { status: 'ACTIVE' })
    })

    it('should count tenants', async () => {
      mockEntityManager.count.mockResolvedValue(5)

      const totalCount = await repository.count()

      expect(totalCount).toBe(5)
      expect(mockEntityManager.count).toHaveBeenCalledWith(TenantEntity, {})
    })

    it('should find tenants with pagination', async () => {
      const mockEntities = [
        { id: 'test-tenant-9', name: 'Tenant 9', code: 'TENANT009', adminUserId: 'admin-9' },
        { id: 'test-tenant-10', name: 'Tenant 10', code: 'TENANT010', adminUserId: 'admin-10' },
      ]

      mockEntityManager.findAndCount.mockResolvedValue([mockEntities as any, 10])

      const result = await repository.findWithPagination(1, 2, {
        status: 'PENDING',
        sortBy: 'name',
        sortOrder: 'asc',
      })

      expect(result).toBeDefined()
      expect(result.tenants.length).toBe(2)
      expect(result.total).toBe(10)
    })
  })

  describe('Error Handling', () => {
    it('should handle non-existent tenant gracefully', async () => {
      mockEntityManager.findOne.mockResolvedValue(null)

      const tenant = await repository.findById('non-existent-id')
      const tenantByCode = await repository.findByCode(new TenantCode('NONEXISTENT'))
      const tenantByName = await repository.findByName(new TenantName('Non-existent Tenant'))

      expect(tenant).toBeNull()
      expect(tenantByCode).toBeNull()
      expect(tenantByName).toBeNull()
    })

    it('should handle repository errors gracefully', async () => {
      const error = new Error('Database connection failed')
      mockEntityManager.findOne.mockRejectedValue(error)

      await expect(repository.findById('test-id')).rejects.toThrow('Database connection failed')
    })

    it('should handle save errors gracefully', async () => {
      const tenant = new TenantDomain(
        'test-tenant-14',
        new TenantName('Test Tenant'),
        new TenantCode('TEST014'),
        'admin-14',
      )

      const error = new Error('Duplicate code violation')
      mockEntityManager.persistAndFlush.mockRejectedValue(error)

      await expect(repository.save(tenant)).rejects.toThrow('Duplicate code violation')
    })
  })
})

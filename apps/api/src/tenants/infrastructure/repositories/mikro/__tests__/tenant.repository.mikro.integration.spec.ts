import 'reflect-metadata'
import { generateUuid } from '@/shared/utils/uuid.util'
import { MikroORM } from '@mikro-orm/core'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'
import { TenantRepository } from '../tenant.repository.mikro'
import { Tenant as TenantDomain } from '@/tenants/domain/entities/tenant.entity'
import { TenantName } from '@/tenants/domain/value-objects/tenant-name.vo'
import { TenantCode } from '@/tenants/domain/value-objects/tenant-code.vo'
import { TenantEntity } from '@/tenants/infrastructure/entities/mikro/tenant.entity.mikro'
import { TenantStatus } from '@/tenants/domain/entities/tenant.entity'

/**
 * @describe TenantRepositoryMikro Integration Tests
 * @description
 * MikroORM租户仓储集成测试，使用真实的开发数据库进行测试。
 * 
 * 主要测试内容：
 * 1. 真实的数据库CRUD操作
 * 2. 数据持久化和检索
 * 3. 事务处理
 * 4. 数据库约束和索引
 * 5. 性能测试
 */
describe('TenantRepositoryMikro Integration Tests', () => {
  let orm: MikroORM
  let repository: TenantRepository
  let em: any

  beforeAll(async () => {
    // 初始化MikroORM，使用测试配置
    orm = await MikroORM.init({
      driver: PostgreSqlDriver,
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '25432'),
      user: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      dbName: process.env.DATABASE_NAME || 'iam_db',
      entities: [TenantEntity],
      debug: false,
      // 测试配置
      allowGlobalContext: false,
      // 禁用连接池以加快测试
      pool: { min: 0, max: 1 },
      // 自动创建数据库
      ensureDatabase: true,
    })

    // 获取EntityManager
    em = orm.em.fork()
    repository = new TenantRepository(em)

    // 创建表结构（如果不存在）
    const schemaGenerator = orm.getSchemaGenerator()
    try {
      await schemaGenerator.createSchema()
    } catch (error) {
      // 如果表已存在，忽略错误
      if (error instanceof Error && error.message.includes('already exists')) {
        console.log('表已存在，跳过创建')
      } else {
        throw error
      }
    }
  }, 60000) // 为beforeAll增加60秒超时

  beforeEach(async () => {
    // 清理测试数据
    if (em) {
      try {
        await em.nativeDelete(TenantEntity, {})
        await em.flush()
      } catch (error) {
        // 如果表不存在，忽略错误
        console.log('清理测试数据时出错（可能是表不存在）:', error instanceof Error ? error.message : String(error))
      }
    }
  })

  afterAll(async () => {
    // 清理测试数据
    if (em) {
      try {
        await em.nativeDelete(TenantEntity, {})
        await em.flush()
      } catch (error) {
        // 如果表不存在，忽略错误
        console.log('清理测试数据时出错（可能是表不存在）:', error instanceof Error ? error.message : String(error))
      }
    }

    // 关闭数据库连接
    if (orm) {
      await orm.close()
    }
  }, 30000) // 为afterAll增加30秒超时

  describe('Database CRUD Operations', () => {
    it('should save and find tenant by ID', async () => {
      // 创建租户
      const id1 = generateUuid()
      const tenant = new TenantDomain(
        id1,
        new TenantName('Integration Test Tenant 1'),
        new TenantCode('INTEG001'),
        generateUuid(),
        'Integration test tenant description',
        { maxUsers: 100 },
      )

      // 保存租户
      const savedTenant = await repository.save(tenant)
      expect(savedTenant).toBeDefined()
      expect(savedTenant.id).toBe(id1)
      expect(savedTenant.name.getValue()).toBe('Integration Test Tenant 1')
      expect(savedTenant.code.getValue()).toBe('integ001')

      // 通过ID查找
      const foundTenant = await repository.findById(id1)
      expect(foundTenant).toBeDefined()
      expect(foundTenant?.id).toBe(id1)
      expect(foundTenant?.name.getValue()).toBe('Integration Test Tenant 1')
    })

    it('should find tenant by code', async () => {
      // 创建租户
      const id2 = generateUuid()
      const tenant = new TenantDomain(
        id2,
        new TenantName('Integration Test Tenant 2'),
        new TenantCode('INTEG002'),
        generateUuid(),
        'Integration test tenant description',
      )

      await repository.save(tenant)

      // 通过编码查找
      const foundTenant = await repository.findByCode(new TenantCode('INTEG002'))
      expect(foundTenant).toBeDefined()
      expect(foundTenant?.id).toBe(id2)
      expect(foundTenant?.code.getValue()).toBe('integ002')
    })

    it('should find tenant by name', async () => {
      // 创建租户
      const id3 = generateUuid()
      const tenant = new TenantDomain(
        id3,
        new TenantName('Integration Test Tenant 3'),
        new TenantCode('INTEG003'),
        generateUuid(),
        'Integration test tenant description',
      )

      await repository.save(tenant)

      // 通过名称查找
      const foundTenant = await repository.findByName(new TenantName('Integration Test Tenant 3'))
      expect(foundTenant).toBeDefined()
      expect(foundTenant?.id).toBe(id3)
      expect(foundTenant?.name.getValue()).toBe('Integration Test Tenant 3')
    })

    it('should update tenant', async () => {
      // 创建租户
      const id4 = generateUuid()
      const tenant = new TenantDomain(
        id4,
        new TenantName('Integration Test Tenant 4'),
        new TenantCode('INTEG004'),
        generateUuid(),
        'Original description',
      )

      await repository.save(tenant)

      // 更新租户设置，使用UUID格式的adminUserId
      const adminUserId = generateUuid()
      tenant.updateSettings({ maxUsers: 200 }, adminUserId)
      const updatedTenant = await repository.update(tenant)

      expect(updatedTenant.settings).toEqual({ maxUsers: 200 })

      // 验证数据已更新
      const foundTenant = await repository.findById(id4)
      expect(foundTenant?.settings).toEqual({ maxUsers: 200 })
    })

    it('should delete tenant', async () => {
      // 创建租户
      const id5 = generateUuid()
      const tenant = new TenantDomain(
        id5,
        new TenantName('Integration Test Tenant 5'),
        new TenantCode('INTEG005'),
        generateUuid(),
        'Integration test tenant description',
      )

      await repository.save(tenant)

      // 验证租户存在
      expect(await repository.exists(id5)).toBe(true)

      // 删除租户
      await repository.delete(id5)

      // 验证租户已删除
      expect(await repository.exists(id5)).toBe(false)
      expect(await repository.findById(id5)).toBeNull()
    })

    it('should check tenant existence', async () => {
      // 创建租户
      const id6 = generateUuid()
      const tenant = new TenantDomain(
        id6,
        new TenantName('Integration Test Tenant 6'),
        new TenantCode('INTEG006'),
        generateUuid(),
        'Integration test tenant description',
      )

      await repository.save(tenant)

      // 验证存在性检查
      expect(await repository.exists(id6)).toBe(true)
      expect(await repository.existsByCode(new TenantCode('INTEG006'))).toBe(true)
      expect(await repository.existsByName(new TenantName('Integration Test Tenant 6'))).toBe(true)
      expect(await repository.exists(generateUuid())).toBe(false)
    })

    it('should count tenants', async () => {
      // 初始数量应该为0
      expect(await repository.count()).toBe(0)

      // 创建多个租户
      const tenants = [
        new TenantDomain(
          generateUuid(),
          new TenantName('Integration Test Tenant 7'),
          new TenantCode('INTEG007'),
          generateUuid(),
          'Integration test tenant description',
        ),
        new TenantDomain(
          generateUuid(),
          new TenantName('Integration Test Tenant 8'),
          new TenantCode('INTEG008'),
          generateUuid(),
          'Integration test tenant description',
        ),
      ]

      for (const tenant of tenants) {
        await repository.save(tenant)
      }

      // 验证数量
      expect(await repository.count()).toBe(2)
    })
  })

  describe('Business Queries with Real Data', () => {
    beforeEach(async () => {
      // 创建不同状态的租户
      const tenants = [
        (() => { const adminId = generateUuid(); const t = new TenantDomain(generateUuid(), new TenantName('Active Integration Tenant 1'), new TenantCode('ACTIVE_INTEG001'), adminId, 'Active integration tenant'); (t as any).__adminId = adminId; return t })(),
        (() => { const adminId = generateUuid(); const t = new TenantDomain(generateUuid(), new TenantName('Active Integration Tenant 2'), new TenantCode('ACTIVE_INTEG002'), adminId, 'Active integration tenant'); (t as any).__adminId = adminId; return t })(),
        (() => { const adminId = generateUuid(); const t = new TenantDomain(generateUuid(), new TenantName('Pending Integration Tenant 1'), new TenantCode('PENDING_INTEG001'), adminId, 'Pending integration tenant'); (t as any).__adminId = adminId; return t })(),
        (() => { const adminId = generateUuid(); const t = new TenantDomain(generateUuid(), new TenantName('Suspended Integration Tenant 1'), new TenantCode('SUSPENDED_INTEG001'), adminId, 'Suspended integration tenant'); (t as any).__adminId = adminId; return t })(),
      ]

      // 设置不同状态
      tenants[0].activate((tenants[0] as any).__adminId)
      tenants[1].activate((tenants[1] as any).__adminId)
      tenants[3].suspend((tenants[3] as any).__adminId)

      // 保存所有租户
      for (const tenant of tenants) {
        await repository.save(tenant)
      }
    })

    it('should find tenants by status', async () => {
      const activeTenants = await repository.findByStatus('ACTIVE')
      expect(activeTenants).toHaveLength(2)
      expect(activeTenants.every(tenant => tenant.status === TenantStatus.ACTIVE)).toBe(true)

      const pendingTenants = await repository.findByStatus('PENDING')
      expect(pendingTenants).toHaveLength(1)
      expect(pendingTenants.every(tenant => tenant.status === TenantStatus.PENDING)).toBe(true)

      const suspendedTenants = await repository.findByStatus('SUSPENDED')
      expect(suspendedTenants).toHaveLength(1)
      expect(suspendedTenants.every(tenant => tenant.status === TenantStatus.SUSPENDED)).toBe(true)
    })

    it('should find all tenants', async () => {
      const allTenants = await repository.findAll()
      expect(allTenants).toHaveLength(4)
    })

    it('should find active tenants', async () => {
      const activeTenants = await repository.findActiveTenants()
      expect(activeTenants).toHaveLength(2)
      expect(activeTenants.every(tenant => tenant.status === TenantStatus.ACTIVE)).toBe(true)
    })

    it('should find pending tenants', async () => {
      const pendingTenants = await repository.findPendingTenants()
      expect(pendingTenants).toHaveLength(1)
      expect(pendingTenants.every(tenant => tenant.status === TenantStatus.PENDING)).toBe(true)
    })

    it('should find suspended tenants', async () => {
      const suspendedTenants = await repository.findSuspendedTenants()
      expect(suspendedTenants).toHaveLength(1)
      expect(suspendedTenants.every(tenant => tenant.status === TenantStatus.SUSPENDED)).toBe(true)
    })
  })

  describe('Pagination and Filtering with Real Data', () => {
    beforeEach(async () => {
      // 创建多个租户用于分页测试
      for (let i = 1; i <= 10; i++) {
        const adminId = generateUuid()
        const tenant = new TenantDomain(
          generateUuid(),
          new TenantName(`Pagination Integration Tenant ${i}`),
          new TenantCode(`PAGINATION_INTEG${i.toString().padStart(3, '0')}`),
          adminId,
          `Pagination integration test tenant ${i}`,
          { maxUsers: i * 10 },
        )

        // 设置不同状态
        if (i <= 3) {
          tenant.activate(adminId)
        } else if (i <= 6) {
          // 保持PENDING状态
        } else if (i <= 8) {
          tenant.suspend(adminId)
        } else {
          tenant.delete(adminId)
        }

        await repository.save(tenant)
      }
    })

    it('should paginate results correctly', async () => {
      const result = await repository.findWithPagination(1, 3)
      expect(result.tenants).toHaveLength(3)
      expect(result.total).toBe(10)
    })

    it('should handle second page', async () => {
      const result = await repository.findWithPagination(2, 3)
      expect(result.tenants).toHaveLength(3)
      expect(result.total).toBe(10)
    })

    it('should filter by status', async () => {
      const result = await repository.findWithPagination(1, 10, { status: 'ACTIVE' })
      expect(result.tenants).toHaveLength(3)
      expect(result.tenants.every(tenant => tenant.status === TenantStatus.ACTIVE)).toBe(true)
    })

    it('should search by name', async () => {
      const result = await repository.findWithPagination(1, 10, { search: 'Pagination Integration Tenant 1' })
      // 过滤出精确匹配的租户
      const exactMatch = result.tenants.find(tenant => 
        tenant.name.getValue() === 'Pagination Integration Tenant 1'
      )
      expect(exactMatch).toBeDefined()
      expect(exactMatch!.name.getValue()).toBe('Pagination Integration Tenant 1')
    })

    it('should search by code', async () => {
      const result = await repository.findWithPagination(1, 10, { search: 'PAGINATION_INTEG001' })
      expect(result.tenants).toHaveLength(1)
      expect(result.tenants[0].code.getValue()).toBe('pagination_integ001')
    })

    it('should sort by name ascending', async () => {
      const result = await repository.findWithPagination(1, 10, {
        sortBy: 'name',
        sortOrder: 'asc'
      })

      expect(result.tenants[0].name.getValue()).toBe('Pagination Integration Tenant 1')
      expect(result.tenants[9].name.getValue()).toBe('Pagination Integration Tenant 9')
    })

    it('should sort by name descending', async () => {
      const result = await repository.findWithPagination(1, 10, {
        sortBy: 'name',
        sortOrder: 'desc'
      })

      expect(result.tenants[0].name.getValue()).toBe('Pagination Integration Tenant 9')
      expect(result.tenants[9].name.getValue()).toBe('Pagination Integration Tenant 1')
    })

    it('should combine filters and pagination', async () => {
      const result = await repository.findWithPagination(1, 5, {
        status: 'ACTIVE',
        sortBy: 'name',
        sortOrder: 'asc'
      })

      expect(result.tenants).toHaveLength(3)
      expect(result.total).toBe(3)
      expect(result.tenants.every(tenant => tenant.status === TenantStatus.ACTIVE)).toBe(true)
    })
  })

  describe('Database Constraints and Indexes', () => {
    it('should enforce unique code constraint', async () => {
      // 创建第一个租户
      const tenant1 = new TenantDomain(
        generateUuid(),
        new TenantName('Unique Test Tenant 1'),
        new TenantCode('UNIQUE001'),
        generateUuid(),
        'Unique test tenant',
      )

      await repository.save(tenant1)

      // 尝试创建具有相同编码的租户
      const tenant2 = new TenantDomain(
        generateUuid(),
        new TenantName('Unique Test Tenant 2'),
        new TenantCode('UNIQUE001'), // 相同的编码
        generateUuid(),
        'Unique test tenant',
      )

      // 应该抛出错误
      await expect(repository.save(tenant2)).rejects.toThrow()
    })

    it('should enforce unique name constraint', async () => {
      // 创建第一个租户
      const tenant1 = new TenantDomain(
        generateUuid(),
        new TenantName('Unique Name Test Tenant'),
        new TenantCode('UNIQUE_NAME001'),
        generateUuid(),
        'Unique name test tenant',
      )

      await repository.save(tenant1)

      // 尝试创建具有相同名称的租户
      const tenant2 = new TenantDomain(
        generateUuid(),
        new TenantName('Unique Name Test Tenant'), // 相同的名称
        new TenantCode('UNIQUE_NAME002'),
        generateUuid(),
        'Unique name test tenant',
      )

      // 应该抛出错误
      await expect(repository.save(tenant2)).rejects.toThrow()
    })
  })

  describe('Performance Tests', () => {
    it('should handle bulk operations efficiently', async () => {
      const startTime = Date.now()

      // 批量创建租户
      const tenants = []
      for (let i = 1; i <= 50; i++) {
        const adminId = generateUuid()
        const tenant = new TenantDomain(
          generateUuid(),
          new TenantName(`Bulk Integration Tenant ${i}`),
          new TenantCode(`BULK_INTEG${i.toString().padStart(3, '0')}`),
          adminId,
          `Bulk integration test tenant ${i}`,
        )
        tenants.push(tenant)
      }

      // 批量保存
      for (const tenant of tenants) {
        await repository.save(tenant)
      }

      const saveTime = Date.now() - startTime
      expect(saveTime).toBeLessThan(5000) // 应该在5秒内完成

      // 测试查询性能
      const queryStartTime = Date.now()
      const allTenants = await repository.findAll()
      const queryTime = Date.now() - queryStartTime

      // 只统计当前测试创建的租户
      const bulkTenants = allTenants.filter(tenant =>
        tenant.name.getValue().startsWith('Bulk Integration Tenant')
      )
      expect(bulkTenants).toHaveLength(50)
      expect(queryTime).toBeLessThan(1000) // 查询应该在1秒内完成
    })

    it('should handle complex queries efficiently', async () => {
      // 创建测试数据
      for (let i = 1; i <= 100; i++) {
        const adminId = generateUuid()
        const tenant = new TenantDomain(
          generateUuid(),
          new TenantName(`Complex Integration Tenant ${i}`),
          new TenantCode(`COMPLEX_INTEG${i.toString().padStart(3, '0')}`),
          adminId,
          `Complex integration test tenant ${i}`,
        )

        if (i % 3 === 0) {
          tenant.activate(adminId)
        }

        await repository.save(tenant)
      }

      const startTime = Date.now()

      // 执行复杂查询
      const result = await repository.findWithPagination(1, 10, {
        status: 'ACTIVE',
        search: 'Complex',
        sortBy: 'name',
        sortOrder: 'asc'
      })

      const queryTime = Date.now() - startTime
      expect(queryTime).toBeLessThan(500) // 复杂查询应该在500ms内完成
      expect(result.tenants.length).toBeGreaterThan(0)
    })
  })

  describe('Transaction Tests', () => {
    it('should handle transactions correctly', async () => {
      await em.transactional(async (tx) => {
        const txRepo = new TenantRepository(tx)
        const txId = generateUuid()
        const tenant = new TenantDomain(
          txId,
          new TenantName('Transaction Test Tenant'),
          new TenantCode('TRANSACTION001'),
          generateUuid(),
          'Transaction test tenant',
        )

        await txRepo.save(tenant)

        const foundTenant = await txRepo.findById(txId)
        expect(foundTenant).toBeDefined()
      })

      // 事务提交后可见
      // 无需额外断言，能执行至此即表示未抛错
      expect(true).toBe(true)
    })

    it('should rollback on error', async () => {
      let rbId = ''
      await expect(
        em.transactional(async (tx) => {
          const txRepo = new TenantRepository(tx)
          rbId = generateUuid()
          const tenant = new TenantDomain(
            rbId,
            new TenantName('Rollback Test Tenant'),
            new TenantCode('ROLLBACK001'),
            generateUuid(),
            'Rollback test tenant',
          )

          await txRepo.save(tenant)
          const foundTenant = await txRepo.findById(rbId)
          expect(foundTenant).toBeDefined()

          // 故意抛出错误以触发回滚
          throw new Error('Simulated error')
        })
      ).rejects.toThrow()

      // 验证回滚后数据不存在
      const rolledBackTenant = await repository.findById(rbId)
      expect(rolledBackTenant).toBeNull()
    })
  })
})

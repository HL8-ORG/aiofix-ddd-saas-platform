import { Test, TestingModule } from '@nestjs/testing'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { MikroORM, EntityManager } from '@mikro-orm/core'
import { generateUuid } from '@/shared/utils/uuid.util'
import { ConfigService } from '@nestjs/config'
import { DatabaseService } from '../../database.service'
import { TestConfigModule, testMikroOrmConfig } from './database.config'
import { TenantEntity } from '@/tenants/infrastructure/entities/mikro/tenant.entity.mikro'

/**
 * @description 数据库模块集成测试
 * 
 * 测试策略：
 * 1. 测试数据库连接
 * 2. 测试事务管理
 * 3. 测试多租户隔离
 * 4. 测试性能优化
 */
describe('Database Integration Tests', () => {
  let module: TestingModule
  let orm: MikroORM
  let em: EntityManager
  let databaseService: DatabaseService

  // 增加超时时间到60秒，因为数据库操作可能较慢
  jest.setTimeout(60000)

  beforeAll(async () => {
    try {
      // 创建测试模块
      module = await Test.createTestingModule({
        imports: [
          TestConfigModule,
          MikroOrmModule.forRootAsync({
            imports: [TestConfigModule],
            useFactory: testMikroOrmConfig,
            inject: [ConfigService],
          }),
        ],
        providers: [DatabaseService],
      }).compile()

      // 获取服务实例
      orm = module.get<MikroORM>(MikroORM)
      em = module.get<EntityManager>(EntityManager)
      databaseService = module.get<DatabaseService>(DatabaseService)

      // 等待连接就绪
      if (!orm.isConnected()) {
        await orm.connect()
      }

      // 确保数据库存在并同步架构
      const generator = orm.getSchemaGenerator()
      await generator.ensureDatabase()
      await generator.updateSchema()

      // 验证连接
      const isConnected = await orm.isConnected()
      if (!isConnected) {
        throw new Error('Database connection failed')
      }
    } catch (error) {
      console.error('Database setup failed:', error)
      // 确保清理资源
      if (orm?.isConnected()) {
        await orm.close(true)
      }
      if (module) {
        await module.close()
      }
      throw error
    }
  }, 60000)

  beforeEach(async () => {
    try {
      // 确保连接可用
      if (!orm?.isConnected()) {
        await orm.connect()
      }

      // 清理数据库
      const generator = orm.getSchemaGenerator()
      await generator.clearDatabase()

      // 重置实体管理器
      em = orm.em.fork()
    } catch (error) {
      console.error('Database cleanup failed:', error)
      throw error
    }
  }, 30000)

  afterAll(async () => {
    try {
      // 关闭所有连接
      if (orm?.isConnected()) {
        // 强制关闭所有连接
        await orm.close(true)
      }

      // 关闭测试模块
      if (module) {
        await module.close()
      }

      // 等待所有异步操作完成
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Cleanup failed:', error)
      throw error
    } finally {
      // 确保资源被释放
      orm = null
      em = null
      module = null
      databaseService = null
    }
  }, 30000)

  describe('数据库连接', () => {
    it('应该成功连接到数据库', async () => {
      // Act
      const isConnected = await orm.isConnected()

      // Assert
      expect(isConnected).toBe(true)
    })

    it('应该能够执行查询', async () => {
      // Arrange
      const tenant = new TenantEntity()
      tenant.id = generateUuid()
      tenant.adminUserId = generateUuid()
      tenant.name = 'Test Tenant'
      tenant.code = 'test'

      // Act
      await em.persistAndFlush(tenant)
      const foundTenant = await em.findOne(TenantEntity, { id: tenant.id })

      // Assert
      expect(foundTenant).toBeDefined()
      expect(foundTenant.name).toBe('Test Tenant')
    })
  })

  describe('事务管理', () => {
    it('应该在事务中提交更改', async () => {
      // Arrange
      const tenant = new TenantEntity()
      tenant.id = generateUuid()
      tenant.adminUserId = generateUuid()
      tenant.name = 'Transaction Test'
      tenant.code = 'trans-test'

      // Act
      await databaseService.withTransaction(async (em) => {
        await em.persistAndFlush(tenant)
      })

      // Assert
      const foundTenant = await em.findOne(TenantEntity, { id: tenant.id })
      expect(foundTenant).toBeDefined()
      expect(foundTenant.name).toBe('Transaction Test')
    })

    it('应该在事务失败时回滚更改', async () => {
      // Arrange
      const tenant = new TenantEntity()
      tenant.id = generateUuid()
      tenant.adminUserId = generateUuid()
      tenant.name = 'Rollback Test'
      tenant.code = 'rollback-test'

      // Act & Assert
      await expect(databaseService.withTransaction(async (em) => {
        await em.persistAndFlush(tenant)
        throw new Error('Transaction should rollback')
      })).rejects.toThrow('Transaction should rollback')

      // Verify rollback
      const foundTenant = await em.findOne(TenantEntity, { id: tenant.id })
      expect(foundTenant).toBeNull()
    })
  })

  describe('多租户支持', () => {
    let tenant1: TenantEntity
    let tenant2: TenantEntity

    beforeEach(async () => {
      // 创建测试租户
      tenant1 = new TenantEntity()
      tenant1.id = generateUuid()
      tenant1.adminUserId = generateUuid()
      tenant1.name = 'Tenant 1'
      tenant1.code = 'tenant-1'

      tenant2 = new TenantEntity()
      tenant2.id = generateUuid()
      tenant2.adminUserId = generateUuid()
      tenant2.name = 'Tenant 2'
      tenant2.code = 'tenant-2'

      await em.persistAndFlush([tenant1, tenant2])
    })

    it('应该支持多租户数据隔离', async () => {
      // 模拟不同租户上下文
      const em1 = em.fork()
      const em2 = em.fork()

      // 使用租户ID作为过滤条件
      const tenantsForContext1 = await em1.find(TenantEntity, { id: tenant1.id })
      const tenantsForContext2 = await em2.find(TenantEntity, { id: tenant2.id })

      // Assert
      expect(tenantsForContext1.length).toBe(1)
      expect(tenantsForContext2.length).toBe(1)
      expect(tenantsForContext1[0].id).toBe(tenant1.id)
      expect(tenantsForContext2[0].id).toBe(tenant2.id)

      // 验证租户数据隔离
      const allTenants = await em.find(TenantEntity, {})
      expect(allTenants.length).toBe(2) // 总共应该有两个租户
    })

    it('应该支持租户特定的事务', async () => {
      // 使用事务更新租户1的数据
      await databaseService.withTransaction(async (em) => {
        const tenant = await em.findOne(TenantEntity, { id: tenant1.id })
        tenant.name = 'Updated Tenant 1'
        await em.persistAndFlush(tenant)
      })

      // 验证只有租户1被更新
      const updatedTenant1 = await em.findOne(TenantEntity, { id: tenant1.id })
      const tenant2Unchanged = await em.findOne(TenantEntity, { id: tenant2.id })

      expect(updatedTenant1.name).toBe('Updated Tenant 1')
      expect(tenant2Unchanged.name).toBe('Tenant 2')
    })

    it('应该支持租户数据的批量操作', async () => {
      // 批量更新租户数据
      await databaseService.withTransaction(async (em) => {
        const tenants = await em.find(TenantEntity, {})
        tenants.forEach(tenant => {
          tenant.name = `Updated ${tenant.name}`
        })
        await em.persistAndFlush(tenants)
      })

      // 验证所有租户都被更新
      const updatedTenants = await em.find(TenantEntity, {})
      expect(updatedTenants.length).toBe(2)
      expect(updatedTenants.every(t => t.name.startsWith('Updated'))).toBe(true)
      expect(updatedTenants.map(t => t.name).sort()).toEqual(['Updated Tenant 1', 'Updated Tenant 2'].sort())
    })

    it('应该正确处理租户删除', async () => {
      // 删除租户1
      await databaseService.withTransaction(async (em) => {
        const tenant = await em.findOne(TenantEntity, { id: tenant1.id })
        await em.removeAndFlush(tenant)
      })

      // 验证租户1被删除，租户2保持不变
      const deletedTenant = await em.findOne(TenantEntity, { id: tenant1.id })
      const remainingTenant = await em.findOne(TenantEntity, { id: tenant2.id })

      expect(deletedTenant).toBeNull()
      expect(remainingTenant).toBeDefined()
      expect(remainingTenant.name).toBe('Tenant 2')
    })
  })

  describe('性能优化', () => {
    it('应该使用连接池', async () => {
      // Arrange
      const promises = Array(5).fill(0).map(async (_, i) => {
        const em = databaseService.getEntityManager()
        const tenant = new TenantEntity()
        tenant.id = generateUuid()
        tenant.adminUserId = generateUuid()
        tenant.name = `Pool Test ${i}`
        tenant.code = `pool-test-${i}`
        await em.persistAndFlush(tenant)
      })

      // Act & Assert
      await expect(Promise.all(promises)).resolves.not.toThrow()
    })

    it('应该支持批量操作', async () => {
      // Arrange
      const tenants = Array(5).fill(0).map((_, i) => {
        const tenant = new TenantEntity()
        tenant.id = generateUuid()
        tenant.adminUserId = generateUuid()
        tenant.name = `Batch Test ${i}`
        tenant.code = `batch-test-${i}`
        return tenant
      })

      // Act
      await em.persistAndFlush(tenants)

      // Assert
      const count = await em.count(TenantEntity)
      expect(count).toBe(5)
    })
  })
})

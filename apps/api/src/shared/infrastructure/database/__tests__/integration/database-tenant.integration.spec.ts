import { Test, TestingModule } from '@nestjs/testing'
import { MikroORM, EntityManager } from '@mikro-orm/core'
import { ConfigService } from '@nestjs/config'
import { DatabaseService } from '../../database.service'
import { TestConfigModule, testMikroOrmConfig } from './database.config'
import { TenantEntity } from '@/tenants/infrastructure/entities/mikro/tenant.entity.mikro'
import { TenantRepository } from '@/tenants/infrastructure/repositories/mikro/tenant.repository.mikro'
import { Tenant as TenantDomain } from '@/tenants/domain/entities/tenant.entity'
import { TenantName } from '@/tenants/domain/value-objects/tenant-name.vo'
import { TenantCode } from '@/tenants/domain/value-objects/tenant-code.vo'
import { generateUuid } from '@/shared/utils/uuid.util'
import { MikroOrmModule } from '@mikro-orm/nestjs'

/**
 * @description 数据库模块与租户模块集成测试
 * 
 * 主要测试内容：
 * 1. 数据库服务与租户仓储的协同工作
 * 2. 事务管理与租户操作的结合
 * 3. 多租户数据隔离
 * 4. 性能测试
 */
describe('Database-Tenant Integration Tests', () => {
  let module: TestingModule
  let orm: MikroORM
  let em: EntityManager
  let databaseService: DatabaseService
  let tenantRepository: TenantRepository

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
        providers: [
          DatabaseService,
          TenantRepository,
        ],
      }).compile()

      // 获取服务实例
      orm = module.get<MikroORM>(MikroORM)
      em = module.get<EntityManager>(EntityManager)
      databaseService = module.get<DatabaseService>(DatabaseService)
      tenantRepository = module.get<TenantRepository>(TenantRepository)

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

  describe('数据库服务与租户仓储协同工作', () => {
    it('应该能通过数据库服务创建和查询租户', async () => {
      // 创建租户
      const tenant = new TenantDomain(
        generateUuid(),
        new TenantName('Test Tenant'),
        new TenantCode('TEST001'),
        generateUuid(),
        'Test tenant description',
      )

      // 使用数据库服务的事务保存租户
      await databaseService.withTransaction(async (em) => {
        const repository = new TenantRepository(em)
        await repository.save(tenant)
      })

      // 验证租户已创建
      const foundTenant = await tenantRepository.findById(tenant.id)
      expect(foundTenant).toBeDefined()
      expect(foundTenant.name.getValue()).toBe('Test Tenant')
      expect(foundTenant.code.getValue()).toBe('test001')
    })

    it('应该在事务失败时回滚租户创建', async () => {
      // 创建租户
      const tenant = new TenantDomain(
        generateUuid(),
        new TenantName('Rollback Test Tenant'),
        new TenantCode('ROLLBACK001'),
        generateUuid(),
        'Rollback test tenant',
      )

      // 尝试在事务中保存租户并故意失败
      try {
        await databaseService.withTransaction(async (em) => {
          const repository = new TenantRepository(em)
          await repository.save(tenant)
          throw new Error('Simulated error')
        })
      } catch (error) {
        // 预期的错误
      }

      // 验证租户未被创建
      const foundTenant = await tenantRepository.findById(tenant.id)
      expect(foundTenant).toBeNull()
    })
  })

  describe('多租户数据隔离', () => {
    let tenant1: TenantDomain
    let tenant2: TenantDomain

    beforeEach(async () => {
      // 创建两个测试租户
      tenant1 = new TenantDomain(
        generateUuid(),
        new TenantName('Tenant 1'),
        new TenantCode('TENANT001'),
        generateUuid(),
        'Tenant 1 description',
      )

      tenant2 = new TenantDomain(
        generateUuid(),
        new TenantName('Tenant 2'),
        new TenantCode('TENANT002'),
        generateUuid(),
        'Tenant 2 description',
      )

      // 保存租户
      await databaseService.withTransaction(async (em) => {
        const repository = new TenantRepository(em)
        await repository.save(tenant1)
        await repository.save(tenant2)
      })
    })

    it('应该支持多租户数据隔离', async () => {
      // 使用不同的EntityManager实例
      const em1 = databaseService.getEntityManager()
      const em2 = databaseService.getEntityManager()

      // 为每个租户创建独立的仓储
      const repo1 = new TenantRepository(em1)
      const repo2 = new TenantRepository(em2)

      // 验证租户隔离
      const foundTenant1 = await repo1.findById(tenant1.id)
      const foundTenant2 = await repo2.findById(tenant2.id)

      expect(foundTenant1.id).toBe(tenant1.id)
      expect(foundTenant2.id).toBe(tenant2.id)
    })

    it('应该支持租户特定的事务', async () => {
      // 更新租户1的设置
      await databaseService.withTransaction(async (em) => {
        const repository = new TenantRepository(em)
        const tenant = await repository.findById(tenant1.id)
        tenant.updateSettings({ maxUsers: 100 }, tenant1.adminUserId)
        await repository.update(tenant)
      })

      // 验证只有租户1被更新
      const updatedTenant1 = await tenantRepository.findById(tenant1.id)
      const tenant2Unchanged = await tenantRepository.findById(tenant2.id)

      expect(updatedTenant1.settings).toEqual({ maxUsers: 100 })
      expect(tenant2Unchanged.settings).toEqual({})
    })
  })

  describe('性能测试', () => {
    it('应该能高效处理大量租户操作', async () => {
      const startTime = Date.now()
      const tenantCount = 50

      // 批量创建租户
      for (let i = 0; i < tenantCount; i++) {
        const tenant = new TenantDomain(
          generateUuid(),
          new TenantName(`Performance Test Tenant ${i}`),
          new TenantCode(`PERF${i.toString().padStart(3, '0')}`),
          generateUuid(),
          `Performance test tenant ${i}`,
        )

        await databaseService.withTransaction(async (em) => {
          const repository = new TenantRepository(em)
          await repository.save(tenant)
        })
      }

      const endTime = Date.now()
      const duration = endTime - startTime

      // 验证性能
      expect(duration).toBeLessThan(30000) // 应该在30秒内完成

      // 验证数据
      const allTenants = await tenantRepository.findAll()
      expect(allTenants).toHaveLength(tenantCount)
    })

    it('应该支持并发租户操作', async () => {
      const tenantCount = 10
      const tenants = Array(tenantCount).fill(0).map((_, i) => {
        return new TenantDomain(
          generateUuid(),
          new TenantName(`Concurrent Test Tenant ${i}`),
          new TenantCode(`CONC${i.toString().padStart(3, '0')}`),
          generateUuid(),
          `Concurrent test tenant ${i}`,
        )
      })

      // 并发保存租户
      const promises = tenants.map(tenant =>
        databaseService.withTransaction(async (em) => {
          const repository = new TenantRepository(em)
          await repository.save(tenant)
        })
      )

      await Promise.all(promises)

      // 验证所有租户都被创建
      const savedTenants = await tenantRepository.findAll()
      expect(savedTenants).toHaveLength(tenantCount)
    })
  })

  describe('错误处理', () => {
    it('应该正确处理重复租户代码', async () => {
      // 创建第一个租户
      const tenant1 = new TenantDomain(
        generateUuid(),
        new TenantName('Duplicate Test Tenant 1'),
        new TenantCode('DUPLICATE001'),
        generateUuid(),
        'Duplicate test tenant 1',
      )

      await databaseService.withTransaction(async (em) => {
        const repository = new TenantRepository(em)
        await repository.save(tenant1)
      })

      // 尝试创建具有相同代码的租户
      const tenant2 = new TenantDomain(
        generateUuid(),
        new TenantName('Duplicate Test Tenant 2'),
        new TenantCode('DUPLICATE001'), // 相同的代码
        generateUuid(),
        'Duplicate test tenant 2',
      )

      // 应该抛出错误
      await expect(
        databaseService.withTransaction(async (em) => {
          const repository = new TenantRepository(em)
          await repository.save(tenant2)
        })
      ).rejects.toThrow()

      // 验证只有第一个租户被保存
      const allTenants = await tenantRepository.findAll()
      expect(allTenants).toHaveLength(1)
      expect(allTenants[0].code.getValue()).toBe('duplicate001')
    })

    it('应该正确处理数据库连接错误', async () => {
      // 关闭数据库连接
      if (orm.isConnected()) {
        await orm.close(true)
      }

      // 尝试执行操作
      const tenant = new TenantDomain(
        generateUuid(),
        new TenantName('Connection Test Tenant'),
        new TenantCode('CONNECTION001'),
        generateUuid(),
        'Connection test tenant',
      )

      // 应该抛出错误
      await expect(
        databaseService.withTransaction(async (em) => {
          const repository = new TenantRepository(em)
          await repository.save(tenant)
        })
      ).rejects.toThrow()

      // 重新连接数据库
      await orm.connect()
    })
  })
})

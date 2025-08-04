import { EntityManager } from '@mikro-orm/core'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Test, type TestingModule } from '@nestjs/testing'
import { generateUuid } from '../../../../../shared/domain/utils/uuid.util'
import config from '../../../../../shared/infrastructure/config/mikro-orm.config'
import { Tenant } from '../../domain/entities/tenant.entity'
import { TenantStatus } from '../../domain/value-objects/tenant-status.value-object'
import { TenantOrmEntity } from '../entities/tenant.orm.entity'
import { TenantRepositoryMikroOrm } from '../repositories/tenant.repository.mikroorm'

/**
 * @description 租户基础设施层数据库连接测试
 * 使用真实的PostgreSQL数据库测试MikroORM实现
 */
describe('租户基础设施层数据库连接测试', () => {
  let module: TestingModule
  let tenantRepository: TenantRepositoryMikroOrm
  let em: EntityManager

  beforeAll(async () => {
    console.log('开始数据库连接测试...')
    console.log('数据库配置:', {
      host: config.host,
      port: config.port,
      dbName: config.dbName,
      user: config.user,
    })

    try {
      module = await Test.createTestingModule({
        imports: [
          MikroOrmModule.forRoot({
            ...config,
            debug: true,
            allowGlobalContext: true, // 允许全局上下文
          }),
        ],
        providers: [
          {
            provide: 'TenantRepository',
            useClass: TenantRepositoryMikroOrm,
          },
          {
            provide: 'MikroORM',
            useFactory: () => module.get('MikroORM'),
          },
        ],
      }).compile()

      tenantRepository =
        module.get<TenantRepositoryMikroOrm>('TenantRepository')
      em = module.get<EntityManager>(EntityManager)

      // 测试数据库连接
      await em.getConnection().execute('SELECT 1')
      console.log('✅ 数据库连接成功')

      // 创建数据库表（如果不存在）
      try {
        await em.getConnection().execute(`
          CREATE TABLE IF NOT EXISTS tenants (
            id UUID PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            code VARCHAR(50) NOT NULL UNIQUE,
            status VARCHAR(20) NOT NULL,
            admin_user_id UUID NOT NULL,
            description TEXT,
            settings JSONB,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            deleted_at TIMESTAMP
          );
          CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
          CREATE INDEX IF NOT EXISTS idx_tenants_admin_user_id ON tenants(admin_user_id);
          CREATE INDEX IF NOT EXISTS idx_tenants_created_at ON tenants(created_at);
          CREATE INDEX IF NOT EXISTS idx_tenants_updated_at ON tenants(updated_at);
        `)
        console.log('✅ 数据库表创建成功')
      } catch (error) {
        console.log('⚠️ 表可能已存在或创建失败:', (error as Error).message)
      }

      // 清理测试数据
      try {
        await em.nativeDelete(TenantOrmEntity, {})
        console.log('✅ 测试数据清理完成')
      } catch (error) {
        console.log('⚠️ 清理测试数据失败:', (error as Error).message)
      }
    } catch (error) {
      console.error('❌ 数据库连接失败:', (error as Error).message)
      throw error
    }
  })

  afterAll(async () => {
    if (module) {
      try {
        await em.nativeDelete(TenantOrmEntity, {})
        console.log('✅ 测试数据清理完成')
      } catch (error) {
        console.error('❌ 清理测试数据失败:', (error as Error).message)
      }

      // 正确关闭 MikroORM 连接
      try {
        const orm = module.get('MikroORM')
        if (orm) {
          await orm.close()
        }
      } catch (error) {
        console.log('⚠️ 关闭MikroORM连接失败:', (error as Error).message)
      }

      await module.close()
    }
  })

  afterEach(async () => {
    try {
      await em.nativeDelete(TenantOrmEntity, {})
    } catch (error) {
      console.error('清理测试数据失败:', (error as Error).message)
    }
  })

  describe('数据库连接测试', () => {
    it('应该能够成功连接到PostgreSQL数据库', async () => {
      const result = await em.getConnection().execute('SELECT version()')
      expect(result).toBeDefined()
      console.log('数据库版本:', result)
    })

    it('应该能够创建和查询租户表', async () => {
      const tables = await em.getConnection().execute(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tenants'
      `)

      expect(tables.length).toBeGreaterThan(0)
      console.log('✅ 租户表存在')
    })
  })

  describe('MikroORM仓储数据库操作测试', () => {
    it('应该能够保存租户到数据库', async () => {
      const tenant = new Tenant(
        generateUuid(),
        '数据库测试租户',
        'db-test-tenant',
        generateUuid(),
        '这是一个数据库测试租户',
        { theme: 'dark', language: 'zh-CN' },
      )

      const savedTenant = await tenantRepository.save(tenant)
      expect(savedTenant.id).toBe(tenant.id)
      expect(savedTenant.getName()).toBe('数据库测试租户')

      // 验证数据确实保存到了数据库
      const dbTenant = await em.findOne(TenantOrmEntity, { id: tenant.id })
      expect(dbTenant).toBeDefined()
      expect(dbTenant?.name).toBe('数据库测试租户')
      expect(dbTenant?.code).toBe('db-test-tenant')

      console.log('✅ 租户保存到数据库成功')
    })

    it('应该能够从数据库查询租户', async () => {
      const tenant = new Tenant(
        generateUuid(),
        '查询测试租户',
        'query-test-tenant',
        generateUuid(),
      )
      await tenantRepository.save(tenant)

      const foundTenant = await tenantRepository.findById(tenant.id)
      expect(foundTenant).toBeDefined()
      expect(foundTenant?.getName()).toBe('查询测试租户')

      const foundByCode =
        await tenantRepository.findByCodeString('query-test-tenant')
      expect(foundByCode).toBeDefined()
      expect(foundByCode?.getCode()).toBe('query-test-tenant')

      console.log('✅ 数据库查询成功')
    })

    it('应该能够更新租户状态', async () => {
      const tenant = new Tenant(
        generateUuid(),
        '状态更新测试租户',
        'status-test-tenant',
        generateUuid(),
      )
      await tenantRepository.save(tenant)

      const updated = await tenantRepository.updateStatus(
        tenant.id,
        TenantStatus.ACTIVE,
      )
      expect(updated).toBe(true)

      const foundTenant = await tenantRepository.findById(tenant.id)
      expect(foundTenant?.getStatus()).toBe(TenantStatus.ACTIVE)

      console.log('✅ 状态更新成功')
    })

    it('应该能够统计租户数量', async () => {
      const tenant1 = new Tenant(
        generateUuid(),
        '统计测试租户1',
        'count-test-tenant-1',
        generateUuid(),
      )
      const tenant2 = new Tenant(
        generateUuid(),
        '统计测试租户2',
        'count-test-tenant-2',
        generateUuid(),
      )

      await tenantRepository.save(tenant1)
      await tenantRepository.save(tenant2)

      const count = await tenantRepository.count()
      expect(count).toBe(2)

      console.log('✅ 统计功能正常')
    })
  })
})

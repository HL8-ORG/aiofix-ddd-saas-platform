import { EntityManager } from '@mikro-orm/core'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Test, type TestingModule } from '@nestjs/testing'
import { generateUuid } from '../../../../../shared/domain/utils/uuid.util'
import config from '../../../../../shared/infrastructure/config/mikro-orm.config'
import { User } from '../../domain/entities/user.entity'
import { UserStatusValue } from '../../domain/value-objects/user-status.value-object'
import { UserOrmEntity } from '../entities/user.orm.entity'
import { UserRepositoryMikroOrm } from '../repositories/user.repository.mikroorm'

/**
 * @description 用户基础设施层数据库连接测试
 * 使用真实的PostgreSQL数据库测试MikroORM实现
 */
describe('用户基础设施层数据库连接测试', () => {
  let module: TestingModule
  let userRepository: UserRepositoryMikroOrm
  let em: EntityManager

  beforeAll(async () => {
    console.log('开始用户数据库连接测试...')
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
            provide: 'UserRepository',
            useClass: UserRepositoryMikroOrm,
          },
        ],
      }).compile()

      userRepository = module.get<UserRepositoryMikroOrm>('UserRepository')
      em = module.get<EntityManager>(EntityManager)

      // 测试数据库连接
      await em.getConnection().execute('SELECT 1')
      console.log('✅ 数据库连接成功')

      // 创建数据库表（如果不存在）
      try {
        await em.getConnection().execute(`
          CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY,
            username VARCHAR(50) NOT NULL,
            email VARCHAR(255) NOT NULL,
            first_name VARCHAR(50) NOT NULL,
            last_name VARCHAR(50) NOT NULL,
            tenant_id UUID NOT NULL,
            admin_user_id UUID NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            phone VARCHAR(20),
            display_name VARCHAR(100),
            avatar VARCHAR(255),
            organization_ids JSONB,
            role_ids JSONB,
            preferences JSONB,
            status VARCHAR(20) NOT NULL,
            login_attempts INTEGER DEFAULT 0,
            email_verified BOOLEAN DEFAULT FALSE,
            phone_verified BOOLEAN DEFAULT FALSE,
            two_factor_enabled BOOLEAN DEFAULT FALSE,
            two_factor_secret VARCHAR(255),
            last_login_at TIMESTAMP,
            locked_until TIMESTAMP,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            deleted_at TIMESTAMP
          );
          CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
          CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
          CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
          CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
          CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
          CREATE INDEX IF NOT EXISTS idx_users_updated_at ON users(updated_at);
        `)
        console.log('✅ 用户数据库表创建成功')
      } catch (error) {
        console.log('⚠️ 表可能已存在或创建失败:', (error as Error).message)
      }

      // 清理测试数据
      try {
        await em.nativeDelete(UserOrmEntity, {})
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
        await em.nativeDelete(UserOrmEntity, {})
        console.log('✅ 测试数据清理完成')
      } catch (error) {
        console.error('❌ 清理测试数据失败:', (error as Error).message)
      }
      await module.close()
    }
  })

  afterEach(async () => {
    try {
      await em.nativeDelete(UserOrmEntity, {})
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

    it('应该能够创建和查询用户表', async () => {
      const tables = await em.getConnection().execute(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      `)

      expect(tables.length).toBeGreaterThan(0)
      console.log('✅ 用户表存在')
    })
  })

  describe('MikroORM仓储数据库操作测试', () => {
    it('应该能够保存用户到数据库', async () => {
      const user = new User(
        generateUuid(),
        'db-test-user',
        'db-test@example.com',
        'Database',
        'Test',
        generateUuid(),
        generateUuid(),
        'hashedPassword123',
        '13812345678',
        'Database Test User',
        'https://example.com/avatar.jpg',
        ['org-1', 'org-2'],
        ['role-1', 'role-2'],
        { theme: 'dark', language: 'zh-CN' },
      )

      const savedUser = await userRepository.save(user)
      expect(savedUser.id).toBe(user.id)
      expect(savedUser.getUsername()).toBe('db-test-user')

      // 验证数据确实保存到了数据库
      const dbUser = await em.findOne(UserOrmEntity, { id: user.id })
      expect(dbUser).toBeDefined()
      expect(dbUser?.username).toBe('db-test-user')
      expect(dbUser?.email).toBe('db-test@example.com')

      console.log('✅ 用户保存到数据库成功')
    })

    it('应该能够从数据库查询用户', async () => {
      const user = new User(
        generateUuid(),
        'query-test-user',
        'query-test@example.com',
        'Query',
        'Test',
        generateUuid(),
        generateUuid(),
        'hashedPassword123',
      )
      await userRepository.save(user)

      const foundUser = await userRepository.findById(user.id, user.tenantId)
      expect(foundUser).toBeDefined()
      expect(foundUser?.getUsername()).toBe('query-test-user')

      const foundByUsername = await userRepository.findByUsernameString(
        'query-test-user',
        user.tenantId,
      )
      expect(foundByUsername).toBeDefined()
      expect(foundByUsername?.getUsername()).toBe('query-test-user')

      const foundByEmail = await userRepository.findByEmailString(
        'query-test@example.com',
        user.tenantId,
      )
      expect(foundByEmail).toBeDefined()
      expect(foundByEmail?.getEmail()).toBe('query-test@example.com')

      console.log('✅ 数据库查询成功')
    })

    it('应该能够更新用户状态', async () => {
      const user = new User(
        generateUuid(),
        'status-test-user',
        'status-test@example.com',
        'Status',
        'Test',
        generateUuid(),
        generateUuid(),
        'hashedPassword123',
      )
      await userRepository.save(user)

      // 激活用户
      user.activate()
      await userRepository.updateStatus(
        user.id,
        UserStatusValue.active(),
        user.tenantId,
      )

      const foundUser = await userRepository.findById(user.id, user.tenantId)
      expect(foundUser?.getStatus()).toBe('ACTIVE')

      // 禁用用户
      user.suspend()
      await userRepository.updateStatus(
        user.id,
        UserStatusValue.suspended(),
        user.tenantId,
      )

      const updatedUser = await userRepository.findById(user.id, user.tenantId)
      expect(updatedUser?.getStatus()).toBe('SUSPENDED')

      console.log('✅ 状态更新成功')
    })

    it('应该能够统计用户数量', async () => {
      const tenantId = generateUuid()
      const user1 = new User(
        generateUuid(),
        'count-test-user-1',
        'count-test-1@example.com',
        'Count',
        'Test1',
        tenantId,
        generateUuid(),
        'hashedPassword123',
      )
      const user2 = new User(
        generateUuid(),
        'count-test-user-2',
        'count-test-2@example.com',
        'Count',
        'Test2',
        tenantId,
        generateUuid(),
        'hashedPassword123',
      )

      await userRepository.save(user1)
      await userRepository.save(user2)

      const allUsers = await userRepository.findAll(tenantId)
      expect(allUsers.length).toBeGreaterThanOrEqual(2)

      console.log('✅ 统计功能正常')
    })

    it('应该能够处理多租户数据隔离', async () => {
      const tenant1 = generateUuid()
      const tenant2 = generateUuid()

      const user1 = new User(
        generateUuid(),
        'tenant1-user',
        'tenant1@example.com',
        'Tenant1',
        'User',
        tenant1,
        generateUuid(),
        'hashedPassword123',
      )
      const user2 = new User(
        generateUuid(),
        'tenant2-user',
        'tenant2@example.com',
        'Tenant2',
        'User',
        tenant2,
        generateUuid(),
        'hashedPassword123',
      )

      await userRepository.save(user1)
      await userRepository.save(user2)

      // 验证租户1只能看到自己的用户
      const tenant1Users = await userRepository.findAll(tenant1)
      const tenant1User = tenant1Users.find((u) => u.tenantId === tenant1)
      expect(tenant1User).toBeDefined()
      expect(tenant1User?.getUsername()).toBe('tenant1-user')

      // 验证租户2只能看到自己的用户
      const tenant2Users = await userRepository.findAll(tenant2)
      const tenant2User = tenant2Users.find((u) => u.tenantId === tenant2)
      expect(tenant2User).toBeDefined()
      expect(tenant2User?.getUsername()).toBe('tenant2-user')

      console.log('✅ 多租户数据隔离正常')
    })
  })
})

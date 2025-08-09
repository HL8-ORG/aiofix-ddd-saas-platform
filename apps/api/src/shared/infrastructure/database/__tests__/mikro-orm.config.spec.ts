import { ConfigService } from '@nestjs/config'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'
import { mikroOrmConfig } from '../mikro-orm.config'
import { TenantEntity } from '@/tenants/infrastructure/entities/mikro/tenant.entity.mikro'

/**
 * @description MikroORM配置单元测试
 * 
 * 测试策略：
 * 1. 测试基本连接配置
 * 2. 测试实体配置
 * 3. 测试开发环境配置
 * 4. 测试连接池配置
 * 5. 测试多租户配置
 */
describe('mikroOrmConfig', () => {
  let configService: jest.Mocked<ConfigService>

  beforeEach(() => {
    configService = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>
  })

  it('应该返回正确的数据库连接配置', () => {
    // Arrange
    configService.get.mockImplementation((key, defaultValue) => {
      const config = {
        DATABASE_HOST: 'test-host',
        DATABASE_PORT: 5432,
        DATABASE_USER: 'test-user',
        DATABASE_PASSWORD: 'test-password',
        DATABASE_NAME: 'test-db',
        NODE_ENV: 'development',
      }
      return config[key] || defaultValue
    })

    // Act
    const config = mikroOrmConfig(configService)

    // Assert
    expect(config.driver).toBe(PostgreSqlDriver)
    expect(config.host).toBe('test-host')
    expect(config.port).toBe(5432)
    expect(config.user).toBe('test-user')
    expect(config.password).toBe('test-password')
    expect(config.dbName).toBe('test-db')
  })

  it('应该使用默认值当环境变量未设置时', () => {
    // Arrange
    configService.get.mockImplementation((key, defaultValue) => defaultValue)

    // Act
    const config = mikroOrmConfig(configService)

    // Assert
    expect(config.host).toBe('localhost')
    expect(config.port).toBe(5432)
    expect(config.user).toBe('postgres')
    expect(config.password).toBe('password')
    expect(config.dbName).toBe('iam_db')
  })

  it('应该正确配置实体', () => {
    // Act
    const config = mikroOrmConfig(configService)

    // Assert
    expect(config.entities).toContain(TenantEntity)
    expect(config.entitiesTs).toContain(TenantEntity)
  })

  it('应该在开发环境启用调试模式', () => {
    // Arrange
    configService.get.mockImplementation((key) => key === 'NODE_ENV' ? 'development' : undefined)

    // Act
    const config = mikroOrmConfig(configService)

    // Assert
    expect(config.debug).toBe(true)
  })

  it('应该在生产环境禁用调试模式', () => {
    // Arrange
    configService.get.mockImplementation((key) => key === 'NODE_ENV' ? 'production' : undefined)

    // Act
    const config = mikroOrmConfig(configService)

    // Assert
    expect(config.debug).toBe(false)
  })

  it('应该正确配置连接池', () => {
    // Arrange
    configService.get.mockImplementation((key, defaultValue) => {
      const config = {
        DATABASE_POOL_MIN: 5,
        DATABASE_POOL_MAX: 20,
      }
      return config[key] || defaultValue
    })

    // Act
    const config = mikroOrmConfig(configService)

    // Assert
    expect(config.pool.min).toBe(5)
    expect(config.pool.max).toBe(20)
  })

  it('应该启用多租户支持', () => {
    // Act
    const config = mikroOrmConfig(configService)

    // Assert
    expect(config.tenant).toBe(true)
  })

  it('应该配置迁移和种子', () => {
    // Act
    const config = mikroOrmConfig(configService)

    // Assert
    expect(config.migrations).toEqual({
      path: 'dist/shared/infrastructure/database/migrations',
      pathTs: 'src/shared/infrastructure/database/migrations',
      tableName: 'mikro_orm_migrations',
      transactional: true,
      allOrNothing: true,
      safe: true,
    })

    expect(config.seeder).toEqual({
      path: 'dist/shared/infrastructure/database/seeders',
      pathTs: 'src/shared/infrastructure/database/seeders',
      defaultSeeder: 'DatabaseSeeder',
    })
  })

  it('应该启用性能优化选项', () => {
    // Act
    const config = mikroOrmConfig(configService)

    // Assert
    expect(config.strict).toBe(true)
    expect(config.validate).toBe(true)
    expect(config.ensureIndexes).toBe(true)
    expect(config.forceUtcTimezone).toBe(true)
    expect(config.persistOnCreate).toBe(true)
    expect(config.implicitTransactions).toBe(true)
  })

  it('应该配置缓存', () => {
    // Arrange
    configService.get.mockImplementation((key) => {
      const config = {
        NODE_ENV: 'development',
        REDIS_HOST: 'redis-host',
        REDIS_PORT: 6379,
      }
      return config[key]
    })

    // Act
    const config = mikroOrmConfig(configService)

    // Assert
    expect(config.cache.enabled).toBe(true)
    expect(config.cache.pretty).toBe(true)
    expect(config.cache.options).toEqual({
      store: 'redis',
      host: 'redis-host',
      port: 6379,
    })
  })
})

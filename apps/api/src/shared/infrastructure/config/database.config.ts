import { registerAs } from '@nestjs/config'
import { MikroOrmModuleOptions } from '@mikro-orm/nestjs'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'
import { TenantEntity } from '@/tenants/infrastructure/entities/mikro/tenant.entity.mikro'
import * as Joi from 'joi'

/**
 * @constant databaseConfig
 * @description
 * 数据库配置工厂，负责生成MikroORM的配置选项。
 * 
 * 主要原理与机制：
 * 1. 使用registerAs注册配置命名空间
 * 2. 根据环境变量生成数据库连接配置
 * 3. 支持不同环境（开发、测试、生产）的配置差异
 * 4. 提供连接池、日志、缓存等高级配置
 */
export const databaseConfig = registerAs('database', () => {
  const nodeEnv = process.env.NODE_ENV || 'development'
  const isProduction = nodeEnv === 'production'

  const config: MikroOrmModuleOptions & Record<string, any> = {
    // 数据库连接配置
    driver: PostgreSqlDriver,
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    dbName: process.env.DATABASE_NAME || 'iam_db',

    // 实体配置
    entities: [TenantEntity],
    entitiesTs: [TenantEntity],

    // 调试配置
    debug: !isProduction,
    logger: console.log,

    // 迁移配置
    migrations: {
      path: 'dist/shared/infrastructure/database/migrations',
      pathTs: 'src/shared/infrastructure/database/migrations',
      tableName: 'mikro_orm_migrations',
      transactional: true,
      allOrNothing: true,
      safe: true,
    },

    // 数据填充配置
    seeder: {
      path: 'dist/shared/infrastructure/database/seeders',
      pathTs: 'src/shared/infrastructure/database/seeders',
      defaultSeeder: 'DatabaseSeeder',
    },

    // 连接池配置
    pool: {
      min: parseInt(process.env.DATABASE_POOL_MIN || '2', 10),
      max: parseInt(process.env.DATABASE_POOL_MAX || '10', 10),
      acquireTimeoutMillis: 60000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 200,
    },

    // 全局配置
    strict: true,
    validate: true,
    ensureIndexes: true,

    // 多租户支持
    tenant: true,

    // 性能优化
    forceUtcTimezone: true,
    persistOnCreate: true,
    implicitTransactions: true,

    // 缓存配置
    cache: {
      enabled: true,
      pretty: !isProduction,
      options: {
        store: 'redis',
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    },
  }

  return config
})

/**
 * @constant databaseValidationSchema
 * @description
 * 数据库配置验证模式，确保必要的数据库配置存在且格式正确。
 */
export const databaseValidationSchema = Joi.object({
  DATABASE_HOST: Joi.string().default('localhost'),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_POOL_MIN: Joi.number().default(2),
  DATABASE_POOL_MAX: Joi.number().default(10),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
})

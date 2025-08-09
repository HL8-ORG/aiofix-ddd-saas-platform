import { ConfigModule, ConfigService } from '@nestjs/config'
import { MikroOrmModuleOptions } from '@mikro-orm/nestjs'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'
import { TenantEntity } from '@/tenants/infrastructure/entities/mikro/tenant.entity.mikro'

/**
 * @description 集成测试数据库配置
 * 
 * 主要原理与机制：
 * 1. 使用独立的测试数据库
 * 2. 每次测试前重置数据库状态
 * 3. 支持事务和多租户测试
 * 4. 提供测试数据填充
 */
export const testDbConfig = {
  DATABASE_HOST: process.env.TEST_DATABASE_HOST || 'localhost',
  DATABASE_PORT: process.env.TEST_DATABASE_PORT || 25432,
  DATABASE_USER: process.env.TEST_DATABASE_USER || 'postgres',
  DATABASE_PASSWORD: process.env.TEST_DATABASE_PASSWORD || 'postgres',
  DATABASE_NAME: process.env.TEST_DATABASE_NAME || 'iam_db',
  NODE_ENV: 'development',
}

/**
 * @description 测试配置模块
 */
export const TestConfigModule = ConfigModule.forRoot({
  isGlobal: true,
  load: [() => testDbConfig],
})

/**
 * @description 测试数据库配置工厂
 */
export const testMikroOrmConfig = (configService: ConfigService): MikroOrmModuleOptions & Record<string, any> => ({
  driver: PostgreSqlDriver,
  host: configService.get('DATABASE_HOST'),
  port: configService.get('DATABASE_PORT'),
  user: configService.get('DATABASE_USER'),
  password: configService.get('DATABASE_PASSWORD'),
  dbName: configService.get('DATABASE_NAME'),

  // 实体配置
  entities: [TenantEntity],
  entitiesTs: [TenantEntity],

  // 调试和日志配置
  debug: true,
  logger: console.log,
  discovery: {
    warnWhenNoEntities: false,
  },

  // 迁移配置
  migrations: {
    path: 'dist/shared/infrastructure/database/migrations',
    pathTs: 'src/shared/infrastructure/database/migrations',
    tableName: 'mikro_orm_migrations',
    transactional: true,
    allOrNothing: true,
    safe: true,
  },

  // 连接池配置
  pool: {
    min: 0,
    max: 2,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 15000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 5000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
  },

  // 多租户支持
  tenant: true,

  // 性能优化
  forceUtcTimezone: true,
  persistOnCreate: true,
  implicitTransactions: true,

  // 连接配置
  connect: true,
  ensureDatabase: true,
  allowGlobalContext: true,
  connectionTimeout: 30000,

  // 数据库驱动配置
  driverOptions: {
    connection: {
      ssl: false,
      statement_timeout: 30000,
      idle_in_transaction_session_timeout: 30000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 5000,
      application_name: 'iam_test',
    },
    pool: {
      max: 2,
      min: 0,
      idleTimeoutMillis: 5000,
      acquireTimeoutMillis: 30000,
      propagateCreateError: false,
      reapIntervalMillis: 1000,
    },
  },

  // 查询配置
  findOneOrFailHandler: () => {
    throw new Error('Entity not found');
  },
  strict: true,
  validate: true,
  populateAfterFlush: true,

  // 性能优化
  flags: {
    useDefineForClassFields: true,
    disableLocking: true,
  },
})

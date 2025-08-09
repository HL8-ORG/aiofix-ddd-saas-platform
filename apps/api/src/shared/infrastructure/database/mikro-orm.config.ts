import { MikroOrmModuleOptions } from '@mikro-orm/nestjs'
import { ConfigService } from '@nestjs/config'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'
// 暂时只导入租户实体，其他实体将在相应模块开发时添加
import { TenantEntity } from '@/tenants/infrastructure/entities/mikro/tenant.entity.mikro'

/**
 * @function mikroOrmConfig
 * @description
 * MikroORM数据库配置工厂函数，根据环境变量动态配置数据库连接。
 * 
 * 主要原理与机制：
 * 1. 使用ConfigService获取环境变量中的数据库配置
 * 2. 支持PostgreSQL数据库连接
 * 3. 配置实体发现和迁移
 * 4. 开发环境启用调试和日志
 * 5. 支持连接池配置
 * 6. 支持多租户隔离
 * 7. 提供全局事务支持
 * 8. 集成缓存机制
 */
export const mikroOrmConfig = (configService: ConfigService): MikroOrmModuleOptions & Record<string, any> => ({
  // 数据库连接配置
  driver: PostgreSqlDriver,
  host: configService.get('DATABASE_HOST', 'localhost'),
  port: configService.get('DATABASE_PORT', 5432),
  user: configService.get('DATABASE_USER', 'postgres'),
  password: configService.get('DATABASE_PASSWORD', 'password'),
  dbName: configService.get('DATABASE_NAME', 'iam_db'),

  // 注册所有IAM相关实体
  entities: [TenantEntity],

  // TypeScript实体
  entitiesTs: [TenantEntity],

  // 开发环境配置
  debug: configService.get('NODE_ENV') === 'development',
  logger: console.log,

  // 迁移配置
  migrations: {
    path: 'dist/shared/infrastructure/database/migrations',
    pathTs: 'src/shared/infrastructure/database/migrations',
    tableName: 'mikro_orm_migrations', // 迁移表名
    transactional: true, // 在事务中运行迁移
    allOrNothing: true, // 所有迁移必须成功
    safe: true, // 安全模式
  },

  // 数据填充配置
  seeder: {
    path: 'dist/shared/infrastructure/database/seeders',
    pathTs: 'src/shared/infrastructure/database/seeders',
    defaultSeeder: 'DatabaseSeeder', // 默认的种子类
  },

  // 连接池配置
  pool: {
    min: configService.get('DATABASE_POOL_MIN', 2),
    max: configService.get('DATABASE_POOL_MAX', 10),
  },

  // 全局配置
  strict: true, // 严格模式
  validate: true, // 启用实体验证
  ensureIndexes: true, // 确保索引存在

  // 多租户支持
  tenant: true,

  // 性能优化
  forceUtcTimezone: true,
  persistOnCreate: true,

  // 事务配置
  implicitTransactions: true, // 隐式事务

  // 缓存配置
  cache: {
    enabled: true,
    pretty: configService.get('NODE_ENV') === 'development',
    options: {
      store: 'redis',
      host: configService.get('REDIS_HOST'),
      port: configService.get('REDIS_PORT'),
    },
  },
})

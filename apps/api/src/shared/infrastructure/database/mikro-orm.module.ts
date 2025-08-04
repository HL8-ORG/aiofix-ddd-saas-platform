import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import config from '../config/mikro-orm.config'
import { DatabaseHealthCheckService } from './health-check.service'
import { MigrationService } from './migration.service'

/**
 * @description MikroORM基础设施模块
 *
 * 该模块提供数据库连接和ORM功能，为所有业务模块提供数据持久化能力。
 *
 * 主要功能：
 * 1. 数据库连接管理
 * 2. 实体发现和注册
 * 3. 事务管理
 * 4. 连接池配置
 * 5. 迁移和种子数据支持
 *
 * 使用方式：
 * 1. 在业务模块中导入此模块
 * 2. 通过依赖注入使用EntityManager
 * 3. 配置实体发现路径
 */
@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...config,
        // 动态配置支持
        host: configService.get('DB_HOST', config.host),
        port: configService.get('DB_PORT', config.port),
        dbName: configService.get('DB_NAME', config.dbName),
        user: configService.get('DB_USER', config.user),
        password: configService.get('DB_PASSWORD', config.password),
        // 开发环境配置
        debug: configService.get('NODE_ENV') === 'development',
        // 连接池配置
        pool: {
          min: configService.get('DB_POOL_MIN', 2),
          max: configService.get('DB_POOL_MAX', 10),
        },
        // 实体发现配置
        discovery: {
          warnWhenNoEntities: false,
        },
        // 迁移配置
        migrations: {
          path: 'dist/shared/infrastructure/database/migrations',
          pathTs: 'src/shared/infrastructure/database/migrations',
        },
        // 种子数据配置
        seeder: {
          path: 'dist/shared/infrastructure/database/seeders',
          pathTs: 'src/shared/infrastructure/database/seeders',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MigrationService, DatabaseHealthCheckService],
  exports: [MigrationService, DatabaseHealthCheckService],
})
export class DatabaseModule {}

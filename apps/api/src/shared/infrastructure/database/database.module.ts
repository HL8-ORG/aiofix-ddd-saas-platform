import { Global, Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { mikroOrmConfig } from './mikro-orm.config'
import { DatabaseService } from './database.service'

/**
 * @module DatabaseModule
 * @description
 * 全局数据库模块，负责配置和初始化MikroORM数据库连接。
 * 
 * 主要原理与机制：
 * 1. 使用@Global()装饰器标记为全局模块
 * 2. 使用MikroOrmModule.forRootAsync异步配置数据库连接
 * 3. 通过ConfigService动态获取环境变量配置
 * 4. 支持开发、测试、生产环境的不同配置
 * 5. 提供数据库连接池和性能优化
 * 6. 集成实体发现和迁移功能
 * 7. 提供DatabaseService用于全局数据库操作
 * 8. 支持多租户和事务管理
 */
@Global()
@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: mikroOrmConfig,
      inject: [ConfigService],
    }),
  ],
  providers: [DatabaseService],
  exports: [MikroOrmModule, DatabaseService],
})
export class DatabaseModule { }

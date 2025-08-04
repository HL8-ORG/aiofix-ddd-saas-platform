/**
 * @description 数据库基础设施模块导出
 *
 * 该模块提供完整的数据库基础设施功能，包括：
 * 1. MikroORM配置和连接管理
 * 2. 数据库迁移和种子数据管理
 * 3. 数据库健康检查和监控
 * 4. 数据库操作工具类
 *
 * 使用方式：
 * 1. 导入DatabaseModule到业务模块
 * 2. 注入MigrationService进行迁移管理
 * 3. 注入DatabaseHealthCheckService进行健康检查
 * 4. 使用DatabaseUtils进行数据库操作
 */

// 模块导出
export { DatabaseModule } from './mikro-orm.module'

// 服务导出
export { MigrationService } from './migration.service'
export { DatabaseHealthCheckService } from './health-check.service'

// 工具类导出
export { DatabaseUtils } from './database.utils'

// 类型导出
export type {
  MigrationOptions,
  SeederOptions,
  HealthCheckResult,
  PaginationOptions,
  SortingOptions,
  SearchOptions,
  DateRangeOptions,
  QueryResult,
} from './types'

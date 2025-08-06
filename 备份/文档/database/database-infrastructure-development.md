# 数据库基础设施模块开发文档

## 概述

数据库基础设施模块是基于MikroORM的数据库持久化解决方案，为整个应用提供统一的数据访问层。该模块遵循DDD和Clean Architecture原则，实现了高度模块化和可扩展的数据库架构。

## 架构设计

### 模块结构

```
apps/api/src/shared/infrastructure/database/
├── __tests__/                          # 测试文件
│   └── database.module.spec.ts         # 数据库模块集成测试
├── config/                             # 配置文件
│   └── mikro-orm.config.ts            # MikroORM配置
├── migrations/                         # 数据库迁移文件
├── seeders/                           # 种子数据文件
├── database.utils.ts                   # 数据库工具类
├── health-check.service.ts             # 健康检查服务
├── migration.service.ts        # 迁移管理服务
├── mikro-orm.module.ts                # MikroORM模块
├── types.ts                           # 类型定义
└── index.ts                           # 模块导出
```

### 核心组件

#### 1. DatabaseModule
- **职责**: 数据库模块的主入口，配置MikroORM连接
- **功能**: 
  - 动态配置数据库连接参数
  - 管理连接池设置
  - 配置实体发现和迁移
  - 提供健康检查和迁移管理服务

#### 2. MigrationService
- **职责**: 管理数据库迁移和版本控制
- **功能**:
  - 执行数据库迁移
  - 回滚迁移
  - 获取迁移状态
  - 运行种子数据

#### 3. DatabaseHealthCheckService
- **职责**: 监控数据库连接和性能
- **功能**:
  - 检查数据库连接状态
  - 获取数据库版本信息
  - 监控连接池状态
  - 性能测试和统计

#### 4. DatabaseUtils
- **职责**: 提供数据库操作工具函数
- **功能**:
  - 事务管理
  - 批量操作
  - 查询构建
  - 数据格式化

## 技术栈

### 核心依赖
- **@mikro-orm/core**: ORM核心功能
- **@mikro-orm/nestjs**: NestJS集成
- **@mikro-orm/postgresql**: PostgreSQL驱动
- **@mikro-orm/migrations**: 迁移管理
- **@mikro-orm/seeder**: 种子数据

### 配置管理
- **@nestjs/config**: 配置服务
- **dotenv**: 环境变量管理

## 配置说明

### 环境变量

```bash
# 数据库连接配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aiofix_dev
DB_USER=postgres
DB_PASSWORD=password

# 连接池配置
DB_POOL_MIN=2
DB_POOL_MAX=10

# 环境配置
NODE_ENV=development
```

### MikroORM配置

```typescript
// mikro-orm.config.ts
export default {
  type: 'postgresql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  dbName: process.env.DB_NAME || 'aiofix_dev',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  
  // 实体发现
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  
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
};
```

## 使用指南

### 1. 在业务模块中导入

```typescript
// 在业务模块中导入数据库模块
import { DatabaseModule } from '@/shared/infrastructure/database';

@Module({
  imports: [DatabaseModule],
  // ...
})
export class TenantsModule {}
```

### 2. 注入数据库服务

```typescript
// 注入EntityManager进行数据操作
import { EntityManager } from '@mikro-orm/core';

@Injectable()
export class TenantService {
  constructor(private readonly em: EntityManager) {}
  
  async createTenant(data: CreateTenantDto) {
    const tenant = this.em.create(TenantEntity, data);
    await this.em.persistAndFlush(tenant);
    return tenant;
  }
}
```

### 3. 使用迁移管理服务

```typescript
// 注入迁移管理服务
import { MigrationService } from '@/shared/infrastructure/database';

@Injectable()
export class DatabaseService {
  constructor(private readonly migrationManager: MigrationService) {}
  
  async runMigrations() {
    await this.migrationManager.runMigrations();
  }
  
  async getMigrationStatus() {
    return await this.migrationManager.getMigrationStatus();
  }
}
```

### 4. 使用健康检查服务

```typescript
// 注入健康检查服务
import { DatabaseHealthCheckService } from '@/shared/infrastructure/database';

@Injectable()
export class HealthService {
  constructor(private readonly healthCheck: DatabaseHealthCheckService) {}
  
  async checkDatabaseHealth() {
    return await this.healthCheck.checkHealth();
  }
}
```

### 5. 使用数据库工具类

```typescript
// 使用数据库工具类
import { DatabaseUtils } from '@/shared/infrastructure/database';

// 事务操作
await DatabaseUtils.executeInTransaction(em, async () => {
  // 事务内的操作
});

// 分页查询构建
const pagination = DatabaseUtils.buildPagination(1, 10);

// 搜索查询构建
const searchQuery = DatabaseUtils.buildSearchQuery('keyword', ['name', 'description']);
```

## 测试策略

### 1. 单元测试
- 测试各个服务的独立功能
- 验证配置和依赖注入
- 测试工具类的静态方法

### 2. 集成测试
- 测试数据库连接和操作
- 验证迁移和种子数据功能
- 测试健康检查和性能监控

### 3. 测试覆盖范围

```typescript
// 测试示例
describe('数据库模块测试', () => {
  // 模块初始化测试
  it('应该成功初始化数据库模块', () => {
    expect(module).toBeDefined();
    expect(em).toBeDefined();
    expect(orm).toBeDefined();
  });
  
  // 数据库连接测试
  it('应该能够连接到数据库', async () => {
    const result = await em.getConnection().execute('SELECT 1');
    expect(result).toBeDefined();
  });
  
  // 健康检查测试
  it('应该能够执行健康检查', async () => {
    const health = await healthCheckService.checkHealth();
    expect(health.status).toBeDefined();
    expect(health.details.connection).toBe(true);
  });
});
```

## 最佳实践

### 1. 事务管理
- 使用`DatabaseUtils.executeInTransaction`进行事务操作
- 确保事务的原子性和一致性
- 正确处理事务回滚

### 2. 连接池管理
- 合理配置连接池大小
- 监控连接池状态
- 避免连接泄漏

### 3. 迁移管理
- 使用版本控制的迁移文件
- 在生产环境谨慎执行迁移
- 保持迁移文件的向后兼容性

### 4. 性能优化
- 使用批量操作减少数据库往返
- 合理使用索引
- 监控查询性能

### 5. 错误处理
- 统一处理数据库异常
- 提供有意义的错误信息
- 实现重试机制

## 部署指南

### 1. 环境准备
```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.development.local
```

### 2. 数据库初始化
```bash
# 运行迁移
npm run migration:run

# 运行种子数据
npm run seeder:run
```

### 3. 健康检查
```bash
# 检查数据库连接
curl http://localhost:3000/health/database
```

## 故障排除

### 常见问题

1. **连接失败**
   - 检查数据库服务是否运行
   - 验证连接参数是否正确
   - 确认防火墙设置

2. **迁移失败**
   - 检查迁移文件语法
   - 确认数据库权限
   - 查看迁移日志

3. **性能问题**
   - 检查连接池配置
   - 分析慢查询
   - 优化索引

### 日志监控

```typescript
// 启用调试日志
const config = {
  debug: process.env.NODE_ENV === 'development',
  logger: (message: string) => console.log(message),
};
```

## 扩展指南

### 1. 添加新的数据库驱动
```typescript
// 支持MySQL
import { MySqlDriver } from '@mikro-orm/mysql';

const config = {
  driver: MySqlDriver,
  // MySQL特定配置
};
```

### 2. 自定义健康检查
```typescript
// 扩展健康检查服务
@Injectable()
export class CustomHealthCheckService extends DatabaseHealthCheckService {
  async checkCustomMetrics() {
    // 自定义健康检查逻辑
  }
}
```

### 3. 添加缓存层
```typescript
// 集成Redis缓存
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    DatabaseModule,
    CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 6379,
    }),
  ],
})
export class AppModule {}
```

## 总结

数据库基础设施模块为应用提供了稳定、高效的数据持久化解决方案。通过模块化设计和清晰的接口定义，确保了代码的可维护性和可扩展性。该模块已经通过了完整的测试覆盖，可以安全地用于生产环境。

### 关键特性
- ✅ 完整的DDD架构支持
- ✅ 灵活的配置管理
- ✅ 强大的迁移系统
- ✅ 全面的健康监控
- ✅ 丰富的工具函数
- ✅ 完整的测试覆盖

### 下一步计划
1. 添加更多数据库驱动支持
2. 实现分布式事务
3. 集成读写分离
4. 添加数据加密功能
5. 实现自动备份机制 
# 租户基础设施层 - 多ORM支持架构

## 概述

租户基础设施层采用多ORM支持架构，允许在不同环境下使用不同的数据库和ORM技术，同时保持领域层和应用层的稳定性。

## 架构设计

### 目录结构

```
apps/api/src/tenants/infrastructure/
├── config/                    # 配置管理
│   └── orm.config.ts         # ORM配置服务
├── entities/                  # 数据库实体
│   ├── mikro/                # MikroORM实体
│   │   └── tenant.entity.mikro.ts
│   └── mongo/                # MongoDB实体（待实现）
├── repositories/              # 仓储实现
│   ├── mikro/                # MikroORM仓储
│   │   └── tenant.repository.mikro.ts
│   └── mongo/                # MongoDB仓储（待实现）
├── mappers/                  # 映射器
│   ├── interfaces/           # 映射器接口
│   │   └── tenant-mapper.interface.ts
│   ├── mikro/               # MikroORM映射器
│   │   └── tenant.mapper.mikro.ts
│   └── mongo/               # MongoDB映射器
│       └── tenant.mapper.mongo.ts
├── factories/                # 工厂模式
│   └── tenant-repository.factory.ts
├── services/                 # 基础设施服务
├── cache/                   # 缓存相关
├── external/                # 外部服务集成
├── security/                # 安全相关
└── index.ts                 # 导出文件
```

## 核心组件

### 1. 映射器接口 (ITenantMapper)

定义数据库实体和领域实体之间的转换契约：

```typescript
export interface ITenantMapper<TEntity = any> {
  toDomain(entity: TEntity): TenantDomain
  toEntity(domain: TenantDomain): TEntity
  toDomainList(entities: TEntity[]): TenantDomain[]
  toEntityList(domains: TenantDomain[]): TEntity[]
}
```

### 2. ORM特定映射器

#### MikroORM映射器
- 处理MikroORM特有的实体属性和关系
- 支持实体生命周期管理
- 实现`ITenantMapper<TenantEntity>`接口

#### MongoDB映射器
- 处理MongoDB文档结构
- 支持`_id`字段映射
- 实现`ITenantMapper<TenantDocument>`接口

### 3. 仓储工厂 (TenantRepositoryFactory)

提供统一的仓储创建接口：

```typescript
export class TenantRepositoryFactory {
  create(config: RepositoryConfig): ITenantRepository
  createMikroRepository(entityManager: EntityManager): ITenantRepository
  createMongoRepository(): ITenantRepository
}
```

### 4. ORM配置服务 (OrmConfigService)

管理不同ORM的配置信息：

```typescript
export class OrmConfigService {
  getTenantRepositoryConfig(): OrmConfig
  isMikroOrm(): boolean
  isMongoDb(): boolean
  validateConfig(config: OrmConfig): void
}
```

## 支持的ORM

### 1. MikroORM (已实现)
- **实体**: `TenantEntity` (tenant.entity.mikro.ts)
- **映射器**: `TenantMapper` (tenant.mapper.mikro.ts)
- **仓储**: `TenantRepository` (tenant.repository.mikro.ts)
- **特点**: 支持PostgreSQL、MySQL等关系型数据库

### 2. MongoDB (待实现)
- **文档**: `TenantDocument`
- **映射器**: `MongoTenantMapper`
- **仓储**: `MongoTenantRepository` (待实现)
- **特点**: 支持文档型数据库

## 配置管理

### 环境变量

```bash
# ORM类型选择
TENANT_REPOSITORY_TYPE=mikro  # 或 mongo

# 数据库连接配置
DATABASE_URL=postgresql://user:pass@localhost:5432/iam_db
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=iam_db
```

### 配置验证

```typescript
const configService = new OrmConfigService(configService)
const config = configService.getTenantRepositoryConfig()
configService.validateConfig(config)
```

## 使用示例

### 1. 使用MikroORM

```typescript
// 在模块中配置
@Module({
  imports: [MikroOrmModule.forFeature([TenantEntity])],
  providers: [
    {
      provide: 'ITenantRepository',
      useFactory: (em: EntityManager) => {
        const factory = new TenantRepositoryFactory()
        return factory.createMikroRepository(em)
      },
      inject: [EntityManager],
    },
  ],
})
export class TenantsModule {}
```

### 2. 使用MongoDB (待实现)

```typescript
// 在模块中配置
@Module({
  providers: [
    {
      provide: 'ITenantRepository',
      useFactory: () => {
        const factory = new TenantRepositoryFactory()
        return factory.createMongoRepository()
      },
    },
  ],
})
export class TenantsModule {}
```

## 扩展指南

### 添加新的ORM支持

1. **创建实体/文档**
   ```typescript
   // entities/new-orm/tenant.entity.ts
   export class TenantEntity {
     // ORM特定的实体定义
   }
   ```

2. **实现映射器**
   ```typescript
   // mappers/new-orm/tenant.mapper.new-orm.ts
   export class TenantMapper implements ITenantMapper<TenantEntity> {
     // 实现映射方法
   }
   ```

3. **实现仓储**
   ```typescript
   // repositories/new-orm/tenant.repository.new-orm.ts
   export class TenantRepository implements ITenantRepository {
     // 实现仓储方法
   }
   ```

4. **更新工厂**
   ```typescript
   // 在TenantRepositoryFactory中添加新的case
   case RepositoryType.NEW_ORM:
     return new NewOrmTenantRepository()
   ```

5. **更新配置服务**
   ```typescript
   // 在OrmConfigService中添加新的验证逻辑
   ```

## 优势

1. **灵活性**: 支持多种ORM，可根据需求选择
2. **可测试性**: 通过接口抽象，便于单元测试
3. **可扩展性**: 易于添加新的ORM支持
4. **一致性**: 统一的接口确保业务逻辑的一致性
5. **配置驱动**: 通过环境变量控制ORM选择

## 注意事项

1. **接口一致性**: 所有ORM实现必须遵循相同的接口
2. **映射器职责**: 映射器只负责数据转换，不包含业务逻辑
3. **配置验证**: 确保配置的完整性和正确性
4. **性能考虑**: 不同ORM的性能特征需要评估
5. **事务支持**: 确保所有ORM实现都支持事务操作

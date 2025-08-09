# 权限管理模块 (Permissions Module)

## 概述

权限管理模块是IAM系统的核心组件，负责管理系统的权限资源。该模块采用DDD（领域驱动设计）+ Clean Architecture（整洁架构）设计模式，实现高度模块化、可维护、可扩展的权限管理功能。

## 架构设计

### 分层架构

```
┌─────────────────────────────────────────────────────────────┐
│                    展示层 (Presentation)                    │
├─────────────────────────────────────────────────────────────┤
│  Controllers:                                              │
│  - PermissionsController                                   │
│  DTOs:                                                     │
│  - CreatePermissionDto                                     │
│  - UpdatePermissionDto                                     │
│  - QueryPermissionDto                                      │
│  - PermissionResponseDto                                   │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    应用层 (Application)                     │
├─────────────────────────────────────────────────────────────┤
│  Use Cases:                                                │
│  - CreatePermissionUseCase                                 │
│  - UpdatePermissionUseCase                                 │
│  - DeletePermissionUseCase                                 │
│  - GetPermissionUseCase                                    │
│  - GetPermissionsUseCase                                   │
│  - SearchPermissionsUseCase                                │
│  - CountPermissionsUseCase                                 │
│  - UpdatePermissionStatusUseCase                           │
│  - GetPermissionStatisticsUseCase                          │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    领域层 (Domain)                         │
├─────────────────────────────────────────────────────────────┤
│  Entities:                                                 │
│  - Permission                                              │
│  Value Objects:                                            │
│  - PermissionAction                                        │
│  - PermissionStatus                                        │
│  - PermissionType                                          │
│  - PermissionCondition                                     │
│  Repositories:                                             │
│  - PermissionRepository (Interface)                        │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                 基础设施层 (Infrastructure)                  │
├─────────────────────────────────────────────────────────────┤
│  Entities:                                                 │
│  - PermissionOrmEntity                                     │
│  Repositories:                                             │
│  - PermissionRepositoryMikroOrm                            │
│  Services:                                                 │
│  - PermissionConfigService                                 │
│  Config:                                                   │
│  - PermissionConfig                                        │
└─────────────────────────────────────────────────────────────┘
```

## 核心功能

### 1. 权限管理
- **创建权限**: 支持创建各种类型的权限（API、菜单、按钮、数据等）
- **更新权限**: 支持权限信息的修改和状态更新
- **删除权限**: 支持软删除和硬删除操作
- **查询权限**: 支持多种查询方式（ID、代码、名称、类型等）

### 2. 权限类型
- **API权限**: 控制API接口的访问权限
- **菜单权限**: 控制菜单项的显示权限
- **按钮权限**: 控制按钮的操作权限
- **数据权限**: 控制数据的访问权限
- **页面权限**: 控制页面的访问权限

### 3. 权限操作
- **创建 (CREATE)**: 创建资源的权限
- **读取 (READ)**: 读取资源的权限
- **更新 (UPDATE)**: 更新资源的权限
- **删除 (DELETE)**: 删除资源的权限
- **管理 (MANAGE)**: 管理资源的权限
- **审批 (APPROVE)**: 审批操作的权限
- **导出 (EXPORT)**: 导出数据的权限
- **导入 (IMPORT)**: 导入数据的权限

### 4. 权限状态
- **启用 (ACTIVE)**: 权限处于启用状态
- **禁用 (INACTIVE)**: 权限处于禁用状态
- **暂停 (SUSPENDED)**: 权限处于暂停状态
- **过期 (EXPIRED)**: 权限已过期

### 5. 高级功能
- **条件权限**: 支持CASL条件权限控制
- **字段权限**: 支持字段级别的权限控制
- **权限树**: 支持父子权限关系
- **权限搜索**: 支持全文搜索和模糊搜索
- **权限统计**: 提供权限使用统计功能
- **多租户**: 支持多租户数据隔离

## 技术特性

### 1. 配置管理
- 支持环境变量配置
- 提供默认配置值
- 支持不同环境的配置覆盖
- 类型安全的配置访问

### 2. 数据持久化
- 使用MikroORM进行数据访问
- 支持PostgreSQL数据库
- 实现软删除机制
- 支持审计日志

### 3. 缓存机制
- 支持Redis缓存
- 可配置的缓存TTL
- 缓存前缀管理
- 缓存大小限制

### 4. 验证机制
- 权限名称唯一性验证
- 权限代码唯一性验证
- 父权限存在性验证
- 字段长度限制验证

### 5. 搜索功能
- 全文搜索支持
- 模糊搜索支持
- 搜索建议功能
- 搜索结果高亮

## API接口

### 权限管理接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/v1/permissions` | 创建权限 |
| PUT | `/v1/permissions/:id` | 更新权限 |
| DELETE | `/v1/permissions/:id` | 删除权限 |
| GET | `/v1/permissions/:id` | 获取权限详情 |
| GET | `/v1/permissions` | 获取权限列表 |
| GET | `/v1/permissions/search` | 搜索权限 |
| GET | `/v1/permissions/count` | 统计权限数量 |

### 请求示例

#### 创建权限
```json
POST /v1/permissions
{
  "name": "用户管理",
  "code": "USER_MANAGE",
  "description": "用户管理相关权限",
  "type": "api",
  "action": "manage",
  "tenantId": "tenant-123",
  "adminUserId": "admin-456",
  "resource": "users",
  "module": "iam"
}
```

#### 查询权限
```json
GET /v1/permissions?tenantId=tenant-123&page=1&limit=10&type=api&status=active
```

## 环境变量配置

### 数据库配置
```bash
PERMISSION_TABLE_NAME=permissions
PERMISSION_ENABLE_SOFT_DELETE=true
PERMISSION_ENABLE_AUDIT_LOG=true
PERMISSION_MAX_BATCH_SIZE=1000
PERMISSION_QUERY_TIMEOUT=30000
```

### 缓存配置
```bash
PERMISSION_CACHE_ENABLED=true
PERMISSION_CACHE_TTL=3600
PERMISSION_CACHE_MAX_SIZE=10000
PERMISSION_CACHE_PREFIX=permission
```

### 策略配置
```bash
PERMISSION_ENABLE_SYSTEM_PROTECTION=true
PERMISSION_ENABLE_DEFAULT_PROTECTION=true
PERMISSION_MAX_PER_TENANT=10000
PERMISSION_MAX_PER_ORG=5000
```

### 验证配置
```bash
PERMISSION_ENABLE_NAME_UNIQUENESS=true
PERMISSION_ENABLE_CODE_UNIQUENESS=true
PERMISSION_MAX_NAME_LENGTH=100
PERMISSION_MAX_CODE_LENGTH=50
```

### 搜索配置
```bash
PERMISSION_ENABLE_FULL_TEXT_SEARCH=true
PERMISSION_ENABLE_FUZZY_SEARCH=true
PERMISSION_MAX_SEARCH_RESULTS=100
PERMISSION_SEARCH_INDEX_FIELDS=name,code,description,resource,module,tags
```

## 开发指南

### 1. 添加新的权限类型
1. 在 `domain/value-objects/permission-type.value-object.ts` 中添加新的类型
2. 更新相关的验证逻辑
3. 添加对应的显示名称

### 2. 添加新的权限操作
1. 在 `domain/value-objects/permission-action.value-object.ts` 中添加新的操作
2. 更新相关的验证逻辑
3. 添加对应的显示名称

### 3. 扩展权限功能
1. 在领域层添加新的实体或值对象
2. 在应用层添加新的用例
3. 在基础设施层实现相应的仓储方法
4. 在展示层添加新的API接口

### 4. 自定义权限验证
1. 在 `infrastructure/services` 中添加新的验证服务
2. 在应用层用例中集成验证逻辑
3. 在配置中启用相应的验证选项

## 测试

### 单元测试
```bash
npm run test permissions
```

### 集成测试
```bash
npm run test:e2e permissions
```

### 数据库测试
```bash
npm run test:db permissions
```

## 部署

### 1. 环境准备
- PostgreSQL 数据库
- Redis 缓存服务
- Node.js 运行环境

### 2. 数据库迁移
```bash
npm run migration:run
```

### 3. 启动服务
```bash
npm run start:prod
```

## 监控和日志

### 1. 性能监控
- 权限查询性能监控
- 缓存命中率监控
- 数据库连接池监控

### 2. 业务监控
- 权限创建/更新/删除统计
- 权限使用频率统计
- 权限冲突检测

### 3. 日志记录
- 权限操作审计日志
- 权限访问日志
- 错误日志记录

## 安全考虑

### 1. 数据安全
- 多租户数据隔离
- 权限数据加密存储
- 敏感信息脱敏处理

### 2. 访问控制
- API接口权限验证
- 操作权限检查
- 数据权限过滤

### 3. 审计追踪
- 权限变更记录
- 操作日志记录
- 访问日志记录

## 扩展性

### 1. 水平扩展
- 支持多实例部署
- 数据库读写分离
- 缓存集群部署

### 2. 功能扩展
- 插件化架构
- 事件驱动设计
- 微服务拆分

### 3. 集成扩展
- 第三方权限系统集成
- SSO单点登录集成
- 外部权限API集成 
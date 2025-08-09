# 缓存基础设施层测试文档

## 测试结构

```
__tests__/
├── test-setup.ts                    # 测试设置和通用工具
├── jest.config.js                   # Jest配置文件
├── run-tests.sh                     # 测试运行脚本
├── README.md                        # 测试文档
├── utils/
│   └── cache-key.generator.spec.ts # 缓存键生成器测试
├── implementations/
│   └── memory-cache.service.spec.ts # 内存缓存服务测试
├── services/
│   ├── multi-level-cache.service.spec.ts    # 多级缓存服务测试
│   └── tenant-aware-cache.service.spec.ts   # 租户感知缓存服务测试
├── interceptors/
│   └── cache.interceptor.spec.ts   # 缓存拦截器测试
├── decorators/
│   └── cache.decorator.spec.ts     # 缓存装饰器测试
└── integration/
    └── cache-integration.spec.ts   # 集成测试
```

## 测试类型

### 1. 单元测试 (Unit Tests)
- **缓存键生成器**: 测试键生成逻辑和上下文注入
- **内存缓存服务**: 测试基础缓存操作和过期处理
- **多级缓存服务**: 测试多级缓存策略和回填机制
- **租户感知缓存**: 测试租户隔离和上下文处理
- **缓存拦截器**: 测试自动缓存处理逻辑
- **缓存装饰器**: 测试元数据设置和装饰器功能

### 2. 集成测试 (Integration Tests)
- **缓存系统集成**: 测试各组件间的协作
- **错误处理**: 测试异常情况的处理
- **性能测试**: 测试缓存性能和统计

## 运行测试

### 运行所有测试
```bash
cd apps/api/src/shared/infrastructure/cache
npm test
```

### 运行特定测试
```bash
# 运行缓存键生成器测试
npm test -- --testPathPattern="cache-key.generator.spec.ts"

# 运行内存缓存测试
npm test -- --testPathPattern="memory-cache.service.spec.ts"

# 运行集成测试
npm test -- --testPathPattern="cache-integration.spec.ts"
```

### 运行测试覆盖率
```bash
npm test -- --coverage
```

### 使用测试脚本
```bash
chmod +x __tests__/run-tests.sh
./__tests__/run-tests.sh
```

## 测试覆盖率目标

- **分支覆盖率**: 80%
- **函数覆盖率**: 80%
- **行覆盖率**: 80%
- **语句覆盖率**: 80%

## 测试场景

### 缓存键生成器测试
- ✅ 基础缓存键生成
- ✅ 带命名空间的缓存键
- ✅ 带标签的缓存键
- ✅ 租户特定缓存键
- ✅ 用户特定缓存键
- ✅ 上下文提取和验证

### 内存缓存服务测试
- ✅ 基础CRUD操作
- ✅ TTL过期处理
- ✅ 缓存淘汰策略
- ✅ 统计信息收集
- ✅ 错误处理
- ✅ 模式清除

### 多级缓存服务测试
- ✅ 内存优先策略
- ✅ Redis优先策略
- ✅ 写透策略
- ✅ 缓存回填
- ✅ 错误降级
- ✅ 预热功能

### 租户感知缓存测试
- ✅ 租户数据获取
- ✅ 缓存命中处理
- ✅ 租户上下文隔离
- ✅ 租户缓存清除
- ✅ 租户统计信息

### 缓存拦截器测试
- ✅ 自动缓存处理
- ✅ 缓存命中跳过
- ✅ 缓存失效处理
- ✅ 装饰器元数据读取

### 缓存装饰器测试
- ✅ 元数据设置
- ✅ 各种装饰器功能
- ✅ 选项传递

### 集成测试
- ✅ 组件协作
- ✅ 端到端流程
- ✅ 错误处理
- ✅ 性能验证

## 测试最佳实践

### 1. 测试隔离
- 每个测试用例独立运行
- 使用beforeEach/afterEach清理状态
- 避免测试间的依赖关系

### 2. 模拟外部依赖
- 模拟Redis连接
- 模拟CLS服务
- 模拟数据库操作

### 3. 异步测试
- 正确处理Promise
- 使用async/await
- 设置合理的超时时间

### 4. 错误测试
- 测试异常情况
- 验证错误处理逻辑
- 确保系统稳定性

### 5. 性能测试
- 测试缓存命中率
- 验证响应时间
- 检查内存使用

## 测试数据

### 模拟数据
```typescript
// 租户上下文
const mockTenantContext = {
  tenantId: 'test-tenant',
  userId: 'test-user',
  requestId: 'test-request',
}

// 缓存数据
const mockCacheData = {
  id: 'test-id',
  name: 'Test Data',
  timestamp: new Date().toISOString(),
}
```

### 测试工具
```typescript
// 创建测试模块
const module = await createTestingModule([
  TenantAwareCacheService,
  MultiLevelCacheService,
  MemoryCacheService,
])

// 模拟服务
const mockService = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
}
```

## 持续集成

### GitHub Actions
```yaml
- name: Run Cache Tests
  run: |
    cd apps/api/src/shared/infrastructure/cache
    npm test -- --coverage
```

### 测试报告
- 控制台输出详细测试结果
- HTML覆盖率报告
- LCOV格式覆盖率数据

## 故障排除

### 常见问题
1. **测试超时**: 增加testTimeout配置
2. **内存泄漏**: 确保正确清理资源
3. **异步问题**: 使用waitFor等待异步操作
4. **模拟问题**: 检查模拟对象配置

### 调试技巧
```bash
# 运行单个测试
npm test -- --testNamePattern="should generate cache key"

# 调试模式
npm test -- --detectOpenHandles --forceExit

# 详细输出
npm test -- --verbose
```

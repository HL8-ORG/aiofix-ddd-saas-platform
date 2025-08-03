# 用户子领域测试文档

## 测试概述

用户子领域采用了全面的测试策略，包括单元测试、集成测试、数据库测试和API测试。所有测试都遵循DDD和Clean Architecture的原则，确保代码质量和功能正确性。

## 测试覆盖范围

### 1. 领域层测试 (Domain Layer Tests)

#### 实体测试 (Entity Tests)
- **文件**: `apps/api/src/modules/iam/users/domain/entities/__tests__/user.entity.spec.ts`
- **覆盖内容**:
  - 用户创建和基本属性
  - 用户状态管理（激活、禁用、删除）
  - 联系信息更新
  - 偏好设置更新
  - 组织分配和角色分配
  - 业务规则验证

#### 值对象测试 (Value Object Tests)
- **文件**: `apps/api/src/modules/iam/users/domain/value-objects/__tests__/`
- **覆盖内容**:
  - `username.value-object.spec.ts` - 用户名验证和唯一性
  - `email.value-object.spec.ts` - 邮箱格式验证
  - `phone.value-object.spec.ts` - 手机号验证（中国和国际）
  - `user-status.value-object.spec.ts` - 用户状态验证和转换

### 2. 应用层测试 (Application Layer Tests)

#### 应用服务测试 (Service Tests)
- **文件**: `apps/api/src/modules/iam/users/application/__tests__/users.service.spec.ts`
- **覆盖内容**:
  - 用户创建业务用例
  - 用户更新业务用例
  - 用户查询业务用例
  - 用户状态管理业务用例
  - 用户删除业务用例
  - 分页查询业务用例
  - 错误处理和异常情况

#### DTO测试 (DTO Tests)
- **文件**: `apps/api/src/modules/iam/users/presentation/__tests__/dto/`
- **覆盖内容**:
  - `create-user.dto.spec.ts` - 创建用户DTO验证
  - `update-user.dto.spec.ts` - 更新用户DTO验证
  - `pagination.dto.spec.ts` - 分页DTO验证
  - `user-response.dto.spec.ts` - 用户响应DTO验证

### 3. 基础设施层测试 (Infrastructure Layer Tests)

#### 仓储测试 (Repository Tests)
- **内存实现测试**: `apps/api/src/modules/iam/users/infrastructure/__tests__/repositories/user.repository.memory.spec.ts`
- **MikroORM实现测试**: `apps/api/src/modules/iam/users/infrastructure/__tests__/repositories/user.repository.mikroorm.spec.ts`
- **数据库集成测试**: `apps/api/src/modules/iam/users/infrastructure/__tests__/user-infrastructure.database.spec.ts`

**覆盖内容**:
- 基本的CRUD操作
- 多租户数据隔离
- 状态管理操作
- 分页和查询功能
- 错误处理

#### 缓存服务测试 (Cache Service Tests)
- **文件**: `apps/api/src/modules/iam/users/infrastructure/__tests__/cache/user-cache.service.spec.ts`
- **覆盖内容**:
  - 基本缓存操作（get, set, delete, clear）
  - 用户特定缓存操作
  - 用户列表缓存操作
  - 缓存失效机制
  - 缓存统计和限制
  - TTL和容量管理

#### 外部服务测试 (External Service Tests)
- **文件**: `apps/api/src/modules/iam/users/infrastructure/__tests__/external/user-notification.service.spec.ts`
- **覆盖内容**:
  - 通知发送功能
  - 特定通知类型（用户创建、状态变更等）
  - 服务禁用状态处理
  - 错误处理和重试机制
  - 批量通知功能

### 4. 表现层测试 (Presentation Layer Tests)

#### 控制器测试 (Controller Tests)
- **文件**: `apps/api/src/modules/iam/users/presentation/__tests__/controllers/users.controller.spec.ts`
- **覆盖内容**:
  - REST API端点测试
  - 请求参数验证
  - 响应格式验证
  - 错误处理
  - 服务层调用验证

## 测试类型详解

### 单元测试 (Unit Tests)
- **目的**: 测试单个类或方法的独立功能
- **特点**: 快速执行，隔离依赖
- **工具**: Jest + TypeScript
- **覆盖率**: > 90%

### 集成测试 (Integration Tests)
- **目的**: 测试模块间的交互和协作
- **特点**: 测试真实的服务集成
- **工具**: Jest + NestJS Testing Module
- **覆盖**: 应用服务与仓储的集成

### 数据库测试 (Database Tests)
- **目的**: 测试真实的数据库操作
- **特点**: 使用PostgreSQL数据库
- **工具**: Jest + MikroORM + PostgreSQL
- **覆盖**: 完整的CRUD操作和数据隔离

### API测试 (API Tests)
- **目的**: 测试HTTP接口的正确性
- **特点**: 测试完整的请求-响应流程
- **工具**: Jest + NestJS Testing Module
- **覆盖**: 所有REST API端点

## 测试数据管理

### 测试数据策略
1. **隔离性**: 每个测试使用独立的测试数据
2. **清理性**: 测试后自动清理测试数据
3. **一致性**: 使用固定的测试数据格式
4. **多租户**: 支持多租户测试数据隔离

### 测试数据生成
```typescript
// 使用generateUuid()生成唯一ID
const userId = generateUuid();
const tenantId = generateUuid();

// 使用有效的测试数据
const testUser = new User(
  userId,
  'test-user',
  'test@example.com',
  'Test',
  'User',
  tenantId,
  adminUserId,
  'hashedPassword123'
);
```

## 测试运行

### 运行所有用户模块测试
```bash
cd apps/api
npm run test:users
```

### 运行特定测试文件
```bash
npm test -- --testPathPattern="user.entity.spec.ts"
```

### 运行数据库测试
```bash
npm test -- --testPathPattern="user-infrastructure.database.spec.ts"
```

### 运行测试并生成覆盖率报告
```bash
npm run test:users:cov
```

## 测试最佳实践

### 1. 测试命名规范
```typescript
describe('User Entity', () => {
  describe('User Creation', () => {
    it('应该能够创建有效的用户', () => {
      // 测试实现
    });
  });
});
```

### 2. 测试结构规范
```typescript
it('应该能够激活用户', async () => {
  // Arrange - 准备测试数据
  const user = new User(/* ... */);
  
  // Act - 执行被测试的操作
  user.activate();
  
  // Assert - 验证结果
  expect(user.getStatus()).toBe('ACTIVE');
});
```

### 3. Mock使用规范
```typescript
// 使用jest.fn()创建mock
const mockUserRepository = {
  save: jest.fn(),
  findById: jest.fn(),
  // ...
};

// 在测试中验证mock调用
expect(mockUserRepository.save).toHaveBeenCalledWith(expectedUser);
```

### 4. 异步测试规范
```typescript
it('应该能够异步保存用户', async () => {
  const user = new User(/* ... */);
  const savedUser = await userRepository.save(user);
  
  expect(savedUser).toBeDefined();
  expect(savedUser.id).toBe(user.id);
});
```

## 测试覆盖率目标

### 覆盖率指标
- **语句覆盖率**: > 90%
- **分支覆盖率**: > 85%
- **函数覆盖率**: > 95%
- **行覆盖率**: > 90%

### 覆盖率报告
```bash
# 生成覆盖率报告
npm run test:users:cov

# 查看覆盖率报告
open coverage/lcov-report/index.html
```

## 持续集成测试

### CI/CD测试流程
1. **代码检查**: ESLint + Prettier
2. **类型检查**: TypeScript编译
3. **单元测试**: 运行所有单元测试
4. **集成测试**: 运行集成测试
5. **数据库测试**: 运行数据库集成测试
6. **覆盖率检查**: 确保覆盖率达标

### 测试环境配置
```yaml
# .github/workflows/test.yml
name: User Module Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm run test:users
      - name: Generate coverage
        run: npm run test:users:cov
```

## 测试维护

### 测试更新策略
1. **功能变更**: 同步更新相关测试
2. **重构**: 保持测试的独立性
3. **新功能**: 先写测试，再写实现
4. **Bug修复**: 添加回归测试

### 测试文档维护
1. **README更新**: 同步更新测试说明
2. **API文档**: 保持测试与API一致
3. **示例代码**: 使用测试作为示例

## 总结

用户子领域的测试策略确保了：

✅ **完整性** - 覆盖所有业务逻辑和边界情况
✅ **可靠性** - 使用真实数据库和外部服务
✅ **可维护性** - 清晰的测试结构和命名
✅ **性能** - 快速的单元测试和合理的集成测试
✅ **质量** - 高覆盖率和高代码质量

通过这套完整的测试体系，用户子领域具备了高质量、可维护、可扩展的特性，为整个IAM系统提供了坚实的基础。 
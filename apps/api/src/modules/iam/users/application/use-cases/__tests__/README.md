# 用户领域用例单元测试

本目录包含了用户领域所有用例的单元测试文件。

## 测试文件结构

```
__tests__/
├── jest.config.js              # Jest配置文件
├── jest.setup.ts               # Jest设置文件
├── README.md                   # 测试文档
├── create-user.use-case.spec.ts
├── get-user.use-case.spec.ts
├── get-users.use-case.spec.ts
├── update-user.use-case.spec.ts
├── delete-user.use-case.spec.ts
├── update-user-status.use-case.spec.ts
├── assign-user-to-organization.use-case.spec.ts
├── assign-role-to-user.use-case.spec.ts
├── search-users.use-case.spec.ts
└── get-user-statistics.use-case.spec.ts
```

## 测试覆盖范围

### 1. 创建用户用例 (create-user.use-case.spec.ts)
- ✅ 成功创建用户
- ✅ 用户名已存在时抛出异常
- ✅ 邮箱已存在时抛出异常
- ✅ 手机号已存在时抛出异常
- ✅ 处理可选字段
- ✅ 不提供手机号时不检查手机号唯一性

### 2. 获取用户用例 (get-user.use-case.spec.ts)
- ✅ 根据ID获取用户
- ✅ 根据用户名获取用户
- ✅ 根据邮箱获取用户
- ✅ 用户不存在时抛出异常

### 3. 获取用户列表用例 (get-users.use-case.spec.ts)
- ✅ 获取所有用户
- ✅ 根据搜索条件过滤
- ✅ 根据状态过滤
- ✅ 根据组织过滤
- ✅ 根据角色过滤
- ✅ 分页处理
- ✅ 空结果处理
- ✅ 获取活跃用户
- ✅ 获取所有用户

### 4. 更新用户用例 (update-user.use-case.spec.ts)
- ✅ 成功更新用户信息
- ✅ 用户不存在时抛出异常
- ✅ 手机号被其他用户使用时抛出异常
- ✅ 处理部分更新
- ✅ 部分字段更新

### 5. 删除用户用例 (delete-user.use-case.spec.ts)
- ✅ 成功软删除用户
- ✅ 成功硬删除用户
- ✅ 批量删除用户
- ✅ 恢复已删除用户
- ✅ 永久删除用户
- ✅ 各种异常情况处理

### 6. 更新用户状态用例 (update-user-status.use-case.spec.ts)
- ✅ 成功更新用户状态
- ✅ 批量更新用户状态
- ✅ 锁定/解锁用户
- ✅ 重置登录失败次数
- ✅ 各种状态转换验证

### 7. 分配用户到组织用例 (assign-user-to-organization.use-case.spec.ts)
- ✅ 成功分配用户到组织
- ✅ 批量分配用户到组织
- ✅ 从组织中移除用户
- ✅ 更新用户的组织列表
- ✅ 获取组织下的所有用户
- ✅ 用户组织转移
- ✅ 获取用户所属组织

### 8. 分配角色给用户用例 (assign-role-to-user.use-case.spec.ts)
- ✅ 成功分配角色给用户
- ✅ 批量分配角色给用户
- ✅ 移除用户角色
- ✅ 更新用户的角色列表
- ✅ 获取拥有指定角色的用户
- ✅ 为用户分配多个角色
- ✅ 获取用户的所有角色
- ✅ 替换用户的所有角色
- ✅ 检查用户是否拥有指定角色

### 9. 搜索用户用例 (search-users.use-case.spec.ts)
- ✅ 基本搜索功能
- ✅ 高级搜索功能
- ✅ 获取用户建议
- ✅ 按用户名搜索
- ✅ 按邮箱搜索
- ✅ 按手机号搜索
- ✅ 按组织搜索
- ✅ 按角色搜索

### 10. 获取用户统计用例 (get-user-statistics.use-case.spec.ts)
- ✅ 获取用户统计信息
- ✅ 按状态分组统计
- ✅ 按组织分组统计
- ✅ 按角色分组统计
- ✅ 按日期范围统计
- ✅ 获取活跃用户数量
- ✅ 获取新用户数量
- ✅ 获取删除用户数量
- ✅ 多租户对比
- ✅ 增长率计算
- ✅ 用户活动统计

## 测试工具

### 全局测试工具函数

```typescript
// 创建模拟用户
const mockUser = global.testUtils.createMockUser({
  id: 'custom-user-id',
  username: 'custom-username'
});

// 创建模拟用户仓储
const mockUserRepository = global.testUtils.createMockUserRepository();

// 创建模拟用户状态
const mockStatus = global.testUtils.createMockUserStatus('ACTIVE');
```

## 运行测试

### 运行所有测试
```bash
npm test
```

### 运行特定测试文件
```bash
npm test create-user.use-case.spec.ts
```

### 运行测试并生成覆盖率报告
```bash
npm test -- --coverage
```

### 运行测试并监听文件变化
```bash
npm test -- --watch
```

## 测试覆盖率目标

- **语句覆盖率**: 80%
- **分支覆盖率**: 80%
- **函数覆盖率**: 80%
- **行覆盖率**: 80%

## 测试最佳实践

1. **AAA模式**: 每个测试都遵循 Arrange-Act-Assert 模式
2. **单一职责**: 每个测试只测试一个功能点
3. **描述性命名**: 测试名称清晰描述测试内容
4. **模拟依赖**: 使用 Jest 模拟所有外部依赖
5. **边界条件**: 测试正常情况、异常情况和边界条件
6. **清理资源**: 每个测试后清理模拟和状态

## 测试数据

测试使用模拟数据，避免依赖真实数据库。所有测试都是独立的，可以并行运行。

## 注意事项

1. 所有测试都使用 TypeScript 编写
2. 使用 NestJS 的 TestingModule 进行依赖注入测试
3. 模拟所有仓储接口方法
4. 测试异常情况和错误处理
5. 验证方法调用和参数传递 
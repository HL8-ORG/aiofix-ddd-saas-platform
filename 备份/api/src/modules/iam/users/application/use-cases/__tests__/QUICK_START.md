# 🚀 快速开始 - 用户领域用例测试

## 最简单的运行方式

### 在项目根目录运行：

```bash
# 运行所有用户用例测试
npm test -- --testPathPattern="users/application/use-cases/__tests__"

# 运行测试并生成覆盖率报告
npm test -- --testPathPattern="users/application/use-cases/__tests__" --coverage
```

## 📋 测试文件概览

| 测试文件 | 测试用例数 | 状态 |
|---------|-----------|------|
| `create-user.use-case.spec.ts` | 6 | ✅ |
| `get-user.use-case.spec.ts` | 6 | ✅ |
| `get-users.use-case.spec.ts` | 12 | ✅ |
| `update-user.use-case.spec.ts` | 8 | ✅ |
| `delete-user.use-case.spec.ts` | 15 | ✅ |
| `update-user-status.use-case.spec.ts` | 18 | ✅ |
| `assign-user-to-organization.use-case.spec.ts` | 14 | ✅ |
| `assign-role-to-user.use-case.spec.ts` | 16 | ✅ |
| `search-users.use-case.spec.ts` | 12 | ✅ |
| `get-user-statistics.use-case.spec.ts` | 15 | ✅ |

**总计**: 10个测试文件，约150+个测试用例

## 🎯 常用命令

```bash
# 运行所有测试
npm test -- --testPathPattern="users/application/use-cases/__tests__"

# 运行特定测试文件
npm test -- --testPathPattern="create-user.use-case.spec.ts"

# 运行测试并监听文件变化
npm test -- --testPathPattern="users/application/use-cases/__tests__" --watch

# 生成覆盖率报告
npm test -- --testPathPattern="users/application/use-cases/__tests__" --coverage

# 详细输出
npm test -- --testPathPattern="users/application/use-cases/__tests__" --verbose
```

## 📊 测试覆盖率目标

- **语句覆盖率**: 80%
- **分支覆盖率**: 80%
- **函数覆盖率**: 80%
- **行覆盖率**: 80%

## 🛠️ 测试工具

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

## 📝 测试架构

```
__tests__/
├── jest.config.js                    # Jest配置
├── jest.setup.ts                     # 测试设置
├── README.md                         # 详细文档
├── HOW_TO_RUN_TESTS.md              # 运行指南
├── TEST_SUMMARY.md                   # 测试总结
├── TEST_ARCHITECTURE.md              # 架构文档
├── QUICK_START.md                    # 快速开始
└── *.spec.ts                         # 测试文件
```

## 🎉 开始测试

现在你可以运行测试了！

```bash
# 在项目根目录运行
npm test -- --testPathPattern="users/application/use-cases/__tests__"
```

如果遇到问题，请查看 `HOW_TO_RUN_TESTS.md` 获取详细说明。 
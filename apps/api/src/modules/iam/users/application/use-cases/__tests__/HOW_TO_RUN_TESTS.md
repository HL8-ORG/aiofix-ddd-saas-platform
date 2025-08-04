# 如何运行用户领域用例测试

## 🚀 快速开始

### 方法1: 使用npm脚本（推荐）

在项目根目录运行：

```bash
# 运行所有用户用例测试
npm test -- --testPathPattern="users/application/use-cases/__tests__"

# 运行特定测试文件
npm test -- --testPathPattern="create-user.use-case.spec.ts"

# 运行测试并生成覆盖率报告
npm test -- --testPathPattern="users/application/use-cases/__tests__" --coverage
```

### 方法2: 使用Jest直接运行

在项目根目录运行：

```bash
# 运行所有用户用例测试
npx jest apps/api/src/modules/iam/users/application/use-cases/__tests__

# 运行特定测试文件
npx jest apps/api/src/modules/iam/users/application/use-cases/__tests__/create-user.use-case.spec.ts

# 运行测试并生成覆盖率报告
npx jest apps/api/src/modules/iam/users/application/use-cases/__tests__ --coverage
```

### 方法3: 在测试目录中运行

进入测试目录：

```bash
cd apps/api/src/modules/iam/users/application/use-cases/__tests__

# 运行所有测试
npx jest --testPathPattern=".*\.spec\.ts$"

# 运行特定测试
npx jest create-user.use-case.spec.ts

# 运行测试并生成覆盖率报告
npx jest --testPathPattern=".*\.spec\.ts$" --coverage
```

## 📋 测试文件列表

| 测试文件 | 描述 | 测试用例数 |
|---------|------|-----------|
| `create-user.use-case.spec.ts` | 创建用户测试 | 6 |
| `get-user.use-case.spec.ts` | 获取用户测试 | 6 |
| `get-users.use-case.spec.ts` | 获取用户列表测试 | 12 |
| `update-user.use-case.spec.ts` | 更新用户测试 | 8 |
| `delete-user.use-case.spec.ts` | 删除用户测试 | 15 |
| `update-user-status.use-case.spec.ts` | 状态管理测试 | 18 |
| `assign-user-to-organization.use-case.spec.ts` | 组织分配测试 | 14 |
| `assign-role-to-user.use-case.spec.ts` | 角色分配测试 | 16 |
| `search-users.use-case.spec.ts` | 搜索功能测试 | 12 |
| `get-user-statistics.use-case.spec.ts` | 统计功能测试 | 15 |

## 🎯 运行特定类型的测试

### 运行所有测试
```bash
npm test -- --testPathPattern="users/application/use-cases/__tests__"
```

### 运行单个测试文件
```bash
npm test -- --testPathPattern="create-user.use-case.spec.ts"
```

### 运行匹配模式的测试
```bash
# 运行所有创建相关的测试
npm test -- --testPathPattern="create.*\.spec\.ts"

# 运行所有更新相关的测试
npm test -- --testPathPattern="update.*\.spec\.ts"
```

### 运行测试并监听文件变化
```bash
npm test -- --testPathPattern="users/application/use-cases/__tests__" --watch
```

## 📊 生成覆盖率报告

### 生成文本覆盖率报告
```bash
npm test -- --testPathPattern="users/application/use-cases/__tests__" --coverage --coverageReporters=text
```

### 生成HTML覆盖率报告
```bash
npm test -- --testPathPattern="users/application/use-cases/__tests__" --coverage --coverageReporters=html
```

### 生成完整覆盖率报告
```bash
npm test -- --testPathPattern="users/application/use-cases/__tests__" --coverage --coverageReporters=text --coverageReporters=lcov --coverageReporters=html
```

## 🔧 调试测试

### 运行单个测试用例
```bash
# 使用 --testNamePattern 运行特定测试
npm test -- --testPathPattern="create-user.use-case.spec.ts" --testNamePattern="应该成功创建用户"
```

### 调试模式运行
```bash
# 使用 --detectOpenHandles 检测未关闭的句柄
npm test -- --testPathPattern="users/application/use-cases/__tests__" --detectOpenHandles

# 使用 --forceExit 强制退出
npm test -- --testPathPattern="users/application/use-cases/__tests__" --forceExit
```

### 详细输出
```bash
npm test -- --testPathPattern="users/application/use-cases/__tests__" --verbose
```

## 🐛 常见问题解决

### 问题1: 测试找不到模块
```bash
# 确保在项目根目录运行
cd /path/to/your/project

# 检查node_modules是否存在
ls node_modules

# 重新安装依赖
npm install
```

### 问题2: TypeScript编译错误
```bash
# 检查TypeScript配置
npx tsc --noEmit

# 运行类型检查
npm run typecheck
```

### 问题3: Jest配置问题
```bash
# 检查Jest配置
npx jest --showConfig

# 使用自定义配置文件
npx jest --config=apps/api/src/modules/iam/users/application/use-cases/__tests__/jest.config.js
```

### 问题4: 测试超时
```bash
# 增加超时时间
npm test -- --testPathPattern="users/application/use-cases/__tests__" --testTimeout=10000
```

## 📈 测试性能优化

### 并行运行测试
```bash
npm test -- --testPathPattern="users/application/use-cases/__tests__" --maxWorkers=4
```

### 只运行失败的测试
```bash
npm test -- --testPathPattern="users/application/use-cases/__tests__" --onlyFailures
```

### 缓存测试结果
```bash
npm test -- --testPathPattern="users/application/use-cases/__tests__" --cache
```

## 🎯 最佳实践

1. **在项目根目录运行测试**：确保所有路径和依赖都正确解析
2. **使用npm脚本**：利用package.json中配置的测试脚本
3. **生成覆盖率报告**：定期检查测试覆盖率
4. **监听文件变化**：在开发时使用--watch模式
5. **调试失败测试**：使用--verbose和--detectOpenHandles

## 📝 示例命令

```bash
# 快速运行所有用户用例测试
npm test -- --testPathPattern="users/application/use-cases/__tests__" --verbose

# 运行测试并生成覆盖率报告
npm test -- --testPathPattern="users/application/use-cases/__tests__" --coverage

# 监听模式运行测试
npm test -- --testPathPattern="users/application/use-cases/__tests__" --watch

# 运行特定测试文件
npm test -- --testPathPattern="create-user.use-case.spec.ts"
```

现在你可以使用这些命令来运行用户领域用例的测试了！ 
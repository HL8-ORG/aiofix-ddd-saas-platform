# 租户子领域 Domain 层

## 概述

本文档描述了租户子领域的Domain层实现，采用TDD（测试驱动开发）原则进行开发，确保代码质量和业务逻辑的正确性。

## 架构设计

### 领域模型

租户子领域采用DDD（领域驱动设计）模式，包含以下核心组件：

1. **值对象（Value Objects）**
   - `TenantName`：租户名称值对象
   - `TenantCode`：租户编码值对象

2. **实体（Entities）**
   - `Tenant`：租户聚合根

3. **枚举（Enums）**
   - `TenantStatus`：租户状态枚举

## 实现详情

### 1. 租户名称值对象（TenantName）

**职责**：封装租户名称的业务规则和验证逻辑

**主要特性**：
- 长度验证：2-100个字符
- 字符验证：支持中文、英文、数字、空格、连字符、下划线
- 格式验证：不能以数字开头，自动标准化连续空格
- 不可变性：值对象一旦创建不可修改

**业务规则**：
```typescript
// 有效示例
new TenantName('测试租户');           // ✅
new TenantName('Test Tenant');        // ✅
new TenantName('Test-Tenant');        // ✅
new TenantName('Test_Tenant');        // ✅

// 无效示例
new TenantName('');                   // ❌ 不能为空
new TenantName('a');                  // ❌ 长度不足
new TenantName('123Test');            // ❌ 不能以数字开头
new TenantName('Test@Tenant');        // ❌ 包含特殊字符
```

### 2. 租户编码值对象（TenantCode）

**职责**：封装租户编码的业务规则和验证逻辑

**主要特性**：
- 长度验证：3-20个字符
- 字符验证：仅允许字母、数字、下划线
- 格式验证：必须以字母开头，自动转换为小写
- 不可变性：值对象一旦创建不可修改

**业务规则**：
```typescript
// 有效示例
new TenantCode('test');               // ✅
new TenantCode('test_tenant');        // ✅
new TenantCode('test123');            // ✅

// 无效示例
new TenantCode('');                   // ❌ 不能为空
new TenantCode('ab');                 // ❌ 长度不足
new TenantCode('123test');            // ❌ 不能以数字开头
new TenantCode('test@tenant');        // ❌ 包含特殊字符
```

### 3. 租户实体（Tenant）

**职责**：作为租户聚合根，管理租户的生命周期和业务操作

**主要特性**：
- 状态管理：PENDING、ACTIVE、SUSPENDED、DELETED
- 配置管理：支持租户级配置设置
- 生命周期：创建、激活、禁用、删除、恢复
- 审计支持：继承BaseEntity获得审计功能

**业务方法**：
```typescript
// 状态管理
tenant.activate('admin-123');         // 激活租户
tenant.suspend('admin-123');          // 禁用租户
tenant.delete('admin-123');           // 删除租户
tenant.restore('admin-123');          // 恢复租户

// 配置管理
tenant.updateSettings({theme: 'dark'}); // 更新配置
tenant.setSetting('timezone', 'UTC');   // 设置单个配置
tenant.getSetting('theme');              // 获取配置

// 状态检查
tenant.isActive();                      // 检查是否激活
tenant.isSuspended();                   // 检查是否禁用
```

## TDD 开发过程

### 1. 测试驱动开发原则

我们严格遵循TDD的"红-绿-重构"循环：

1. **红（Red）**：编写失败的测试
2. **绿（Green）**：实现最小代码使测试通过
3. **重构（Refactor）**：优化代码结构，保持测试通过

### 2. 测试策略

**单元测试覆盖**：
- 正常情况测试
- 边界条件测试
- 异常情况测试
- 业务规则验证测试
- 性能测试

**测试文件结构**：
```
src/tenants/domain/
├── entities/
│   ├── tenant.entity.ts
│   └── __tests__/
│       └── tenant.entity.spec.ts
├── value-objects/
│   ├── tenant-name.vo.ts
│   ├── tenant-code.vo.ts
│   └── __tests__/
│       ├── tenant-name.vo.spec.ts
│       └── tenant-code.vo.spec.ts
```

### 3. 测试覆盖率

| 组件 | 语句覆盖率 | 分支覆盖率 | 函数覆盖率 | 行覆盖率 |
|------|------------|------------|------------|----------|
| TenantName | 100% | 100% | 100% | 100% |
| TenantCode | 82.05% | 76.92% | 69.23% | 82.05% |
| Tenant | 98.07% | 92.85% | 100% | 98.07% |

## 测试结果

### 测试统计
- **测试套件**：3个
- **测试用例**：75个
- **通过率**：100%
- **执行时间**：~0.7秒

### 测试分类

1. **构造函数测试**
   - 正常创建测试
   - 参数验证测试
   - 默认值测试

2. **业务规则测试**
   - 长度验证测试
   - 字符验证测试
   - 格式验证测试
   - 状态转换测试

3. **方法测试**
   - 获取值测试
   - 比较方法测试
   - 序列化测试
   - 配置管理测试

4. **静态方法测试**
   - 验证方法测试
   - 工厂方法测试
   - 常量获取测试

5. **边界条件测试**
   - Unicode字符测试
   - 混合字符测试
   - 最大/最小长度测试

6. **性能测试**
   - 大量数据处理测试
   - 快速验证测试

## 代码质量

### 1. 代码规范
- 遵循TSDoc注释规范
- 使用中文注释说明业务逻辑
- 清晰的命名约定
- 合理的代码结构

### 2. 设计原则
- **单一职责原则**：每个类只负责一个功能
- **开闭原则**：对扩展开放，对修改封闭
- **依赖倒置原则**：依赖抽象而非具体实现
- **值对象模式**：确保业务概念的不可变性

### 3. 错误处理
- 明确的错误消息
- 适当的异常类型
- 完整的错误上下文

## 下一步计划

### 1. 完善Domain层
- [ ] 添加领域事件（Domain Events）
- [ ] 实现领域服务（Domain Services）
- [ ] 创建仓储接口（Repository Interfaces）
- [ ] 添加领域异常（Domain Exceptions）

### 2. 扩展测试
- [ ] 添加集成测试
- [ ] 实现性能基准测试
- [ ] 添加压力测试
- [ ] 完善边界条件测试

### 3. 文档完善
- [ ] 添加API文档
- [ ] 创建使用示例
- [ ] 编写部署指南
- [ ] 更新架构文档

## 总结

通过TDD开发方式，我们成功实现了租户子领域的Domain层，确保了：

1. **高质量代码**：通过测试驱动确保代码质量
2. **业务逻辑正确性**：全面的测试覆盖验证业务规则
3. **可维护性**：清晰的代码结构和完整的文档
4. **可扩展性**：良好的设计模式支持未来扩展

这个实现为后续的应用层、基础设施层和表现层开发奠定了坚实的基础。

# 权限管理基础设施层测试文档

## 概述

本目录包含权限管理子领域基础设施层的完整单元测试，遵循TDD开发原则，确保代码质量和功能正确性。

## 测试覆盖范围

### 1. 实体测试 (permission.orm.entity.spec.ts)
- **测试目标**: PermissionOrmEntity
- **覆盖内容**:
  - 基本属性设置和获取
  - JSON字段处理（roleIds, conditions, fields, childPermissionIds）
  - 日期字段处理（createdAt, updatedAt, expiresAt, deletedAt）
  - 布尔字段处理（isSystemPermission, isDefaultPermission）
  - 字符串字段长度限制验证
  - UUID字段处理
  - 枚举值处理（type, status, action）
  - 实体完整性验证
  - 数据验证（空值、空数组、空对象处理）

### 2. 映射器测试 (permission.mapper.spec.ts)
- **测试目标**: PermissionMapper
- **覆盖内容**:
  - toDomain: 数据库实体转领域实体
  - toOrm: 领域实体转数据库实体
  - updateOrm: 更新数据库实体
  - toDomainList/toOrmList: 批量转换
  - toPartialOrm: 部分转换
  - validateOrmEntity/validateDomainEntity: 实体验证
  - 可选字段处理
  - 多租户数据隔离

### 3. 缓存服务测试 (permission-cache.service.spec.ts)
- **测试目标**: PermissionCacheService
- **覆盖内容**:
  - setPermission/getPermission: 单个权限缓存
  - setPermissionList/getPermissionList: 权限列表缓存
  - deletePermission: 删除缓存
  - invalidatePermissionList: 清除权限列表缓存
  - clear: 清空所有缓存
  - getStats: 缓存统计
  - setUserPermissions/getUserPermissions/deleteUserPermissions: 用户权限缓存
  - 缓存键生成和验证
  - 多租户缓存隔离

### 4. 内存仓储测试 (permission.repository.memory.spec.ts)
- **测试目标**: PermissionRepositoryMemory
- **覆盖内容**:
  - save: 保存和更新权限
  - findById/findByCode/findByName: 基础查询
  - findByTenant: 租户权限查询
  - findByRole: 角色权限查询
  - findByType/findByStatus/findByResource: 条件查询
  - findTree: 权限树查询
  - delete: 删除权限
  - exists: 存在性检查
  - countByTenant: 统计查询
  - findAll: 全量查询
  - 多租户数据隔离验证

### 5. MikroORM仓储测试 (permission.repository.mikroorm.spec.ts)
- **测试目标**: PermissionRepositoryMikroOrm
- **覆盖内容**:
  - 所有仓储接口方法的Mock测试
  - EntityManager交互验证
  - 数据库查询条件验证
  - 错误处理测试
  - 批量操作测试
  - 搜索和分页功能测试
  - 多租户查询条件验证

## 测试原则

### 1. TDD开发原则
- 先写测试，再实现功能
- 测试驱动设计，确保代码质量
- 持续重构，保持测试覆盖率

### 2. 测试隔离
- 每个测试用例独立运行
- 使用beforeEach重置测试状态
- Mock外部依赖，避免测试间相互影响

### 3. 多租户测试
- 验证租户数据隔离
- 测试跨租户访问限制
- 确保数据安全性

### 4. 边界条件测试
- 空值处理
- 异常情况处理
- 性能边界测试

## 运行测试

```bash
# 运行所有基础设施层测试
npm test apps/api/src/modules/iam/permissions/infrastructure/__tests__/

# 运行特定测试文件
npm test apps/api/src/modules/iam/permissions/infrastructure/__tests__/permission.mapper.spec.ts

# 运行测试并生成覆盖率报告
npm test -- --coverage apps/api/src/modules/iam/permissions/infrastructure/__tests__/
```

## 测试覆盖率目标

- **语句覆盖率**: > 95%
- **分支覆盖率**: > 90%
- **函数覆盖率**: > 95%
- **行覆盖率**: > 95%

## 持续集成

- 所有测试必须在CI/CD流水线中通过
- 代码覆盖率不能低于目标值
- 新增功能必须包含相应测试

## 维护指南

1. **新增功能**: 必须先写测试，再实现功能
2. **修改功能**: 必须更新相关测试
3. **重构代码**: 确保所有测试仍然通过
4. **性能优化**: 添加性能测试用例

## 注意事项

1. 测试数据使用中文，便于理解
2. 测试用例命名清晰，描述具体功能
3. 使用Mock避免外部依赖
4. 保持测试代码的可读性和可维护性 
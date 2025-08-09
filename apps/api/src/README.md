# IAM模块设计文档

## 模块概述

IAM（身份认证与权限管理）模块基于领域驱动设计（DDD）和整洁架构（Clean Architecture）模式，实现CQRS和事件溯源（Event Sourcing），为多租户SaaS平台提供完整的身份认证与权限管理解决方案。

## 架构设计

### 分层架构

```
┌─────────────────────────────────────────────────────────────┐
│                    表现层 (Presentation Layer)             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│  │UserController│ │AuthController│ │RoleController│         │
│  └─────────────┘ └─────────────┘ └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    应用层 (Application Layer)              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│  │UserService  │ │AuthService  │ │RoleService  │         │
│  └─────────────┘ └─────────────┘ └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    领域层 (Domain Layer)                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│  │User         │ │Role         │ │Permission   │         │
│  └─────────────┘ └─────────────┘ └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                  基础设施层 (Infrastructure Layer)          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│  │UserRepository│ │RoleRepository│ │PermissionRepo│         │
│  └─────────────┘ └─────────────┘ └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### 目录结构
您说得对！值对象不应该放在shared目录，因为它们是领域特定的概念。让我重新组织目录结构：

```bash
rm -rf apps/api/src/shared/domain/value-objects
```
```bash
touch apps/api/src/tenants/domain/value-objects/tenant-name.vo.ts apps/api/src/tenants/domain/value-objects/tenant-code.vo.ts
```
```bash
touch apps/api/src/users/domain/value-objects/username.vo.ts apps/api/src/users/domain/value-objects/email.vo.ts apps/api/src/users/domain/value-objects/phone.vo.ts
```
```bash
touch apps/api/src/roles/domain/value-objects/role-name.vo.ts apps/api/src/roles/domain/value-objects/role-code.vo.ts
```
```bash
touch apps/api/src/permissions/domain/value-objects/permission-name.vo.ts apps/api/src/permissions/domain/value-objects/permission-code.vo.ts
```
现在让我创建各个子领域的核心实体：

```bash
touch apps/api/src/tenants/domain/entities/tenant.entity.ts apps/api/src/users/domain/entities/user.entity.ts apps/api/src/roles/domain/entities/role.entity.ts
```
```bash
touch apps/api/src/permissions/domain/entities/permission.entity.ts apps/api/src/organizations/domain/entities/organization.entity.ts
```
现在让我查看一下我们创建的目录结构：

```bash
find apps/api/src -type d | head -20
```
```bash
find apps/api/src -name "*.ts" | wc -l
```
很好！现在我们已经创建了基于子领域的目录结构。让我总结一下新的架构：

## 新的子领域架构

### 目录结构
```
apps/api/src/
├── shared/                    # 共享组件
│   ├── domain/
│   │   ├── entities/         # 基础实体
│   │   ├── repositories/     # 基础仓储接口
│   │   ├── services/         # 共享领域服务
│   │   ├── events/           # 共享事件
│   │   └── exceptions/       # 共享异常
│   ├── application/
│   ├── infrastructure/
│   └── presentation/
├── tenants/                   # 租户子领域
│   ├── domain/
│   │   ├── entities/         # 租户实体
│   │   ├── value-objects/    # 租户名称、租户编码
│   │   ├── repositories/     # 租户仓储接口
│   │   ├── services/         # 租户领域服务
│   │   ├── events/           # 租户事件
│   │   └── exceptions/       # 租户异常
│   ├── application/
│   ├── infrastructure/
│   └── presentation/
├── users/                     # 用户子领域
│   ├── domain/
│   │   ├── entities/         # 用户实体
│   │   ├── value-objects/    # 用户名、邮箱、手机号
│   │   ├── repositories/     # 用户仓储接口
│   │   ├── services/         # 用户领域服务
│   │   ├── events/           # 用户事件
│   │   └── exceptions/       # 用户异常
│   ├── application/
│   ├── infrastructure/
│   └── presentation/
├── roles/                     # 角色子领域
├── permissions/               # 权限子领域
└── organizations/             # 组织子领域
```

### 设计优势

1. **子领域隔离**: 每个子领域都有完整的四层架构
2. **值对象归属**: 值对象属于特定的子领域，而不是共享
3. **领域边界清晰**: 每个子领域都有明确的业务边界
4. **易于测试**: 每个子领域可以独立测试
5. **易于维护**: 修改某个子领域不会影响其他子领域
6. **团队协作**: 不同团队可以负责不同的子领域

现在我们可以开始实现具体的代码。您希望从哪个子领域开始？我建议从租户子领域开始，因为它是整个系统的基础。
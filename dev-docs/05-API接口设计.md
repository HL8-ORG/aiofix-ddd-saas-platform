# API接口设计

## 文档概述

本文档详细描述IAM系统的API接口设计，基于RESTful API设计原则，定义完整的接口规范、数据传输对象（DTO）、错误处理机制等，确保API的一致性和可维护性。

---

## 一、API设计原则

### 1.1 RESTful设计原则

#### 1.1.1 资源导向设计
- **资源识别**：将业务概念映射为REST资源
- **HTTP方法语义**：GET、POST、PUT、DELETE、PATCH
- **状态无关**：每个请求包含完整的状态信息
- **统一接口**：使用标准的HTTP方法和状态码

#### 1.1.2 URL设计规范
- **资源路径**：使用名词而非动词，如`/users`而非`/getUsers`
- **层级关系**：使用路径表示资源关系，如`/tenants/{tenantId}/users`
- **版本控制**：在URL中包含版本号，如`/api/v1/users`
- **查询参数**：使用查询参数进行过滤、排序、分页

#### 1.1.3 HTTP状态码使用
- **2xx成功**：200 OK、201 Created、204 No Content
- **4xx客户端错误**：400 Bad Request、401 Unauthorized、403 Forbidden、404 Not Found、409 Conflict
- **5xx服务器错误**：500 Internal Server Error、502 Bad Gateway、503 Service Unavailable

### 1.2 多租户API设计

#### 1.2.1 租户识别策略
- **URL路径**：`/api/v1/tenants/{tenantId}/users`
- **请求头**：`X-Tenant-ID: {tenantId}`
- **子域名**：`{tenant}.api.example.com`
- **JWT令牌**：在JWT中包含租户信息

#### 1.2.2 数据隔离保证
- **自动过滤**：所有查询自动添加租户过滤条件
- **权限验证**：验证用户对指定租户的访问权限
- **资源归属**：确保资源属于正确的租户

### 1.3 安全设计原则

#### 1.3.1 认证机制
- **JWT令牌**：使用JWT进行无状态认证
- **刷新令牌**：支持令牌刷新机制
- **多因素认证**：支持TOTP、SMS等MFA方式

#### 1.3.2 授权机制
- **基于角色**：RBAC权限控制
- **基于属性**：ABAC动态权限控制
- **细粒度权限**：字段级、数据级权限控制

#### 1.3.3 安全防护
- **输入验证**：严格的输入参数验证
- **SQL注入防护**：使用参数化查询
- **XSS防护**：输出编码和CSP策略
- **CSRF防护**：CSRF令牌验证

---

## 二、API接口规范

### 2.1 通用接口规范

#### 2.1.1 请求格式
```typescript
// 标准请求头
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {jwt_token}",
  "X-Tenant-ID": "{tenant_id}",
  "X-Request-ID": "{request_id}",
  "X-Client-Version": "{client_version}"
}

// 分页请求参数
{
  "page": 1,
  "size": 20,
  "sort": "createdAt:desc",
  "search": "keyword"
}
```

#### 2.1.2 响应格式
```typescript
// 成功响应
{
  "success": true,
  "data": {
    // 响应数据
  },
  "message": "操作成功",
  "timestamp": "2024-12-01T10:00:00Z",
  "requestId": "req_123456789"
}

// 分页响应
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "size": 20,
      "total": 100,
      "totalPages": 5
    }
  },
  "message": "查询成功"
}

// 错误响应
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "用户不存在",
    "details": {
      "userId": "用户ID不存在"
    }
  },
  "timestamp": "2024-12-01T10:00:00Z",
  "requestId": "req_123456789"
}
```

#### 2.1.3 错误码规范
```typescript
// 通用错误码
enum ErrorCode {
  // 认证相关
  UNAUTHORIZED = "UNAUTHORIZED",
  INVALID_TOKEN = "INVALID_TOKEN",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  
  // 授权相关
  FORBIDDEN = "FORBIDDEN",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
  
  // 资源相关
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  RESOURCE_ALREADY_EXISTS = "RESOURCE_ALREADY_EXISTS",
  RESOURCE_CONFLICT = "RESOURCE_CONFLICT",
  
  // 验证相关
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  
  // 业务相关
  BUSINESS_RULE_VIOLATION = "BUSINESS_RULE_VIOLATION",
  OPERATION_NOT_ALLOWED = "OPERATION_NOT_ALLOWED",
  
  // 系统相关
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
}
```

### 2.2 认证接口设计

#### 2.2.1 用户注册
```typescript
// POST /api/v1/auth/register
interface RegisterRequest {
  tenantId: string;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  inviteCode?: string;
}

interface RegisterResponse {
  userId: string;
  username: string;
  email: string;
  status: UserStatus;
  message: string;
}
```

#### 2.2.2 用户登录
```typescript
// POST /api/v1/auth/login
interface LoginRequest {
  tenantId: string;
  username: string; // 用户名或邮箱
  password: string;
  rememberMe?: boolean;
  twoFactorCode?: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    username: string;
    email: string;
    displayName: string;
    avatar?: string;
    roles: string[];
    permissions: string[];
  };
}
```

#### 2.2.3 令牌刷新
```typescript
// POST /api/v1/auth/refresh
interface RefreshRequest {
  refreshToken: string;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
```

#### 2.2.4 用户登出
```typescript
// POST /api/v1/auth/logout
interface LogoutRequest {
  refreshToken: string;
}

interface LogoutResponse {
  message: string;
}
```

### 2.3 用户管理接口设计

#### 2.3.1 获取用户列表
```typescript
// GET /api/v1/users
interface GetUsersRequest {
  page?: number;
  size?: number;
  search?: string;
  status?: UserStatus;
  organizationId?: string;
  roleId?: string;
  sort?: string;
}

interface GetUsersResponse {
  items: UserDto[];
  pagination: PaginationDto;
}
```

#### 2.3.2 获取用户详情
```typescript
// GET /api/v1/users/{userId}
interface GetUserResponse {
  id: string;
  username: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar?: string;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  organizations: UserOrganizationDto[];
  roles: UserRoleDto[];
  permissions: PermissionDto[];
}
```

#### 2.3.3 创建用户
```typescript
// POST /api/v1/users
interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  organizationIds?: string[];
  roleIds?: string[];
  sendWelcomeEmail?: boolean;
}

interface CreateUserResponse {
  id: string;
  username: string;
  email: string;
  status: UserStatus;
  message: string;
}
```

#### 2.3.4 更新用户
```typescript
// PUT /api/v1/users/{userId}
interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
  phone?: string;
  preferences?: Record<string, any>;
}

interface UpdateUserResponse {
  id: string;
  message: string;
}
```

#### 2.3.5 删除用户
```typescript
// DELETE /api/v1/users/{userId}
interface DeleteUserResponse {
  message: string;
}
```

### 2.4 角色管理接口设计

#### 2.4.1 获取角色列表
```typescript
// GET /api/v1/roles
interface GetRolesRequest {
  page?: number;
  size?: number;
  search?: string;
  status?: RoleStatus;
  organizationId?: string;
  sort?: string;
}

interface GetRolesResponse {
  items: RoleDto[];
  pagination: PaginationDto;
}
```

#### 2.4.2 获取角色详情
```typescript
// GET /api/v1/roles/{roleId}
interface GetRoleResponse {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: RoleStatus;
  priority: number;
  maxUsers?: number;
  expiresAt?: string;
  isSystemRole: boolean;
  isDefaultRole: boolean;
  parentRole?: RoleDto;
  childRoles: RoleDto[];
  permissions: PermissionDto[];
  users: UserDto[];
  createdAt: string;
  updatedAt: string;
}
```

#### 2.4.3 创建角色
```typescript
// POST /api/v1/roles
interface CreateRoleRequest {
  name: string;
  code: string;
  description?: string;
  priority?: number;
  maxUsers?: number;
  expiresAt?: string;
  parentRoleId?: string;
  permissionIds?: string[];
}

interface CreateRoleResponse {
  id: string;
  name: string;
  code: string;
  message: string;
}
```

#### 2.4.4 更新角色
```typescript
// PUT /api/v1/roles/{roleId}
interface UpdateRoleRequest {
  name?: string;
  description?: string;
  priority?: number;
  maxUsers?: number;
  expiresAt?: string;
  parentRoleId?: string;
}

interface UpdateRoleResponse {
  id: string;
  message: string;
}
```

#### 2.4.5 分配权限
```typescript
// POST /api/v1/roles/{roleId}/permissions
interface AssignPermissionsRequest {
  permissionIds: string[];
  expiresAt?: string;
}

interface AssignPermissionsResponse {
  message: string;
  assignedCount: number;
}
```

#### 2.4.6 分配用户
```typescript
// POST /api/v1/roles/{roleId}/users
interface AssignUsersRequest {
  userIds: string[];
  expiresAt?: string;
}

interface AssignUsersResponse {
  message: string;
  assignedCount: number;
}
```

### 2.5 权限管理接口设计

#### 2.5.1 获取权限列表
```typescript
// GET /api/v1/permissions
interface GetPermissionsRequest {
  page?: number;
  size?: number;
  search?: string;
  type?: PermissionType;
  action?: PermissionAction;
  module?: string;
  resource?: string;
  sort?: string;
}

interface GetPermissionsResponse {
  items: PermissionDto[];
  pagination: PaginationDto;
}
```

#### 2.5.2 获取权限详情
```typescript
// GET /api/v1/permissions/{permissionId}
interface GetPermissionResponse {
  id: string;
  name: string;
  code: string;
  description?: string;
  type: PermissionType;
  action: PermissionAction;
  resource: string;
  module: string;
  conditions?: Record<string, any>;
  fields?: string[];
  status: PermissionStatus;
  isSystemPermission: boolean;
  parentPermission?: PermissionDto;
  childPermissions: PermissionDto[];
  roles: RoleDto[];
  createdAt: string;
  updatedAt: string;
}
```

#### 2.5.3 验证权限
```typescript
// POST /api/v1/permissions/validate
interface ValidatePermissionRequest {
  resource: string;
  action: string;
  resourceAttributes?: Record<string, any>;
  fields?: string[];
}

interface ValidatePermissionResponse {
  hasPermission: boolean;
  allowedFields?: string[];
  deniedFields?: string[];
  reason?: string;
}
```

### 2.6 组织管理接口设计

#### 2.6.1 获取组织树
```typescript
// GET /api/v1/organizations/tree
interface GetOrganizationTreeRequest {
  includeUsers?: boolean;
  includeRoles?: boolean;
  maxDepth?: number;
}

interface GetOrganizationTreeResponse {
  items: OrganizationTreeNode[];
}

interface OrganizationTreeNode {
  id: string;
  name: string;
  code: string;
  type: OrganizationType;
  level: number;
  path: string;
  userCount: number;
  children: OrganizationTreeNode[];
}
```

#### 2.6.2 获取组织列表
```typescript
// GET /api/v1/organizations
interface GetOrganizationsRequest {
  page?: number;
  size?: number;
  search?: string;
  status?: OrganizationStatus;
  type?: OrganizationType;
  parentId?: string;
  level?: number;
  sort?: string;
}

interface GetOrganizationsResponse {
  items: OrganizationDto[];
  pagination: PaginationDto;
}
```

#### 2.6.3 获取组织详情
```typescript
// GET /api/v1/organizations/{organizationId}
interface GetOrganizationResponse {
  id: string;
  name: string;
  code: string;
  description?: string;
  type: OrganizationType;
  status: OrganizationStatus;
  path: string;
  level: number;
  sortOrder: number;
  parent?: OrganizationDto;
  children: OrganizationDto[];
  admin?: UserDto;
  contactInfo?: Record<string, any>;
  settings?: Record<string, any>;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}
```

#### 2.6.4 创建组织
```typescript
// POST /api/v1/organizations
interface CreateOrganizationRequest {
  name: string;
  code: string;
  description?: string;
  type: OrganizationType;
  parentId?: string;
  adminId?: string;
  contactInfo?: Record<string, any>;
  settings?: Record<string, any>;
}

interface CreateOrganizationResponse {
  id: string;
  name: string;
  code: string;
  message: string;
}
```

#### 2.6.5 更新组织
```typescript
// PUT /api/v1/organizations/{organizationId}
interface UpdateOrganizationRequest {
  name?: string;
  description?: string;
  type?: OrganizationType;
  adminId?: string;
  contactInfo?: Record<string, any>;
  settings?: Record<string, any>;
}

interface UpdateOrganizationResponse {
  id: string;
  message: string;
}
```

#### 2.6.6 移动组织
```typescript
// PUT /api/v1/organizations/{organizationId}/move
interface MoveOrganizationRequest {
  newParentId?: string; // null表示移动到根级
}

interface MoveOrganizationResponse {
  message: string;
}
```

### 2.7 租户管理接口设计

#### 2.7.1 获取租户列表
```typescript
// GET /api/v1/tenants
interface GetTenantsRequest {
  page?: number;
  size?: number;
  search?: string;
  status?: TenantStatus;
  sort?: string;
}

interface GetTenantsResponse {
  items: TenantDto[];
  pagination: PaginationDto;
}
```

#### 2.7.2 获取租户详情
```typescript
// GET /api/v1/tenants/{tenantId}
interface GetTenantResponse {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: TenantStatus;
  admin: UserDto;
  settings: Record<string, any>;
  statistics: {
    userCount: number;
    organizationCount: number;
    roleCount: number;
    permissionCount: number;
  };
  createdAt: string;
  updatedAt: string;
}
```

#### 2.7.3 创建租户
```typescript
// POST /api/v1/tenants
interface CreateTenantRequest {
  name: string;
  code: string;
  description?: string;
  adminUser: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  };
  settings?: Record<string, any>;
}

interface CreateTenantResponse {
  id: string;
  name: string;
  code: string;
  adminUserId: string;
  message: string;
}
```

#### 2.7.4 激活租户
```typescript
// POST /api/v1/tenants/{tenantId}/activate
interface ActivateTenantResponse {
  message: string;
}
```

#### 2.7.5 禁用租户
```typescript
// POST /api/v1/tenants/{tenantId}/suspend
interface SuspendTenantRequest {
  reason: string;
}

interface SuspendTenantResponse {
  message: string;
}
```

### 2.8 审计日志接口设计

#### 2.8.1 获取审计日志
```typescript
// GET /api/v1/audit-logs
interface GetAuditLogsRequest {
  page?: number;
  size?: number;
  userId?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  startTime?: string;
  endTime?: string;
  search?: string;
  sort?: string;
}

interface GetAuditLogsResponse {
  items: AuditLogDto[];
  pagination: PaginationDto;
}
```

#### 2.8.2 导出审计日志
```typescript
// GET /api/v1/audit-logs/export
interface ExportAuditLogsRequest {
  format: 'csv' | 'excel' | 'json';
  filters: GetAuditLogsRequest;
}

interface ExportAuditLogsResponse {
  downloadUrl: string;
  expiresAt: string;
}
```

---

## 三、数据传输对象（DTO）设计

### 3.1 基础DTO

#### 3.1.1 分页DTO
```typescript
interface PaginationDto {
  page: number;
  size: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
```

#### 3.1.2 用户DTO
```typescript
interface UserDto {
  id: string;
  username: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar?: string;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### 3.1.3 角色DTO
```typescript
interface RoleDto {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: RoleStatus;
  priority: number;
  maxUsers?: number;
  expiresAt?: string;
  isSystemRole: boolean;
  isDefaultRole: boolean;
  userCount: number;
  permissionCount: number;
  createdAt: string;
  updatedAt: string;
}
```

#### 3.1.4 权限DTO
```typescript
interface PermissionDto {
  id: string;
  name: string;
  code: string;
  description?: string;
  type: PermissionType;
  action: PermissionAction;
  resource: string;
  module: string;
  status: PermissionStatus;
  isSystemPermission: boolean;
  roleCount: number;
  createdAt: string;
  updatedAt: string;
}
```

#### 3.1.5 组织DTO
```typescript
interface OrganizationDto {
  id: string;
  name: string;
  code: string;
  description?: string;
  type: OrganizationType;
  status: OrganizationStatus;
  path: string;
  level: number;
  sortOrder: number;
  userCount: number;
  childCount: number;
  createdAt: string;
  updatedAt: string;
}
```

#### 3.1.6 租户DTO
```typescript
interface TenantDto {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: TenantStatus;
  admin: UserDto;
  userCount: number;
  organizationCount: number;
  createdAt: string;
  updatedAt: string;
}
```

### 3.2 关联DTO

#### 3.2.1 用户组织关联DTO
```typescript
interface UserOrganizationDto {
  id: string;
  user: UserDto;
  organization: OrganizationDto;
  role: string;
  isPrimary: boolean;
  joinDate: string;
  leaveDate?: string;
  status: UserOrganizationStatus;
}
```

#### 3.2.2 用户角色关联DTO
```typescript
interface UserRoleDto {
  id: string;
  user: UserDto;
  role: RoleDto;
  assignedBy: UserDto;
  assignedAt: string;
  expiresAt?: string;
  status: UserRoleStatus;
}
```

#### 3.2.3 角色权限关联DTO
```typescript
interface RolePermissionDto {
  id: string;
  role: RoleDto;
  permission: PermissionDto;
  assignedBy: UserDto;
  assignedAt: string;
  expiresAt?: string;
  status: RolePermissionStatus;
}
```

### 3.3 枚举类型

#### 3.3.1 状态枚举
```typescript
enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED'
}

enum RoleStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED'
}

enum PermissionStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED'
}

enum OrganizationStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED'
}

enum TenantStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED'
}
```

#### 3.3.2 类型枚举
```typescript
enum PermissionType {
  PAGE = 'PAGE',
  OPERATION = 'OPERATION',
  DATA = 'DATA',
  FIELD = 'FIELD'
}

enum PermissionAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  MANAGE = 'MANAGE',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT'
}

enum OrganizationType {
  DEPARTMENT = 'DEPARTMENT',
  SUBSIDIARY = 'SUBSIDIARY',
  PROJECT = 'PROJECT',
  TEAM = 'TEAM',
  DIVISION = 'DIVISION',
  BRANCH = 'BRANCH'
}
```

---

## 四、API版本管理

### 4.1 版本策略

#### 4.1.1 URL版本控制
```typescript
// 版本化URL示例
GET /api/v1/users
GET /api/v2/users
```

#### 4.1.2 请求头版本控制
```typescript
// 请求头版本控制
{
  "Accept": "application/vnd.iam.v1+json",
  "Accept": "application/vnd.iam.v2+json"
}
```

#### 4.1.3 版本兼容性
- **向后兼容**：新版本保持对旧版本的兼容
- **渐进式升级**：支持多版本同时运行
- **版本弃用**：提前通知版本弃用计划

### 4.2 版本管理策略

#### 4.2.1 版本号规范
- **主版本号**：不兼容的API变更
- **次版本号**：向后兼容的功能性新增
- **修订版本号**：向后兼容的问题修正

#### 4.2.2 版本生命周期
- **开发阶段**：Alpha版本，内部测试
- **测试阶段**：Beta版本，公开测试
- **稳定阶段**：正式版本，生产环境
- **维护阶段**：安全更新和bug修复
- **弃用阶段**：通知用户迁移到新版本

---

## 五、错误处理机制

### 5.1 错误响应格式

#### 5.1.1 标准错误响应
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
  };
}
```

#### 5.1.2 验证错误响应
```typescript
interface ValidationErrorResponse {
  success: false;
  error: {
    code: 'VALIDATION_ERROR';
    message: '输入参数验证失败';
    details: {
      field: string;
      message: string;
      value?: any;
    }[];
  };
}
```

### 5.2 错误处理策略

#### 5.2.1 全局错误处理
- **统一格式**：所有错误响应使用统一格式
- **错误码规范**：使用标准化的错误码
- **日志记录**：记录详细的错误日志
- **安全考虑**：避免泄露敏感信息

#### 5.2.2 业务错误处理
- **业务规则验证**：验证业务规则和约束
- **权限检查**：验证用户权限
- **资源存在性**：检查资源是否存在
- **并发控制**：处理并发冲突

### 5.3 错误码定义

#### 5.3.1 认证错误码
```typescript
enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TWO_FACTOR_REQUIRED = 'TWO_FACTOR_REQUIRED',
  INVALID_TWO_FACTOR_CODE = 'INVALID_TWO_FACTOR_CODE'
}
```

#### 5.3.2 权限错误码
```typescript
enum PermissionErrorCode {
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_ACCESS_DENIED = 'RESOURCE_ACCESS_DENIED',
  FIELD_ACCESS_DENIED = 'FIELD_ACCESS_DENIED',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED'
}
```

#### 5.3.3 业务错误码
```typescript
enum BusinessErrorCode {
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  ROLE_ALREADY_EXISTS = 'ROLE_ALREADY_EXISTS',
  ORGANIZATION_ALREADY_EXISTS = 'ORGANIZATION_ALREADY_EXISTS',
  TENANT_ALREADY_EXISTS = 'TENANT_ALREADY_EXISTS',
  RESOURCE_IN_USE = 'RESOURCE_IN_USE',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION'
}
```

---

## 六、API文档和测试

### 6.1 API文档

#### 6.1.1 Swagger/OpenAPI规范
```yaml
openapi: 3.0.0
info:
  title: IAM System API
  version: 1.0.0
  description: 身份认证与权限管理系统API
servers:
  - url: https://api.example.com/v1
    description: Production server
  - url: https://staging-api.example.com/v1
    description: Staging server
paths:
  /auth/login:
    post:
      summary: 用户登录
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginRequest'
      responses:
        '200':
          description: 登录成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/LoginResponse'
        '401':
          description: 认证失败
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
```

#### 6.1.2 文档生成和维护
- **自动生成**：基于代码注释自动生成API文档
- **版本同步**：文档与代码版本保持同步
- **示例代码**：提供完整的请求响应示例
- **在线测试**：支持在线API测试

### 6.2 API测试

#### 6.2.1 测试策略
- **单元测试**：测试API接口的单元功能
- **集成测试**：测试API与其他组件的集成
- **端到端测试**：测试完整的API调用流程
- **性能测试**：测试API的性能和负载能力

#### 6.2.2 测试工具
- **Postman**：API测试和文档工具
- **Jest**：单元测试框架
- **Supertest**：HTTP断言库
- **Artillery**：性能测试工具

---

## 七、API安全设计

### 7.1 安全策略

#### 7.1.1 输入验证
- **参数验证**：严格验证所有输入参数
- **类型检查**：确保参数类型正确
- **长度限制**：限制输入长度
- **格式验证**：验证输入格式

#### 7.1.2 输出编码
- **HTML编码**：防止XSS攻击
- **JSON编码**：安全处理JSON数据
- **URL编码**：安全处理URL参数

#### 7.1.3 访问控制
- **身份验证**：验证用户身份
- **权限检查**：检查用户权限
- **资源隔离**：确保资源访问隔离
- **审计日志**：记录访问日志

### 7.2 安全防护

#### 7.2.1 防护措施
- **HTTPS**：使用HTTPS加密传输
- **CORS**：配置跨域资源共享
- **CSP**：内容安全策略
- **HSTS**：HTTP严格传输安全

#### 7.2.2 监控告警
- **异常检测**：检测异常访问模式
- **实时告警**：实时安全告警
- **日志分析**：分析安全日志
- **威胁情报**：集成威胁情报

---

## 八、总结

### 8.1 设计亮点

#### 8.1.1 API设计亮点
- **RESTful规范**：严格遵循RESTful设计原则
- **多租户支持**：完整的多租户API设计
- **版本管理**：完善的API版本管理策略
- **错误处理**：统一的错误处理和响应格式

#### 8.1.2 安全设计亮点
- **多层次安全**：从传输到应用的多层安全防护
- **权限控制**：细粒度的权限控制机制
- **审计日志**：完整的操作审计日志
- **监控告警**：实时安全监控和告警

#### 8.1.3 文档设计亮点
- **自动生成**：基于代码自动生成API文档
- **在线测试**：支持在线API测试
- **版本同步**：文档与代码版本保持同步
- **示例丰富**：提供完整的请求响应示例

### 8.2 技术优势

#### 8.2.1 标准化优势
- **标准规范**：遵循行业标准API设计规范
- **一致性**：统一的API设计风格和格式
- **可维护性**：清晰的API结构和文档
- **可扩展性**：支持API的平滑扩展

#### 8.2.2 安全性优势
- **多层防护**：从网络到应用的多层安全防护
- **权限控制**：基于角色的细粒度权限控制
- **审计追踪**：完整的操作审计和追踪
- **合规支持**：满足安全合规要求

#### 8.2.3 可用性优势
- **高可用性**：支持高并发和负载均衡
- **容错能力**：完善的错误处理和恢复机制
- **监控告警**：实时监控和告警机制
- **文档完善**：详细的API文档和示例

### 8.3 实施建议

#### 8.3.1 开发阶段建议
- **设计先行**：先设计API接口，再实现功能
- **文档同步**：保持代码和文档同步更新
- **测试驱动**：采用测试驱动开发
- **代码审查**：建立API代码审查机制

#### 8.3.2 部署阶段建议
- **版本管理**：建立完善的版本管理策略
- **监控告警**：部署API监控和告警
- **性能优化**：优化API性能和响应时间
- **安全防护**：部署完善的安全防护措施

#### 8.3.3 运维阶段建议
- **性能监控**：持续监控API性能
- **安全监控**：监控API安全状况
- **容量规划**：根据使用情况规划容量
- **持续改进**：根据反馈持续优化API

这个API接口设计为IAM系统提供了完整的接口规范，确保API的一致性、安全性和可维护性。通过RESTful设计原则、完善的错误处理机制、多租户支持等设计，为系统的长期稳定运行提供了坚实的接口基础。 
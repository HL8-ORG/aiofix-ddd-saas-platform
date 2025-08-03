# 用户子领域API文档

## 概述

用户子领域提供了完整的用户管理REST API，支持用户的创建、查询、更新、删除等操作。所有API都支持多租户数据隔离，并遵循RESTful设计原则。

## 基础信息

- **Base URL**: `/api/v1/users`
- **Content-Type**: `application/json`
- **认证**: Bearer Token (JWT)
- **多租户**: 所有操作都基于租户ID进行数据隔离

## API端点

### 1. 创建用户

**POST** `/api/v1/users`

```json
{
  "username": "john_doe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "13812345678",
  "organizationIds": ["550e8400-e29b-41d4-a716-446655440001"],
  "roleIds": ["550e8400-e29b-41d4-a716-446655440002"]
}
```

### 2. 获取用户列表

**GET** `/api/v1/users?page=1&limit=10&status=ACTIVE`

### 3. 获取用户详情

**GET** `/api/v1/users/{id}`

### 4. 更新用户

**PUT** `/api/v1/users/{id}`

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "13812345678",
  "organizationIds": ["550e8400-e29b-41d4-a716-446655440001"],
  "roleIds": ["550e8400-e29b-41d4-a716-446655440002"]
}
```

### 5. 删除用户

**DELETE** `/api/v1/users/{id}`

### 6. 更新用户状态

**PATCH** `/api/v1/users/{id}/status`

```json
{
  "status": "SUSPENDED"
}
```

## 错误码说明

| 错误码 | HTTP状态码 | 说明 |
|--------|------------|------|
| USER_NOT_FOUND | 404 | 用户不存在 |
| USER_ALREADY_EXISTS | 409 | 用户名或邮箱已存在 |
| INVALID_USER_STATUS | 400 | 无效的用户状态 |
| VALIDATION_ERROR | 400 | 参数验证失败 |
| UNAUTHORIZED | 401 | 未授权访问 |
| FORBIDDEN | 403 | 权限不足 |

## 多租户支持

所有API操作都基于租户ID进行数据隔离，确保不同租户的数据完全隔离。

## 认证和授权

所有API都需要在请求头中包含有效的JWT令牌：

```
Authorization: Bearer <jwt_token>
```

## 使用示例

### JavaScript/TypeScript
```javascript
// 创建用户
const createUser = async (userData) => {
  const response = await fetch('/api/v1/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(userData)
  });
  return response.json();
};

// 获取用户列表
const getUsers = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`/api/v1/users?${queryString}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

### cURL示例
```bash
# 创建用户
curl -X POST /api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "username": "john_doe",
    "email": "john.doe@example.com",
    "password": "securePassword123",
    "firstName": "John",
    "lastName": "Doe"
  }'

# 获取用户列表
curl -X GET "/api/v1/users?page=1&limit=10&status=ACTIVE" \
  -H "Authorization: Bearer <token>"
```

## 总结

用户子领域API提供了完整的用户管理功能，支持多租户数据隔离、状态管理、组织角色管理等特性，为前端应用和其他服务提供了强大的用户管理能力。 
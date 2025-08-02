# 租户控制器流程图

## 概述

租户控制器（TenantsController）是表现层的核心组件，负责处理HTTP请求和响应，连接客户端和应用服务。

## HTTP接口流程

```mermaid
graph TD
    A[客户端HTTP请求] --> B[TenantsController接收请求]
    
    B --> C{请求类型}
    
    C -->|POST /v1/tenants| D[createTenant]
    C -->|GET /v1/tenants/:id| E[getTenantById]
    C -->|GET /v1/tenants| F[getAllTenants]
    C -->|PUT /v1/tenants/:id/activate| G[activateTenant]
    C -->|DELETE /v1/tenants/:id| H[deleteTenant]
    
    D --> D1[验证请求体参数]
    D1 --> D2[调用应用服务createTenant]
    D2 --> D3{创建是否成功?}
    D3 -->|成功| D4[返回201状态码和租户数据]
    D3 -->|失败| D5[返回错误状态码和错误信息]
    
    E --> E1[验证路径参数ID]
    E1 --> E2[调用应用服务getTenantById]
    E2 --> E3{租户是否存在?}
    E3 -->|存在| E4[返回200状态码和租户数据]
    E3 -->|不存在| E5[返回404状态码和错误信息]
    
    F --> F1[调用应用服务getAllTenants]
    F1 --> F2[返回200状态码和租户列表]
    
    G --> G1[验证路径参数ID]
    G1 --> G2[调用应用服务activateTenant]
    G2 --> G3{激活是否成功?}
    G3 -->|成功| G4[返回200状态码和更新后的租户数据]
    G3 -->|失败| G5[返回错误状态码和错误信息]
    
    H --> H1[验证路径参数ID]
    H1 --> H2[调用应用服务deleteTenant]
    H2 --> H3{删除是否成功?}
    H3 -->|成功| H4[返回200状态码和成功消息]
    H3 -->|失败| H5[返回错误状态码和错误信息]
    
    D4 --> I[统一响应格式]
    D5 --> I
    E4 --> I
    E5 --> I
    F2 --> I
    G4 --> I
    G5 --> I
    H4 --> I
    H5 --> I
    
    I --> J[返回HTTP响应]
    
    classDef start fill:#e3f2fd,stroke:#1565c0,stroke-width:3px,color:#0d47a1
    classDef process fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px,color:#4a148c
    classDef success fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px,color:#1b5e20
    classDef error fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#b71c1c
    classDef decision fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#e65100
    
    class A start
    class B,C,D,E,F,G,H process
    class D4,E4,F2,G4,H4,I,J success
    class D5,E5,G5,H5 error
    class C,D3,E3,G3,H3 decision
```

## 响应格式

```mermaid
graph TD
    A[控制器方法] --> B{操作类型}
    
    B -->|查询操作| C[返回数据响应]
    B -->|创建操作| D[返回创建响应]
    B -->|更新操作| E[返回更新响应]
    B -->|删除操作| F[返回删除响应]
    
    C --> C1[success: true]
    C1 --> C2[data: 租户数据]
    C2 --> C3[message: 成功消息]
    
    D --> D1[success: true]
    D1 --> D2[data: 新租户]
    D2 --> D3[message: 创建成功]
    
    E --> E1[success: true]
    E1 --> E2[data: 更新后的租户]
    E2 --> E3[message: 更新成功]
    
    F --> F1[success: true]
    F1 --> F2[message: 删除成功]
    
    C3 --> G[统一响应格式]
    D3 --> G
    E3 --> G
    F2 --> G
    
    classDef success fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px,color:#1b5e20
    classDef process fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px,color:#4a148c
    
    class G success
    class A,B,C,D,E,F process
```

## 异常处理流程

```mermaid
graph TD
    A[应用服务抛出异常] --> B[控制器捕获异常]
    
    B --> C{异常类型}
    
    C -->|NotFoundException| D[返回404状态码]
    C -->|ConflictException| E[返回409状态码]
    C -->|BadRequestException| F[返回400状态码]
    C -->|其他异常| G[返回500状态码]
    
    D --> H[错误响应格式]
    E --> H
    F --> H
    G --> H
    
    H --> I[返回HTTP错误响应]
    
    classDef error fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#b71c1c
    classDef process fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px,color:#4a148c
    
    class A,B process
    class C,D,E,F,G,H,I error
```

## API接口列表

| HTTP方法 | 路径 | 描述 | 状态码 |
|---------|------|------|--------|
| POST | `/v1/tenants` | 创建新租户 | 201/400/409 |
| GET | `/v1/tenants/:id` | 根据ID获取租户 | 200/404 |
| GET | `/v1/tenants` | 获取所有租户 | 200 |
| PUT | `/v1/tenants/:id/activate` | 激活租户 | 200/404/400 |
| DELETE | `/v1/tenants/:id` | 删除租户 | 200/404/400 |

## 设计原则

1. **RESTful设计** - 遵循REST API设计原则
2. **统一响应格式** - 所有响应使用统一的数据结构
3. **异常处理** - 统一的异常处理和错误响应
4. **参数验证** - 使用NestJS的验证管道
5. **文档生成** - 集成Swagger文档生成 
# 租户DTO流程图

## 概述

租户DTO（Data Transfer Objects）是表现层的重要组成部分，用于定义API接口的数据传输格式，包括请求和响应的数据结构。

## DTO类型分类

```mermaid
graph TD
    A[租户DTO类型] --> B[请求DTO]
    A --> C[响应DTO]
    A --> D[查询DTO]
    
    B --> B1[CreateTenantDto]
    B --> B2[UpdateTenantDto]
    B --> B3[UpdateTenantSettingsDto]
    B --> B4[ActivateTenantDto]
    B --> B5[SuspendTenantDto]
    
    C --> C1[TenantResponseDto]
    C --> C2[TenantListResponseDto]
    C --> C3[TenantDetailResponseDto]
    C --> C4[TenantCreateResponseDto]
    C --> C5[TenantDeleteResponseDto]
    
    D --> D1[QueryTenantDto]
    D --> D2[TenantStatsQueryDto]
    
    classDef request fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
    classDef response fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
    classDef query fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#e65100
    
    class B,B1,B2,B3,B4,B5 request
    class C,C1,C2,C3,C4,C5 response
    class D,D1,D2 query
```

## 请求DTO数据流

```mermaid
graph TD
    A[客户端请求] --> B[HTTP请求体]
    B --> C[CreateTenantDto验证]
    C --> D{验证结果}
    
    D -->|通过| E[转换为应用服务参数]
    D -->|失败| F[返回验证错误]
    
    E --> G[调用应用服务]
    G --> H[返回领域对象]
    
    F --> I[HTTP 400响应]
    H --> J[转换为响应DTO]
    J --> K[HTTP 201响应]
    
    classDef success fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px,color:#1b5e20
    classDef error fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#b71c1c
    classDef process fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px,color:#4a148c
    classDef decision fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#e65100
    
    class A,B process
    class C,G,H,J process
    class D decision
    class E,K success
    class F,I error
```

## 响应DTO数据流

```mermaid
graph TD
    A[领域对象] --> B[TenantResponseDto转换]
    B --> C[数据序列化]
    C --> D[字段过滤]
    D --> E[格式转换]
    E --> F[统一响应格式]
    F --> G[HTTP响应]
    
    B --> B1[ID字段]
    B --> B2[名称字段]
    B --> B3[编码字段]
    B --> B4[状态字段]
    B --> B5[时间字段]
    
    E --> E1[日期格式化]
    E --> E2[设置对象处理]
    E --> E3[状态显示名称]
    
    classDef process fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px,color:#4a148c
    classDef success fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px,color:#1b5e20
    
    class A,B,C,D,E,F,G process
    class B1,B2,B3,B4,B5 process
    class E1,E2,E3 process
```

## 验证流程

```mermaid
graph TD
    A[DTO实例] --> B[class-validator验证]
    B --> C{验证规则}
    
    C -->|必填字段| D[检查非空]
    C -->|字符串字段| E[检查类型和长度]
    C -->|UUID字段| F[检查格式]
    C -->|对象字段| G[检查类型]
    C -->|可选字段| H[跳过验证]
    
    D --> I{验证结果}
    E --> I
    F --> I
    G --> I
    H --> I
    
    I -->|通过| J[验证成功]
    I -->|失败| K[收集错误信息]
    
    J --> L[继续处理]
    K --> M[返回验证错误]
    
    classDef success fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px,color:#1b5e20
    classDef error fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#b71c1c
    classDef process fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px,color:#4a148c
    classDef decision fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#e65100
    
    class A,B process
    class C decision
    class D,E,F,G,H process
    class I decision
    class J,L success
    class K,M error
```

## DTO字段映射

| DTO类型 | 主要字段 | 验证规则 | 用途 |
|---------|----------|----------|------|
| CreateTenantDto | name, code, adminUserId | 必填、长度、格式 | 创建租户请求 |
| UpdateTenantDto | name?, code?, adminUserId? | 可选、长度、格式 | 更新租户请求 |
| TenantResponseDto | id, name, code, status | 序列化、转换 | 租户响应数据 |
| QueryTenantDto | page, limit, search, status | 分页、过滤、排序 | 查询参数 |
| UpdateTenantSettingsDto | settings | 对象验证 | 更新配置请求 |

## 设计原则

1. **单一职责** - 每个DTO只负责一种数据传输场景
2. **类型安全** - 使用TypeScript强类型定义
3. **验证完整** - 使用class-validator进行参数验证
4. **文档生成** - 使用Swagger装饰器生成API文档
5. **数据转换** - 使用class-transformer进行数据转换 
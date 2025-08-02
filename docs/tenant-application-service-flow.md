# 租户应用服务流程图

## 概述

租户应用服务（TenantsService）是应用层的核心组件，负责协调领域对象完成业务用例，连接表现层和领域层。

## 主要业务流程

```mermaid
graph TD
    A[客户端请求] --> B[TenantsService接收请求]
    
    B --> C{请求类型}
    
    C -->|创建租户| D[createTenant]
    C -->|获取租户| E[getTenantById/getTenantByCode]
    C -->|查询租户| F[getAllTenants/getActiveTenants]
    C -->|状态管理| G[activateTenant/suspendTenant]
    C -->|配置管理| H[updateTenantSettings]
    C -->|删除租户| I[deleteTenant]
    C -->|统计信息| J[getTenantStats]
    
    D --> D1[检查租户编码是否存在]
    D1 --> D2{编码是否存在?}
    D2 -->|是| D3[抛出ConflictException]
    D2 -->|否| D4[创建Tenant实体]
    D4 --> D5[调用仓储保存]
    D5 --> D6[返回租户实体]
    
    E --> E1[调用仓储查询]
    E1 --> E2{租户是否存在?}
    E2 -->|是| E3[返回租户实体]
    E2 -->|否| E4[抛出NotFoundException]
    
    F --> F1[调用仓储查询]
    F1 --> F2[返回租户列表]
    
    G --> G1[获取租户实体]
    G1 --> G2[调用实体状态方法]
    G2 --> G3[保存到仓储]
    G3 --> G4[返回更新后的实体]
    
    H --> H1[获取租户实体]
    H1 --> H2[更新配置]
    H2 --> H3[保存到仓储]
    H3 --> H4[返回更新后的实体]
    
    I --> I1[获取租户实体]
    I1 --> I2[标记为删除]
    I2 --> I3[保存到仓储]
    I3 --> I4[返回删除结果]
    
    J --> J1[并行查询统计信息]
    J1 --> J2[返回统计结果]
    
    D6 --> K[返回响应]
    E3 --> K
    E4 --> K
    F2 --> K
    G4 --> K
    H4 --> K
    I4 --> K
    J2 --> K
    
    classDef start fill:#e3f2fd,stroke:#1565c0,stroke-width:3px,color:#0d47a1
    classDef process fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px,color:#4a148c
    classDef success fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px,color:#1b5e20
    classDef error fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#b71c1c
    classDef decision fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#e65100
    
    class A start
    class B,C,D,E,F,G,H,I,J process
    class D6,E3,F2,G4,H4,I4,J2,K success
    class D3,E4 error
    class C,D1,D2,E1,E2 decision
```

## 设计原则

1. **单一职责** - 每个方法只负责一个业务用例
2. **依赖倒置** - 依赖抽象接口而非具体实现
3. **异常处理** - 统一的异常处理和错误响应
4. **事务边界** - 应用服务作为事务边界
5. **业务协调** - 协调领域对象完成业务用例 
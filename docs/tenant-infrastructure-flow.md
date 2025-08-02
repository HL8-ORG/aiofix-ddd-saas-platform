# 租户基础设施层流程图

## 概述

租户基础设施层负责提供数据持久化、外部服务集成和缓存功能，是连接领域层与外部系统的桥梁。

## 整体架构流程图

```mermaid
graph TD
    A[应用层] --> B[基础设施层]
    B --> C[数据库]
    B --> D[外部服务]
    B --> E[缓存系统]
    
    B --> F[仓储实现]
    B --> G[通知服务]
    B --> H[缓存服务]
    
    F --> I[内存仓储]
    F --> J[MikroORM仓储]
    
    G --> K[邮件服务]
    G --> L[短信服务]
    
    H --> M[内存缓存]
    H --> N[Redis缓存]
    
    classDef layer fill:#e3f2fd,stroke:#1565c0,stroke-width:3px,color:#0d47a1
    classDef service fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px,color:#4a148c
    classDef storage fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
    classDef external fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#e65100
    
    class A,B layer
    class F,G,H service
    class C,E storage
    class D,K,L external
```

## 仓储实现流程图

```mermaid
graph TD
    A[应用服务] --> B[仓储接口]
    B --> C[内存仓储实现]
    B --> D[MikroORM仓储实现]
    
    C --> E[内存存储]
    D --> F[PostgreSQL数据库]
    
    G[租户实体] --> H[ORM实体映射]
    H --> F
    
    I[查询请求] --> B
    B --> J[查询结果]
    J --> K[领域实体]
    
    classDef interface fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
    classDef implementation fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px,color:#4a148c
    classDef storage fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
    classDef entity fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#e65100
    
    class B interface
    class C,D implementation
    class E,F storage
    class G,K entity
```

## 通知服务流程图

```mermaid
graph TD
    A[领域事件] --> B[通知服务]
    B --> C[欢迎邮件]
    B --> D[激活通知]
    B --> E[暂停通知]
    B --> F[删除通知]
    
    C --> G[邮件服务]
    D --> H[短信服务]
    E --> G
    F --> G
    
    G --> I[SMTP服务器]
    H --> J[短信网关]
    
    K[租户创建] --> A
    L[租户激活] --> A
    M[租户暂停] --> A
    N[租户删除] --> A
    
    classDef event fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
    classDef service fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px,color:#4a148c
    classDef notification fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
    classDef external fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#e65100
    
    class A,K,L,M,N event
    class B service
    class C,D,E,F notification
    class G,H,I,J external
```

## 缓存服务流程图

```mermaid
graph TD
    A[应用服务] --> B[缓存服务]
    B --> C[内存缓存]
    B --> D[Redis缓存]
    
    E[租户数据] --> F[缓存键生成]
    F --> G[缓存存储]
    G --> C
    G --> D
    
    H[查询请求] --> I[缓存查找]
    I --> J{缓存命中?}
    J -->|是| K[返回缓存数据]
    J -->|否| L[数据库查询]
    L --> M[更新缓存]
    M --> K
    
    N[数据更新] --> O[缓存失效]
    O --> P[删除缓存]
    P --> C
    P --> D
    
    classDef service fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
    classDef cache fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px,color:#4a148c
    classDef data fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
    classDef decision fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#e65100
    
    class A,B service
    class C,D cache
    class E,H,N data
    class J decision
```

## 总结

基础设施层作为连接领域层与外部系统的桥梁，提供了：

1. **数据持久化**：通过仓储模式实现数据访问抽象
2. **外部服务集成**：提供通知、邮件等外部服务接口
3. **缓存管理**：提升系统性能和响应速度
4. **错误处理**：统一的异常处理和错误恢复机制
5. **性能优化**：通过缓存、索引等手段优化系统性能
6. **测试保障**：完整的测试策略确保系统稳定性
7. **部署支持**：支持多环境部署和监控

通过这些流程图，可以清晰地了解基础设施层的各个组件如何协同工作，为上层应用提供可靠的基础服务。 
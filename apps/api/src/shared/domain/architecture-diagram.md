# 领域实体设计架构图

## 整体架构图

```mermaid
graph TB
    subgraph "表现层 (Presentation Layer)"
        A[API Controllers]
        B[DTOs]
        C[Validators]
    end

    subgraph "应用层 (Application Layer)"
        D[Application Services]
        E[Use Cases]
        F[Command/Query Handlers]
    end

    subgraph "领域层 (Domain Layer)"
        G[Entities]
        H[Value Objects]
        I[Domain Services]
        J[Repository Interfaces]
        K[Domain Events]
    end

    subgraph "基础设施层 (Infrastructure Layer)"
        L[ORM Entities]
        M[Repository Implementations]
        N[External Services]
        O[Database]
    end

    A --> D
    D --> G
    D --> I
    G --> H
    G --> J
    I --> G
    M --> O
    M -.-> J
    L --> O

    classDef presentation fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
    classDef application fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px,color:#4a148c
    classDef domain fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px,color:#1b5e20
    classDef infrastructure fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#e65100

    class A,B,C presentation
    class D,E,F application
    class G,H,I,J,K domain
    class L,M,N,O infrastructure
```

## 租户领域模型图

```mermaid
graph TD
    subgraph "值对象 (Value Objects)"
        A[TenantName]
        B[TenantCode]
        C[TenantStatusValue]
    end

    subgraph "领域实体 (Domain Entity)"
        D[Tenant]
        E[BaseEntity]
    end

    subgraph "仓储接口 (Repository Interface)"
        F[ITenantRepository]
    end

    subgraph "领域服务 (Domain Service)"
        G[TenantDomainService]
    end

    subgraph "领域事件 (Domain Events)"
        H[TenantCreatedEvent]
        I[TenantActivatedEvent]
        J[TenantSuspendedEvent]
    end

    D --> A
    D --> B
    D --> C
    D --> E
    F --> D
    G --> D
    D --> H
    D --> I
    D --> J

    classDef valueObject fill:#e1f5fe,stroke:#0277bd,stroke-width:2px,color:#01579b
    classDef entity fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px,color:#1b5e20
    classDef repository fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#e65100
    classDef service fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px,color:#4a148c
    classDef event fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#880e4f

    class A,B,C valueObject
    class D,E entity
    class F repository
    class G service
    class H,I,J event
```

## 值对象设计模式图

```mermaid
graph LR
    subgraph "TenantName 值对象"
        A1[构造函数验证]
        A2[业务规则检查]
        A3[标准化处理]
        A4[不可变性保证]
    end

    subgraph "TenantCode 值对象"
        B1[格式验证]
        B2[字符限制]
        B3[URL友好转换]
        B4[唯一性约束]
    end

    subgraph "TenantStatusValue 值对象"
        C1[状态机管理]
        C2[状态转换验证]
        C3[状态查询方法]
        C4[显示名称映射]
    end

    A1 --> A2
    A2 --> A3
    A3 --> A4

    B1 --> B2
    B2 --> B3
    B3 --> B4

    C1 --> C2
    C2 --> C3
    C3 --> C4

    classDef validation fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#b71c1c
    classDef business fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
    classDef immutable fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1

    class A1,B1,C1 validation
    class A2,B2,C2 business
    class A3,B3,C3 business
    class A4,B4,C4 immutable
```

## 分层依赖关系图

```mermaid
graph TD
    subgraph "依赖方向"
        A[表现层] --> B[应用层]
        B --> C[领域层]
        C -.-> D[基础设施层]
    end

    subgraph "依赖倒置原则"
        E[高层模块] -.-> F[抽象接口]
        G[低层模块] --> F
    end

    subgraph "领域层独立性"
        H[领域实体] -.-> I[外部依赖]
        J[值对象] -.-> I
        K[领域服务] -.-> I
    end

    classDef highLevel fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px,color:#1b5e20
    classDef lowLevel fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#e65100
    classDef abstract fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px,color:#4a148c

    class A,B,C,E,F highLevel
    class D,G lowLevel
    class F abstract
```

## 设计原则总结

### 1. 纯领域对象原则
- ✅ 领域实体不包含ORM装饰器
- ✅ 使用class-validator进行数据校验
- ✅ 使用class-transformer控制序列化
- ✅ 领域逻辑与基础设施分离

### 2. 值对象优先原则
- ✅ 封装业务概念（名称、编码、状态）
- ✅ 确保不可变性
- ✅ 包含业务规则验证
- ✅ 提供丰富的业务方法

### 3. 分层架构原则
- ✅ 清晰的依赖方向
- ✅ 依赖倒置原则
- ✅ 领域层独立性
- ✅ 单一职责原则

### 4. 代码质量要求
- ✅ TSDoc格式注释
- ✅ 中文业务描述
- ✅ 严格的类型安全
- ✅ 完善的错误处理 
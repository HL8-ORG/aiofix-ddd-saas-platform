# 租户领域事件开发总结

## 概述

本文档总结了租户子领域中领域事件（Domain Events）的设计和实现。领域事件是DDD中的重要概念，用于在领域对象之间进行松耦合的通信。

## 开发内容

### 1. 领域事件定义

#### 1.1 事件基类
- **文件**: `apps/api/src/modules/tenants/domain/events/tenant.events.ts`
- **类**: `TenantDomainEvent`（抽象基类）
- **功能**: 定义领域事件的通用属性和方法

#### 1.2 具体事件类型
- **TenantCreatedEvent**: 租户创建事件
- **TenantActivatedEvent**: 租户激活事件
- **TenantSuspendedEvent**: 租户暂停事件
- **TenantDeletedEvent**: 租户删除事件
- **TenantSettingsUpdatedEvent**: 租户配置更新事件

### 2. 事件处理器接口

- **文件**: `apps/api/src/modules/tenants/domain/events/tenant-event-handler.interface.ts`
- **接口**: `TenantDomainEventHandler` 和 `TenantDomainEventPublisher`
- **功能**: 定义处理领域事件的契约

### 3. 实体集成

#### 3.1 Tenant实体增强
- **文件**: `apps/api/src/modules/tenants/domain/entities/tenant.entity.ts`
- **新增功能**: 领域事件集合管理和事件触发

#### 3.2 事件触发点
- **构造函数**: 创建租户时触发`TenantCreatedEvent`
- **activate()**: 激活租户时触发`TenantActivatedEvent`
- **suspend()**: 暂停租户时触发`TenantSuspendedEvent`
- **markAsDeleted()**: 删除租户时触发`TenantDeletedEvent`
- **updateSettings()**: 更新配置时触发`TenantSettingsUpdatedEvent`

## 技术实现

### 1. 事件基类设计

```typescript
export abstract class TenantDomainEvent {
  readonly eventId: string;
  readonly occurredOn: Date;
  readonly tenantId: string;
  readonly eventType: string;

  constructor(tenantId: string) {
    this.eventId = this.generateEventId();
    this.occurredOn = new Date();
    this.tenantId = tenantId;
    this.eventType = this.constructor.name;
  }
}
```

### 2. 实体事件管理

```typescript
export class Tenant extends BaseEntity {
  private _domainEvents: TenantDomainEvent[] = [];

  addDomainEvent(event: TenantDomainEvent): void {
    this._domainEvents.push(event);
  }

  getDomainEvents(): TenantDomainEvent[] {
    return [...this._domainEvents];
  }
}
```

## 测试覆盖

### 1. 事件测试
- **文件**: `apps/api/src/modules/tenants/domain/events/__tests__/tenant.events.spec.ts`
- **测试内容**: 事件基类功能、各种事件类型创建、事件序列化

### 2. 实体事件集成测试
- **文件**: `apps/api/src/modules/tenants/domain/entities/__tests__/tenant.entity.spec.ts`
- **测试内容**: 业务方法触发事件、事件管理方法、多事件累积

## 设计原则

### 1. DDD原则
- **聚合根**: Tenant作为聚合根，负责管理领域事件
- **事件不可变性**: 事件一旦创建就不能修改
- **事件自包含**: 事件包含所有必要的信息

### 2. 事件驱动架构
- **松耦合**: 通过事件实现组件间的松耦合
- **可扩展性**: 新功能可以通过订阅事件实现
- **可测试性**: 事件可以独立测试

## 使用场景

### 1. 审计追踪
- 记录所有重要的业务操作
- 提供完整的操作历史

### 2. 通知系统
- 租户创建时发送欢迎邮件
- 状态变更时通知管理员

### 3. 缓存更新
- 租户状态变更时更新缓存
- 保持数据一致性

## 总结

领域事件的实现为租户子领域提供了完整的事件驱动架构基础，实现了松耦合的组件通信、完整的审计追踪和可扩展的架构设计。 
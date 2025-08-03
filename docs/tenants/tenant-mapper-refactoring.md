# TenantMapper重构总结

## 重构背景

在DDD和Clean Architecture的设计原则下，我们发现`TenantOrmEntity`违反了单一职责原则。它既承担了数据库映射的职责，又承担了领域实体转换的职责，这导致了以下问题：

1. **职责混乱**: 数据库实体既要做ORM映射，又要做领域转换
2. **耦合度高**: 领域层和基础设施层耦合
3. **测试困难**: 难以单独测试映射逻辑
4. **维护困难**: 修改映射逻辑需要修改数据库实体

## 重构方案

### 1. 创建专门的Mapper类

创建了`TenantMapper`类，专门负责领域实体与数据库实体之间的转换：

```typescript
export class TenantMapper {
  // 数据库实体 -> 领域实体
  static toDomain(ormEntity: TenantOrmEntity): Tenant
  
  // 领域实体 -> 数据库实体
  static toOrm(tenant: Tenant): TenantOrmEntity
  
  // 更新数据库实体
  static updateOrm(ormEntity: TenantOrmEntity, tenant: Tenant): void
  
  // 批量转换
  static toDomainList(ormEntities: TenantOrmEntity[]): Tenant[]
  static toOrmList(tenants: Tenant[]): TenantOrmEntity[]
  
  // 部分转换（用于更新操作）
  static toPartialOrm(tenant: Tenant): Partial<TenantOrmEntity>
  
  // 验证
  static validateOrmEntity(ormEntity: TenantOrmEntity): boolean
  static validateDomainEntity(tenant: Tenant): boolean
}
```

### 2. 简化TenantOrmEntity

移除了`TenantOrmEntity`中的映射方法，让它只专注于数据库映射：

```typescript
@Entity({ tableName: 'tenants' })
export class TenantOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'varchar', length: 100 })
  name!: string;

  // ... 其他字段定义
  
  // 移除了 toDomain(), fromDomain(), updateFromDomain() 方法
}
```

### 3. 更新Repository实现

更新`TenantRepositoryMikroOrm`使用新的`TenantMapper`：

```typescript
// 之前
const ormEntity = TenantOrmEntity.fromDomain(tenant);
return ormEntity.toDomain();

// 之后
const ormEntity = TenantMapper.toOrm(tenant);
return TenantMapper.toDomain(ormEntity);
```

## 重构优势

### 1. 单一职责原则
- **TenantOrmEntity**: 只负责数据库表结构映射
- **TenantMapper**: 只负责领域实体与数据库实体的转换
- **TenantRepository**: 只负责数据访问逻辑

### 2. 更好的可测试性
- 可以单独测试映射逻辑
- 可以模拟Mapper进行Repository测试
- 可以测试各种边界情况

### 3. 更清晰的架构
- 领域层保持纯净
- 基础设施层职责明确
- 依赖关系更加清晰

### 4. 更好的可维护性
- 映射逻辑集中管理
- 修改映射不影响数据库实体
- 支持批量操作和验证

## 实现细节

### 1. 映射方法

#### toDomain()
```typescript
static toDomain(ormEntity: TenantOrmEntity): Tenant {
  const tenant = new Tenant(
    ormEntity.id,
    ormEntity.name,
    ormEntity.code,
    ormEntity.adminUserId,
    ormEntity.description,
    ormEntity.settings
  );

  // 设置状态
  tenant.status = new TenantStatusValue(ormEntity.status as TenantStatus);

  // 设置时间戳
  tenant.createdAt = ormEntity.createdAt;
  tenant.updatedAt = ormEntity.updatedAt;
  if (ormEntity.deletedAt) {
    tenant.deletedAt = ormEntity.deletedAt;
  }

  return tenant;
}
```

#### toOrm()
```typescript
static toOrm(tenant: Tenant): TenantOrmEntity {
  const ormEntity = new TenantOrmEntity();

  ormEntity.id = tenant.id;
  ormEntity.name = tenant.getName();
  ormEntity.code = tenant.getCode();
  ormEntity.status = tenant.getStatus();
  ormEntity.adminUserId = tenant.adminUserId;
  ormEntity.description = tenant.description;
  ormEntity.settings = tenant.settings;
  ormEntity.createdAt = tenant.createdAt;
  ormEntity.updatedAt = tenant.updatedAt;
  ormEntity.deletedAt = tenant.deletedAt;

  return ormEntity;
}
```

### 2. 批量操作

#### toDomainList()
```typescript
static toDomainList(ormEntities: TenantOrmEntity[]): Tenant[] {
  return ormEntities.map(ormEntity => this.toDomain(ormEntity));
}
```

#### toOrmList()
```typescript
static toOrmList(tenants: Tenant[]): TenantOrmEntity[] {
  return tenants.map(tenant => this.toOrm(tenant));
}
```

### 3. 验证功能

#### validateOrmEntity()
```typescript
static validateOrmEntity(ormEntity: TenantOrmEntity): boolean {
  return !!(
    ormEntity.id &&
    ormEntity.name &&
    ormEntity.code &&
    ormEntity.status &&
    ormEntity.adminUserId &&
    ormEntity.createdAt &&
    ormEntity.updatedAt
  );
}
```

## 测试覆盖

### 1. 单元测试
- ✅ toDomain() 方法测试
- ✅ toOrm() 方法测试
- ✅ updateOrm() 方法测试
- ✅ 批量转换测试
- ✅ 验证功能测试
- ✅ 映射一致性测试

### 2. 测试场景
- 正常映射场景
- 软删除实体处理
- 可选字段处理
- 批量操作
- 验证功能
- 状态类型处理

## 使用示例

### 1. 在Repository中使用
```typescript
async findById(id: string): Promise<Tenant | null> {
  const ormEntity = await this.em.findOne(TenantOrmEntity, { id });
  return ormEntity ? TenantMapper.toDomain(ormEntity) : null;
}

async save(tenant: Tenant): Promise<Tenant> {
  const ormEntity = TenantMapper.toOrm(tenant);
  await this.em.persistAndFlush(ormEntity);
  return TenantMapper.toDomain(ormEntity);
}
```

### 2. 批量操作
```typescript
async findAll(): Promise<Tenant[]> {
  const ormEntities = await this.em.find(TenantOrmEntity, {});
  return TenantMapper.toDomainList(ormEntities);
}
```

### 3. 更新操作
```typescript
async update(tenant: Tenant): Promise<void> {
  const ormEntity = await this.em.findOne(TenantOrmEntity, { id: tenant.id });
  if (ormEntity) {
    TenantMapper.updateOrm(ormEntity, tenant);
    await this.em.flush();
  }
}
```

## 最佳实践

### 1. 映射原则
- 保持领域实体的纯净性
- 处理值对象的序列化
- 正确处理时间戳
- 支持软删除

### 2. 性能考虑
- 使用批量操作减少循环
- 避免不必要的对象创建
- 合理使用验证功能

### 3. 错误处理
- 验证输入数据的完整性
- 提供有意义的错误信息
- 处理边界情况

## 总结

通过这次重构，我们成功地：

1. **遵循了单一职责原则**: 每个类都有明确的职责
2. **提高了代码的可测试性**: 可以单独测试映射逻辑
3. **改善了架构清晰度**: 依赖关系更加明确
4. **增强了可维护性**: 映射逻辑集中管理
5. **提供了更好的扩展性**: 支持批量操作和验证

这次重构为后续的开发奠定了良好的基础，也为其他模块的重构提供了参考模式。 
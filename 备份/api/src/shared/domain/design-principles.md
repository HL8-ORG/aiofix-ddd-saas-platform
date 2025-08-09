# 领域实体设计技术规范

## 一、核心设计原则

### 1.1 纯领域对象原则
- **领域实体必须是纯领域对象**，不包含任何ORM装饰器或数据库依赖
- **序列化安全性**通过`class-transformer`控制
- **数据校验**通过`class-validator`实现
- **领域逻辑**与基础设施完全分离

### 1.2 值对象优先原则
- **优先使用值对象**封装业务概念（如名称、编码、状态等）
- **值对象是不可变的**，一旦创建就不能修改
- **值对象包含业务规则**，确保数据的一致性和有效性
- **值对象提供丰富的业务方法**，如状态转换、格式验证等

### 1.3 分层架构原则
- **领域层**：纯业务逻辑，无外部依赖
- **应用层**：业务用例协调，调用领域对象
- **基础设施层**：技术实现细节，包含ORM映射
- **表现层**：用户界面和API接口

## 二、技术实现规范

### 2.1 基础实体设计

```typescript
/**
 * @abstract class BaseEntity
 * @description 基础实体类，为所有领域实体提供通用属性和方法
 */
export abstract class BaseEntity {
  @IsUUID()
  @Expose()
  id: string;

  @IsDate()
  @Expose()
  @Transform(({ value }) => value instanceof Date ? value : new Date(value))
  createdAt: Date;

  @IsDate()
  @Expose()
  @Transform(({ value }) => value instanceof Date ? value : new Date(value))
  updatedAt: Date;

  @IsOptional()
  @IsDate()
  @Expose()
  @Transform(({ value }) => value ? (value instanceof Date ? value : new Date(value)) : undefined)
  deletedAt?: Date;

  // 业务方法
  isDeleted(): boolean { /* ... */ }
  softDelete(): void { /* ... */ }
  restore(): void { /* ... */ }
  updateTimestamp(): void { /* ... */ }
}
```

### 2.2 值对象设计规范

```typescript
/**
 * @class ValueObject
 * @description 值对象设计模板
 */
export class ValueObject {
  @IsNotEmpty()
  @Expose()
  private readonly _value: string;

  constructor(value: string) {
    this._value = this.normalize(value);
    this.validate();
  }

  get value(): string {
    return this._value;
  }

  private normalize(value: string): string {
    // 标准化处理
  }

  private validate(): void {
    // 业务规则验证
  }

  toString(): string {
    return this._value;
  }

  equals(other: ValueObject): boolean {
    return this._value === other._value;
  }
}
```

### 2.3 领域实体设计规范

```typescript
/**
 * @class DomainEntity
 * @description 领域实体设计模板
 */
export class DomainEntity extends BaseEntity {
  @Expose()
  name: ValueObject;

  @Expose()
  status: StatusValueObject;

  constructor(id: string, name: string, status: string) {
    super();
    this.id = id;
    this.name = new ValueObject(name);
    this.status = new StatusValueObject(status);
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // 业务方法
  activate(): void {
    if (!this.status.canActivate()) {
      throw new Error('无法激活');
    }
    this.status = new StatusValueObject('active');
    this.updateTimestamp();
  }

  // 获取器方法
  getName(): string {
    return this.name.value;
  }

  getStatus(): string {
    return this.status.value;
  }
}
```

## 三、设计模式应用

### 3.1 值对象模式
- **封装业务概念**：将具有业务含义的数据封装为值对象
- **不可变性**：值对象一旦创建就不能修改
- **业务规则**：在值对象中实现相关的业务规则和验证
- **相等性**：实现值对象的相等性比较

### 3.2 状态机模式
- **状态转换**：通过状态机管理实体的状态转换
- **状态验证**：验证状态转换的合法性
- **状态查询**：提供丰富的状态查询方法

### 3.3 工厂模式
- **对象创建**：通过工厂方法创建复杂的领域对象
- **参数验证**：在创建过程中进行参数验证
- **默认值设置**：设置合理的默认值

## 四、代码质量要求

### 4.1 注释规范
- **TSDoc格式**：使用TSDoc格式编写注释
- **中文注释**：使用中文描述业务逻辑
- **原理说明**：在注释中说明代码的原理与机制
- **参数说明**：详细说明方法的参数和返回值

### 4.2 错误处理
- **业务异常**：使用有意义的错误消息
- **状态检查**：在状态转换前进行合法性检查
- **异常传播**：合理传播和处理异常

### 4.3 类型安全
- **严格类型**：使用严格的TypeScript类型
- **类型推断**：充分利用TypeScript的类型推断
- **接口定义**：为复杂对象定义接口

## 五、最佳实践

### 5.1 命名规范
- **实体类**：使用名词，如`Tenant`、`User`
- **值对象**：使用描述性名称，如`TenantName`、`TenantCode`
- **方法名**：使用动词，如`activate()`、`suspend()`

### 5.2 方法设计
- **单一职责**：每个方法只做一件事
- **参数验证**：在方法开始处进行参数验证
- **返回值**：明确方法的返回值类型

### 5.3 测试友好
- **可测试性**：设计易于测试的代码结构
- **依赖注入**：使用依赖注入提高可测试性
- **模拟对象**：便于创建模拟对象进行测试

## 六、目录结构规范

```
domain/
├── entities/           # 领域实体
│   ├── base.entity.ts
│   └── tenant.entity.ts
├── value-objects/      # 值对象
│   ├── tenant-name.value-object.ts
│   ├── tenant-code.value-object.ts
│   └── tenant-status.value-object.ts
├── repositories/       # 仓储接口
│   └── tenant.repository.interface.ts
├── services/          # 领域服务
│   └── tenant.service.ts
└── events/           # 领域事件
    └── tenant-created.event.ts
```

## 七、示例：租户实体完整设计

```typescript
// 值对象
export class TenantName {
  private readonly _value: string;
  constructor(value: string) {
    this._value = value.trim();
    this.validate();
  }
  get value(): string { return this._value; }
  private validate(): void { /* 业务规则验证 */ }
}

// 领域实体
export class Tenant extends BaseEntity {
  name: TenantName;
  code: TenantCode;
  status: TenantStatusValue;

  constructor(id: string, name: string, code: string, adminUserId: string) {
    super();
    this.id = id;
    this.name = new TenantName(name);
    this.code = new TenantCode(code);
    this.status = new TenantStatusValue(TenantStatus.PENDING);
    this.adminUserId = adminUserId;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  activate(): void {
    if (!this.status.canActivate()) {
      throw new Error(`租户当前状态为${this.status.getDisplayName()}，无法激活`);
    }
    this.status = new TenantStatusValue(TenantStatus.ACTIVE);
    this.updateTimestamp();
  }
}
```

这个技术规范确保了：
1. **领域模型的纯净性**：不包含技术实现细节
2. **业务规则的封装**：通过值对象封装业务概念
3. **代码的可维护性**：清晰的分层和职责分离
4. **测试的便利性**：易于进行单元测试
5. **扩展的灵活性**：便于添加新的业务功能 
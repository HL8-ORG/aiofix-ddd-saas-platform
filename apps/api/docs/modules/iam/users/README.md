# 用户子领域开发文档

## 概述

用户子领域是IAM（身份认证与访问管理）系统的核心模块之一，负责用户的生命周期管理、身份验证、权限分配等功能。本模块采用DDD（领域驱动设计）和Clean Architecture（整洁架构）设计模式，实现了高度模块化、可维护、可扩展的用户管理系统。

## 架构设计

### 分层架构

```
用户子领域
├── Domain Layer (领域层)
│   ├── Entities (实体)
│   ├── Value Objects (值对象)
│   ├── Repositories (仓储接口)
│   └── Events (领域事件)
├── Application Layer (应用层)
│   ├── Services (应用服务)
│   ├── DTOs (数据传输对象)
│   └── Interfaces (应用接口)
├── Infrastructure Layer (基础设施层)
│   ├── Repositories (仓储实现)
│   ├── Entities (ORM实体)
│   ├── Mappers (映射器)
│   ├── Cache (缓存服务)
│   ├── External (外部服务)
│   └── Config (配置管理)
└── Presentation Layer (表现层)
    ├── Controllers (控制器)
    ├── DTOs (表现层DTO)
    └── Validators (校验器)
```

### 设计原则

1. **依赖倒置原则** - 高层模块不依赖低层模块，抽象不依赖具体实现
2. **单一职责原则** - 每个类只负责一个功能
3. **开闭原则** - 对扩展开放，对修改关闭
4. **多租户数据隔离** - 所有操作都基于租户ID进行数据隔离

## 领域层 (Domain Layer)

### 核心实体

#### User (用户实体)

```typescript
/**
 * @class User
 * @description 用户聚合根，包含用户的所有业务逻辑和状态管理
 */
export class User {
  constructor(
    id: string,
    username: string,
    email: string,
    firstName: string,
    lastName: string,
    tenantId: string,
    adminUserId: string,
    passwordHash: string,
    phone?: string,
    displayName?: string,
    avatar?: string,
    organizationIds?: string[],
    roleIds?: string[],
    preferences?: Record<string, any>
  )
}
```

**主要方法：**
- `activate()` - 激活用户
- `suspend()` - 禁用用户
- `delete()` - 删除用户
- `updateContactInfo()` - 更新联系信息
- `updatePreferences()` - 更新偏好设置
- `assignToOrganization()` - 分配到组织
- `assignRole()` - 分配角色

### 值对象 (Value Objects)

#### Username (用户名值对象)
- 验证规则：3-50个字符，只能包含字母、数字、下划线
- 唯一性：在同一租户内必须唯一

#### Email (邮箱值对象)
- 验证规则：标准邮箱格式
- 唯一性：在同一租户内必须唯一

#### Phone (手机号值对象)
- 验证规则：支持中国手机号和国际手机号
- 中国手机号：11位数字，以1开头
- 国际手机号：1-15位数字

#### UserStatus (用户状态值对象)
- 状态枚举：PENDING, ACTIVE, SUSPENDED, DELETED
- 状态转换规则验证
- 业务规则检查方法

### 仓储接口

#### UserRepository (用户仓储接口)

```typescript
export abstract class UserRepository {
  abstract save(user: User): Promise<User>;
  abstract findById(id: string, tenantId: string): Promise<User | null>;
  abstract findByUsername(username: string, tenantId: string): Promise<User | null>;
  abstract findByEmail(email: string, tenantId: string): Promise<User | null>;
  abstract findAll(tenantId: string): Promise<User[]>;
  abstract updateStatus(id: string, status: UserStatusValue, tenantId: string): Promise<boolean>;
  abstract delete(id: string, tenantId: string): Promise<boolean>;
  // ... 更多方法
}
```

## 应用层 (Application Layer)

### 应用服务

#### UsersService (用户应用服务)

```typescript
/**
 * @class UsersService
 * @description 用户应用服务，协调领域对象完成业务用例
 */
@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userCacheService: UserCacheService,
    private readonly userNotificationService: UserNotificationService
  ) {}
}
```

**主要业务用例：**
- `createUser()` - 创建用户
- `updateUser()` - 更新用户信息
- `getUserById()` - 根据ID获取用户
- `getUsersWithPagination()` - 分页查询用户
- `updateUserStatus()` - 更新用户状态
- `deleteUser()` - 删除用户
- `assignUserToOrganization()` - 分配用户到组织
- `assignRoleToUser()` - 为用户分配角色

### 数据传输对象 (DTOs)

#### CreateUserDto
```typescript
export class CreateUserDto {
  @IsString()
  @Length(3, 50)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @Length(1, 50)
  firstName: string;

  @IsString()
  @Length(1, 50)
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  organizationIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  roleIds?: string[];
}
```

#### UpdateUserDto
```typescript
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  organizationIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  roleIds?: string[];
}
```

## 基础设施层 (Infrastructure Layer)

### 仓储实现

#### UserRepositoryMikroOrm (MikroORM实现)
- 基于MikroORM的数据库操作
- 支持PostgreSQL数据库
- 实现多租户数据隔离
- 提供完整的CRUD操作

#### UserRepositoryMemory (内存实现)
- 用于单元测试的内存实现
- 模拟真实数据库行为
- 支持数据隔离和状态管理

### 映射器

#### UserMapper (用户映射器)
```typescript
export class UserMapper {
  static toOrm(user: User): UserOrmEntity;
  static toDomain(ormEntity: UserOrmEntity): User;
  static toDomainList(ormEntities: UserOrmEntity[]): User[];
}
```

### 缓存服务

#### UserCacheService (用户缓存服务)
- 内存缓存实现
- 支持TTL和最大容量限制
- 提供用户数据和列表缓存
- 支持缓存失效和清理

### 外部服务

#### UserNotificationService (用户通知服务)
- 模拟外部通知服务
- 支持用户创建、状态变更等事件通知
- 可配置启用/禁用状态
- 提供批量通知功能

### 配置管理

#### UserInfrastructureConfig (用户基础设施配置)
```typescript
export interface UserInfrastructureConfig {
  cache: {
    ttl: number;
    maxSize: number;
  };
  database: {
    connectionTimeout: number;
    queryTimeout: number;
  };
  external: {
    notification: {
      enabled: boolean;
      timeout: number;
    };
    email: {
      enabled: boolean;
      provider: string;
    };
  };
  security: {
    passwordMinLength: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
  };
}
```

## 表现层 (Presentation Layer)

### 控制器

#### UsersController (用户控制器)
```typescript
/**
 * @class UsersController
 * @description 用户REST API控制器
 */
@Controller('users')
@ApiTags('用户管理')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: '创建用户' })
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {}

  @Get()
  @ApiOperation({ summary: '获取用户列表' })
  async getAllUsers(@Query() paginationDto: PaginationQueryDto): Promise<PaginatedResponseDto<UserResponseDto>> {}

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取用户' })
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {}

  @Put(':id')
  @ApiOperation({ summary: '更新用户信息' })
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<UserResponseDto> {}

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  async deleteUser(@Param('id') id: string): Promise<void> {}
}
```

### 响应DTO

#### UserResponseDto (用户响应DTO)
```typescript
export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromDomain(user: User): UserResponseDto;
}
```

## 测试策略

### 测试覆盖范围

1. **领域层测试**
   - 实体业务逻辑测试
   - 值对象验证测试
   - 领域事件测试

2. **应用层测试**
   - 应用服务业务用例测试
   - DTO验证测试
   - 服务集成测试

3. **基础设施层测试**
   - 仓储实现测试（内存和MikroORM）
   - 缓存服务测试
   - 外部服务测试
   - 映射器测试
   - 数据库集成测试

4. **表现层测试**
   - 控制器API测试
   - 请求/响应DTO测试
   - 参数验证测试

### 测试类型

- **单元测试** - 测试单个类或方法
- **集成测试** - 测试模块间的交互
- **数据库测试** - 使用真实PostgreSQL数据库
- **API测试** - 测试HTTP接口

## 多租户支持

### 数据隔离策略

1. **租户ID过滤** - 所有查询都基于租户ID进行过滤
2. **软隔离** - 通过应用层逻辑实现数据隔离
3. **数据完整性** - 确保跨租户数据不会相互干扰

### 租户相关字段

- `tenantId` - 租户标识符
- `adminUserId` - 管理员用户ID
- 所有查询都包含租户ID条件

## 安全考虑

### 密码安全
- 密码哈希存储
- 密码强度验证
- 密码重置机制

### 访问控制
- 基于角色的访问控制
- 用户状态管理
- 登录尝试限制

### 数据保护
- 敏感信息加密
- 数据脱敏处理
- 审计日志记录

## 性能优化

### 缓存策略
- 用户数据缓存
- 用户列表缓存
- 缓存失效机制

### 数据库优化
- 索引优化
- 查询优化
- 分页查询

### 外部服务优化
- 异步通知
- 批量处理
- 超时处理

## 部署和配置

### 环境变量
```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=user_management
DB_USER=postgres
DB_PASSWORD=password

# 缓存配置
USER_CACHE_TTL=3600
USER_CACHE_MAX_SIZE=1000

# 外部服务配置
USER_NOTIFICATION_ENABLED=true
USER_NOTIFICATION_TIMEOUT=5000

# 安全配置
USER_PASSWORD_MIN_LENGTH=8
USER_MAX_LOGIN_ATTEMPTS=5
USER_LOCKOUT_DURATION=300
```

### 依赖注入配置
```typescript
@Module({
  imports: [
    ConfigModule.forFeature(userInfrastructureConfig),
  ],
  providers: [
    UsersService,
    UserCacheService,
    UserNotificationService,
    {
      provide: 'UserRepository',
      useClass: UserRepositoryMikroOrm,
    },
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
```

## API文档

### 用户管理API

#### 创建用户
```http
POST /api/v1/users
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "13812345678",
  "organizationIds": ["org-1", "org-2"],
  "roleIds": ["role-1", "role-2"]
}
```

#### 获取用户列表
```http
GET /api/v1/users?page=1&limit=10&status=ACTIVE&sortBy=createdAt&sortOrder=desc
```

#### 获取用户详情
```http
GET /api/v1/users/{id}
```

#### 更新用户
```http
PUT /api/v1/users/{id}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "13812345678",
  "organizationIds": ["org-1"],
  "roleIds": ["role-1"]
}
```

#### 删除用户
```http
DELETE /api/v1/users/{id}
```

## 开发指南

### 添加新功能

1. **领域层** - 在领域层定义业务逻辑
2. **应用层** - 在应用层实现业务用例
3. **基础设施层** - 在基础设施层实现技术细节
4. **表现层** - 在表现层暴露API接口
5. **测试** - 为各层编写相应的测试

### 代码规范

- 使用TypeScript严格模式
- 遵循ESLint规则
- 使用TSDoc注释
- 遵循DDD和Clean Architecture原则

### 测试规范

- 单元测试覆盖率 > 90%
- 集成测试覆盖主要业务流程
- 数据库测试使用真实数据库
- API测试覆盖所有端点

## 总结

用户子领域已经完成了完整的开发，包括：

✅ **领域层** - 实体、值对象、仓储接口
✅ **应用层** - 应用服务、DTO、业务用例
✅ **基础设施层** - 仓储实现、缓存、外部服务、配置
✅ **表现层** - 控制器、API、响应DTO
✅ **测试覆盖** - 单元测试、集成测试、数据库测试
✅ **文档** - 完整的开发文档和API文档

该模块遵循了DDD和Clean Architecture的最佳实践，实现了高度模块化、可维护、可扩展的用户管理系统，支持多租户数据隔离，具备完整的测试覆盖和文档支持。 
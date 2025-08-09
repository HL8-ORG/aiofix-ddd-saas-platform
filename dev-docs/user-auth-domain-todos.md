# 用户与身份认证模块（User & Auth Domain）开发任务清单 - DDD + Clean Architecture + CQRS + Event Sourcing

## 概述

本模块整合用户管理和身份认证功能，采用DDD设计模式，实现完整的用户生命周期管理和安全认证体系。支持CQRS（命令查询职责分离）和事件溯源（Event Sourcing）架构。

## 快速参考

### 技术栈规范
- **UUID生成**：`import { generateUuid } from '@/shared/utils/uuid.util'`
- **UUID验证**：`import { isValidUuidV4 } from '@/shared/utils/uuid.util'`
- **Logger使用**：`import { Logger } from '@libs/pino-nestjs'`
- **禁止直接使用**：`uuid`库和`@nestjs/common`的Logger

### 代码示例
```typescript
// ✅ 正确的UUID使用方式
import { generateUuid, isValidUuidV4 } from '@/shared/utils/uuid.util'
const userId = generateUuid()
if (isValidUuidV4(userId)) { /* ... */ }

// ✅ 正确的Logger使用方式
import { Injectable } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'

@Injectable()
export class MyService {
  constructor(private readonly logger: Logger) {}
  
  someMethod() {
    this.logger.log('Some message')
  }
}

// ❌ 错误的使用方式
import { v4 as uuidv4 } from 'uuid'  // 禁止
import { Logger } from '@nestjs/common'  // 禁止
```

## 领域层开发任务

### 1. 值对象（Value Objects）

#### 1.1 用户相关值对象
- [x] Email 值对象
- [x] Password 值对象
- [x] PhoneNumber 值对象
- [x] UserName 值对象
- [x] UserId 值对象
- [x] UserStatus 值对象

#### 1.2 认证相关值对象
- [x] JWT Token 值对象
- [x] RefreshToken 值对象
- [x] SessionId 值对象

### 2. 聚合根（Aggregate Roots）

#### 2.1 用户聚合根
- [x] User 实体

#### 2.2 认证聚合根
- [x] AuthSession 实体
- [x] LoginAttempt 实体

### 3. 仓储接口（Repository Interfaces）

#### 3.1 用户仓储
- [x] UserRepository 接口（内存实现）
- [ ] 数据库实现

#### 3.2 认证仓储
- [x] AuthSessionRepository 接口
- [x] LoginAttemptRepository 接口

### 4. 领域服务（Domain Services）

#### 4.1 用户服务
- [x] UserAuthenticationService
- [x] PasswordPolicyService
- [x] UserStatusManagementService

#### 4.2 认证服务
- [x] JWTTokenService
- [x] SessionManagementService
- [x] LoginSecurityService

### 5. 领域事件（Domain Events）

#### 5.1 用户事件
- [x] UserCreatedEvent
- [x] UserActivatedEvent
- [x] UserLockedEvent
- [x] PasswordChangedEvent
- [x] UserLoginSuccessEvent
- [x] UserLoginFailureEvent

#### 5.2 认证事件
- [ ] SessionCreatedEvent
- [ ] SessionExpiredEvent
- [ ] SessionRevokedEvent
- [x] LoginAttemptFailedEvent
- [x] AccountLockedEvent

### 6. 领域异常（Domain Exceptions）

#### 6.1 用户异常
- [x] UserNotFoundException
- [x] UserAlreadyExistsException
- [x] InvalidUserDataException
- [x] UserStatusException

#### 6.2 认证异常
- [x] InvalidTokenException
- [x] TokenExpiredException
- [x] SessionNotFoundException
- [x] TooManyLoginAttemptsException
- [x] AccountLockedException

## 应用层开发任务

### 1. Commands & Queries (CQRS)

#### 1.1 用户命令
- [x] RegisterUserCommand
- [x] UpdateUserProfileCommand
- [x] ChangeUserPasswordCommand
- [x] ActivateUserCommand
- [x] DeactivateUserCommand
- [x] LockUserCommand
- [x] UnlockUserCommand
- [x] DeleteUserCommand

#### 1.2 用户查询
- [x] GetUserByIdQuery
- [x] GetUserByEmailQuery
- [x] GetUserByUsernameQuery
- [x] SearchUsersQuery
- [x] GetUsersByTenantQuery
- [x] GetUserProfileQuery

#### 1.3 认证命令
- [x] LoginUserCommand
- [x] LogoutUserCommand
- [x] RefreshTokenCommand
- [x] RevokeSessionCommand
- [x] ResetPasswordCommand
- [x] EnableTwoFactorAuthCommand
- [x] VerifyTwoFactorAuthCommand

#### 1.4 认证查询
- [x] ValidateSessionQuery
- [x] GetUserSessionsQuery
- [x] CheckLoginSecurityQuery
- [x] GetLoginAttemptsQuery

### 2. Use Cases (应用用例)

#### 2.1 用户管理用例
- [x] RegisterUserUseCase
- [x] UpdateUserProfileUseCase
- [x] ChangeUserPasswordUseCase
- [x] ActivateUserUseCase
- [x] DeactivateUserUseCase
- [x] LockUserUseCase
- [x] UnlockUserUseCase
- [x] DeleteUserUseCase

#### 2.2 用户查询用例
- [x] GetUserByIdUseCase
- [x] GetUserByEmailUseCase
- [x] GetUserByUsernameUseCase
- [ ] SearchUsersUseCase
- [ ] GetUsersByTenantUseCase
- [ ] GetUserProfileUseCase

#### 2.3 认证用例
- [x] LoginUserUseCase
- [x] LogoutUserUseCase
- [x] RefreshTokenUseCase
- [x] RevokeSessionUseCase
- [x] ResetPasswordUseCase
- [x] EnableTwoFactorAuthUseCase
- [x] VerifyTwoFactorAuthUseCase

#### 2.4 认证查询用例
- [x] ValidateSessionUseCase
- [x] GetUserSessionsUseCase
- [x] CheckLoginSecurityUseCase
- [x] GetLoginAttemptsUseCase

### 3. Command & Query Handlers

#### 3.1 命令处理器
- [x] RegisterUserCommandHandler
- [x] UpdateUserProfileCommandHandler
- [x] ChangeUserPasswordCommandHandler
- [x] ActivateUserCommandHandler
- [x] DeactivateUserCommandHandler
- [x] LockUserCommandHandler
- [x] UnlockUserCommandHandler
- [x] DeleteUserCommandHandler
- [x] LoginUserCommandHandler
- [x] LogoutUserCommandHandler
- [x] RefreshTokenCommandHandler
- [x] RevokeSessionCommandHandler
- [x] ResetPasswordCommandHandler
- [x] EnableTwoFactorAuthCommandHandler
- [x] VerifyTwoFactorAuthCommandHandler

#### 3.2 查询处理器
- [x] GetUserByIdQueryHandler
- [x] GetUserByEmailQueryHandler
- [x] GetUserByUsernameQueryHandler
- [ ] SearchUsersQueryHandler
- [ ] GetUsersByTenantQueryHandler
- [ ] GetUserProfileQueryHandler
- [x] ValidateSessionQueryHandler
- [ ] GetUserSessionsQueryHandler
- [ ] CheckLoginSecurityQueryHandler
- [x] GetLoginAttemptsQueryHandler

### 4. 应用服务（Application Services）

#### 4.1 用户管理服务
- [x] UserRegistrationService
- [x] UserManagementService
- [ ] UserProfileService

#### 4.2 认证服务
- [x] IAuthService 接口
- [x] BaseAuthService 抽象基类
- [ ] AuthenticationService 具体实现
- [ ] AuthorizationService
- [ ] SessionService

### 5. 事件处理器 (Event Handlers)

#### 5.1 用户事件处理器
- [ ] UserCreatedEventHandler
- [ ] UserActivatedEventHandler
- [ ] UserLockedEventHandler
- [ ] PasswordChangedEventHandler
- [ ] UserLoginSuccessEventHandler
- [ ] UserLoginFailureEventHandler

#### 5.2 认证事件处理器
- [ ] LoginAttemptFailedEventHandler
- [ ] AccountLockedEventHandler

### 6. 事件溯源 (Event Sourcing)

#### 6.1 事件存储
- [ ] EventStore 接口
- [ ] EventStore 内存实现
- [ ] EventStore 数据库实现

#### 6.2 事件投影
- [ ] UserProjection
- [ ] AuthSessionProjection
- [ ] LoginAttemptProjection

#### 6.3 快照管理
- [ ] SnapshotStore 接口
- [ ] SnapshotStore 实现
- [ ] SnapshotPolicy

### 7. 应用层DTO

#### 7.1 用户DTO
- [ ] UserDto
- [ ] CreateUserDto
- [ ] UpdateUserDto
- [ ] UserProfileDto

#### 7.2 认证DTO
- [ ] LoginDto
- [ ] RegisterDto
- [ ] TokenDto
- [ ] SessionDto

## 基础设施层开发任务

### 1. 数据库实现
- [ ] UserEntity (MikroORM)
- [ ] AuthSessionEntity
- [ ] LoginAttemptEntity

### 2. 外部服务集成
- [ ] EmailService
- [ ] SMSService
- [ ] FileStorageService

### 3. 缓存实现
- [ ] UserCacheService
- [ ] AuthCacheService

## 表现层开发任务

### 1. 控制器（Controllers）
- [ ] UserController
- [ ] AuthController

### 2. 中间件（Middlewares）
- [ ] JWTGuard
- [ ] SessionGuard
- [ ] RateLimitMiddleware

## 安全与合规

### 1. 安全策略
- [ ] 密码策略
- [ ] 会话策略
- [ ] 锁定策略

### 2. 合规要求
- [ ] 数据保护
- [ ] 审计日志
- [ ] 数据加密

## 测试策略

### 1. 单元测试
- [ ] 领域层测试
- [ ] 应用层测试
- [ ] 基础设施层测试

### 2. 集成测试
- [ ] API端点测试
- [ ] 数据库集成测试

## 开发规范

1. 使用 TypeScript 严格模式
2. 所有公共方法必须有完整的 TSDoc 注释
3. 每个功能必须有对应的单元测试
4. 遵循 DDD 的最佳实践和设计原则
5. 保持代码简洁、可读、可维护
6. 注重安全性和性能优化
7. 支持多租户架构
8. 实现完整的审计日志
9. 实现CQRS模式，分离命令和查询职责
10. 实现事件溯源，确保数据一致性和可追溯性

## 技术规范与注意事项

### UUID使用规范
- **统一使用UUID v4格式**：所有ID生成必须使用`@/shared/utils/uuid.util`提供的工具函数
- **UUID生成**：使用`generateUuid()`函数生成UUID v4
- **UUID验证**：使用`isValidUuidV4()`函数验证UUID v4格式
- **禁止直接使用uuid库**：不允许直接导入和使用`uuid`库，必须通过工具函数使用
- **值对象集成**：UserId等值对象内部使用`generateUuid()`和`isValidUuidV4()`进行ID管理

### 日志系统规范
- **统一使用自定义Logger**：所有模块必须使用`@libs/pino-nestjs`提供的Logger
- **禁止使用@nestjs/common的Logger**：不允许直接导入和使用`@nestjs/common`的Logger
- **Logger导入方式**：
  ```typescript
  import { Injectable } from '@nestjs/common'
  import { Logger } from '@libs/pino-nestjs'
  ```
- **Logger注入方式**：在构造函数中注入Logger
  ```typescript
  constructor(
    private readonly logger: Logger,
    // 其他依赖...
  ) {}
  ```

### 代码质量要求
- **类型安全**：严格使用TypeScript类型检查
- **错误处理**：统一的异常处理和错误响应格式
- **性能优化**：合理使用缓存和数据库查询优化
- **安全考虑**：输入验证、认证授权、数据加密
- **测试覆盖**：单元测试覆盖率不低于80%
- **文档完整**：所有公共API必须有完整的TSDoc注释

## 完成度统计

### 领域层: 85% ✅
- 值对象: 100% ✅
- 聚合根: 100% ✅  
- 仓储接口: 100% ✅
- 领域服务: 100% ✅
- 领域事件: 80% ✅
- 领域异常: 90% ✅

### 应用层: 85% ✅
- 认证用例: 90% ✅
- 用户管理用例: 100% ✅
- 命令处理器: 100% ✅
- 查询处理器: 80% ✅
- 事件处理器: 10% ❌
- 事件溯源: 0% ❌

### 基础设施层: 20% ❌
- 数据库实现: 0% ❌
- 外部服务: 0% ❌
- 缓存实现: 0% ❌

### 表现层: 10% ❌
- 控制器: 0% ❌
- 中间件: 0% ❌

## 下一步计划

### 优先级 1 (高优先级)
1. 完善剩余的用户查询用例 (SearchUsers, GetUsersByTenant, GetUserProfile)
2. 实现数据库层 (UserEntity, AuthSessionEntity, LoginAttemptEntity)
3. 创建表现层控制器 (UserController, AuthController)
4. 实现事件处理器

### 优先级 2 (中优先级)
1. 实现事件处理器
2. 实现事件溯源
3. 完善应用层DTO
4. 添加单元测试和集成测试

### 优先级 3 (低优先级)
1. 实现外部服务集成
2. 实现缓存层
3. 完善安全策略
4. 优化性能和监控

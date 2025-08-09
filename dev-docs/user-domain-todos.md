# 用户领域（User Domain）开发任务清单 - 已完成 ✅

> **注意：** 此文件已被新的综合开发计划替代，请参考 `user-auth-domain-todos.md`

## 领域层开发任务

### 1. 值对象（Value Objects）
- [x] 创建 Email 值对象
  - [x] 实现邮箱格式验证
  - [x] 实现值对象的相等性比较
  - [x] 添加单元测试
- [x] 创建 Password 值对象
  - [x] 实现密码强度验证
  - [x] 实现密码哈希处理
  - [x] 添加单元测试
- [x] 创建 PhoneNumber 值对象
  - [x] 实现手机号格式验证
  - [x] 实现国际化手机号支持
  - [x] 添加单元测试
- [x] 创建 UserName 值对象
  - [x] 实现用户名格式验证
  - [x] 实现唯一性检查
  - [x] 添加单元测试

### 2. 用户聚合根（User Aggregate Root）
- [x] 定义用户实体的属性和行为
  - [x] 基本属性（ID、邮箱、用户名等）
  - [x] 状态属性（激活状态、锁定状态、暂停状态）
  - [x] 安全属性（密码哈希等）
- [x] 实现用户实体的业务规则
  - [x] 用户创建规则
  - [x] 用户状态变更规则（含 suspend/restore）
  - [x] 密码修改规则（记录 passwordChangedAt）
- [x] 实现用户实体的领域方法
  - [x] 激活/停用/暂停/恢复
  - [x] 锁定/解锁
  - [x] 密码修改/重置

### 3. 用户仓储接口（User Repository Interface）
- [x] 定义仓储接口方法
  - [x] 查找用户（按ID、邮箱、用户名）
  - [x] 保存用户
  - [x] 删除用户
  - [x] 更新用户
- [x] 定义仓储的查询规范
  - [x] 分页查询
  - [x] 条件过滤
  - [x] 排序规则
- [x] 实现仓储（内存版本）
  - [x] 完整实现所有接口方法
  - [x] 支持多租户数据隔离
  - [x] 实现查询规范和过滤功能
  - [x] 添加完整的单元测试

### 4. 领域事件（Domain Events）
- [x] 创建用户相关事件
  - [x] UserCreatedEvent
  - [x] UserActivatedEvent
  - [x] UserLockedEvent
  - [x] PasswordChangedEvent
  - [x] UserLoginSuccessEvent
  - [x] UserLoginFailureEvent
- [x] 实现事件处理器
  - [x] 事件发布机制（集成 @nestjs/cqrs，`UsersModule` 已引入并导出）
  - [x] 事件订阅机制（登录成功/失败事件处理器已注册）
  - [x] 事件处理逻辑（接入审计服务，记录用户登录审计）

### 5. 领域服务（Domain Services）
- [x] 实现用户认证服务
  - [x] 密码验证
  - [ ] Token生成和验证
  - [ ] 会话管理
- [x] 实现用户授权服务（领域层）
  - [x] 角色检查（`AuthorizationService.isInRole`）
  - [x] 权限验证（`AuthorizationService.can/hasAny/hasAll`）
  - [x] 访问控制（支持租户隔离校验 `tenantId/resourceTenantId`）
  - [ ] 策略提供者实现（`AuthorizationPolicyProvider` 的基础设施实现与缓存优化）

### 6. 领域异常（Domain Exceptions）
- [x] 创建用户相关异常类
  - [x] UserNotFoundException
  - [x] InvalidPasswordException / IncorrectPasswordException
  - [x] UserLockedException
  - [x] DuplicateUserException
- [ ] 实现异常处理机制
  - [ ] 异常分类
  - [ ] 错误码定义
  - [ ] 错误消息国际化

### 7. 密码处理服务
- [ ] 实现密码加密服务
  - [x] bcrypt 算法集成（通过值对象/服务使用）
  - [x] 密码哈希生成
  - [x] 密码验证
- [x] 实现密码策略服务
  - [x] 密码强度检查
  - [ ] 密码历史记录
  - [x] 密码过期策略

### 8. 用户状态管理
- [x] 实现状态枚举和转换
  - [x] 定义用户状态（Pending、Active、Inactive、Locked、Suspended、Deleted）
  - [x] 实现状态转换规则
  - [x] 状态变更验证
- [ ] 实现状态相关的业务规则
  - [ ] 状态变更权限控制
  - [ ] 状态变更通知
  - [ ] 状态变更日志

### 9. 多因素认证
- [ ] 实现 TOTP 认证
  - [ ] TOTP 密钥生成
  - [ ] TOTP 验证码验证
  - [ ] TOTP 配置管理
- [ ] 实现 SMS 认证
  - [ ] 短信验证码生成
  - [ ] 短信发送集成
  - [ ] 验证码验证
- [ ] 实现 Email 认证
  - [ ] 邮件验证码生成
  - [ ] 邮件发送集成
  - [ ] 验证码验证

### 10. 单元测试
- [ ] 编写值对象测试
  - [x] 验证规则测试（Email、PhoneNumber）
  - [ ] 相等性比较测试
  - [ ] 边界条件测试
- [ ] 编写实体测试
  - [ ] 业务规则测试
  - [ ] 状态转换测试
  - [ ] 方法行为测试
- [x] 编写服务测试
  - [x] 认证流程测试
  - [x] 密码处理测试
  - [ ] 多因素认证测试

## 注意事项
1. 所有代码必须遵循 TypeScript 严格模式
2. 所有公共方法必须有完整的 TSDoc 注释
3. 每个功能必须有对应的单元测试
4. 遵循 DDD 的最佳实践和设计原则
5. 保持代码简洁、可读、可维护

## 开发规范
1. 使用 TypeScript 装饰器进行元数据定义
2. 使用不可变对象设计
3. 使用 UUID v4 作为实体标识
4. 实现审计字段（创建时间、更新时间、版本等）
5. 使用强类型和类型推导

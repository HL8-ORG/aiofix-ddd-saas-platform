import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { UserLoginSuccessEventHandler } from './domain/events/handlers/user-login-success.handler'
import { UserLoginFailureEventHandler } from './domain/events/handlers/user-login-failure.handler'
// 授权相关提供者已迁移到 AuthModule，这里不重复提供，避免循环依赖

/**
 * @module UsersModule
 * @description
 * 用户模块：注册用户领域相关的CQRS事件处理器等。
 */
@Module({
  imports: [CqrsModule],
  providers: [
    // 事件处理器
    UserLoginSuccessEventHandler,
    UserLoginFailureEventHandler,
    // 提供一个简单的审计服务token，默认输出到控制台（可在上层模块替换）
    {
      provide: 'AUDIT_SERVICE',
      useValue: {
        async log(entry: any) {
          // eslint-disable-next-line no-console
          console.info('[AUDIT]', entry)
        },
      },
    },
  ],
  exports: [],
})
export class UsersModule { }



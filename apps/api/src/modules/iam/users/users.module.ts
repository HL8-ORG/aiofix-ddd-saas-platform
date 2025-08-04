import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { UsersService } from './application/users.service'
import { UserCacheService } from './infrastructure/cache/user-cache.service'
import { userInfrastructureConfig } from './infrastructure/config/user-infrastructure.config'
import { UserNotificationService } from './infrastructure/external/user-notification.service'
import { UserRepositoryMemory } from './infrastructure/repositories/user.repository.memory'
import { UsersController } from './presentation/controllers/users.controller'

/**
 * @class UsersModule
 * @description
 * 用户模块，负责注册用户相关的控制器、服务、仓储等。
 * 这是用户子领域的模块定义，遵循DDD和Clean Architecture原则。
 *
 * 主要原理与机制：
 * 1. 使用@Module装饰器定义模块，包含controllers、providers、exports等
 * 2. 通过依赖注入容器管理各组件间的依赖关系
 * 3. 使用token 'UserRepository' 实现仓储接口的依赖倒置
 * 4. 导出UsersService供其他模块使用
 */
@Module({
  imports: [ConfigModule.forFeature(userInfrastructureConfig)],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserCacheService,
    UserNotificationService,
    {
      provide: 'UserRepository',
      useClass: UserRepositoryMemory,
    },
  ],
  exports: [UsersService, UserCacheService, UserNotificationService],
})
export class UsersModule {}

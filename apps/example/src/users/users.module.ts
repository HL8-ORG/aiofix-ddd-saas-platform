import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from 'src/entities/user.entity';
import { Role } from 'src/entities/role.entity';
import { IsDomainUnique } from './validators/is-domain-unique.validator';

/**
 * @module UsersModule
 * @description
 * 用户模块，负责用户领域的依赖注入、控制器、服务、实体、校验器等的统一注册与导出。
 *
 * 代码原理与机制说明：
 * 1. 通过`@Module`装饰器声明模块，组织用户相关的所有依赖，便于功能解耦与复用。
 * 2. imports:
 *    - `MikroOrmModule.forFeature([User, Role])`：注册User和Role两个实体到MikroORM上下文，
 *      使其在本模块内可通过依赖注入方式获取对应的Repository，实现数据库操作。
 * 3. controllers:
 *    - `UsersController`：负责处理用户相关的HTTP请求（如增删改查），并结合策略实现权限控制。
 * 4. providers:
 *    - `UsersService`：封装用户业务逻辑，负责与Repository交互、数据校验、业务处理等。
 *    - `IsDomainUnique`：自定义字段唯一性校验器，用于校验用户域名等字段的唯一性，提升数据一致性。
 * 5. exports:
 *    - `UsersService`：将用户服务导出，允许其他模块（如认证模块）通过依赖注入复用用户相关业务逻辑。
 *
 * 该模块实现了用户领域的高内聚、低耦合，便于后续扩展和维护。
 */
@Module({
  imports: [MikroOrmModule.forFeature([User, Role])],
  controllers: [UsersController],
  providers: [UsersService, IsDomainUnique],
  exports: [UsersService],
})
export class UsersModule {}

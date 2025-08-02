import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Global, Module } from '@nestjs/common';
import { IsUnique } from 'src/common/validators/is-unique.validator';
import { Permission } from 'src/entities/permission.entity';
import { Role } from 'src/entities/role.entity';
import { User } from 'src/entities/user.entity';

/**
 * @module ValidatorsModule
 * @description
 * 全局校验器模块，负责注册自定义校验器（如唯一性校验器IsUnique），并将其导出供全局使用。
 *
 * 代码原理与机制说明：
 * 1. 使用@Global()装饰器声明为全局模块，导出的校验器在整个NestJS应用中均可注入和复用，无需在每个模块单独导入。
 * 2. 通过@Module装饰器配置模块元数据：
 *    - imports: 使用MikroOrmModule.forFeature([User, Role, Permission])，将User、Role、Permission实体注册到当前模块，
 *      便于自定义校验器（如IsUnique）在校验时通过依赖注入获取对应实体的Repository，实现数据库层面的唯一性校验。
 *    - providers: 注册IsUnique校验器为可注入服务，支持依赖注入机制。
 *    - exports: 将IsUnique导出，使其在其他模块中也能被依赖和使用，提升校验器的复用性。
 * 3. 该模块设计用于集中管理所有自定义校验器，便于后续扩展和维护。
 */
@Global()
@Module({
  imports: [MikroOrmModule.forFeature([User, Role, Permission])],
  providers: [IsUnique],
  exports: [IsUnique],
})
export class ValidatorsModule {}

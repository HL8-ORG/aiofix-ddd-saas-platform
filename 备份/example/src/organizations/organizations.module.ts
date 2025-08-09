import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Organization } from 'src/entities/organization.entity';

/**
 * @module OrganizationsModule
 * @description
 * 组织（Organization）功能模块，负责组织实体的依赖注入、控制器注册与服务导出。
 *
 * 代码原理与机制说明：
 * 1. 通过@Module装饰器声明为NestJS模块，集中管理组织相关的依赖与功能。
 * 2. imports: 引入MikroOrmModule.forFeature([Organization])，将Organization实体注册到MikroORM上下文，
 *    使其支持依赖注入EntityManager和自定义Repository，便于后续的ORM操作。
 * 3. controllers: 注册OrganizationsController，负责处理组织相关的HTTP请求与路由分发。
 * 4. providers: 注册OrganizationsService，封装组织的业务逻辑与数据操作，供控制器和其他模块调用。
 * 5. exports: 导出OrganizationsService，允许其他模块（如租户模块、用户模块等）复用组织服务，实现跨模块的业务协作。
 *
 * 该模块作为组织管理的核心入口，确保组织相关的实体、服务与控制器均可被NestJS依赖注入系统自动管理，
 * 并结合MikroORM实现高效的数据持久化与多租户隔离。
 */
@Module({
  imports: [MikroOrmModule.forFeature([Organization])],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}

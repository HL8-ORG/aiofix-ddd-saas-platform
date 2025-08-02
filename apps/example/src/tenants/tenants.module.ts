import { Module } from '@nestjs/common';
import { TenantSubscriber } from './subscribers/tenants.subscriber';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TenantInterceptor } from './tenants.interceptor';
import { TenantAwareSubscriber } from './subscribers/tenant-aware.subscriber';

/**
 * @module TenantModule
 * @description
 * 多租户核心模块，负责在NestJS应用中集成多租户相关的拦截器与ORM事件订阅器，实现租户级别的数据隔离与自动注入。
 *
 * 代码原理与机制说明：
 * 1. 通过@Module装饰器声明为NestJS模块，集中注册多租户相关的核心能力。
 * 2. providers数组中注册了两个ORM事件订阅器（TenantSubscriber、TenantAwareSubscriber）：
 *    - TenantSubscriber：专注于租户（Tenant）实体的生命周期事件，自动拼接和规范租户域名，确保所有新建租户的domain字段符合统一规范。
 *    - TenantAwareSubscriber：为所有需要租户隔离的实体自动注入tenant字段，实现多租户数据的自动隔离，防止数据串租。
 * 3. 通过APP_INTERCEPTOR全局注册TenantInterceptor拦截器：
 *    - 该拦截器会在每次HTTP请求时自动为MikroORM的EntityManager添加租户过滤器，根据当前登录用户的租户ID动态过滤数据，实现ORM层面的租户隔离。
 *    - 支持通过元数据灵活跳过租户隔离（如公开接口、特殊接口等）。
 * 4. exports导出两个订阅器，便于其他模块按需依赖和扩展多租户能力。
 *
 * 该模块作为多租户系统的基础设施，确保所有数据访问和实体操作都自动带有租户上下文，极大提升系统的数据安全性和隔离性。
 */
@Module({
  providers: [
    TenantAwareSubscriber,
    TenantSubscriber,
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantInterceptor,
    },
  ],
  exports: [TenantSubscriber, TenantAwareSubscriber],
})
export class TenantModule {}

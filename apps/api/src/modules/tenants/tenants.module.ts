import { Module } from '@nestjs/common';
import { TenantsController } from './presentation/tenants.controller';
import { TenantsService } from './application/tenants.service';
import { TenantRepositoryMemory } from './infrastructure/repositories/tenant.repository.memory';

/**
 * @class TenantsModule
 * @description
 * 租户模块，负责组装租户相关的所有组件。
 * 
 * 主要原理与机制：
 * 1. 使用@Module装饰器定义模块
 * 2. 注册控制器、服务、仓储等组件
 * 3. 配置依赖注入，将接口绑定到具体实现
 * 4. 遵循DDD分层架构原则
 */
@Module({
  controllers: [TenantsController],
  providers: [
    TenantsService,
    {
      provide: 'TenantRepository',
      useClass: TenantRepositoryMemory,
    },
  ],
  exports: [TenantsService],
})
export class TenantsModule { } 
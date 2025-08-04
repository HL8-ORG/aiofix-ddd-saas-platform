import { Module } from '@nestjs/common'
import { TenantsService } from './application/tenants.service'
import { CreateTenantUseCase } from './application/use-cases/create-tenant.use-case'
import { DeleteTenantUseCase } from './application/use-cases/delete-tenant.use-case'
import { GetTenantStatisticsUseCase } from './application/use-cases/get-tenant-statistics.use-case'
import { GetTenantUseCase } from './application/use-cases/get-tenant.use-case'
import { GetTenantsUseCase } from './application/use-cases/get-tenants.use-case'
import { SearchTenantsUseCase } from './application/use-cases/search-tenants.use-case'
import { UpdateTenantStatusUseCase } from './application/use-cases/update-tenant-status.use-case'
import { UpdateTenantUseCase } from './application/use-cases/update-tenant.use-case'
import { TenantRepositoryMemory } from './infrastructure/repositories/tenant.repository.memory'
import { TenantsController } from './presentation/tenants.controller'

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
 * 5. 注册所有Use Cases以支持依赖注入
 */
@Module({
  controllers: [TenantsController],
  providers: [
    TenantsService,
    CreateTenantUseCase,
    GetTenantUseCase,
    GetTenantsUseCase,
    UpdateTenantUseCase,
    UpdateTenantStatusUseCase,
    DeleteTenantUseCase,
    SearchTenantsUseCase,
    GetTenantStatisticsUseCase,
    {
      provide: 'TenantRepository',
      useClass: TenantRepositoryMemory,
    },
  ],
  exports: [TenantsService],
})
export class TenantsModule { }

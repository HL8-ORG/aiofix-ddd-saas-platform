import { Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { TenantEntity } from './infrastructure/entities/mikro/tenant.entity.mikro'
import { TenantRepository } from './infrastructure/repositories/mikro/tenant.repository.mikro'
import { TenantService } from './infrastructure/services/tenant.service'
import { TenantDomainService } from './domain/services/tenant-domain.service'
import { TENANT_SERVICE_TOKEN } from './application/services/interfaces/tenant-service.interface'
import { TenantValidator } from './application/validators/tenant-validator'

// 应用层组件
import { CreateTenantHandler } from './application/handlers/create-tenant.handler'
import { GetTenantByIdHandler } from './application/handlers/get-tenant-by-id.handler'
import { ActivateTenantHandler } from './application/handlers/activate-tenant.handler'
import { SuspendTenantHandler } from './application/handlers/suspend-tenant.handler'

// Use Cases
import { CreateTenantUseCase } from './application/use-cases/create-tenant.use-case'
import { GetTenantByIdUseCase } from './application/use-cases/get-tenant-by-id.use-case'
import { ActivateTenantUseCase } from './application/use-cases/activate-tenant.use-case'
import { SearchTenantsUseCase } from './application/use-cases/search-tenants.use-case'
import { UpdateTenantSettingsUseCase } from './application/use-cases/update-tenant-settings.use-case'
import { SuspendTenantUseCase } from './application/use-cases/suspend-tenant.use-case'

// 表现层组件
import { TenantsController } from './presentation/controllers/tenants.controller'

/**
 * @class TenantsModule
 * @description
 * 租户模块，整合租户子领域的所有组件。
 * 该模块采用DDD架构，包含领域层、应用层和基础设施层的所有组件。
 * 
 * 主要原理与机制：
 * 1. 使用@Module装饰器定义模块，提供依赖注入配置
 * 2. 使用MikroOrmModule.forFeature注册数据库实体
 * 3. 使用providers配置服务、处理器和Use Cases
 * 4. 使用exports导出需要被其他模块使用的组件
 * 5. 实现依赖倒置，通过接口进行依赖注入
 */
@Module({
  imports: [
    // 注册数据库实体
    MikroOrmModule.forFeature([TenantEntity]),
  ],
  providers: [
    // 领域服务
    TenantDomainService,

    // 基础设施层服务
    TenantRepository,
    TenantService,

    // 应用层验证器
    TenantValidator,

    // Use Cases
    CreateTenantUseCase,
    GetTenantByIdUseCase,
    ActivateTenantUseCase,
    SearchTenantsUseCase,
    UpdateTenantSettingsUseCase,
    SuspendTenantUseCase,

    // 命令和查询处理器
    CreateTenantHandler,
    GetTenantByIdHandler,
    ActivateTenantHandler,
    SuspendTenantHandler,

    // 依赖注入配置 - 将实现绑定到接口
    {
      provide: TENANT_SERVICE_TOKEN,
      useClass: TenantService,
    },
    {
      provide: 'ITenantRepository',
      useClass: TenantRepository,
    },
  ],
  controllers: [
    // 表现层控制器
    TenantsController,
  ],
  exports: [
    // 导出服务接口，供其他模块使用
    TENANT_SERVICE_TOKEN,

    // 导出处理器，供表现层使用
    CreateTenantHandler,
    GetTenantByIdHandler,
    ActivateTenantHandler,
    SuspendTenantHandler,
  ],
})
export class TenantsModule { }

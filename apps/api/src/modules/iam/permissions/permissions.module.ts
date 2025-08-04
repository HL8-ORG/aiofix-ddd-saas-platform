import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { PermissionOrmEntity } from './infrastructure/entities/permission.orm.entity'
import { PermissionRepositoryMikroOrm } from './infrastructure/repositories/permission.repository.mikroorm'
import { PermissionConfigService } from './infrastructure/services/permission-config.service'
import { CreatePermissionUseCase } from './application/use-cases/create-permission.use-case'
import { UpdatePermissionUseCase } from './application/use-cases/update-permission.use-case'
import { DeletePermissionUseCase } from './application/use-cases/delete-permission.use-case'
import { GetPermissionUseCase } from './application/use-cases/get-permission.use-case'
import { GetPermissionsUseCase } from './application/use-cases/get-permissions.use-case'
import { SearchPermissionsUseCase } from './application/use-cases/search-permissions.use-case'
import { CountPermissionsUseCase } from './application/use-cases/count-permissions.use-case'
import { UpdatePermissionStatusUseCase } from './application/use-cases/update-permission-status.use-case'
import { GetPermissionStatisticsUseCase } from './application/use-cases/get-permission-statistics.use-case'
import { PermissionsController } from './presentation/controllers/permissions.controller'
import { permissionConfig } from './infrastructure/config/permission.config'

/**
 * @module PermissionsModule
 * @description
 * 权限模块，整合权限管理的所有组件。
 * 
 * 主要原理与机制：
 * 1. 使用NestJS模块系统组织代码结构
 * 2. 通过依赖注入管理组件间的依赖关系
 * 3. 整合领域层、应用层、基础设施层和展示层
 * 4. 提供完整的权限管理功能
 * 5. 支持多租户架构
 * 6. 遵循DDD和Clean Architecture设计原则
 * 7. 集成配置管理，支持环境变量配置
 */
@Module({
  imports: [
    ConfigModule.forFeature(permissionConfig),
    MikroOrmModule.forFeature([PermissionOrmEntity]),
  ],
  controllers: [PermissionsController],
  providers: [
    // 配置服务
    PermissionConfigService,
    // 仓储层
    {
      provide: 'PermissionRepository',
      useClass: PermissionRepositoryMikroOrm,
    },
    // 应用层用例
    CreatePermissionUseCase,
    UpdatePermissionUseCase,
    DeletePermissionUseCase,
    GetPermissionUseCase,
    GetPermissionsUseCase,
    SearchPermissionsUseCase,
    CountPermissionsUseCase,
    UpdatePermissionStatusUseCase,
    GetPermissionStatisticsUseCase,
  ],
  exports: [
    // 导出配置服务，供其他模块使用
    PermissionConfigService,
    // 导出仓储接口，供其他模块使用
    'PermissionRepository',
    // 导出用例，供其他模块使用
    CreatePermissionUseCase,
    UpdatePermissionUseCase,
    DeletePermissionUseCase,
    GetPermissionUseCase,
    GetPermissionsUseCase,
    SearchPermissionsUseCase,
    CountPermissionsUseCase,
    UpdatePermissionStatusUseCase,
    GetPermissionStatisticsUseCase,
  ],
})
export class PermissionsModule { } 
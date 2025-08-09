/**
 * @file application/index.ts
 * @description 租户应用层模块索引文件
 * 
 * 该文件导出应用层的所有组件，包括：
 * - 命令和查询
 * - 用例
 * - 处理器
 * - DTOs
 * - 验证器
 * - 服务接口
 */

// 导出命令
export { CreateTenantCommand, CreateTenantCommandDto } from './commands/create-tenant.command'
export { ActivateTenantCommand, ActivateTenantCommandDto } from './commands/activate-tenant.command'

// 导出查询
export { GetTenantByIdQuery, GetTenantByIdQueryDto } from './queries/get-tenant-by-id.query'

// 导出用例
export {
  CreateTenantUseCase,
  GetTenantByIdUseCase,
  ActivateTenantUseCase,
  SearchTenantsUseCase,
  UpdateTenantSettingsUseCase
} from './use-cases'
export type {
  CreateTenantUseCaseResult,
  GetTenantByIdUseCaseResult,
  ActivateTenantUseCaseResult,
  SearchTenantsUseCaseResult,
  UpdateTenantSettingsUseCaseResult
} from './use-cases'

// 导出处理器
export { CreateTenantHandler } from './handlers/create-tenant.handler'
export { GetTenantByIdHandler } from './handlers/get-tenant-by-id.handler'
export { ActivateTenantHandler } from './handlers/activate-tenant.handler'

// 导出DTOs
export { TenantDto } from './dto/tenant.dto'
export { AdminUserDto } from './dto/admin-user.dto'
export { TenantSettingsDto } from './dto/tenant-settings.dto'
export { TenantStatisticsDto } from './dto/tenant-statistics.dto'

// 导出验证器
export { TenantValidator } from './validators/tenant-validator'

// 导出服务接口
export { TENANT_SERVICE_TOKEN } from './services/interfaces/tenant-service.interface'
export type { ITenantService } from './services/interfaces/tenant-service.interface'

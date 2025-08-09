/**
 * @file use-cases/index.ts
 * @description 用例模块索引文件
 * 
 * 该文件导出所有租户相关的用例，包括：
 * - 创建租户用例
 * - 查询租户用例
 * - 激活租户用例
 * - 搜索租户用例
 * - 更新租户设置用例
 * - 其他租户管理用例
 */

// 导出用例类
export { CreateTenantUseCase } from './create-tenant.use-case'
export { GetTenantByIdUseCase } from './get-tenant-by-id.use-case'
export { ActivateTenantUseCase } from './activate-tenant.use-case'
export { SearchTenantsUseCase } from './search-tenants.use-case'
export { UpdateTenantSettingsUseCase } from './update-tenant-settings.use-case'
export { SuspendTenantUseCase } from './suspend-tenant.use-case'

// 导出用例结果接口
export type { CreateTenantUseCaseResult } from './create-tenant.use-case'
export type { GetTenantByIdUseCaseResult } from './get-tenant-by-id.use-case'
export type { ActivateTenantUseCaseResult } from './activate-tenant.use-case'
export type { SearchTenantsUseCaseResult } from './search-tenants.use-case'
export type { UpdateTenantSettingsUseCaseResult } from './update-tenant-settings.use-case'
export type { SuspendTenantUseCaseResult } from './suspend-tenant.use-case'

/**
 * @constant TENANT_SERVICE_TOKEN
 * @description 租户服务的依赖注入令牌
 */
export const TENANT_SERVICE_TOKEN = 'TENANT_SERVICE_TOKEN'

/**
 * @interface ITenantService
 * @description
 * 租户服务接口，定义租户相关的业务操作契约。该接口采用依赖倒置原则，
 * 确保应用层不依赖具体的服务实现，而是依赖抽象。
 *
 * 主要原理与机制：
 * 1. 租户生命周期管理：创建、激活、禁用、删除租户
 * 2. 租户配置管理：设置、更新、查询租户配置
 * 3. 租户统计信息：获取租户使用统计
 * 4. 多租户隔离：确保租户间数据隔离
 * 5. 事件发布：业务操作完成后发布领域事件
 * 6. 审计日志：记录关键操作的审计日志
 */
export interface ITenantService {
  // 租户生命周期管理
  createTenant(command: CreateTenantCommand): Promise<CreateTenantResult>
  activateTenant(command: ActivateTenantCommand): Promise<ActivateTenantResult>
  suspendTenant(command: SuspendTenantCommand): Promise<SuspendTenantResult>
  deleteTenant(command: DeleteTenantCommand): Promise<DeleteTenantResult>
  restoreTenant(command: RestoreTenantCommand): Promise<RestoreTenantResult>

  // 租户查询
  getTenantById(query: GetTenantByIdQuery): Promise<GetTenantByIdResult>
  searchTenants(query: SearchTenantsQuery): Promise<SearchTenantsResult>
  getAllTenants(query: GetAllTenantsQuery): Promise<GetAllTenantsResult>

  // 租户配置管理
  updateTenantSettings(
    command: UpdateTenantSettingsCommand,
  ): Promise<UpdateTenantSettingsResult>
  getTenantSettings(
    query: GetTenantSettingsQuery,
  ): Promise<GetTenantSettingsResult>

  // 租户统计
  getTenantStatistics(
    query: GetTenantStatisticsQuery,
  ): Promise<GetTenantStatisticsResult>
}

/**
 * @interface CreateTenantCommand
 * @description 创建租户命令
 */
export interface CreateTenantCommand {
  name: string
  code: string
  description?: string
  adminUserInfo: {
    username: string
    email: string
    password: string
    firstName: string
    lastName: string
  }
  settings?: Record<string, any>
  metadata?: Record<string, any>
}

/**
 * @interface CreateTenantResult
 * @description 创建租户结果
 */
export interface CreateTenantResult {
  success: boolean
  tenantId?: string
  adminUserId?: string
  message?: string
  error?: string
}

/**
 * @interface ActivateTenantCommand
 * @description 激活租户命令
 */
export interface ActivateTenantCommand {
  tenantId: string
  reason?: string
  activatedBy: string
}

/**
 * @interface ActivateTenantResult
 * @description 激活租户结果
 */
export interface ActivateTenantResult {
  success: boolean
  tenantId?: string
  message?: string
  error?: string
}

/**
 * @interface SuspendTenantCommand
 * @description 禁用租户命令
 */
export interface SuspendTenantCommand {
  tenantId: string
  reason?: string
  suspendedBy: string
}

/**
 * @interface SuspendTenantResult
 * @description 禁用租户结果
 */
export interface SuspendTenantResult {
  success: boolean
  tenantId?: string
  message?: string
  error?: string
  warnings?: string[]
}

/**
 * @interface DeleteTenantCommand
 * @description 删除租户命令
 */
export interface DeleteTenantCommand {
  tenantId: string
  reason?: string
  deletedBy: string
}

/**
 * @interface DeleteTenantResult
 * @description 删除租户结果
 */
export interface DeleteTenantResult {
  success: boolean
  tenantId?: string
  message?: string
  error?: string
}

/**
 * @interface RestoreTenantCommand
 * @description 恢复租户命令
 */
export interface RestoreTenantCommand {
  tenantId: string
  reason?: string
  restoredBy: string
}

/**
 * @interface RestoreTenantResult
 * @description 恢复租户结果
 */
export interface RestoreTenantResult {
  success: boolean
  tenantId?: string
  message?: string
  error?: string
}

/**
 * @interface GetTenantByIdQuery
 * @description 根据ID查询租户
 */
export interface GetTenantByIdQuery {
  tenantId: string
}

/**
 * @interface GetTenantByIdResult
 * @description 根据ID查询租户结果
 */
export interface GetTenantByIdResult {
  success: boolean
  tenant?: TenantDto
  error?: string
}

/**
 * @interface SearchTenantsQuery
 * @description 搜索租户查询
 */
export interface SearchTenantsQuery {
  page?: number
  size?: number
  status?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * @interface SearchTenantsResult
 * @description 搜索租户结果
 */
export interface SearchTenantsResult {
  success: boolean
  tenants?: TenantDto[]
  pagination?: {
    page: number
    size: number
    total: number
    totalPages: number
  }
  error?: string
}

/**
 * @interface GetAllTenantsQuery
 * @description 获取所有租户查询
 */
export interface GetAllTenantsQuery {
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * @interface GetAllTenantsResult
 * @description 获取所有租户结果
 */
export interface GetAllTenantsResult {
  success: boolean
  tenants?: TenantDto[]
  error?: string
}

/**
 * @interface UpdateTenantSettingsCommand
 * @description 更新租户配置命令
 */
export interface UpdateTenantSettingsCommand {
  tenantId: string
  settings: Record<string, any>
  updatedBy: string
}

/**
 * @interface UpdateTenantSettingsResult
 * @description 更新租户配置结果
 */
export interface UpdateTenantSettingsResult {
  success: boolean
  tenantId?: string
  message?: string
  error?: string
}



/**
 * @interface GetTenantSettingsQuery
 * @description 获取租户配置查询
 */
export interface GetTenantSettingsQuery {
  tenantId: string
}

/**
 * @interface GetTenantSettingsResult
 * @description 获取租户配置结果
 */
export interface GetTenantSettingsResult {
  success: boolean
  settings?: Record<string, any>
  error?: string
}

/**
 * @interface GetTenantStatisticsQuery
 * @description 获取租户统计查询
 */
export interface GetTenantStatisticsQuery {
  tenantId: string
  period?: string // daily, weekly, monthly, yearly
}

/**
 * @interface GetTenantStatisticsResult
 * @description 获取租户统计结果
 */
export interface GetTenantStatisticsResult {
  success: boolean
  statistics?: {
    totalUsers: number
    activeUsers: number
    totalOrganizations: number
    totalRoles: number
    lastLoginTime?: Date
    createdDate: Date
  }
  error?: string
}

// 导入统一的TenantDto类型
import type { TenantDto } from '../../dto/tenant.dto'

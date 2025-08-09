import { Injectable, Inject } from '@nestjs/common'

/**
 * @interface PermissionConfigType
 * @description 权限配置类型定义
 */
interface PermissionConfigType {
  database: {
    tableName: string
    enableSoftDelete: boolean
    enableAuditLog: boolean
    maxBatchSize: number
    queryTimeout: number
  }
  cache: {
    enabled: boolean
    ttl: number
    maxSize: number
    prefix: string
  }
  policy: {
    enableSystemPermissionProtection: boolean
    enableDefaultPermissionProtection: boolean
    maxPermissionsPerTenant: number
    maxPermissionsPerOrganization: number
    enablePermissionTreeValidation: boolean
    enablePermissionConditionValidation: boolean
    enablePermissionFieldValidation: boolean
  }
  validation: {
    enableNameUniquenessCheck: boolean
    enableCodeUniquenessCheck: boolean
    enableParentPermissionValidation: boolean
    enableRolePermissionValidation: boolean
    enableResourcePermissionValidation: boolean
    maxNameLength: number
    maxCodeLength: number
    maxDescriptionLength: number
    maxResourceLength: number
    maxModuleLength: number
    maxTagsLength: number
  }
  search: {
    enableFullTextSearch: boolean
    enableFuzzySearch: boolean
    enableSuggestions: boolean
    maxSearchResults: number
    searchIndexFields: string[]
    enableSearchHighlight: boolean
  }
}

/**
 * @class PermissionConfigService
 * @description
 * 权限配置服务，负责管理权限模块的配置。
 * 
 * 主要原理与机制：
 * 1. 使用NestJS的配置注入机制
 * 2. 提供类型安全的配置访问
 * 3. 支持配置的动态更新
 * 4. 提供配置验证和默认值
 * 5. 支持不同环境的配置管理
 */
@Injectable()
export class PermissionConfigService {
  constructor(
    @Inject('permission')
    private readonly config: PermissionConfigType,
  ) { }

  /**
   * @method getDatabaseConfig
   * @description 获取数据库配置
   */
  getDatabaseConfig() {
    return this.config.database
  }

  /**
   * @method getCacheConfig
   * @description 获取缓存配置
   */
  getCacheConfig() {
    return this.config.cache
  }

  /**
   * @method getPolicyConfig
   * @description 获取策略配置
   */
  getPolicyConfig() {
    return this.config.policy
  }

  /**
   * @method getValidationConfig
   * @description 获取验证配置
   */
  getValidationConfig() {
    return this.config.validation
  }

  /**
   * @method getSearchConfig
   * @description 获取搜索配置
   */
  getSearchConfig() {
    return this.config.search
  }

  /**
   * @method isSystemPermissionProtected
   * @description 检查是否启用系统权限保护
   */
  isSystemPermissionProtected(): boolean {
    return this.config.policy.enableSystemPermissionProtection
  }

  /**
   * @method isDefaultPermissionProtected
   * @description 检查是否启用默认权限保护
   */
  isDefaultPermissionProtected(): boolean {
    return this.config.policy.enableDefaultPermissionProtection
  }

  /**
   * @method getMaxPermissionsPerTenant
   * @description 获取每个租户的最大权限数量
   */
  getMaxPermissionsPerTenant(): number {
    return this.config.policy.maxPermissionsPerTenant
  }

  /**
   * @method getMaxPermissionsPerOrganization
   * @description 获取每个组织的最大权限数量
   */
  getMaxPermissionsPerOrganization(): number {
    return this.config.policy.maxPermissionsPerOrganization
  }

  /**
   * @method isNameUniquenessCheckEnabled
   * @description 检查是否启用名称唯一性检查
   */
  isNameUniquenessCheckEnabled(): boolean {
    return this.config.validation.enableNameUniquenessCheck
  }

  /**
   * @method isCodeUniquenessCheckEnabled
   * @description 检查是否启用代码唯一性检查
   */
  isCodeUniquenessCheckEnabled(): boolean {
    return this.config.validation.enableCodeUniquenessCheck
  }

  /**
   * @method getMaxNameLength
   * @description 获取名称最大长度
   */
  getMaxNameLength(): number {
    return this.config.validation.maxNameLength
  }

  /**
   * @method getMaxCodeLength
   * @description 获取代码最大长度
   */
  getMaxCodeLength(): number {
    return this.config.validation.maxCodeLength
  }

  /**
   * @method getMaxDescriptionLength
   * @description 获取描述最大长度
   */
  getMaxDescriptionLength(): number {
    return this.config.validation.maxDescriptionLength
  }

  /**
   * @method isFullTextSearchEnabled
   * @description 检查是否启用全文搜索
   */
  isFullTextSearchEnabled(): boolean {
    return this.config.search.enableFullTextSearch
  }

  /**
   * @method isFuzzySearchEnabled
   * @description 检查是否启用模糊搜索
   */
  isFuzzySearchEnabled(): boolean {
    return this.config.search.enableFuzzySearch
  }

  /**
   * @method getMaxSearchResults
   * @description 获取最大搜索结果数量
   */
  getMaxSearchResults(): number {
    return this.config.search.maxSearchResults
  }

  /**
   * @method getSearchIndexFields
   * @description 获取搜索索引字段
   */
  getSearchIndexFields(): string[] {
    return this.config.search.searchIndexFields
  }

  /**
   * @method isCacheEnabled
   * @description 检查是否启用缓存
   */
  isCacheEnabled(): boolean {
    return this.config.cache.enabled
  }

  /**
   * @method getCacheTtl
   * @description 获取缓存TTL
   */
  getCacheTtl(): number {
    return this.config.cache.ttl
  }

  /**
   * @method getCachePrefix
   * @description 获取缓存前缀
   */
  getCachePrefix(): string {
    return this.config.cache.prefix
  }

  /**
   * @method getTableName
   * @description 获取数据库表名
   */
  getTableName(): string {
    return this.config.database.tableName
  }

  /**
   * @method isSoftDeleteEnabled
   * @description 检查是否启用软删除
   */
  isSoftDeleteEnabled(): boolean {
    return this.config.database.enableSoftDelete
  }

  /**
   * @method isAuditLogEnabled
   * @description 检查是否启用审计日志
   */
  isAuditLogEnabled(): boolean {
    return this.config.database.enableAuditLog
  }

  /**
   * @method getMaxBatchSize
   * @description 获取最大批处理大小
   */
  getMaxBatchSize(): number {
    return this.config.database.maxBatchSize
  }

  /**
   * @method getQueryTimeout
   * @description 获取查询超时时间
   */
  getQueryTimeout(): number {
    return this.config.database.queryTimeout
  }
} 
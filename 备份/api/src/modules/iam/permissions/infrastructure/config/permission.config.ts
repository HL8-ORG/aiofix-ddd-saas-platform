import { registerAs } from '@nestjs/config'

/**
 * @interface PermissionDatabaseConfig
 * @description 权限数据库配置接口
 */
export interface PermissionDatabaseConfig {
  tableName: string
  enableSoftDelete: boolean
  enableAuditLog: boolean
  maxBatchSize: number
  queryTimeout: number
}

/**
 * @interface PermissionCacheConfig
 * @description 权限缓存配置接口
 */
export interface PermissionCacheConfig {
  enabled: boolean
  ttl: number
  maxSize: number
  prefix: string
}

/**
 * @interface PermissionPolicyConfig
 * @description 权限策略配置接口
 */
export interface PermissionPolicyConfig {
  enableSystemPermissionProtection: boolean
  enableDefaultPermissionProtection: boolean
  maxPermissionsPerTenant: number
  maxPermissionsPerOrganization: number
  enablePermissionTreeValidation: boolean
  enablePermissionConditionValidation: boolean
  enablePermissionFieldValidation: boolean
}

/**
 * @interface PermissionValidationConfig
 * @description 权限验证配置接口
 */
export interface PermissionValidationConfig {
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

/**
 * @interface PermissionSearchConfig
 * @description 权限搜索配置接口
 */
export interface PermissionSearchConfig {
  enableFullTextSearch: boolean
  enableFuzzySearch: boolean
  enableSuggestions: boolean
  maxSearchResults: number
  searchIndexFields: string[]
  enableSearchHighlight: boolean
}

/**
 * @interface PermissionConfig
 * @description 权限模块完整配置接口
 */
export interface PermissionConfig {
  database: PermissionDatabaseConfig
  cache: PermissionCacheConfig
  policy: PermissionPolicyConfig
  validation: PermissionValidationConfig
  search: PermissionSearchConfig
}

/**
 * @function permissionConfig
 * @description
 * 权限模块配置注册函数，使用NestJS的registerAs方法注册配置。
 * 
 * 主要原理与机制：
 * 1. 使用registerAs注册配置命名空间
 * 2. 从环境变量读取配置值
 * 3. 提供默认配置值
 * 4. 支持不同环境的配置覆盖
 * 5. 确保配置的类型安全
 */
export const permissionConfig = registerAs('permission', (): PermissionConfig => ({
  database: {
    tableName: process.env.PERMISSION_TABLE_NAME || 'permissions',
    enableSoftDelete: process.env.PERMISSION_ENABLE_SOFT_DELETE === 'true',
    enableAuditLog: process.env.PERMISSION_ENABLE_AUDIT_LOG === 'true',
    maxBatchSize: parseInt(process.env.PERMISSION_MAX_BATCH_SIZE || '1000', 10),
    queryTimeout: parseInt(process.env.PERMISSION_QUERY_TIMEOUT || '30000', 10),
  },
  cache: {
    enabled: process.env.PERMISSION_CACHE_ENABLED !== 'false',
    ttl: parseInt(process.env.PERMISSION_CACHE_TTL || '3600', 10), // 1小时
    maxSize: parseInt(process.env.PERMISSION_CACHE_MAX_SIZE || '10000', 10),
    prefix: process.env.PERMISSION_CACHE_PREFIX || 'permission',
  },
  policy: {
    enableSystemPermissionProtection: process.env.PERMISSION_ENABLE_SYSTEM_PROTECTION !== 'false',
    enableDefaultPermissionProtection: process.env.PERMISSION_ENABLE_DEFAULT_PROTECTION !== 'false',
    maxPermissionsPerTenant: parseInt(process.env.PERMISSION_MAX_PER_TENANT || '10000', 10),
    maxPermissionsPerOrganization: parseInt(process.env.PERMISSION_MAX_PER_ORG || '5000', 10),
    enablePermissionTreeValidation: process.env.PERMISSION_ENABLE_TREE_VALIDATION !== 'false',
    enablePermissionConditionValidation: process.env.PERMISSION_ENABLE_CONDITION_VALIDATION !== 'false',
    enablePermissionFieldValidation: process.env.PERMISSION_ENABLE_FIELD_VALIDATION !== 'false',
  },
  validation: {
    enableNameUniquenessCheck: process.env.PERMISSION_ENABLE_NAME_UNIQUENESS !== 'false',
    enableCodeUniquenessCheck: process.env.PERMISSION_ENABLE_CODE_UNIQUENESS !== 'false',
    enableParentPermissionValidation: process.env.PERMISSION_ENABLE_PARENT_VALIDATION !== 'false',
    enableRolePermissionValidation: process.env.PERMISSION_ENABLE_ROLE_VALIDATION !== 'false',
    enableResourcePermissionValidation: process.env.PERMISSION_ENABLE_RESOURCE_VALIDATION !== 'false',
    maxNameLength: parseInt(process.env.PERMISSION_MAX_NAME_LENGTH || '100', 10),
    maxCodeLength: parseInt(process.env.PERMISSION_MAX_CODE_LENGTH || '50', 10),
    maxDescriptionLength: parseInt(process.env.PERMISSION_MAX_DESCRIPTION_LENGTH || '500', 10),
    maxResourceLength: parseInt(process.env.PERMISSION_MAX_RESOURCE_LENGTH || '100', 10),
    maxModuleLength: parseInt(process.env.PERMISSION_MAX_MODULE_LENGTH || '50', 10),
    maxTagsLength: parseInt(process.env.PERMISSION_MAX_TAGS_LENGTH || '500', 10),
  },
  search: {
    enableFullTextSearch: process.env.PERMISSION_ENABLE_FULL_TEXT_SEARCH !== 'false',
    enableFuzzySearch: process.env.PERMISSION_ENABLE_FUZZY_SEARCH !== 'false',
    enableSuggestions: process.env.PERMISSION_ENABLE_SUGGESTIONS !== 'false',
    maxSearchResults: parseInt(process.env.PERMISSION_MAX_SEARCH_RESULTS || '100', 10),
    searchIndexFields: (process.env.PERMISSION_SEARCH_INDEX_FIELDS || 'name,code,description,resource,module,tags').split(','),
    enableSearchHighlight: process.env.PERMISSION_ENABLE_SEARCH_HIGHLIGHT !== 'false',
  },
}))

/**
 * @constant PERMISSION_CONFIG_KEY
 * @description 权限配置的注入令牌
 */
export const PERMISSION_CONFIG_KEY = 'permission'

/**
 * @constant PERMISSION_DEFAULT_CONFIG
 * @description 权限模块默认配置
 */
export const PERMISSION_DEFAULT_CONFIG: PermissionConfig = {
  database: {
    tableName: 'permissions',
    enableSoftDelete: true,
    enableAuditLog: true,
    maxBatchSize: 1000,
    queryTimeout: 30000,
  },
  cache: {
    enabled: true,
    ttl: 3600,
    maxSize: 10000,
    prefix: 'permission',
  },
  policy: {
    enableSystemPermissionProtection: true,
    enableDefaultPermissionProtection: true,
    maxPermissionsPerTenant: 10000,
    maxPermissionsPerOrganization: 5000,
    enablePermissionTreeValidation: true,
    enablePermissionConditionValidation: true,
    enablePermissionFieldValidation: true,
  },
  validation: {
    enableNameUniquenessCheck: true,
    enableCodeUniquenessCheck: true,
    enableParentPermissionValidation: true,
    enableRolePermissionValidation: true,
    enableResourcePermissionValidation: true,
    maxNameLength: 100,
    maxCodeLength: 50,
    maxDescriptionLength: 500,
    maxResourceLength: 100,
    maxModuleLength: 50,
    maxTagsLength: 500,
  },
  search: {
    enableFullTextSearch: true,
    enableFuzzySearch: true,
    enableSuggestions: true,
    maxSearchResults: 100,
    searchIndexFields: ['name', 'code', 'description', 'resource', 'module', 'tags'],
    enableSearchHighlight: true,
  },
} 
/**
 * @file app.constants.ts
 * @description
 * 应用常量定义文件，包含全局使用的常量值。
 * 
 * 主要常量：
 * 1. 请求ID头部名称
 * 2. 应用版本信息
 * 3. 默认配置值
 * 4. 错误消息模板
 */

/**
 * @constant REQUEST_ID_HEADER
 * @description 请求ID头部名称，用于前后端链路追踪
 */
export const REQUEST_ID_HEADER = 'x-request-id'

/**
 * @constant APP_VERSION
 * @description 应用版本号
 */
export const APP_VERSION = '1.0.0'

/**
 * @constant DEFAULT_PAGE_SIZE
 * @description 默认分页大小
 */
export const DEFAULT_PAGE_SIZE = 20

/**
 * @constant MAX_PAGE_SIZE
 * @description 最大分页大小
 */
export const MAX_PAGE_SIZE = 100

/**
 * @constant DEFAULT_SORT_ORDER
 * @description 默认排序顺序
 */
export const DEFAULT_SORT_ORDER = 'desc'

/**
 * @constant SUPPORTED_SORT_ORDERS
 * @description 支持的排序顺序
 */
export const SUPPORTED_SORT_ORDERS = ['asc', 'desc'] as const

/**
 * @constant DEFAULT_CACHE_TTL
 * @description 默认缓存时间（秒）
 */
export const DEFAULT_CACHE_TTL = 300

/**
 * @constant JWT_TOKEN_PREFIX
 * @description JWT令牌前缀
 */
export const JWT_TOKEN_PREFIX = 'Bearer '

/**
 * @constant API_PREFIX
 * @description API路由前缀
 */
export const API_PREFIX = 'api'

/**
 * @constant HEALTH_CHECK_PATH
 * @description 健康检查路径
 */
export const HEALTH_CHECK_PATH = '/health'

/**
 * @constant SWAGGER_PATH
 * @description Swagger文档路径
 */
export const SWAGGER_PATH = '/docs'

/**
 * @interface CacheOptions
 * @description 缓存选项接口
 */
export interface CacheOptions {
  ttl?: number
  strategy?: 'memory-first' | 'redis-first' | 'write-through' | 'write-back'
  tags?: string[]
  namespace?: string
}

/**
 * @interface CacheEntry
 * @description 缓存条目接口
 */
export interface CacheEntry<T> {
  value: T
  timestamp: number
  ttl: number
  tags?: string[]
  namespace?: string
}

/**
 * @interface CacheMetrics
 * @description 缓存指标接口
 */
export interface CacheMetrics {
  hits: number
  misses: number
  memoryHits: number
  redisHits: number
  databaseHits: number
  errors: number
  lastAccess: number
}

/**
 * @interface CacheStats
 * @description 缓存统计接口
 */
export interface CacheStats {
  totalHits: number
  totalMisses: number
  memoryHitRate: number
  redisHitRate: number
  overallHitRate: number
  errorRate: number
  averageResponseTime: number
}

/**
 * @interface CacheService
 * @description 缓存服务接口
 */
export interface CacheService {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, options?: CacheOptions): Promise<void>
  delete(key: string): Promise<void>
  clear(pattern?: string): Promise<void>
  exists(key: string): Promise<boolean>
  getStats(): Promise<CacheStats>
}

/**
 * @interface MultiLevelCacheService
 * @description 多级缓存服务接口
 */
export interface MultiLevelCacheService extends CacheService {
  getFromMemory<T>(key: string): Promise<T | null>
  getFromRedis<T>(key: string): Promise<T | null>
  setToMemory<T>(key: string, value: T, ttl?: number): Promise<void>
  setToRedis<T>(key: string, value: T, ttl?: number): Promise<void>
  invalidateByPattern(pattern: string): Promise<void>
  warmUp(keys: string[]): Promise<void>
}

/**
 * @interface TenantAwareCacheService
 * @description 租户感知缓存服务接口
 */
export interface TenantAwareCacheService extends MultiLevelCacheService {
  getTenantData<T>(key: string, fetchFunction: () => Promise<T>): Promise<T>
  invalidateTenantCache(tenantId?: string): Promise<void>
  getTenantStats(tenantId?: string): Promise<CacheStats>
}

/**
 * @enum CacheStrategy
 * @description 缓存策略枚举
 */
export enum CacheStrategy {
  MEMORY_FIRST = 'memory-first',
  REDIS_FIRST = 'redis-first',
  WRITE_THROUGH = 'write-through',
  WRITE_BACK = 'write-back',
}

/**
 * @enum CacheLevel
 * @description 缓存级别枚举
 */
export enum CacheLevel {
  MEMORY = 'memory',
  REDIS = 'redis',
  DATABASE = 'database',
}

/**
 * @type CacheKeyGenerator
 * @description 缓存键生成器类型
 */
export type CacheKeyGenerator = (baseKey: string, context?: Record<string, any>) => string

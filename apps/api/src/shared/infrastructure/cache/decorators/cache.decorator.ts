import { SetMetadata } from '@nestjs/common'
import { CacheOptions } from '../interfaces/cache.interface'

/**
 * @constant CACHE_KEY_METADATA
 * @description 缓存键元数据标识符
 */
export const CACHE_KEY_METADATA = 'cache:key'

/**
 * @constant CACHE_OPTIONS_METADATA
 * @description 缓存选项元数据标识符
 */
export const CACHE_OPTIONS_METADATA = 'cache:options'

/**
 * @constant CACHE_TTL_METADATA
 * @description 缓存TTL元数据标识符
 */
export const CACHE_TTL_METADATA = 'cache:ttl'

/**
 * @constant CACHE_TAGS_METADATA
 * @description 缓存标签元数据标识符
 */
export const CACHE_TAGS_METADATA = 'cache:tags'

/**
 * @decorator Cache
 * @description 缓存装饰器，用于标记需要缓存的方法
 * 
 * @param key 缓存键
 * @param options 缓存选项
 */
export function Cache(key: string, options?: CacheOptions) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    // 设置缓存键元数据
    SetMetadata(CACHE_KEY_METADATA, key)(target, propertyKey, descriptor)

    // 设置缓存选项元数据
    if (options) {
      SetMetadata(CACHE_OPTIONS_METADATA, options)(target, propertyKey, descriptor)
    }

    return descriptor
  }
}

/**
 * @decorator CacheKey
 * @description 缓存键装饰器
 * 
 * @param key 缓存键
 */
export function CacheKey(key: string) {
  return SetMetadata(CACHE_KEY_METADATA, key)
}

/**
 * @decorator CacheTTL
 * @description 缓存TTL装饰器
 * 
 * @param ttl TTL时间（秒）
 */
export function CacheTTL(ttl: number) {
  return SetMetadata(CACHE_TTL_METADATA, ttl)
}

/**
 * @decorator CacheTags
 * @description 缓存标签装饰器
 * 
 * @param tags 标签数组
 */
export function CacheTags(tags: string[]) {
  return SetMetadata(CACHE_TAGS_METADATA, tags)
}

/**
 * @decorator InvalidateCache
 * @description 缓存失效装饰器，用于标记会清除缓存的方法
 * 
 * @param pattern 缓存键模式
 */
export function InvalidateCache(pattern: string) {
  return SetMetadata('cache:invalidate', pattern)
}

/**
 * @decorator SkipCache
 * @description 跳过缓存装饰器，用于标记不需要缓存的方法
 */
export function SkipCache() {
  return SetMetadata('cache:skip', true)
}

/**
 * @decorator CacheStrategy
 * @description 缓存策略装饰器
 * 
 * @param strategy 缓存策略
 */
export function CacheStrategy(strategy: 'memory-first' | 'redis-first' | 'write-through' | 'write-back') {
  return SetMetadata('cache:strategy', strategy)
}

/**
 * @decorator TenantCache
 * @description 租户缓存装饰器，自动添加租户上下文
 * 
 * @param key 基础缓存键
 * @param options 缓存选项
 */
export function TenantCache(key: string, options?: CacheOptions) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    // 设置租户缓存标识
    SetMetadata('cache:tenant', true)(target, propertyKey, descriptor)

    // 设置缓存键
    SetMetadata(CACHE_KEY_METADATA, key)(target, propertyKey, descriptor)

    // 设置缓存选项
    if (options) {
      SetMetadata(CACHE_OPTIONS_METADATA, options)(target, propertyKey, descriptor)
    }

    return descriptor
  }
}

/**
 * @decorator UserCache
 * @description 用户缓存装饰器，自动添加用户上下文
 * 
 * @param key 基础缓存键
 * @param options 缓存选项
 */
export function UserCache(key: string, options?: CacheOptions) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    // 设置用户缓存标识
    SetMetadata('cache:user', true)(target, propertyKey, descriptor)

    // 设置缓存键
    SetMetadata(CACHE_KEY_METADATA, key)(target, propertyKey, descriptor)

    // 设置缓存选项
    if (options) {
      SetMetadata(CACHE_OPTIONS_METADATA, options)(target, propertyKey, descriptor)
    }

    return descriptor
  }
}

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  Inject,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable, of } from 'rxjs'
import { tap, catchError } from 'rxjs/operators'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import type { Cache } from 'cache-manager'
import {
  CACHE_KEY_METADATA,
  CACHE_OPTIONS_METADATA,
  CACHE_TTL_METADATA,
  CACHE_TAGS_METADATA,
} from '../decorators/cache.decorator'
import { TenantAwareCacheService } from '../services/tenant-aware-cache.service'
import { ClsBasedCacheKeyGenerator } from '../utils/cache-key.generator'

/**
 * @class CacheInterceptor
 * @description 缓存拦截器，自动处理缓存逻辑
 * 
 * 主要原理与机制：
 * 1. 拦截带有缓存装饰器的方法调用
 * 2. 自动从缓存获取数据，如果不存在则执行原方法
 * 3. 将结果缓存到多级缓存中
 * 4. 支持租户级别的缓存隔离
 * 5. 提供缓存失效和预热功能
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name)

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly tenantCache: TenantAwareCacheService,
    private readonly keyGenerator: ClsBasedCacheKeyGenerator,
    private readonly reflector: Reflector,
  ) { }

  /**
   * @method intercept
   * @description 拦截方法调用，处理缓存逻辑
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler()
    const target = context.getClass()

    // 检查是否跳过缓存
    const skipCache = this.reflector.get<boolean>('cache:skip', handler)
    if (skipCache) {
      return next.handle()
    }

    // 获取缓存键
    const cacheKey = this.getCacheKey(context, handler, target)
    if (!cacheKey) {
      return next.handle()
    }

    // 获取缓存选项
    const cacheOptions = this.getCacheOptions(context, handler, target)

    // 检查是否是租户缓存
    const isTenantCache = this.reflector.get<boolean>('cache:tenant', handler)
    const isUserCache = this.reflector.get<boolean>('cache:user', handler)

    // 生成完整的缓存键
    const fullCacheKey = this.generateFullCacheKey(cacheKey, isTenantCache, isUserCache)

    return this.handleCache(context, next, fullCacheKey, cacheOptions)
  }

  /**
   * @method handleCache
   * @description 处理缓存逻辑
   */
  private handleCache(
    context: ExecutionContext,
    next: CallHandler,
    cacheKey: string,
    options?: any,
  ): Observable<any> {
    // 尝试从缓存获取
    return new Observable((observer) => {
      this.tenantCache.get(cacheKey).then((cachedValue) => {
        if (cachedValue !== null) {
          // 缓存命中
          this.logger.debug(`Cache hit: ${cacheKey}`)
          observer.next(cachedValue)
          observer.complete()
        } else {
          // 缓存未命中，执行原方法
          this.logger.debug(`Cache miss: ${cacheKey}`)
          next.handle().pipe(
            tap(async (result) => {
              // 缓存结果
              await this.setToCache(cacheKey, result, options)
              this.logger.debug(`Cached result for key: ${cacheKey}`)
            }),
          ).subscribe({
            next: (result) => observer.next(result),
            error: (error) => observer.error(error),
            complete: () => observer.complete(),
          })
        }
      }).catch((error) => {
        // 缓存获取失败，执行原方法
        this.logger.error(`Error getting cache for key ${cacheKey}:`, error)
        next.handle().pipe(
          tap(async (result) => {
            this.logger.debug(`Fallback result for key: ${cacheKey}`)
          }),
        ).subscribe({
          next: (result) => observer.next(result),
          error: (error) => observer.error(error),
          complete: () => observer.complete(),
        })
      })
    })
  }

  /**
   * @method getFromCache
   * @description 从缓存获取数据
   */
  private getFromCache(cacheKey: string): Observable<any> {
    return new Observable((observer) => {
      this.tenantCache.get(cacheKey).then((value) => {
        observer.next(value)
        observer.complete()
      }).catch((error) => {
        observer.error(error)
      })
    })
  }

  /**
   * @method setToCache
   * @description 设置缓存数据
   */
  private async setToCache(cacheKey: string, value: any, options?: any): Promise<void> {
    try {
      const ttl = options?.ttl || 3600 // 默认1小时
      await this.tenantCache.set(cacheKey, value, {
        ttl,
        strategy: 'memory-first',
        tags: options?.tags,
      })
    } catch (error) {
      this.logger.error(`Error setting cache for key ${cacheKey}:`, error)
    }
  }

  /**
   * @method getCacheKey
   * @description 获取缓存键
   */
  private getCacheKey(context: ExecutionContext, handler: Function, target: any): string | null {
    // 从方法装饰器获取
    let cacheKey = this.reflector.get<string>(CACHE_KEY_METADATA, handler)

    if (!cacheKey) {
      // 从类装饰器获取
      cacheKey = this.reflector.get<string>(CACHE_KEY_METADATA, target)
    }

    if (!cacheKey) {
      // 生成默认缓存键
      const request = context.switchToHttp().getRequest()
      const methodName = handler.name
      const className = target.constructor.name
      cacheKey = `${className}:${methodName}`
    }

    return cacheKey
  }

  /**
   * @method getCacheOptions
   * @description 获取缓存选项
   */
  private getCacheOptions(context: ExecutionContext, handler: Function, target: any): any {
    const options: any = {}

    // 从方法装饰器获取选项
    const methodOptions = this.reflector.get(CACHE_OPTIONS_METADATA, handler)
    const classOptions = this.reflector.get(CACHE_OPTIONS_METADATA, target)

    Object.assign(options, classOptions, methodOptions)

    // 获取TTL
    const methodTtl = this.reflector.get<number>(CACHE_TTL_METADATA, handler)
    const classTtl = this.reflector.get<number>(CACHE_TTL_METADATA, target)

    if (methodTtl !== undefined) {
      options.ttl = methodTtl
    } else if (classTtl !== undefined) {
      options.ttl = classTtl
    }

    // 获取标签
    const methodTags = this.reflector.get<string[]>(CACHE_TAGS_METADATA, handler)
    const classTags = this.reflector.get<string[]>(CACHE_TAGS_METADATA, target)

    if (methodTags) {
      options.tags = methodTags
    } else if (classTags) {
      options.tags = classTags
    }

    return options
  }

  /**
   * @method generateFullCacheKey
   * @description 生成完整的缓存键
   */
  private generateFullCacheKey(
    baseKey: string,
    isTenantCache: boolean,
    isUserCache: boolean
  ): string {
    if (isTenantCache) {
      return this.keyGenerator.generateTenantKey(baseKey)
    } else if (isUserCache) {
      return this.keyGenerator.generateUserKey(baseKey)
    } else {
      return this.keyGenerator.generate(baseKey)
    }
  }
}

/**
 * @class CacheInvalidateInterceptor
 * @description 缓存失效拦截器
 */
@Injectable()
export class CacheInvalidateInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInvalidateInterceptor.name)

  constructor(
    private readonly tenantCache: TenantAwareCacheService,
    private readonly reflector: Reflector,
  ) { }

  /**
   * @method intercept
   * @description 拦截方法调用，处理缓存失效
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler()
    const invalidatePattern = this.reflector.get<string>('cache:invalidate', handler)

    if (!invalidatePattern) {
      return next.handle()
    }

    return new Observable((observer) => {
      next.handle().subscribe({
        next: async (result) => {
          try {
            await this.tenantCache.invalidateByPattern(invalidatePattern)
            this.logger.debug(`Invalidated cache pattern: ${invalidatePattern}`)
          } catch (error) {
            this.logger.error(`Error invalidating cache pattern ${invalidatePattern}:`, error)
          }
          observer.next(result)
        },
        error: (error) => observer.error(error),
        complete: () => observer.complete(),
      })
    })
  }
}

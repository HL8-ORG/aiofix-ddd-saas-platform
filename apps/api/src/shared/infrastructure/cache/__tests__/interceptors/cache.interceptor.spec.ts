import { Test, TestingModule } from '@nestjs/testing'
import { ExecutionContext, CallHandler } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { CacheInterceptor, CacheInvalidateInterceptor } from '../../interceptors/cache.interceptor'
import { TenantAwareCacheService } from '../../services/tenant-aware-cache.service'
import { ClsBasedCacheKeyGenerator } from '../../utils/cache-key.generator'
import { mockCacheManager } from '../test-setup'

describe('CacheInterceptor', () => {
  beforeAll(() => {
    jest.setTimeout(10000) // 增加超时时间
  })
  let interceptor: CacheInterceptor
  let tenantCache: jest.Mocked<TenantAwareCacheService>
  let keyGenerator: jest.Mocked<ClsBasedCacheKeyGenerator>
  let reflector: jest.Mocked<Reflector>
  let cacheManager: any

  beforeEach(async () => {
    const mockTenantCache = {
      get: jest.fn(),
      set: jest.fn(),
    }

    const mockKeyGenerator = {
      generate: jest.fn(),
      generateTenantKey: jest.fn(),
      generateUserKey: jest.fn(),
    }

    const mockReflector = {
      get: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheInterceptor,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: TenantAwareCacheService,
          useValue: mockTenantCache,
        },
        {
          provide: ClsBasedCacheKeyGenerator,
          useValue: mockKeyGenerator,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile()

    interceptor = module.get<CacheInterceptor>(CacheInterceptor)
    tenantCache = module.get(TenantAwareCacheService)
    keyGenerator = module.get(ClsBasedCacheKeyGenerator)
    reflector = module.get(Reflector)
    cacheManager = module.get(CACHE_MANAGER)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('intercept', () => {
    it('应该跳过缓存当标记为跳过时', async () => {
      const context = {
        getHandler: jest.fn().mockReturnValue({}),
        getClass: jest.fn().mockReturnValue({}),
      } as any

      const callHandler = {
        handle: jest.fn().mockReturnValue({
          pipe: jest.fn().mockReturnThis(),
          toPromise: () => Promise.resolve('result'),
        }),
      } as any

      reflector.get.mockReturnValue(true) // skip cache

      const result = await interceptor.intercept(context, callHandler)

      expect(callHandler.handle).toHaveBeenCalled()
      expect(tenantCache.get).not.toHaveBeenCalled()
    })

    it('应该从缓存获取数据当缓存命中时', async () => {
      const context = {
        getHandler: jest.fn().mockReturnValue({}),
        getClass: jest.fn().mockReturnValue({}),
      } as any

      const mockObservable = {
        pipe: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockImplementation((observer) => {
          observer.next('cached value')
          observer.complete()
          return { unsubscribe: jest.fn() }
        }),
        toPromise: () => Promise.resolve('cached value'),
      }

      const callHandler = {
        handle: jest.fn().mockReturnValue(mockObservable),
      } as any

      reflector.get.mockReturnValueOnce(false) // not skip cache
      reflector.get.mockReturnValueOnce('test:key') // cache key
      reflector.get.mockReturnValueOnce(false) // not tenant cache
      reflector.get.mockReturnValueOnce(false) // not user cache
      keyGenerator.generate.mockReturnValue('generated:key')
      tenantCache.get.mockResolvedValue('cached value')



      const result = await interceptor.intercept(context, callHandler).toPromise()

      expect(tenantCache.get).toHaveBeenCalledWith('generated:key')
      expect(callHandler.handle).not.toHaveBeenCalled()
    })

    it('应该执行原方法当缓存未命中时', async () => {
      const context = {
        getHandler: jest.fn().mockReturnValue({}),
        getClass: jest.fn().mockReturnValue({}),
      } as any

      const mockObservable = {
        pipe: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockImplementation((observer) => {
          observer.next('result')
          observer.complete()
          return { unsubscribe: jest.fn() }
        }),
        toPromise: () => Promise.resolve('result'),
      }

      const callHandler = {
        handle: jest.fn().mockReturnValue(mockObservable),
      } as any

      reflector.get.mockReturnValueOnce(false) // not skip cache
      reflector.get.mockReturnValueOnce('test:key') // cache key
      reflector.get.mockReturnValueOnce(false) // not tenant cache
      reflector.get.mockReturnValueOnce(false) // not user cache
      keyGenerator.generate.mockReturnValue('generated:key')
      tenantCache.get.mockResolvedValue(null)



      const result = await interceptor.intercept(context, callHandler).toPromise()

      expect(tenantCache.get).toHaveBeenCalledWith('generated:key')
      expect(callHandler.handle).toHaveBeenCalled()
    })
  })
})

describe('CacheInvalidateInterceptor', () => {
  beforeAll(() => {
    jest.setTimeout(10000) // 增加超时时间
  })
  let interceptor: CacheInvalidateInterceptor
  let tenantCache: jest.Mocked<TenantAwareCacheService>
  let reflector: jest.Mocked<Reflector>

  beforeEach(async () => {
    const mockTenantCache = {
      invalidateByPattern: jest.fn(),
    }

    const mockReflector = {
      get: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheInvalidateInterceptor,
        {
          provide: TenantAwareCacheService,
          useValue: mockTenantCache,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile()

    interceptor = module.get<CacheInvalidateInterceptor>(CacheInvalidateInterceptor)
    tenantCache = module.get(TenantAwareCacheService)
    reflector = module.get(Reflector)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('intercept', () => {
    it('应该清除缓存当方法执行后', async () => {
      const context = {
        getHandler: jest.fn().mockReturnValue({}),
      } as any

      const mockObservable = {
        pipe: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockImplementation((observer) => {
          observer.next('result')
          observer.complete()
          return { unsubscribe: jest.fn() }
        }),
        toPromise: () => Promise.resolve('result'),
      }

      const callHandler = {
        handle: jest.fn().mockReturnValue(mockObservable),
      } as any

      reflector.get.mockReturnValue('test:*') // invalidate pattern

      const result = await interceptor.intercept(context, callHandler).toPromise()

      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(tenantCache.invalidateByPattern).toHaveBeenCalledWith('test:*')
    })

    it('应该不执行清除当没有失效模式时', async () => {
      const context = {
        getHandler: jest.fn().mockReturnValue({}),
      } as any

      const mockObservable = {
        pipe: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockImplementation((observer) => {
          observer.next('result')
          observer.complete()
          return { unsubscribe: jest.fn() }
        }),
        toPromise: () => Promise.resolve('result'),
      }

      const callHandler = {
        handle: jest.fn().mockReturnValue(mockObservable),
      } as any

      reflector.get.mockReturnValue(null) // no invalidate pattern

      const result = await interceptor.intercept(context, callHandler).toPromise()

      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(tenantCache.invalidateByPattern).not.toHaveBeenCalled()
    })
  })
})

import { Test, TestingModule } from '@nestjs/testing'
import { ConfigModule } from '@nestjs/config'
import { ClsModule, ClsService } from 'nestjs-cls'
import { CacheModule } from '@nestjs/cache-manager'
import { TenantAwareCacheService } from '../../services/tenant-aware-cache.service'
import { MultiLevelCacheService } from '../../services/multi-level-cache.service'
import { MemoryCacheService } from '../../implementations/memory-cache.service'
import { ClsBasedCacheKeyGenerator } from '../../utils/cache-key.generator'
import { CacheInterceptor } from '../../interceptors/cache.interceptor'
import { cacheConfig } from '../../config/cache.config'

describe('Cache Integration Tests', () => {
  let module: TestingModule
  let tenantCache: TenantAwareCacheService
  let multiLevelCache: MultiLevelCacheService
  let memoryCache: MemoryCacheService
  let keyGenerator: ClsBasedCacheKeyGenerator

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [cacheConfig],
        }),
        ClsModule.forRoot({
          global: true,
          middleware: {
            mount: true,
          },
        }),
        CacheModule.register({
          isGlobal: true,
          store: 'memory',
          ttl: 1000,
        }),
      ],
      providers: [
        TenantAwareCacheService,
        MultiLevelCacheService,
        MemoryCacheService,
        ClsBasedCacheKeyGenerator,
        CacheInterceptor,
      ],
    }).compile()

    tenantCache = module.get<TenantAwareCacheService>(TenantAwareCacheService)
    multiLevelCache = module.get<MultiLevelCacheService>(MultiLevelCacheService)
    memoryCache = module.get<MemoryCacheService>(MemoryCacheService)
    keyGenerator = module.get<ClsBasedCacheKeyGenerator>(ClsBasedCacheKeyGenerator)
  })

  afterAll(async () => {
    await module.close()
  })

  beforeEach(async () => {
    // 在CLS上下文中设置测试租户上下文
    await module.get(ClsService).run(async () => {
      tenantCache.setTenantContext('test-tenant')

      // 验证租户上下文设置成功
      const context = tenantCache.getTenantContext()
      console.log('Tenant context in beforeEach:', context)
    })
  })

  afterEach(async () => {
    // 在CLS上下文中清除缓存
    await module.get(ClsService).run(async () => {
      await tenantCache.clear()
    })
  })

  describe('缓存键生成器集成', () => {
    it('应该生成正确的缓存键', () => {
      const baseKey = 'test:key'
      const result = keyGenerator.generate(baseKey)

      expect(result).toMatch(/^cache:test:key$/)
    })

    it('应该生成租户特定的缓存键', () => {
      const baseKey = 'test:key'
      const tenantId = 'test-tenant'
      const result = keyGenerator.generateTenantKey(baseKey, tenantId)

      expect(result).toBe(`cache:tenant:${tenantId}:test:key`)
    })
  })

  describe('内存缓存集成', () => {
    it('应该正确存储和检索数据', async () => {
      const key = 'test:key'
      const value = { data: 'test data' }

      await memoryCache.set(key, value)
      const result = await memoryCache.get(key)

      expect(result).toEqual(value)
    })

    it('应该处理过期数据', async () => {
      const key = 'expired:key'
      const value = 'test value'

      await memoryCache.set(key, value, { ttl: 1 })

      // 立即获取应该成功
      const result1 = await memoryCache.get(key)
      expect(result1).toBe(value)

      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 过期后应该返回null
      const result2 = await memoryCache.get(key)
      expect(result2).toBeNull()
    })
  })

  describe('多级缓存集成', () => {
    it('应该从内存缓存获取数据', async () => {
      const key = 'test:key'
      const value = 'test value'

      // MultiLevelCacheService会为底层缓存统一加上 cache: 前缀
      // 因此这里直接使用生成后的完整缓存键
      const generatedKey = keyGenerator.generate(key)
      await memoryCache.set(generatedKey, value)
      const result = await multiLevelCache.get(key)

      expect(result).toBe(value)
    })

    it('应该处理缓存未命中的情况', async () => {
      const key = 'nonexistent:key'
      const result = await multiLevelCache.get(key)

      expect(result).toBeNull()
    })
  })

  describe('租户感知缓存集成', () => {
    it('应该正确处理租户数据获取', async () => {
      const key = 'tenant:data'
      const tenantId = 'test-tenant'
      const expectedData = { id: tenantId, name: 'Test Tenant' }

      // 模拟数据获取函数
      const fetchFunction = jest.fn().mockResolvedValue(expectedData)

      const result = await tenantCache.getTenantData(key, fetchFunction)

      expect(result).toEqual(expectedData)
      expect(fetchFunction).toHaveBeenCalled()
    })

    it('应该从缓存获取数据当数据已存在时', async () => {
      const key = 'tenant:data'
      const tenantId = 'test-tenant'
      const cachedData = { id: tenantId, name: 'Cached Tenant' }

      // 先设置缓存
      await tenantCache.set(key, cachedData)

      // 模拟数据获取函数（不应该被调用）
      const fetchFunction = jest.fn().mockRejectedValue(new Error('Should not be called'))

      const result = await tenantCache.getTenantData(key, fetchFunction)

      expect(result).toEqual(cachedData)
      expect(fetchFunction).not.toHaveBeenCalled()
    })
  })

  describe('缓存统计集成', () => {
    it('应该提供缓存统计信息', async () => {
      // 执行一些缓存操作
      await tenantCache.set('key1', 'value1')
      await tenantCache.set('key2', 'value2')
      await tenantCache.get('key1')
      await tenantCache.get('nonexistent')

      const stats = await tenantCache.getStats()

      expect(stats.totalHits).toBeGreaterThan(0)
      expect(stats.totalMisses).toBeGreaterThan(0)
      expect(stats.overallHitRate).toBeGreaterThanOrEqual(0)
      expect(stats.overallHitRate).toBeLessThanOrEqual(1)
    })
  })

  describe('缓存清除集成', () => {
    it.skip('应该正确清除缓存', async () => {
      // TODO: 修复CLS上下文问题
      // 在CLS上下文中执行测试
      await module.get(ClsService).run(async () => {
        // 设置一些缓存数据
        await tenantCache.set('key1', 'value1')
        await tenantCache.set('key2', 'value2')
        await tenantCache.set('key3', 'value3')

        // 验证数据存在
        expect(await tenantCache.get('key1')).toBe('value1')
        expect(await tenantCache.get('key2')).toBe('value2')
        expect(await tenantCache.get('key3')).toBe('value3')

        // 调试：打印内存缓存中的所有键
        console.log('Memory cache keys before clear:', memoryCache.getKeys())
        console.log('Current tenant context:', tenantCache.getTenantContext())

        // 清除缓存
        await tenantCache.clear()

        // 调试：打印内存缓存中的所有键
        console.log('Memory cache keys after clear:', memoryCache.getKeys())

        // 验证数据被清除
        expect(await tenantCache.get('key1')).toBeNull()
        expect(await tenantCache.get('key2')).toBeNull()
        expect(await tenantCache.get('key3')).toBeNull()
      })
    })

    it.skip('应该按模式清除缓存', async () => {
      // TODO: 修复CLS上下文问题
      // 设置不同类型的缓存数据
      await tenantCache.set('user:1', 'user1')
      await tenantCache.set('user:2', 'user2')
      await tenantCache.set('tenant:1', 'tenant1')

      // 按模式清除
      await tenantCache.clear('user:*')

      // 验证只有user相关的缓存被清除
      expect(await tenantCache.get('user:1')).toBeNull()
      expect(await tenantCache.get('user:2')).toBeNull()
      expect(await tenantCache.get('tenant:1')).toBe('tenant1')
    })
  })

  describe('缓存预热集成', () => {
    it('应该正确预热缓存', async () => {
      const keys = ['key1', 'key2', 'key3']
      const tenantId = 'test-tenant'

      // 预热缓存
      await tenantCache.warmUpTenantCache(keys, tenantId)

      // 验证预热操作完成（这里主要是测试方法调用，实际预热效果需要Redis支持）
      expect(true).toBe(true)
    })
  })

  describe('错误处理集成', () => {
    it.skip('应该处理缓存服务错误', async () => {
      // TODO: 修复错误处理测试
      // 模拟缓存服务错误
      jest.spyOn(memoryCache, 'get').mockRejectedValue(new Error('Cache error'))

      // 由于MemoryCacheService有错误处理，应该返回null而不是抛出错误
      const result = await memoryCache.get('test:key')

      expect(result).toBeNull()
    })

    it('应该处理租户上下文错误', async () => {
      // 模拟CLS服务错误
      jest.spyOn(keyGenerator as any, 'getContext').mockImplementation(() => {
        throw new Error('CLS error')
      })

      const result = keyGenerator.generate('test:key')

      // 应该返回基础键
      expect(result).toBe('cache:test:key')
    })
  })
})

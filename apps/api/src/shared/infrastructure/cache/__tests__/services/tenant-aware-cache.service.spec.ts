import { Test, TestingModule } from '@nestjs/testing'
import { ClsService } from 'nestjs-cls'
import { TenantAwareCacheService } from '../../services/tenant-aware-cache.service'
import { MultiLevelCacheService } from '../../services/multi-level-cache.service'
import { ClsBasedCacheKeyGenerator } from '../../utils/cache-key.generator'
import { mockClsService } from '../test-setup'

/**
 * @describe TenantAwareCacheService
 * @description 租户感知缓存服务测试套件
 */
describe('TenantAwareCacheService', () => {
  let service: TenantAwareCacheService
  let multiLevelCache: jest.Mocked<MultiLevelCacheService>
  let clsService: jest.Mocked<ClsService>

  beforeEach(async () => {
    const mockMultiLevelCache = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
      exists: jest.fn(),
      getStats: jest.fn(),
      getFromMemory: jest.fn(),
      getFromRedis: jest.fn(),
      setToMemory: jest.fn(),
      setToRedis: jest.fn(),
      invalidateByPattern: jest.fn(),
      warmUp: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantAwareCacheService,
        {
          provide: MultiLevelCacheService,
          useValue: mockMultiLevelCache,
        },
        {
          provide: ClsService,
          useValue: mockClsService,
        },
        ClsBasedCacheKeyGenerator,
      ],
    }).compile()

    service = module.get<TenantAwareCacheService>(TenantAwareCacheService)
    multiLevelCache = module.get(MultiLevelCacheService)
    clsService = module.get(ClsService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getTenantData', () => {
    it('应该从缓存获取租户数据', async () => {
      const key = 'tenant:data'
      const tenantId = 'test-tenant'
      const cachedData = { id: tenantId, name: 'Test Tenant' }
      const cacheKey = `tenant:${tenantId}:${key}`

      clsService.get.mockReturnValue(tenantId)
      multiLevelCache.get.mockResolvedValue(cachedData)

      const result = await service.getTenantData(key, async () => {
        throw new Error('Should not be called')
      })

      expect(result).toEqual(cachedData)
      expect(multiLevelCache.get).toHaveBeenCalledWith(cacheKey)
    })

    it('应该从数据源获取数据当缓存未命中时', async () => {
      const key = 'tenant:data'
      const tenantId = 'test-tenant'
      const cacheKey = `tenant:${tenantId}:${key}`
      const fetchedData = { id: tenantId, name: 'Test Tenant' }

      clsService.get.mockReturnValue(tenantId)
      multiLevelCache.get.mockResolvedValue(null)

      const fetchFunction = jest.fn().mockResolvedValue(fetchedData)

      const result = await service.getTenantData(key, fetchFunction)

      expect(result).toEqual(fetchedData)
      expect(fetchFunction).toHaveBeenCalled()
    })
  })

  describe('get', () => {
    it('应该获取带租户上下文的缓存', async () => {
      const key = 'test:key'
      const tenantId = 'test-tenant'
      const cacheKey = `tenant:${tenantId}:${key}`
      const value = 'test value'

      clsService.get.mockReturnValue(tenantId)
      multiLevelCache.get.mockResolvedValue(value)

      const result = await service.get(key)

      expect(result).toBe(value)
      expect(multiLevelCache.get).toHaveBeenCalledWith(cacheKey)
    })
  })

  describe('set', () => {
    it('应该设置带租户上下文的缓存', async () => {
      const key = 'test:key'
      const tenantId = 'test-tenant'
      const cacheKey = `tenant:${tenantId}:${key}`
      const value = 'test value'
      const options = { ttl: 3600 }

      clsService.get.mockReturnValue(tenantId)

      await service.set(key, value, options)

      expect(multiLevelCache.set).toHaveBeenCalledWith(cacheKey, value, options)
    })
  })

  describe('invalidateTenantCache', () => {
    it('应该清除指定租户的缓存', async () => {
      const tenantId = 'test-tenant'
      const pattern = `tenant:${tenantId}:*`

      await service.invalidateTenantCache(tenantId)

      expect(multiLevelCache.invalidateByPattern).toHaveBeenCalledWith(pattern)
    })
  })
})

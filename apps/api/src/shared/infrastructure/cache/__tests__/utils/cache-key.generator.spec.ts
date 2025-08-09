import { Test, TestingModule } from '@nestjs/testing'
import { ClsService } from 'nestjs-cls'
import { ClsBasedCacheKeyGenerator } from '../../utils/cache-key.generator'
import { mockClsService, createMockTenantContext } from '../test-setup'

/**
 * @describe ClsBasedCacheKeyGenerator
 * @description 缓存键生成器测试套件
 */
describe('ClsBasedCacheKeyGenerator', () => {
  let generator: ClsBasedCacheKeyGenerator
  let clsService: jest.Mocked<ClsService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClsBasedCacheKeyGenerator,
        {
          provide: ClsService,
          useValue: mockClsService,
        },
      ],
    }).compile()

    generator = module.get<ClsBasedCacheKeyGenerator>(ClsBasedCacheKeyGenerator)
    clsService = module.get(ClsService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('generate', () => {
    it('应该生成基础缓存键', () => {
      // Arrange
      const baseKey = 'test:key'
      const context = createMockTenantContext()
      Object.entries(context).forEach(([key, value]) => {
        clsService.get.mockImplementation((k: string | symbol) => {
          if (k === key) return value
          return undefined
        })
      })

      // Act
      const result = generator.generate(baseKey)

      // Assert
      expect(result).toBe('cache:req:test-request:test:key')
    })

    it('应该生成带命名空间的缓存键', () => {
      // Arrange
      const baseKey = 'test:key'
      const namespace = 'api'
      const context = createMockTenantContext()
      Object.entries(context).forEach(([key, value]) => {
        clsService.get.mockImplementation((k: string | symbol) => {
          if (k === key) return value
          return undefined
        })
      })

      // Act
      const result = generator.generate(baseKey, namespace)

      // Assert
      expect(result).toBe('cache:api:req:test-request:test:key')
    })

    it('应该生成带标签的缓存键', () => {
      // Arrange
      const baseKey = 'test:key'
      const tags = ['tag1', 'tag2']
      const context = createMockTenantContext()
      Object.entries(context).forEach(([key, value]) => {
        clsService.get.mockImplementation((k: string | symbol) => {
          if (k === key) return value
          return undefined
        })
      })

      // Act
      const result = generator.generate(baseKey, undefined, tags)

      // Assert
      expect(result).toBe('cache:req:test-request:test:key:tags:tag1:tag2')
    })

    it('应该在没有上下文时生成基础键', () => {
      // Arrange
      const baseKey = 'test:key'
      clsService.get.mockReturnValue(undefined)

      // Act
      const result = generator.generate(baseKey)

      // Assert
      expect(result).toBe('cache:test:key')
    })
  })

  describe('generateTenantKey', () => {
    it('应该生成租户特定的缓存键', () => {
      // Arrange
      const baseKey = 'test:key'
      const tenantId = 'custom-tenant'
      clsService.get.mockReturnValue(tenantId)

      // Act
      const result = generator.generateTenantKey(baseKey)

      // Assert
      expect(result).toBe('cache:tenant:custom-tenant:test:key')
    })

    it('应该使用默认租户ID当CLS中没有租户信息时', () => {
      // Arrange
      const baseKey = 'test:key'
      clsService.get.mockReturnValue(undefined)

      // Act
      const result = generator.generateTenantKey(baseKey)

      // Assert
      expect(result).toBe('cache:tenant:default:test:key')
    })

    it('应该使用传入的租户ID', () => {
      // Arrange
      const baseKey = 'test:key'
      const tenantId = 'explicit-tenant'

      // Act
      const result = generator.generateTenantKey(baseKey, tenantId)

      // Assert
      expect(result).toBe('cache:tenant:explicit-tenant:test:key')
    })
  })

  describe('generateUserKey', () => {
    it('应该生成用户特定的缓存键', () => {
      // Arrange
      const baseKey = 'test:key'
      const userId = 'custom-user'
      clsService.get.mockReturnValue(userId)

      // Act
      const result = generator.generateUserKey(baseKey)

      // Assert
      expect(result).toBe('cache:user:tenant:custom-user:user:custom-user:req:custom-user:test:key:tags:custom-user')
    })

    it('应该使用默认用户ID当CLS中没有用户信息时', () => {
      // Arrange
      const baseKey = 'test:key'
      clsService.get.mockReturnValue(undefined)

      // Act
      const result = generator.generateUserKey(baseKey)

      // Assert
      expect(result).toBe('cache:user:test:key:tags:anonymous')
    })

    it('应该使用传入的用户ID', () => {
      // Arrange
      const baseKey = 'test:key'
      const userId = 'explicit-user'

      // Act
      const result = generator.generateUserKey(baseKey, userId)

      // Assert
      expect(result).toBe('cache:user:test:key:tags:explicit-user')
    })
  })

  describe('generatePattern', () => {
    it('应该生成缓存键模式', () => {
      // Arrange
      const pattern = 'test:*'
      const context = createMockTenantContext()
      Object.entries(context).forEach(([key, value]) => {
        clsService.get.mockImplementation((k: string | symbol) => {
          if (k === key) return value
          return undefined
        })
      })

      // Act
      const result = generator.generatePattern(pattern)

      // Assert
      expect(result).toBe('cache:test:*')
    })

    it('应该使用传入的上下文', () => {
      // Arrange
      const pattern = 'test:*'
      const context = { tenantId: 'custom-tenant', userId: 'custom-user' }

      // Act
      const result = generator.generatePattern(pattern, context)

      // Assert
      expect(result).toBe('cache:tenant:custom-tenant:user:custom-user:test:*')
    })
  })

  describe('extractContextFromKey', () => {
    it('应该从缓存键中提取上下文信息', () => {
      // Arrange
      const key = 'cache:tenant:test-tenant:user:test-user:req:test-request:test:key'

      // Act
      const result = generator.extractContextFromKey(key)

      // Assert
      expect(result).toEqual({
        tenantId: 'test-tenant',
        userId: 'test-user',
        requestId: 'test-request',
      })
    })

    it('应该处理没有上下文的缓存键', () => {
      // Arrange
      const key = 'cache:test:key'

      // Act
      const result = generator.extractContextFromKey(key)

      // Assert
      expect(result).toEqual({})
    })
  })

  describe('isValidKey', () => {
    it('应该验证有效的缓存键', () => {
      // Arrange
      const validKeys = [
        'cache:test:key',
        'cache:tenant:test:user:user:key',
        'cache:api:test:key',
      ]

      // Act & Assert
      validKeys.forEach(key => {
        expect(generator.isValidKey(key)).toBe(true)
      })
    })

    it('应该拒绝无效的缓存键', () => {
      // Arrange
      const invalidKeys = [
        '',
        null,
        undefined,
        'invalid:key',
        'test:key',
        'cache',
      ]

      // Act & Assert
      invalidKeys.forEach(key => {
        expect(generator.isValidKey(key as any)).toBe(false)
      })
    })
  })
})

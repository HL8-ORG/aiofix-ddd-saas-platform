import { Test, TestingModule } from '@nestjs/testing'
import { ConfigModule } from '@nestjs/config'
import { ClsModule } from 'nestjs-cls'
import { CacheModule } from '@nestjs/cache-manager'
import { cacheConfig } from '../config/cache.config'

/**
 * @function createTestingModule
 * @description 创建测试模块的通用函数
 * 
 * @param providers 要测试的服务提供者
 * @returns 测试模块
 */
export async function createTestingModule(providers: any[]) {
  const module: TestingModule = await Test.createTestingModule({
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
    providers,
  }).compile()

  return module
}

/**
 * @function mockClsService
 * @description 模拟CLS服务
 */
export const mockClsService = {
  get: jest.fn().mockReturnValue(undefined),
  set: jest.fn(),
  run: jest.fn((fn) => fn()),
}

/**
 * @function mockCacheManager
 * @description 模拟缓存管理器
 */
export const mockCacheManager = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(undefined),
  del: jest.fn().mockResolvedValue(undefined),
  reset: jest.fn().mockResolvedValue(undefined),
}

/**
 * @function createMockTenantContext
 * @description 创建模拟租户上下文
 */
export function createMockTenantContext(tenantId: string = 'test-tenant') {
  return {
    tenantId,
    userId: 'test-user',
    requestId: 'test-request',
  }
}

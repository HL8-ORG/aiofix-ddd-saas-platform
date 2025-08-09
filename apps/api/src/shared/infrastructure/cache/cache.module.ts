import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { CacheModule } from '@nestjs/cache-manager'
import { ClsService } from 'nestjs-cls'
import { TenantAwareCacheService } from './services/tenant-aware-cache.service'
import { MultiLevelCacheService } from './services/multi-level-cache.service'
import { ClsBasedCacheKeyGenerator } from './utils/cache-key.generator'
import { CacheInterceptor, CacheInvalidateInterceptor } from './interceptors/cache.interceptor'

/**
 * @class CacheModule
 * @description
 * 全局缓存模块，提供多级缓存、租户感知缓存、缓存拦截器等功能。
 * 
 * 主要原理与机制：
 * 1. 使用@Global()装饰器，使缓存服务在全局可用
 * 2. 异步注册CacheModule，支持配置注入
 * 3. 提供多级缓存服务（内存+Redis）
 * 4. 支持租户数据隔离的缓存服务
 * 5. 提供缓存拦截器，实现声明式缓存
 */
@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        ...configService.get('cache'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    // 缓存键生成器
    ClsBasedCacheKeyGenerator,
    // 多级缓存服务
    MultiLevelCacheService,
    // 租户感知缓存服务
    TenantAwareCacheService,
    // 缓存拦截器
    CacheInterceptor,
    CacheInvalidateInterceptor,
    // CLS服务
    ClsService,
  ],
  exports: [
    CacheModule,
    MultiLevelCacheService,
    TenantAwareCacheService,
    CacheInterceptor,
    CacheInvalidateInterceptor,
  ],
})
export class AppCacheModule { }
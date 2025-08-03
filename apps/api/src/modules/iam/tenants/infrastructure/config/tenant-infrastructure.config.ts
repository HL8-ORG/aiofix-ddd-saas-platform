import { Module } from '@nestjs/common';
import { TenantRepositoryMemory } from '../repositories/tenant.repository.memory';
import { TenantNotificationService } from '../external/tenant-notification.service';
import { TenantCacheService } from '../cache/tenant-cache.service';

/**
 * @module TenantInfrastructureModule
 * @description
 * 租户基础设施层模块，负责配置基础设施层的依赖注入。
 * 
 * 主要功能：
 * 1. 注册仓储实现（使用内存实现进行测试）
 * 2. 注册外部服务
 * 3. 注册缓存服务
 * 4. 提供基础设施层的依赖注入
 */
@Module({
  providers: [
    // 仓储实现 - 使用内存实现进行测试
    {
      provide: 'TenantRepository',
      useClass: TenantRepositoryMemory
    },

    // 外部服务
    TenantNotificationService,

    // 缓存服务
    TenantCacheService
  ],
  exports: [
    'TenantRepository',
    TenantNotificationService,
    TenantCacheService
  ]
})
export class TenantInfrastructureModule { } 
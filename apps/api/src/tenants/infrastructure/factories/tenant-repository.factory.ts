import { Injectable } from '@nestjs/common'
import { EntityManager } from '@mikro-orm/core'
import { ITenantRepository } from '@/tenants/domain/repositories/tenant.repository.interface'
import { TenantRepository as MikroTenantRepository } from '../repositories/mikro/tenant.repository.mikro'
import { TenantRepositoryMemory } from '../repositories/mikro/tenant.repository.memory'

/**
 * @enum RepositoryType
 * @description 支持的仓储类型枚举
 */
export enum RepositoryType {
  MIKRO = 'mikro',
  MONGO = 'mongo',
  MEMORY = 'memory',
  // 可以添加更多ORM类型
}

/**
 * @interface RepositoryConfig
 * @description 仓储配置接口
 */
export interface RepositoryConfig {
  type: RepositoryType
  entityManager?: EntityManager
  // 可以添加其他ORM特定的配置
}

/**
 * @class TenantRepositoryFactory
 * @description
 * 租户仓储工厂，负责根据配置创建相应的仓储实现。
 * 该工厂支持多种ORM，实现仓储的灵活切换。
 * 
 * 主要原理与机制：
 * 1. 根据配置类型创建对应的仓储实现
 * 2. 支持依赖注入和配置管理
 * 3. 确保仓储接口的一致性
 * 4. 支持运行时切换仓储实现
 * 5. 便于测试和扩展
 */
@Injectable()
export class TenantRepositoryFactory {
  /**
   * @method create
   * @description 根据配置创建仓储实例
   * @param config 仓储配置
   * @returns 仓储实例
   */
  create(config: RepositoryConfig): ITenantRepository {
    switch (config.type) {
      case RepositoryType.MIKRO:
        if (!config.entityManager) {
          throw new Error('EntityManager is required for MikroORM repository')
        }
        return new MikroTenantRepository(config.entityManager)

      case RepositoryType.MONGO:
        // TODO: 实现MongoDB仓储
        throw new Error('MongoDB repository not implemented yet')

      case RepositoryType.MEMORY:
        return new TenantRepositoryMemory()

      default:
        throw new Error(`Unsupported repository type: ${config.type}`)
    }
  }

  /**
   * @method createMikroRepository
   * @description 创建MikroORM仓储实例
   * @param entityManager EntityManager实例
   * @returns MikroORM仓储实例
   */
  createMikroRepository(entityManager: EntityManager): ITenantRepository {
    return new MikroTenantRepository(entityManager)
  }

  /**
   * @method createMongoRepository
   * @description 创建MongoDB仓储实例
   * @returns MongoDB仓储实例
   */
  createMongoRepository(): ITenantRepository {
    // TODO: 实现MongoDB仓储
    throw new Error('MongoDB repository not implemented yet')
  }

  /**
   * @method createMemoryRepository
   * @description 创建内存仓储实例
   * @returns 内存仓储实例
   */
  createMemoryRepository(): ITenantRepository {
    return new TenantRepositoryMemory()
  }
}

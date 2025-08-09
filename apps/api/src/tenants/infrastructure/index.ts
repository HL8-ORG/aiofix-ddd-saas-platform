// 映射器接口
export * from './mappers/interfaces/tenant-mapper.interface'

// MikroORM实现
export { TenantEntity } from './entities/mikro/tenant.entity.mikro'
export { TenantMapper as MikroTenantMapper } from './mappers/mikro/tenant.mapper.mikro'
export { TenantRepository as MikroTenantRepository } from './repositories/mikro/tenant.repository.mikro'

// 内存仓储实现（用于测试）
export { TenantRepositoryMemory } from './repositories/mikro/tenant.repository.memory'

// MongoDB实现
export { TenantMapper as MongoTenantMapper } from './mappers/mongo/tenant.mapper.mongo'
export type { TenantDocument } from './mappers/mongo/tenant.mapper.mongo'

// 工厂
export * from './factories/tenant-repository.factory'

// 配置
export * from './config/orm.config'

// 服务
export * from './services/tenant.service'

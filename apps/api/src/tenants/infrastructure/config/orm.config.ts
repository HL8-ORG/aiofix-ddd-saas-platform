import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RepositoryType } from '../factories/tenant-repository.factory'

/**
 * @interface OrmConfig
 * @description ORM配置接口
 */
export interface OrmConfig {
  type: RepositoryType
  connectionString?: string
  database?: string
  options?: Record<string, any>
}

/**
 * @class OrmConfigService
 * @description
 * ORM配置服务，负责管理不同ORM的配置信息。
 * 该服务支持从环境变量和配置文件读取ORM配置。
 * 
 * 主要原理与机制：
 * 1. 从环境变量读取ORM类型和连接信息
 * 2. 支持多种ORM的配置管理
 * 3. 提供默认配置和验证
 * 4. 支持开发和生产环境的不同配置
 * 5. 便于测试和部署
 */
@Injectable()
export class OrmConfigService {
  constructor(private readonly configService: ConfigService) { }

  /**
   * @method getTenantRepositoryConfig
   * @description 获取租户仓储的ORM配置
   * @returns ORM配置
   */
  getTenantRepositoryConfig(): OrmConfig {
    const type = this.configService.get<string>('TENANT_REPOSITORY_TYPE', 'mikro') as RepositoryType

    return {
      type,
      connectionString: this.configService.get<string>('DATABASE_URL'),
      database: this.configService.get<string>('DATABASE_NAME', 'iam_db'),
      options: {
        host: this.configService.get<string>('DATABASE_HOST', 'localhost'),
        port: this.configService.get<number>('DATABASE_PORT', 5432),
        user: this.configService.get<string>('DATABASE_USER', 'postgres'),
        password: this.configService.get<string>('DATABASE_PASSWORD', 'password'),
      },
    }
  }

  /**
   * @method isMikroOrm
   * @description 检查是否使用MikroORM
   * @returns 是否使用MikroORM
   */
  isMikroOrm(): boolean {
    return this.getTenantRepositoryConfig().type === RepositoryType.MIKRO
  }

  /**
   * @method isMongoDb
   * @description 检查是否使用MongoDB
   * @returns 是否使用MongoDB
   */
  isMongoDb(): boolean {
    return this.getTenantRepositoryConfig().type === RepositoryType.MONGO
  }

  /**
   * @method validateConfig
   * @description 验证ORM配置
   * @param config ORM配置
   * @throws 配置错误时抛出异常
   */
  validateConfig(config: OrmConfig): void {
    if (!Object.values(RepositoryType).includes(config.type)) {
      throw new Error(`Unsupported repository type: ${config.type}`)
    }

    if (config.type === RepositoryType.MIKRO) {
      if (!config.options?.host || !config.options?.port) {
        throw new Error('MikroORM requires host and port configuration')
      }
    }

    if (config.type === RepositoryType.MONGO) {
      if (!config.connectionString && !config.database) {
        throw new Error('MongoDB requires connection string or database name')
      }
    }
  }
}

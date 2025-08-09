import { Injectable, OnApplicationShutdown } from '@nestjs/common'
import { EntityManager, MikroORM } from '@mikro-orm/core'

/**
 * @class DatabaseService
 * @description
 * 数据库服务，提供全局数据库操作功能。
 * 
 * 主要原理与机制：
 * 1. 提供实体管理器的统一访问点
 * 2. 支持事务管理
 * 3. 处理数据库连接的生命周期
 * 4. 提供数据库操作的辅助方法
 */
@Injectable()
export class DatabaseService implements OnApplicationShutdown {
  constructor(
    private readonly orm: MikroORM,
    private readonly em: EntityManager,
  ) { }

  /**
   * @method getEntityManager
   * @description 获取实体管理器
   * @returns {EntityManager} 新的实体管理器实例
   */
  getEntityManager(): EntityManager {
    return this.em.fork()
  }

  /**
   * @method withTransaction
   * @description 在事务中执行操作
   * @param callback 事务回调函数
   * @returns {Promise<T>} 事务执行结果
   */
  async withTransaction<T>(
    callback: (em: EntityManager) => Promise<T>,
  ): Promise<T> {
    const em = this.getEntityManager()
    return await em.transactional(callback)
  }

  /**
   * @method onApplicationShutdown
   * @description 应用关闭时断开数据库连接
   */
  async onApplicationShutdown() {
    await this.orm.close()
  }
}

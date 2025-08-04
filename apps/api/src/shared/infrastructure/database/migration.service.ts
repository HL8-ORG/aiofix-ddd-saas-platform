import type { EntityManager, MikroORM } from '@mikro-orm/core'
import { Injectable, Logger } from '@nestjs/common'

/**
 * @description 数据库迁移管理器服务
 *
 * 该服务提供数据库迁移和种子数据管理功能，支持：
 * 1. 自动迁移执行
 * 2. 种子数据插入
 * 3. 数据库状态检查
 * 4. 迁移回滚
 *
 * 使用场景：
 * - 应用启动时自动执行迁移
 * - 开发环境数据初始化
 * - 测试环境数据准备
 * - 生产环境数据迁移
 */
@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name)

  constructor(
    private readonly em: EntityManager,
    private readonly orm: MikroORM,
  ) {}

  /**
   * @description 执行数据库迁移
   * @param options 迁移选项
   */
  async runMigrations(
    options: {
      from?: string
      to?: string
      dryRun?: boolean
    } = {},
  ): Promise<void> {
    try {
      this.logger.log('开始执行数据库迁移...')

      const migrator = this.orm.getMigrator()

      // 检查是否有待执行的迁移
      const pending = await migrator.getPendingMigrations()

      if (pending.length === 0) {
        this.logger.log('没有待执行的迁移')
        return
      }

      this.logger.log(`发现 ${pending.length} 个待执行迁移`)

      // 执行迁移
      const result = await migrator.up(options)

      this.logger.log(`成功执行 ${result.length} 个迁移`)

      // 记录迁移详情
      result.forEach((migration) => {
        this.logger.log(`- ${migration.name}`)
      })
    } catch (error) {
      this.logger.error('迁移执行失败:', error)
      throw error
    }
  }

  /**
   * @description 执行种子数据插入
   * @param seederName 种子数据名称
   */
  async runSeeder(seederName?: string): Promise<void> {
    try {
      this.logger.log('开始执行种子数据插入...')

      const seeder = this.orm.getSeeder()

      if (seederName) {
        await seeder.seedString(seederName)
        this.logger.log(`成功执行种子数据: ${seederName}`)
      } else {
        await seeder.seed()
        this.logger.log('成功执行所有种子数据')
      }
    } catch (error) {
      this.logger.error('种子数据插入失败:', error)
      throw error
    }
  }

  /**
   * @description 检查数据库连接状态
   */
  async checkConnection(): Promise<boolean> {
    try {
      await this.em.getConnection().execute('SELECT 1')
      this.logger.log('数据库连接正常')
      return true
    } catch (error) {
      this.logger.error('数据库连接失败:', error)
      return false
    }
  }

  /**
   * @description 获取数据库版本信息
   */
  async getDatabaseVersion(): Promise<string> {
    try {
      const result = await this.em.getConnection().execute('SELECT version()')
      return result[0]?.version || 'Unknown'
    } catch (error) {
      this.logger.error('获取数据库版本失败:', error)
      return 'Unknown'
    }
  }

  /**
   * @description 获取迁移状态
   */
  async getMigrationStatus(): Promise<{
    executed: string[]
    pending: string[]
  }> {
    try {
      const migrator = this.orm.getMigrator()

      const executed = await migrator.getExecutedMigrations()
      const pending = await migrator.getPendingMigrations()

      return {
        executed: executed.map((m) => m.name),
        pending: pending.map((m) => m.name),
      }
    } catch (error) {
      this.logger.error('获取迁移状态失败:', error)
      return { executed: [], pending: [] }
    }
  }

  /**
   * @description 回滚迁移
   * @param steps 回滚步数
   */
  async rollbackMigrations(steps = 1): Promise<void> {
    try {
      this.logger.log(`开始回滚 ${steps} 个迁移...`)

      const migrator = this.orm.getMigrator()
      // 获取已执行的迁移
      const executed = await migrator.getExecutedMigrations()
      const toRollback = executed.slice(-steps)

      if (toRollback.length === 0) {
        this.logger.log('没有可回滚的迁移')
        return
      }

      // 回滚指定的迁移
      for (const migration of toRollback.reverse()) {
        await migrator.down(migration.name)
        this.logger.log(`- 回滚迁移: ${migration.name}`)
      }

      this.logger.log(`成功回滚 ${toRollback.length} 个迁移`)
    } catch (error) {
      this.logger.error('迁移回滚失败:', error)
      throw error
    }
  }

  /**
   * @description 创建数据库表结构
   */
  async createSchema(): Promise<void> {
    try {
      this.logger.log('开始创建数据库表结构...')

      const schemaGenerator = this.orm.getSchemaGenerator()
      await schemaGenerator.createSchema()

      this.logger.log('数据库表结构创建成功')
    } catch (error) {
      this.logger.error('创建数据库表结构失败:', error)
      throw error
    }
  }

  /**
   * @description 更新数据库表结构
   */
  async updateSchema(): Promise<void> {
    try {
      this.logger.log('开始更新数据库表结构...')

      const schemaGenerator = this.orm.getSchemaGenerator()
      await schemaGenerator.updateSchema()

      this.logger.log('数据库表结构更新成功')
    } catch (error) {
      this.logger.error('更新数据库表结构失败:', error)
      throw error
    }
  }

  /**
   * @description 删除数据库表结构
   */
  async dropSchema(): Promise<void> {
    try {
      this.logger.log('开始删除数据库表结构...')

      const schemaGenerator = this.orm.getSchemaGenerator()
      await schemaGenerator.dropSchema()

      this.logger.log('数据库表结构删除成功')
    } catch (error) {
      this.logger.error('删除数据库表结构失败:', error)
      throw error
    }
  }
}

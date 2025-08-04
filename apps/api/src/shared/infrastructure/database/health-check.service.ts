import type { EntityManager, MikroORM } from '@mikro-orm/core'
import { Injectable, Logger } from '@nestjs/common'

/**
 * @description 数据库健康检查服务
 *
 * 该服务提供数据库连接状态监控和健康检查功能，支持：
 * 1. 连接状态检查
 * 2. 性能指标监控
 * 3. 连接池状态检查
 * 4. 数据库版本信息
 *
 * 使用场景：
 * - 应用启动时的健康检查
 * - 定期监控数据库状态
 * - 负载均衡器的健康检查
 * - 运维监控和告警
 */
@Injectable()
export class DatabaseHealthCheckService {
  private readonly logger = new Logger(DatabaseHealthCheckService.name)

  constructor(
    private readonly em: EntityManager,
    private readonly orm: MikroORM,
  ) {}

  /**
   * @description 执行数据库健康检查
   */
  async checkHealth(): Promise<{
    status: string
    details: {
      connection: boolean
      version: string
      poolStatus: any
      lastCheck: Date
    }
  }> {
    try {
      this.logger.log('开始数据库健康检查...')

      // 检查连接状态
      const connectionOk = await this.checkConnection()

      // 获取数据库版本
      const version = await this.getDatabaseVersion()

      // 获取连接池状态
      const poolStatus = await this.getPoolStatus()

      const isHealthy = connectionOk

      const result = {
        status: isHealthy ? 'healthy' : 'unhealthy',
        details: {
          connection: connectionOk,
          version,
          poolStatus,
          lastCheck: new Date(),
        },
      }

      if (isHealthy) {
        this.logger.log('数据库健康检查通过')
      } else {
        this.logger.error('数据库健康检查失败')
      }

      return result
    } catch (error) {
      this.logger.error('数据库健康检查异常:', error)
      return {
        status: 'unhealthy' as const,
        details: {
          connection: false,
          version: 'Unknown',
          poolStatus: null,
          lastCheck: new Date(),
        },
      }
    }
  }

  /**
   * @description 检查数据库连接状态
   */
  async checkConnection(): Promise<boolean> {
    try {
      await this.em.getConnection().execute('SELECT 1')
      return true
    } catch (error) {
      this.logger.error('数据库连接检查失败:', error)
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
   * @description 获取连接池状态
   */
  async getPoolStatus(): Promise<any> {
    try {
      // 简化连接池状态检查
      return {
        available: true,
        note: 'Pool status not available in this version',
      }
    } catch (error) {
      this.logger.error('获取连接池状态失败:', error)
      return null
    }
  }

  /**
   * @description 获取数据库统计信息
   */
  async getDatabaseStats(): Promise<{
    tableCount: number
    totalSize: string
    activeConnections: number
  }> {
    try {
      // 获取表数量
      const tablesResult = await this.em.getConnection().execute(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `)
      const tableCount = Number.parseInt(tablesResult[0]?.count || '0')

      // 获取数据库大小
      const sizeResult = await this.em.getConnection().execute(`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `)
      const totalSize = sizeResult[0]?.size || 'Unknown'

      // 获取活跃连接数
      const connectionsResult = await this.em.getConnection().execute(`
        SELECT COUNT(*) as count 
        FROM pg_stat_activity 
        WHERE state = 'active'
      `)
      const activeConnections = Number.parseInt(
        connectionsResult[0]?.count || '0',
      )

      return {
        tableCount,
        totalSize,
        activeConnections,
      }
    } catch (error) {
      this.logger.error('获取数据库统计信息失败:', error)
      return {
        tableCount: 0,
        totalSize: 'Unknown',
        activeConnections: 0,
      }
    }
  }

  /**
   * @description 测试数据库性能
   */
  async testPerformance(): Promise<{
    queryTime: number
    connectionTime: number
    overall: 'good' | 'acceptable' | 'poor'
  }> {
    try {
      const startTime = Date.now()

      // 测试连接时间
      const connectionStart = Date.now()
      await this.em.getConnection().execute('SELECT 1')
      const connectionTime = Date.now() - connectionStart

      // 测试查询时间
      const queryStart = Date.now()
      await this.em
        .getConnection()
        .execute('SELECT COUNT(*) FROM information_schema.tables')
      const queryTime = Date.now() - queryStart

      const totalTime = Date.now() - startTime

      // 评估性能
      let overall: 'good' | 'acceptable' | 'poor'
      if (totalTime < 100) {
        overall = 'good'
      } else if (totalTime < 500) {
        overall = 'acceptable'
      } else {
        overall = 'poor'
      }

      return {
        queryTime,
        connectionTime,
        overall,
      }
    } catch (error) {
      this.logger.error('性能测试失败:', error)
      return {
        queryTime: 0,
        connectionTime: 0,
        overall: 'poor' as const,
      }
    }
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { EntityManager, MikroORM } from '@mikro-orm/core';
import { DatabaseModule } from '../mikro-orm.module';
import { MigrationService } from '../migration.service';
import { DatabaseHealthCheckService } from '../health-check.service';
import { DatabaseUtils } from '../database.utils';

/**
 * @description 数据库模块测试
 * 
 * 测试数据库基础设施模块的各项功能，包括：
 * 1. 模块初始化
 * 2. 服务注入
 * 3. 数据库连接
 * 4. 健康检查
 * 5. 工具类功能
 */
describe('数据库模块测试', () => {
  let module: TestingModule;
  let em: EntityManager;
  let orm: MikroORM;
  let migrationManager: MigrationService;
  let healthCheckService: DatabaseHealthCheckService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env.development.local', '.env'],
        }),
        DatabaseModule,
      ],
    }).compile();

    em = module.get<EntityManager>(EntityManager);
    orm = module.get<MikroORM>(MikroORM);
    migrationManager = module.get<MigrationService>(MigrationService);
    healthCheckService = module.get<DatabaseHealthCheckService>(DatabaseHealthCheckService);
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  describe('模块初始化测试', () => {
    it('应该成功初始化数据库模块', () => {
      expect(module).toBeDefined();
      expect(em).toBeDefined();
      expect(orm).toBeDefined();
      expect(migrationManager).toBeDefined();
      expect(healthCheckService).toBeDefined();
    });

    it('应该能够获取EntityManager实例', () => {
      expect(em).toBeInstanceOf(EntityManager);
    });

    it('应该能够获取MikroORM实例', () => {
      expect(orm).toBeInstanceOf(MikroORM);
    });
  });

  describe('数据库连接测试', () => {
    it('应该能够连接到数据库', async () => {
      const result = await em.getConnection().execute('SELECT 1');
      expect(result).toBeDefined();
    });

    it('应该能够获取数据库版本', async () => {
      const version = await healthCheckService.getDatabaseVersion();
      expect(version).toBeDefined();
      expect(version).toContain('PostgreSQL');
    });
  });

  describe('健康检查服务测试', () => {
    it('应该能够执行健康检查', async () => {
      const health = await healthCheckService.checkHealth();

      expect(health).toBeDefined();
      expect(health.status).toBeDefined();
      expect(health.details).toBeDefined();
      expect(health.details.connection).toBe(true);
      expect(health.details.version).toBeDefined();
      expect(health.details.lastCheck).toBeInstanceOf(Date);
    });

    it('应该能够检查连接状态', async () => {
      const isConnected = await healthCheckService.checkConnection();
      expect(isConnected).toBe(true);
    });

    it('应该能够获取数据库统计信息', async () => {
      const stats = await healthCheckService.getDatabaseStats();

      expect(stats).toBeDefined();
      expect(stats.tableCount).toBeGreaterThanOrEqual(0);
      expect(stats.totalSize).toBeDefined();
      expect(stats.activeConnections).toBeGreaterThanOrEqual(0);
    });

    it('应该能够测试数据库性能', async () => {
      const performance = await healthCheckService.testPerformance();

      expect(performance).toBeDefined();
      expect(performance.queryTime).toBeGreaterThanOrEqual(0);
      expect(performance.connectionTime).toBeGreaterThanOrEqual(0);
      expect(['good', 'acceptable', 'poor']).toContain(performance.overall);
    });
  });

  describe('迁移管理器服务测试', () => {
    it('应该能够获取迁移状态', async () => {
      const status = await migrationManager.getMigrationStatus();

      expect(status).toBeDefined();
      expect(status.executed).toBeInstanceOf(Array);
      expect(status.pending).toBeInstanceOf(Array);
    });

    it('应该能够检查数据库连接', async () => {
      const isConnected = await migrationManager.checkConnection();
      expect(isConnected).toBe(true);
    });

    it('应该能够获取数据库版本', async () => {
      const version = await migrationManager.getDatabaseVersion();
      expect(version).toBeDefined();
      expect(version).toContain('PostgreSQL');
    });
  });

  describe('数据库工具类测试', () => {
    it('应该能够构建分页查询', () => {
      const pagination = DatabaseUtils.buildPagination(2, 20);

      expect(pagination).toBeDefined();
      expect(pagination.offset).toBe(20);
      expect(pagination.limit).toBe(20);
      expect(pagination.page).toBe(2);
    });

    it('应该能够构建排序查询', () => {
      const sorting = DatabaseUtils.buildSorting('name', 'DESC', ['name', 'createdAt']);

      expect(sorting).toBeDefined();
      expect(sorting.sortBy).toBe('name');
      expect(sorting.sortOrder).toBe('DESC');
    });

    it('应该能够构建搜索查询', () => {
      const search = DatabaseUtils.buildSearchQuery('test', ['name', 'description']);

      expect(search).toBeDefined();
      expect(search.$or).toBeDefined();
      expect(search.$or).toHaveLength(2);
    });

    it('应该能够构建日期范围查询', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const dateRange = DatabaseUtils.buildDateRangeQuery(startDate, endDate, 'createdAt');

      expect(dateRange).toBeDefined();
      expect(dateRange.createdAt).toBeDefined();
      expect(dateRange.createdAt.$gte).toBe(startDate);
      expect(dateRange.createdAt.$lte).toBe(endDate);
    });

    it('应该能够构建软删除查询条件', () => {
      const softDelete = DatabaseUtils.buildSoftDeleteCondition(false);

      expect(softDelete).toBeDefined();
      expect(softDelete.$or).toBeDefined();
      expect(softDelete.$or).toHaveLength(2);
    });

    it('应该能够格式化查询结果', () => {
      const data = [{ id: 1, name: 'test' }];
      const result = DatabaseUtils.formatQueryResult(data, {
        total: 100,
        page: 1,
        limit: 10,
        includeMetadata: true,
      });

      expect(result).toBeDefined();
      expect(result.data).toEqual(data);
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.total).toBe(100);
      expect(result.metadata?.page).toBe(1);
      expect(result.metadata?.limit).toBe(10);
      expect(result.metadata?.totalPages).toBe(10);
    });

    it('应该能够生成UUID', () => {
      const uuid = DatabaseUtils.generateUuid();

      expect(uuid).toBeDefined();
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    it('应该能够生成短UUID', () => {
      const shortUuid = DatabaseUtils.generateShortUuid();

      expect(shortUuid).toBeDefined();
      expect(shortUuid.length).toBeGreaterThan(0);
    });

    it('应该能够转义SQL字符串', () => {
      const original = "O'Reilly";
      const escaped = DatabaseUtils.escapeSqlString(original);

      expect(escaped).toBe("O''Reilly");
    });

    it('应该能够构建IN查询条件', () => {
      const values = [1, 2, 3];
      const condition = DatabaseUtils.buildInCondition('id', values);

      expect(condition).toBeDefined();
      expect(condition.id.$in).toEqual(values);
    });

    it('应该能够构建NOT IN查询条件', () => {
      const values = [1, 2, 3];
      const condition = DatabaseUtils.buildNotInCondition('id', values);

      expect(condition).toBeDefined();
      expect(condition.id.$nin).toEqual(values);
    });
  });

  describe('事务测试', () => {
    it('应该能够执行事务操作', async () => {
      const result = await DatabaseUtils.executeInTransaction(em, async () => {
        // 在事务中执行一个简单的查询
        const queryResult = await em.getConnection().execute('SELECT 1 as test');
        return queryResult[0].test;
      });

      expect(result).toBe(1);
    });

    it('应该在事务失败时回滚', async () => {
      await expect(
        DatabaseUtils.executeInTransaction(em, async () => {
          // 故意执行一个会失败的查询
          await em.getConnection().execute('SELECT * FROM non_existent_table');
        })
      ).rejects.toThrow();
    });
  });
}); 
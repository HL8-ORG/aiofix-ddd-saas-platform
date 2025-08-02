import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { registerAs } from '@nestjs/config';

/**
 * @module databaseConfig
 * @description
 * 数据库配置模块，基于NestJS的ConfigModule实现，负责提供MikroORM所需的数据库连接参数。
 *
 * 主要原理与机制如下：
 * 1. 通过`registerAs`方法注册名为'database'的配置命名空间，便于全局依赖注入和配置解耦。
 * 2. 读取环境变量（如DATABASE_HOST、DATABASE_PORT等），实现多环境灵活配置。
 * 3. `entities`指定编译后实体文件路径，`entitiesTs`指定源码实体路径，支持开发与生产环境自动切换。
 * 4. `driver`指定为PostgreSqlDriver，确保MikroORM使用PostgreSQL数据库驱动进行连接和操作。
 * 5. 该配置对象可被MikroOrmModule.forRootAsync等异步模块加载方式直接消费，实现配置与业务分离。
 */
export default registerAs('database', () => ({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT) || 5432,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  dbName: process.env.DATABASE_NAME,
  entities: ['./dist/entities/**/*.js'],
  entitiesTs: ['./src/entities/**/*.ts'],
  driver: PostgreSqlDriver,
}));

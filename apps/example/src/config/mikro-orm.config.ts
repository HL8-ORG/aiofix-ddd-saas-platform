import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { Options } from '@mikro-orm/core';
import dotenv from 'dotenv';
import { SeedManager } from '@mikro-orm/seeder';

/**
 * @file mikro-orm.config.ts
 * @description
 * MikroORM 配置文件，负责初始化数据库连接、实体、迁移与数据填充等相关配置。
 *
 * 主要原理与机制如下：
 * 1. 通过 dotenv 加载环境变量，优先读取 .env.development.local，其次读取 .env 文件，确保开发和生产环境的灵活配置。
 * 2. 配置数据库连接参数（host、port、user、password、dbName），均从环境变量中读取，便于环境切换和安全管理。
 * 3. entities 与 entitiesTs 分别指定编译后和源码的实体文件路径，支持开发与生产环境的自动切换。
 * 4. seeder 配置项用于数据填充，支持自定义填充器路径、默认填充器、文件匹配规则、输出格式（ts/js）及文件命名规则。
 *    - fileName 方法将类名转为小写并追加 .seeder 后缀，便于统一管理。
 * 5. migrations 配置项用于数据库迁移，支持自定义迁移文件路径和文件匹配规则，便于版本管理和自动化部署。
 * 6. driver 指定为 PostgreSqlDriver，确保 ORM 使用 PostgreSQL 作为底层数据库驱动。
 * 7. extensions 加载 Migrator 和 SeedManager 扩展，分别用于数据库迁移和数据填充功能。
 * 8. debug 根据 NODE_ENV 环境变量自动切换，非生产环境下开启调试模式，便于开发排查问题。
 */

const envFiles = ['.env.development.local', '.env'];
dotenv.config({ path: envFiles });

/**
 * @constant config
 * @type {Options}
 * @description
 * MikroORM 的主配置对象，包含数据库连接、实体、迁移、数据填充等所有核心参数。
 */
const config: Options = {
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT) || 5432,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  dbName: process.env.DATABASE_NAME,
  entities: ['./dist/entities/**/*.js'],
  entitiesTs: ['./src/entities/**/*.ts'],
  seeder: {
    path: process.env.MIKRO_ORM_SEEDER_PATH || './dist/database/seeders',
    pathTs: process.env.MIKRO_ORM_SEEDER_PATH_TS || './src/database/seeders',
    defaultSeeder:
      process.env.MIKRO_ORM_SEEDER_DEFAULT_SEEDER || 'DatabaseSeeder',
    glob: process.env.MIKRO_ORM_SEEDER_GLOB || '!(*.d).{js,ts}',
    emit:
      (process.env.MIKRO_ORM_SEEDER_EMIT as 'ts' | 'js' | undefined) || 'ts',
    fileName: (className: string) => className.toLowerCase() + '.seeder',
  },
  migrations: {
    path: process.env.MIKRO_ORM_MIGRATION_PATH || './dist/database/migrations',
    pathTs:
      process.env.MIKRO_ORM_MIGRATION_PATH_TS || './src/database/migrations',
    glob: process.env.MIKRO_ORM_MIGRATION_GLOB || '!(*.d).{js,ts}',
  },
  driver: PostgreSqlDriver,
  extensions: [Migrator, SeedManager],
  debug: process.env.NODE_ENV !== 'production',
};

export default config;

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import pinoLoggerConfig from './config/pino-logger.config';
import tenantConfig from './config/tenant.config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import authConfig from './config/auth.config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ValidatorsModule } from './validators/validators.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import throttleConfig from './config/throttle.config';
import { CaslModule } from './casl/casl.module';
import { LoggerModule } from 'pino-nestjs';
import { TenantModule } from './tenants/tenants.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { ClsModule } from 'nestjs-cls';

/**
 * @module AppModule
 * @description
 * 应用的主模块，负责全局依赖注入、配置加载、数据库连接、日志、限流、租户、权限等核心功能的集成。
 *
 * 主要原理与机制如下：
 *
 * 1. ClsModule：全局上下文存储（CLS），用于实现请求级别的数据隔离和追踪，支持多租户等场景。
 *    - 通过`global: true`和`middleware.mount: true`，自动为每个请求创建独立上下文。
 *
 * 2. ConfigModule：全局配置模块，支持多环境配置文件加载（如.env.development.local、.env），
 *    并通过`load`参数加载自定义配置工厂（数据库、认证、租户等）。
 *
 * 3. MikroOrmModule：异步方式初始化数据库ORM，支持依赖注入和配置解耦。
 *
 * 4. ThrottlerModule：全局限流模块，防止接口被恶意刷请求，配置通过throttleConfig异步加载。
 *
 * 5. LoggerModule：集成pino高性能日志，异步加载配置，提升日志结构化和性能。
 *
 * 6. AuthModule、UsersModule、TenantModule、OrganizationsModule、CaslModule、ValidatorsModule：
 *    分别负责认证、用户、租户、组织、权限（CASL）、自定义校验器等领域功能的模块化拆分。
 *
 * 7. providers:
 *    - AppService：主服务逻辑。
 *    - APP_GUARD（JwtAuthGuard）：全局JWT认证守卫，保护所有路由，未认证请求将被拦截。
 *    - APP_GUARD（ThrottlerGuard）：全局限流守卫，所有路由自动应用限流策略。
 *      多个APP_GUARD会按顺序依次执行，确保认证和限流都生效。
 */
@Module({
  imports: [
    // 全局上下文存储，支持请求级别数据隔离
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
      },
    }),
    // 全局配置模块，支持多环境和自定义配置工厂
    ConfigModule.forRoot({
      envFilePath: ['.env.development.local', '.env'],
      isGlobal: true,
      load: [databaseConfig, authConfig, tenantConfig],
    }),
    // 异步初始化数据库ORM，明确指定PostgreSQL驱动
    MikroOrmModule.forRootAsync({
      useFactory: databaseConfig,
      driver: PostgreSqlDriver,
    }),
    // 异步初始化全局限流
    ThrottlerModule.forRootAsync(throttleConfig.asProvider()),
    // 认证、用户、校验器、权限、日志、租户、组织等功能模块
    AuthModule,
    UsersModule,
    ValidatorsModule,
    CaslModule,
    LoggerModule.forRootAsync(pinoLoggerConfig.asProvider()),
    TenantModule,
    OrganizationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 全局JWT认证守卫，保护所有路由
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // 全局限流守卫，所有路由自动限流
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

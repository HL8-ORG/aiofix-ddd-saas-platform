import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import authConfig from 'src/config/auth.config';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from 'src/entities/user.entity';

/**
 * @module AuthModule
 * @description
 * 认证模块，负责系统的用户认证、登录、注册及相关安全机制的集成。
 *
 * 代码原理与机制说明：
 * 1. 通过@Module装饰器声明为NestJS模块，聚合认证相关的服务、控制器与依赖。
 * 2. imports部分：
 *    - UsersModule：引入用户模块，便于认证服务查询和管理用户数据。
 *    - PassportModule：集成Passport中间件，支持多种认证策略（如本地、JWT等）。
 *    - JwtModule.registerAsync(authConfig.asProvider())：异步注册JWT模块，动态加载认证配置（如密钥、过期时间），提升安全性与灵活性。
 *    - MikroOrmModule.forFeature([User])：注册User实体，便于认证服务通过ORM操作用户数据。
 * 3. controllers部分：
 *    - AuthController：认证控制器，暴露登录、注册、获取当前用户等接口。
 * 4. providers部分：
 *    - AuthService：核心认证服务，封装登录、注册、校验等业务逻辑。
 *    - JwtStrategy：JWT认证策略，负责解析和校验JWT令牌。
 *    - LocalStrategy：本地认证策略，负责用户名密码登录校验。
 * 5. exports部分：
 *    - AuthService：对外导出认证服务，便于其他模块（如用户模块、权限模块）复用认证逻辑。
 *
 * 该模块实现了认证相关的解耦与高内聚，支持灵活扩展多种认证方式，保障系统安全。
 */
@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync(authConfig.asProvider()),
    MikroOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}

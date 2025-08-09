import { registerAs } from '@nestjs/config';
import { Organization } from 'src/entities/organization.entity';
import { User } from 'src/entities/user.entity';

/**
 * @file tenant.config.ts
 * @description
 * 多租户（Tenant）配置模块，负责注册与租户相关的实体和域名信息，供全局依赖注入使用。
 *
 * 主要原理与机制如下：
 * 1. 使用 registerAs 方法将配置注册为 'tenant' 命名空间，便于在 NestJS 应用中通过 ConfigService 按命名空间获取配置。
 * 2. entities 字段包含所有与租户相关的实体（如 User、Organization），用于 ORM 自动加载和管理多租户数据结构。
 * 3. domain 字段从环境变量 TENANT_DOMAIN 读取，支持不同租户通过不同域名进行隔离和路由，便于实现多租户架构下的域名分流。
 */
export default registerAs('tenant', () => ({
  entities: [User, Organization],
  domain: process.env.TENANT_DOMAIN,
}));

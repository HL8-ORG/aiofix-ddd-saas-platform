import { registerAs } from '@nestjs/config';

/**
 * @interface UserInfrastructureConfig
 * @description
 * 用户基础设施配置接口，定义用户模块的基础设施层配置选项。
 * 
 * 主要配置项包括：
 * 1. 缓存配置：用户数据的缓存策略和过期时间
 * 2. 数据库配置：用户相关的数据库连接和查询配置
 * 3. 外部服务配置：用户通知、邮件等服务集成配置
 * 4. 安全配置：用户密码策略、登录限制等安全相关配置
 */
export interface UserInfrastructureConfig {
  cache: {
    enabled: boolean;
    ttl: number; // 缓存过期时间（秒）
    maxSize: number; // 最大缓存条目数
  };
  database: {
    connectionTimeout: number; // 数据库连接超时时间（毫秒）
    queryTimeout: number; // 查询超时时间（毫秒）
    maxConnections: number; // 最大连接数
  };
  external: {
    notification: {
      enabled: boolean;
      endpoint: string;
      timeout: number;
    };
    email: {
      enabled: boolean;
      provider: string;
      templatePath: string;
    };
  };
  security: {
    passwordMinLength: number;
    passwordMaxLength: number;
    passwordRequireSpecialChar: boolean;
    maxLoginAttempts: number;
    lockoutDuration: number; // 锁定持续时间（分钟）
    sessionTimeout: number; // 会话超时时间（分钟）
  };
}

/**
 * @function userInfrastructureConfig
 * @description
 * 用户基础设施配置工厂函数，使用registerAs注册配置命名空间。
 * 
 * 主要原理与机制：
 * 1. 使用registerAs创建命名空间为'userInfrastructure'的配置
 * 2. 从环境变量读取配置值，提供合理的默认值
 * 3. 支持不同环境的配置覆盖（开发、测试、生产）
 * 4. 配置项类型安全，通过TypeScript接口约束
 */
export const userInfrastructureConfig = registerAs(
  'userInfrastructure',
  (): UserInfrastructureConfig => ({
    cache: {
      enabled: process.env.USER_CACHE_ENABLED === 'true' || true,
      ttl: parseInt(process.env.USER_CACHE_TTL || '3600', 10), // 1小时
      maxSize: parseInt(process.env.USER_CACHE_MAX_SIZE || '1000', 10),
    },
    database: {
      connectionTimeout: parseInt(process.env.USER_DB_CONNECTION_TIMEOUT || '5000', 10),
      queryTimeout: parseInt(process.env.USER_DB_QUERY_TIMEOUT || '30000', 10),
      maxConnections: parseInt(process.env.USER_DB_MAX_CONNECTIONS || '10', 10),
    },
    external: {
      notification: {
        enabled: process.env.USER_NOTIFICATION_ENABLED === 'true' || false,
        endpoint: process.env.USER_NOTIFICATION_ENDPOINT || 'http://localhost:3001/notifications',
        timeout: parseInt(process.env.USER_NOTIFICATION_TIMEOUT || '5000', 10),
      },
      email: {
        enabled: process.env.USER_EMAIL_ENABLED === 'true' || false,
        provider: process.env.USER_EMAIL_PROVIDER || 'smtp',
        templatePath: process.env.USER_EMAIL_TEMPLATE_PATH || './templates/emails',
      },
    },
    security: {
      passwordMinLength: parseInt(process.env.USER_PASSWORD_MIN_LENGTH || '8', 10),
      passwordMaxLength: parseInt(process.env.USER_PASSWORD_MAX_LENGTH || '128', 10),
      passwordRequireSpecialChar: process.env.USER_PASSWORD_REQUIRE_SPECIAL_CHAR === 'true' || true,
      maxLoginAttempts: parseInt(process.env.USER_MAX_LOGIN_ATTEMPTS || '5', 10),
      lockoutDuration: parseInt(process.env.USER_LOCKOUT_DURATION || '30', 10), // 30分钟
      sessionTimeout: parseInt(process.env.USER_SESSION_TIMEOUT || '1440', 10), // 24小时
    },
  }),
); 
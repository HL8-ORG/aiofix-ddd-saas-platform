import { registerAs } from '@nestjs/config';

/**
 * @file auth.config.ts
 * @description
 * JWT认证配置模块，负责注册与认证相关的全局配置，供NestJS应用依赖注入使用。
 *
 * 主要原理与机制如下：
 * 1. 使用registerAs方法将配置注册为'auth'命名空间，便于通过ConfigService获取认证相关配置。
 * 2. secret字段从环境变量JWT_SECRET读取，作为JWT签名和验证的密钥，确保令牌安全性。
 * 3. signOptions字段配置JWT的签发选项，如expiresIn（令牌有效期），同样从环境变量JWT_EXPIRES_IN读取，支持灵活调整令牌过期时间。
 * 4. 该配置通常被Passport、@nestjs/jwt等认证模块自动读取，实现统一的认证机制和安全策略。
 */
export default registerAs('auth', () => ({
  secret: process.env.JWT_SECRET,
  signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
}));

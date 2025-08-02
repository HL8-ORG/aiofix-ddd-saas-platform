import { registerAs } from '@nestjs/config';

/**
 * @file throttle.config.ts
 * @description
 * 全局限流（Throttle）配置模块，定义不同级别的限流策略，供NestJS应用中依赖注入使用。
 *
 * 主要原理与机制如下：
 * 1. 使用 registerAs 方法将限流配置注册为 'throttle' 命名空间，便于通过 ConfigService 获取和管理限流策略。
 * 2. 配置数组中每个对象代表一种限流策略，包含 name（策略名称）、ttl（时间窗口，单位为毫秒）、limit（窗口内最大请求数）。
 * 3. 通过为不同业务场景（如短时、普通、长时）设置不同的限流参数，实现灵活的流量控制，防止接口被恶意刷请求。
 * 4. 该配置可被全局限流守卫（如NestJS ThrottlerGuard）读取，实现多策略动态限流。
 */
export default registerAs('throttle', () => [
  {
    name: 'short', // 短时间窗口限流策略
    ttl: 1000, // 1秒内
    limit: 2, // 最多允许2次请求
  },
  {
    name: 'medium', // 中等时间窗口限流策略
    ttl: 10000, // 10秒内
    limit: 20, // 最多允许20次请求
  },
  {
    name: 'long', // 长时间窗口限流策略
    ttl: 60000, // 60秒内
    limit: 100, // 最多允许100次请求
  },
]);

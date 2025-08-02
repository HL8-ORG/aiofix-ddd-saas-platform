import { SetMetadata } from '@nestjs/common';

/**
 * @constant SKIP_TENANT_KEY
 * @description
 * 用于标记路由或控制器是否跳过多租户校验的元数据Key。
 *
 * 代码原理与机制说明：
 * 1. 该常量作为元数据的Key，配合NestJS的SetMetadata装饰器使用。
 * 2. 在多租户守卫（如TenantGuard）中可通过Reflector获取该Key对应的元数据，判断当前路由是否需要跳过租户校验。
 */
export const SKIP_TENANT_KEY = 'skipTenant';

/**
 * @decorator SkipTenant
 * @description
 * 自定义装饰器，用于标记控制器或路由跳过多租户校验。
 *
 * 代码原理与机制说明：
 * 1. 基于NestJS的SetMetadata实现，将SKIP_TENANT_KEY设置为true，作为元数据附加到目标路由或控制器上。
 * 2. 在全局多租户守卫中，通过Reflector读取该元数据，若为true则跳过租户校验逻辑，允许无租户上下文访问。
 * 3. 该装饰器常用于无需租户隔离的接口，如系统管理、健康检查等，提升多租户系统的灵活性与可维护性。
 *
 * @example
 * ```ts
 * @SkipTenant()
 * @Get('health')
 * healthCheck() {
 *   // 该接口跳过租户校验
 * }
 * ```
 */
export const SkipTenant = () => SetMetadata(SKIP_TENANT_KEY, true);

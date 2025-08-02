import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * @const UserTenant
 * @description
 * 自定义参数装饰器，用于在控制器方法参数中自动注入当前请求用户的租户（tenant）信息。
 *
 * 原理与机制说明：
 * 1. 该装饰器基于NestJS的`createParamDecorator`实现，允许开发者在控制器方法参数上使用`@UserTenant()`，
 *    自动获取当前请求对象（request）中的`user.tenant`属性。
 * 2. `ExecutionContext`用于获取当前请求的上下文环境，通过`switchToHttp().getRequest()`方法获取原始的HTTP请求对象。
 * 3. 假设认证中间件（如Passport）已将用户信息挂载到`request.user`上，此装饰器即可安全地提取`tenant`字段。
 * 4. 该装饰器简化了多租户场景下租户信息的获取流程，提升了代码的可读性与复用性。
 *
 * @example
 * ```ts
 * @Get()
 * async findAll(@UserTenant() tenant: string) {
 *   // tenant即为当前用户的租户信息
 * }
 * ```
 */
export const UserTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    // 获取当前HTTP请求对象
    const request = ctx.switchToHttp().getRequest();
    // 返回用户的租户信息
    return request.user.tenant;
  },
);

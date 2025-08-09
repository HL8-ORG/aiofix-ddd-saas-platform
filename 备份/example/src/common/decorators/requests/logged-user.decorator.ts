import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * @constant LoggedUser
 * @description
 * 自定义参数装饰器，用于在控制器方法中便捷地获取当前已登录用户对象。
 *
 * 代码原理与机制说明：
 * 1. 基于NestJS的`createParamDecorator`工厂函数实现，支持依赖注入和上下文感知。
 * 2. 装饰器回调函数接收两个参数：`data`（装饰器传参，当前未用）和`ctx`（执行上下文）。
 * 3. 通过`ctx.switchToHttp().getRequest()`获取当前HTTP请求对象（Express Request）。
 * 4. 直接返回`request.user`，即认证中间件（如Passport）注入的用户信息，便于在控制器中直接注入用户实体。
 * 5. 该装饰器常用于需要获取当前用户信息的接口方法参数，提升代码可读性和复用性，避免手动解析请求对象。
 *
 * @example
 * ```ts
 * @Get('profile')
 * getProfile(@LoggedUser() user: User) {
 *   return user;
 * }
 * ```
 */
export const LoggedUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    // 获取当前HTTP请求对象
    const request = ctx.switchToHttp().getRequest();
    // 返回已登录用户信息
    return request.user;
  },
);

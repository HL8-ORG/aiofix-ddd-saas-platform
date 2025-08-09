import { SetMetadata } from '@nestjs/common';

/**
 * @constant IS_PUBLIC_KEY
 * @description
 * 用于标记路由是否为公开（无需认证）的元数据Key。
 *
 * 代码原理与机制说明：
 * 1. 该常量作为元数据的Key，配合NestJS的SetMetadata装饰器使用。
 * 2. 在守卫（如AuthGuard）中可通过Reflector获取该Key对应的元数据，判断当前路由是否为公开路由。
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * @decorator Public
 * @description
 * 自定义装饰器，用于标记控制器或路由为公开接口（无需认证）。
 *
 * 代码原理与机制说明：
 * 1. 基于NestJS的SetMetadata实现，将IS_PUBLIC_KEY设置为true，作为元数据附加到目标路由或控制器上。
 * 2. 在全局认证守卫中，通过Reflector读取该元数据，若为true则跳过认证逻辑，允许匿名访问。
 * 3. 该装饰器常用于登录、注册等无需登录即可访问的接口，提升权限控制的灵活性与可维护性。
 *
 * @example
 * ```ts
 * @Public()
 * @Get('login')
 * login() {
 *   // 公开接口，无需认证
 * }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

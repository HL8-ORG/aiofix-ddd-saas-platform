import { SetMetadata } from '@nestjs/common';
import { PolicyHandler } from 'src/common/interfaces/policy-handler.interface';

/**
 * @constant CHECK_POLICIES_KEY
 * @description
 * 用于标记路由或控制器所需权限策略的元数据Key。
 *
 * 代码原理与机制说明：
 * 1. 该常量作为元数据的Key，配合NestJS的SetMetadata装饰器使用。
 * 2. 在权限守卫（如PolicyGuard）中可通过Reflector获取该Key对应的元数据，从而获取当前路由需要校验的权限策略。
 */
export const CHECK_POLICIES_KEY = 'checkPolicy';

/**
 * @decorator CheckPolicies
 * @description
 * 自定义装饰器，用于为路由或控制器附加权限策略处理器（PolicyHandler）。
 *
 * 代码原理与机制说明：
 * 1. 基于NestJS的SetMetadata实现，将传入的权限策略处理器数组（handlers）作为元数据附加到目标路由或控制器上。
 * 2. 支持传入一个或多个PolicyHandler（可为类实现或函数实现），用于描述当前接口所需的权限校验逻辑。
 * 3. 在权限守卫中，通过Reflector读取该元数据，依次执行所有PolicyHandler，实现细粒度的访问控制。
 * 4. 该装饰器常用于需要复杂权限判断的接口，提升系统的安全性与灵活性。
 *
 * @example
 * ```ts
 * @CheckPolicies(new ManageUserPolicy(), (ability, user, req) => ability.can('read', 'User'))
 * @Get('users')
 * findAllUsers() {
 *   // 只有通过所有策略校验的用户才能访问
 * }
 * ```
 *
 * @param handlers 权限策略处理器列表（可为类或函数）
 * @returns 装饰器函数，将策略处理器元数据附加到目标上
 */
export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);

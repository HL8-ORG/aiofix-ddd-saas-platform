import { User } from 'src/entities/user.entity';
import { AppAbility } from '../factories/casl-ability.factory';
import { FastifyRequest } from 'fastify';

/**
 * @interface IPolicyHandler
 * @description
 * 策略处理器接口，用于定义权限校验的统一规范。
 *
 * 代码原理与机制说明：
 * 1. 该接口约定了handle方法，接收当前用户的能力（AppAbility）、用户实体（User）以及当前请求对象（FastifyRequest）。
 * 2. handle方法返回布尔值，表示当前用户是否有权执行某项操作（true为有权限，false为无权限）。
 * 3. 通过实现该接口，可以自定义复杂的权限校验逻辑，实现细粒度的访问控制。
 * 4. 该接口常与CASL能力系统结合，支持基于能力的动态权限判断，提升系统安全性与灵活性。
 * 5. 适配Fastify平台，使用FastifyRequest替代Express的Request类型。
 */
export interface IPolicyHandler {
  handle(ability: AppAbility, user: User, request: FastifyRequest): boolean;
}

/**
 * @type PolicyHandlerCallback
 * @description
 * 策略处理器回调类型，作为函数式权限校验的简化写法。
 *
 * 代码原理与机制说明：
 * 1. 该类型定义了一个函数签名，与IPolicyHandler的handle方法参数一致。
 * 2. 允许直接以函数形式编写权限校验逻辑，提升开发灵活性和可读性。
 * 3. 适用于简单或一次性的权限判断场景，无需额外实现类。
 * 4. 适配Fastify平台，使用FastifyRequest替代Express的Request类型。
 */
type PolicyHandlerCallback = (
  ability: AppAbility,
  user: User,
  request: FastifyRequest,
) => boolean;

/**
 * @type PolicyHandler
 * @description
 * 策略处理器类型联合体，支持类实现（IPolicyHandler）和函数实现（PolicyHandlerCallback）。
 *
 * 代码原理与机制说明：
 * 1. 该类型允许在权限校验时，既可以传入实现了IPolicyHandler接口的类实例，也可以直接传入函数。
 * 2. 便于在不同场景下灵活选择策略实现方式，兼容面向对象和函数式两种风格。
 * 3. 在权限守卫、装饰器等场景下，统一接收PolicyHandler类型，提升扩展性和可维护性。
 * 4. 适配Fastify平台，使用FastifyRequest替代Express的Request类型。
 */
export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback;

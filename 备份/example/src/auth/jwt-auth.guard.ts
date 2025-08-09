import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/common/decorators/metadata/auth.decorator';

/**
 * @class JwtAuthGuard
 * @extends AuthGuard('jwt')
 * @description
 * JWT认证守卫，继承自NestJS的AuthGuard，指定使用'jwt'策略（即passport-jwt）。
 *
 * 代码原理与机制说明：
 * 1. 该守卫用于保护需要JWT令牌认证的接口，确保只有已登录用户才能访问受保护资源。
 * 2. 构造函数中注入Reflector，用于读取自定义元数据（如是否为公开接口）。
 * 3. canActivate方法会在每次请求时被调用，首先通过Reflector读取IS_PUBLIC_KEY元数据，判断当前路由或控制器是否被标记为公开（无需认证）。
 *    - 若为公开接口（如@Public()装饰器标记），直接放行，返回true。
 *    - 否则，调用父类AuthGuard('jwt')的canActivate方法，执行JWT令牌校验逻辑。
 * 4. 该机制实现了灵活的接口认证控制，既支持全局JWT保护，也支持对部分接口开放匿名访问。
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * @constructor
   * @param reflector 反射工具，用于读取路由或控制器上的元数据
   */
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * @method canActivate
   * @description
   * 判断当前请求是否允许通过守卫。若为公开接口则直接放行，否则执行JWT认证。
   *
   * @param context 当前执行上下文，包含请求、路由等信息
   * @returns boolean | Promise<boolean> 是否允许通过
   */
  canActivate(context: ExecutionContext) {
    // 读取路由或控制器上的IS_PUBLIC_KEY元数据，判断是否为公开接口
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // 公开接口直接放行
      return true;
    }
    // 非公开接口，执行JWT认证
    return super.canActivate(context);
  }
}

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * @class LocalAuthGuard
 * @extends AuthGuard('local')
 * @description
 * 本地认证守卫，继承自NestJS的AuthGuard，指定使用'local'策略（即passport-local）。
 *
 * 代码原理与机制说明：
 * 1. 该守卫用于保护需要用户名和密码登录认证的接口（如登录接口）。
 * 2. 当路由被@UseGuards(LocalAuthGuard)装饰时，NestJS会自动调用passport-local策略进行认证。
 * 3. passport-local策略会自动提取请求体中的username和password字段，并调用LocalStrategy的validate方法进行校验。
 * 4. 若认证通过，用户对象会被注入到请求的req.user中，供后续控制器或服务使用。
 * 5. 若认证失败，守卫会自动抛出401 Unauthorized异常，阻止未授权访问。
 * 6. 通过@Injectable()装饰器声明为可注入的守卫，便于在控制器中复用。
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}

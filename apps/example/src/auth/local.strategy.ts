import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

/**
 * @class LocalStrategy
 * @extends PassportStrategy(Strategy)
 * @description
 * 本地认证策略类，继承自Passport的Strategy（passport-local），用于实现基于用户名和密码的登录认证。
 *
 * 代码原理与机制说明：
 * 1. 通过super()调用，注册passport-local策略，默认使用username和password字段作为认证参数。
 * 2. validate方法会在认证流程中被自动调用，接收前端提交的用户名和密码。
 * 3. 调用AuthService的validateUser方法校验用户凭证，若校验失败则抛出UnauthorizedException异常，阻止登录。
 * 4. 校验通过后返回用户对象，NestJS会将其注入到req.user，供后续守卫、控制器等使用。
 * 5. 该策略通常配合LocalAuthGuard使用，实现登录接口的本地认证保护。
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  /**
   * @constructor
   * @param authService 认证服务，负责校验用户凭证
   */
  constructor(private authService: AuthService) {
    // 调用父类构造函数，注册passport-local策略
    super();
  }

  /**
   * @method validate
   * @description
   * 校验用户名和密码，返回认证通过的用户对象。
   *
   * 代码原理与机制说明：
   * 1. 调用authService.validateUser方法校验用户名和密码的有效性。
   * 2. 若校验失败（user为null），抛出UnauthorizedException，阻止后续流程。
   * 3. 校验通过则返回用户对象，供Passport注入到请求上下文。
   *
   * @param username 用户名
   * @param password 密码
   * @returns Promise<any> 认证通过的用户对象
   * @throws UnauthorizedException 认证失败时抛出
   */
  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

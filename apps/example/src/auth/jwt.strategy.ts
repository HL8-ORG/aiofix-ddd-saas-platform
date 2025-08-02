import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import authConfig from 'src/config/auth.config';
import { ConfigType } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { ClsService } from 'nestjs-cls';
import { AsyncLocalStorage } from 'async_hooks';
import { EntityManager } from '@mikro-orm/postgresql';

/**
 * @class JwtStrategy
 * @extends PassportStrategy(Strategy)
 * @description
 * JWT认证策略类，继承自Passport的Strategy。用于解析和校验前端请求中的JWT令牌，实现用户身份认证。
 *
 * 主要原理与机制如下：
 * 1. 通过super构造函数配置passport-jwt的Strategy，指定JWT的提取方式（从Authorization Bearer头部获取）、
 *    是否忽略过期（ignoreExpiration: false）、以及JWT密钥（secretOrKey）。
 * 2. validate方法会在JWT校验通过后被自动调用，payload为解密后的JWT载荷。
 * 3. 通过usersService根据payload.sub（用户ID）查找用户，并级联加载用户的角色、权限和租户信息。
 * 4. 若查找到用户，则将用户的tenant信息写入CLS（异步上下文存储），便于后续请求链路中获取当前租户上下文。
 * 5. 最终返回user对象，NestJS会将其注入到请求的req.user中，供后续守卫、控制器等使用。
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * @constructor
   * @param config 注入的JWT配置，包含密钥等信息
   * @param usersService 用户服务，用于查找用户信息
   * @param cls CLS服务，用于存储请求上下文（如租户信息）
   */
  constructor(
    @Inject(authConfig.KEY)
    private config: ConfigType<typeof authConfig>,
    private readonly usersService: UsersService,
    private readonly cls: ClsService,
  ) {
    // 配置passport-jwt策略，指定JWT提取方式和密钥
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.secret!,
    });
  }

  /**
   * @method validate
   * @description
   * 校验JWT载荷，查找并返回对应用户对象。
   *
   * @param payload JWT解密后的载荷对象，通常包含sub（用户ID）等信息
   * @returns 查找到的用户对象，若无则返回null
   */
  async validate(payload: any) {
    // 根据JWT中的sub字段查找用户，并级联加载角色、权限、租户信息
    const user = await this.usersService.findOne({
      id: payload.sub,
      options: {
        populate: ['role', 'role.permissions', 'tenant'] as never,
        disableIdentityMap: true,
      },
    });
    // 若查找到用户，则将租户信息写入CLS上下文，便于后续链路获取
    if (user) this.cls.set('tenant', user.tenant);
    // 返回用户对象，Nest会注入到req.user
    return user;
  }
}

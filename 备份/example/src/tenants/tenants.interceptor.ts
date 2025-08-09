import { EntityManager } from '@mikro-orm/postgresql';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Tenant } from 'src/entities/tenant.entity';
import { ConfigType } from '@nestjs/config';
import tenantConfig from 'src/config/tenant.config';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/common/decorators/metadata/auth.decorator';
import { SKIP_TENANT_KEY } from 'src/common/decorators/metadata/skip-tenant.decorator';

/**
 * @class TenantInterceptor
 * @implements NestInterceptor
 * @description
 * 多租户拦截器，用于在每次HTTP请求时自动为MikroORM的EntityManager添加租户过滤器，实现数据的租户隔离。
 *
 * 代码原理与机制说明：
 * 1. 通过NestJS的拦截器机制，在请求进入控制器前执行intercept方法。
 * 2. 首先利用Reflector读取路由或控制器上的IS_PUBLIC_KEY元数据，判断当前接口是否为公开接口（如登录、注册等），
 *    若为公开接口则直接放行，不做租户隔离。
 * 3. 再判断是否有SKIP_TENANT_KEY元数据（如某些特殊接口需要跳过租户隔离），若有则直接放行。
 * 4. 从请求对象中获取user信息，若user不存在则抛出500异常（正常情况下应由认证守卫注入user）。
 * 5. 校验user.tenant是否存在，若不存在同样抛出500异常，防止无租户上下文的数据访问。
 * 6. 通过EntityManager的addFilter方法为所有配置的实体动态添加名为'tenant'的过滤器，过滤条件为{ tenant: args.tenantId }，
 *    其中tenantId取自当前登录用户的租户ID。
 * 7. 通过setFilterParams方法设置当前请求上下文的租户ID参数，实现ORM层面的数据隔离。
 * 8. 最终调用next.handle()继续后续请求处理流程。
 *
 * 该拦截器确保所有受保护接口的数据访问都自动带上租户过滤条件，极大提升多租户系统的数据安全性和隔离性。
 */
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  /**
   * @constructor
   * @param reflector 反射工具，用于读取路由/控制器上的元数据
   * @param em MikroORM的EntityManager实例，用于操作数据库和添加过滤器
   * @param tenantConfigService 租户配置服务，提供需要隔离的实体列表
   */
  constructor(
    private readonly reflector: Reflector,
    private readonly em: EntityManager,
    @Inject(tenantConfig.KEY)
    private readonly tenantConfigService: ConfigType<typeof tenantConfig>,
  ) {}

  /**
   * @method intercept
   * @description
   * 请求拦截处理逻辑，自动为EntityManager添加租户过滤器，实现多租户数据隔离。
   *
   * @param context 当前执行上下文，包含请求、路由等信息
   * @param next 下一个处理器
   * @returns Observable<any> 继续后续处理流程
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 获取HTTP请求对象
    const request = context.switchToHttp().getRequest();

    // 判断是否为公开接口（如登录、注册等），公开接口不做租户隔离
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return next.handle();

    // 判断是否需要跳过租户隔离（如某些特殊接口）
    const shouldSkipTenant = this.reflector.getAllAndOverride<boolean>(
      SKIP_TENANT_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (shouldSkipTenant) return next.handle();

    // 获取当前登录用户
    const { user } = request;
    if (!user) throw new InternalServerErrorException('User not found');

    // 校验用户是否绑定租户
    const tenant = user.tenant as Tenant;
    if (!tenant) throw new InternalServerErrorException('Tenant not found');

    // 为所有需要隔离的实体添加租户过滤器
    this.em.addFilter(
      'tenant',
      (args) => ({ tenant: args.tenantId }),
      this.tenantConfigService.entities,
    );

    // 设置当前请求上下文的租户ID参数
    this.em.setFilterParams('tenant', { tenantId: tenant.id });

    // 继续后续处理流程
    return next.handle();
  }
}

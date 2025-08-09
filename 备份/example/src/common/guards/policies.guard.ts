import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory } from 'src/common/factories/casl-ability.factory';
import { CHECK_POLICIES_KEY } from 'src/common/decorators/metadata/check-policy.decorator';
import { PolicyHandler } from 'src/common/interfaces/policy-handler.interface';
import { FastifyRequest } from 'fastify';

/**
 * @class PoliciesGuard
 * @implements CanActivate
 * @description
 * 策略守卫类，用于检查用户是否具有执行特定操作的权限。
 *
 * 主要原理与机制如下：
 * 1. 通过Reflector获取控制器或方法上通过@CheckPolicies装饰器定义的策略处理器。
 * 2. 使用CaslAbilityFactory创建用户的权限能力对象，该对象基于用户的角色和权限。
 * 3. 对每个策略处理器进行权限检查，如果所有策略都通过则允许访问，否则拒绝。
 * 4. 支持多种策略类型：基于角色的权限控制、基于资源的权限控制等。
 * 5. 与CASL库集成，提供强大的权限管理能力。
 */
@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];

    const { user } = context.switchToHttp().getRequest<FastifyRequest & { user?: any }>();
    const ability = this.caslAbilityFactory.createForUser(user);

    return policyHandlers.every((handler) =>
      this.execPolicyHandler(handler, ability, user, context.switchToHttp().getRequest()),
    );
  }

  private execPolicyHandler(handler: PolicyHandler, ability: any, user: any, request: any) {
    if (typeof handler === 'function') {
      return handler(ability, user, request);
    }
    return handler.handle(ability, user, request);
  }
}

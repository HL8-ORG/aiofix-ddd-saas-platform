import { IPolicyHandler } from 'src/common/interfaces/policy-handler.interface';
import { AppAbility, Actions, Subjects } from 'src/common/factories/casl-ability.factory';
import { User } from 'src/entities/user.entity';
import { FastifyRequest } from 'fastify';

/**
 * @class ReadUserPolicy
 * @implements IPolicyHandler
 * @description
 * 读取用户权限策略类，用于校验当前用户是否有权限读取指定用户信息。
 *
 * 主要原理与机制如下：
 * 1. 实现IPolicyHandler接口，提供统一的权限校验方法。
 * 2. 通过CASL能力系统检查当前用户是否具有读取用户的权限。
 * 3. 支持基于角色的权限控制，确保只有具有相应权限的用户才能执行读取操作。
 * 4. 适配Fastify平台，使用FastifyRequest替代Express的Request类型。
 */
export class ReadUserPolicy implements IPolicyHandler {
  handle(ability: AppAbility, user: User, request: FastifyRequest<{ Params: { id: string } }>): boolean {
    return (
      ability.can(Actions.ReadAny, Subjects.User) ||
      (ability.can(Actions.ReadOwn, Subjects.User) &&
        user.id === parseInt(request.params.id))
    );
  }
}

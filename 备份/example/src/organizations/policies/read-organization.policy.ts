import { IPolicyHandler } from 'src/common/interfaces/policy-handler.interface';
import {
  Actions,
  AppAbility,
  Subjects,
} from 'src/common/factories/casl-ability.factory';
import { Organization } from 'src/entities/organization.entity';

/**
 * @class ReadOrganizationPolicyHandler
 * @implements IPolicyHandler
 * @description
 * 组织“读取单个组织”权限策略处理器，用于判断当前用户是否具备读取指定组织（Read Organization）能力。
 *
 * 代码原理与机制说明：
 * 1. 实现IPolicyHandler接口，统一策略处理器规范，便于与CASL能力工厂集成。
 * 2. handle方法接收当前用户的AppAbility实例（由CASL能力工厂动态生成），
 *    并调用ability.can(Actions.Read, Subjects.Organization)判断用户是否拥有“读取单个组织”权限。
 * 3. 该策略通常用于普通成员或有组织查看权限的用户，结合PoliciesGuard与@CheckPolicies装饰器，
 *    可灵活控制接口访问权限，实现细粒度的资源授权。
 * 4. 通过策略处理器的解耦设计，便于后续扩展更多复杂的权限校验逻辑，提高系统的安全性与可维护性。
 */
export class ReadOrganizationPolicyHandler implements IPolicyHandler {
  /**
   * @method handle
   * @description
   * 判断当前Ability是否具备“读取单个组织”权限。
   * @param ability 当前用户的CASL能力对象
   * @returns boolean 是否有权限
   */
  handle(ability: AppAbility): boolean {
    return ability.can(Actions.Read, Subjects.Organization);
  }
}

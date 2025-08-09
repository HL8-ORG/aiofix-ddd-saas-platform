import { Injectable } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { createMongoAbility, MongoAbility, RawRuleOf } from '@casl/ability';

/**
 * @enum Subjects
 * @description
 * 定义系统中可作为权限控制对象（subject）的实体类型枚举。
 *
 * 代码原理与机制说明：
 * 1. Subjects枚举用于描述CASL权限系统中可被操作的资源类型，如用户、角色、权限、组织等。
 * 2. 每个枚举值对应一个业务实体，便于权限规则的统一管理与类型安全。
 */
export enum Subjects {
  User = 'User',
  Role = 'Role',
  Permission = 'Permission',
  Organization = 'Organization',
}

/**
 * @enum Actions
 * @description
 * 定义系统中可授权的操作类型（action）枚举，支持细粒度的权限控制。
 *
 * 代码原理与机制说明：
 * 1. Actions枚举涵盖了常见的CRUD操作及其变体（如Any/One/Own），满足多样化的权限需求。
 * 2. 通过将操作类型与Subjects结合，可实现如“只能读取自己用户信息”、“可删除任意组织”等复杂权限场景。
 * 3. 该枚举与CASL的规则系统配合，提升权限表达能力与可维护性。
 */
export enum Actions {
  Manage = 'manage',
  Create = 'create',
  CreateAny = 'createAny',
  CreateOne = 'createOne',
  CreateOwn = 'createOwn',
  Read = 'read',
  ReadAny = 'readAny',
  ReadOne = 'readOne',
  ReadOwn = 'readOwn',
  Update = 'update',
  UpdateAny = 'updateAny',
  UpdateOne = 'updateOne',
  UpdateOwn = 'updateOwn',
  Delete = 'delete',
  DeleteAny = 'deleteAny',
  DeleteOne = 'deleteOne',
  DeleteOwn = 'deleteOwn',
}

/**
 * @type AppAbility
 * @description
 * 定义应用的CASL能力类型，约束action与subject的组合，提升类型安全。
 *
 * 代码原理与机制说明：
 * 1. MongoAbility是CASL官方为MongoDB风格规则提供的能力类型。
 * 2. 通过泛型参数<[Actions, Subjects]>，限定规则中action和subject的取值范围，防止拼写错误和类型不匹配。
 * 3. 该类型在全局权限校验、策略处理等场景中广泛使用。
 */
export type AppAbility = MongoAbility<[Actions, Subjects]>;

/**
 * @class CaslAbilityFactory
 * @description
 * CASL能力工厂类，用于根据用户信息动态生成其权限能力（Ability）实例。
 *
 * 代码原理与机制说明：
 * 1. 该类被标记为NestJS的可注入服务（@Injectable），可在全局依赖注入。
 * 2. createForUser方法接收一个User实体，根据其角色下的权限集合，动态生成CASL能力规则。
 * 3. 权限规则通过user.role.permissions映射为CASL规则对象（action/subject），并传递给createMongoAbility生成Ability实例。
 * 4. 返回的Ability实例可用于后续的权限校验（如ability.can('read', 'User')），实现细粒度的访问控制。
 * 5. 该机制实现了基于角色的动态权限分配，支持多角色、多资源、多操作的复杂权限模型。
 */
@Injectable()
export class CaslAbilityFactory {
  /**
   * @method createForUser
   * @description
   * 根据传入的用户信息，生成其对应的CASL权限能力实例。
   *
   * @param user 用户实体对象，需包含角色及其权限信息
   * @returns AppAbility CASL能力实例，可用于权限校验
   */
  createForUser(user: User): AppAbility {
    // 将用户角色下的权限集合映射为CASL规则对象
    const permissions = user.role.permissions.map((permission) => ({
      action: permission.action,
      subject: permission.subject,
    })) as RawRuleOf<AppAbility>[];
    // 基于规则集合生成CASL能力实例
    return createMongoAbility(permissions);
  }
}

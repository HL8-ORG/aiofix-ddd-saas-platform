import {
  Entity,
  Property,
  ManyToOne,
  EntityRepositoryType,
} from '@mikro-orm/core';
import { CustomBaseEntity } from './base.entity';
import { UserRepository } from '../users/users.repository';
import { Role } from './role.entity';
import { Tenant } from './tenant.entity';

/**
 * @class User
 * @extends CustomBaseEntity
 * @description
 * 用户实体类，继承自自定义基础实体（CustomBaseEntity），用于描述系统中的用户对象及其与角色、租户的关联关系。
 *
 * 原理与机制说明：
 * 1. 通过 @Entity 装饰器声明为MikroORM实体，并指定自定义仓库UserRepository，实现复杂查询与业务逻辑的解耦。
 * 2. username 和 email 字段均设置 unique: true，保证用户名和邮箱在全局唯一，防止重复注册。
 * 3. password 字段设置 hidden: true，序列化时自动隐藏，提升安全性，防止敏感信息泄露。
 * 4. role 字段通过 @ManyToOne 关联到 Role 实体，实现用户与角色的多对一关系，便于权限管理。
 * 5. tenant 字段通过 @ManyToOne 关联到 Tenant 实体，实现用户与租户的多对一关系，支持多租户架构。
 * 6. 继承自 CustomBaseEntity，自动拥有主键、创建时间、更新时间等通用字段，提升开发一致性。
 */
@Entity({ repository: () => UserRepository })
export class User extends CustomBaseEntity {
  /**
   * @property [EntityRepositoryType]
   * @description
   * 指定当前实体默认使用的自定义仓库类型，便于依赖注入和类型推断。
   */
  [EntityRepositoryType]?: UserRepository;

  /**
   * @property username
   * @description
   * 用户名，唯一索引，作为用户的主要标识之一。
   */
  @Property({ unique: true })
  username: string;

  /**
   * @property email
   * @description
   * 用户邮箱，唯一索引，用于登录、找回密码等场景。
   */
  @Property({ unique: true })
  email: string;

  /**
   * @property password
   * @description
   * 用户密码，数据库加密存储，序列化时自动隐藏，保障安全。
   */
  @Property({ hidden: true })
  password: string;

  /**
   * @property role
   * @description
   * 用户所属角色，多对一关联Role实体，用于权限控制。
   */
  @ManyToOne({ entity: () => Role })
  role: Role;

  /**
   * @property tenant
   * @description
   * 用户所属租户，多对一关联Tenant实体，支持多租户架构。
   */
  @ManyToOne({ entity: () => Tenant })
  tenant: Tenant;
}

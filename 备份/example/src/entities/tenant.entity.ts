import {
  Cascade,
  Collection,
  Entity,
  OneToMany,
  Property,
} from '@mikro-orm/core';
import { CustomBaseEntity } from './base.entity';
import { Organization } from './organization.entity';
import { User } from './user.entity';

/**
 * @class Tenant
 * @extends CustomBaseEntity
 * @description
 * 租户实体类，继承自自定义基础实体（CustomBaseEntity），用于描述多租户系统中的租户对象及其与组织、用户的关联关系。
 *
 * 原理与机制说明：
 * 1. 通过 @Entity 装饰器声明为MikroORM实体，自动映射为数据库表，支持ORM的所有生命周期管理。
 * 2. domain 字段为租户的唯一标识（如域名或租户代码），设置 unique: true，确保每个租户全局唯一，防止重复。
 * 3. isActive 字段用于标记租户是否处于激活状态，支持软禁用租户功能，默认值为 true，nullable: true 便于兼容历史数据。
 * 4. organizations 字段通过 @OneToMany 关联到 Organization 实体，实现租户与组织的一对多关系。级联删除（Cascade.REMOVE）保证删除租户时自动删除其下所有组织，防止数据孤岛。
 * 5. users 字段通过 @OneToMany 关联到 User 实体，实现租户与用户的一对多关系。级联删除同理，保证数据一致性。
 * 6. 继承自 CustomBaseEntity，自动拥有主键、创建时间、更新时间等通用字段，提升开发一致性。
 * 7. 构造函数要求传入 domain，保证每个租户实例创建时即有唯一标识。
 */
@Entity()
export class Tenant extends CustomBaseEntity {
  /**
   * @constructor
   * @param domain - 租户唯一标识（如域名）
   * @description
   * 创建租户实体实例时，必须传入唯一的 domain 字段，确保租户标识的唯一性。
   */
  constructor(domain: string) {
    super();
    this.domain = domain;
  }

  /**
   * @property domain
   * @description
   * 租户唯一标识（如域名），全局唯一，防止重复租户。
   */
  @Property({ unique: true })
  domain: string;

  /**
   * @property isActive
   * @description
   * 租户是否激活，支持软禁用租户，默认值为 true。
   */
  @Property({ nullable: true })
  isActive: boolean = true;

  /**
   * @property organizations
   * @description
   * 当前租户下的所有组织，一对多关系。删除租户时自动级联删除所有组织。
   */
  @OneToMany(() => Organization, (organization) => organization.tenant, {
    cascade: [Cascade.REMOVE],
  })
  organizations = new Collection<Organization>(this);

  /**
   * @property users
   * @description
   * 当前租户下的所有用户，一对多关系。删除租户时自动级联删除所有用户。
   */
  @OneToMany(() => User, (user) => user.tenant, {
    cascade: [Cascade.REMOVE],
  })
  users = new Collection<User>(this);
}

import {
  Collection,
  Entity,
  ManyToMany,
  OneToMany,
  Property,
} from '@mikro-orm/core';
import { CustomBaseEntity } from './base.entity';
import { Permission } from './permission.entity';
import { User } from './user.entity';

/**
 * @class Role
 * @extends CustomBaseEntity
 * @description
 * 角色实体类，表示系统中的权限角色。每个角色拥有唯一的名称，可以关联多个权限（Permission），
 * 并且可以被多个用户（User）引用。
 *
 * 代码原理与机制说明：
 * 1. 继承自CustomBaseEntity，自动拥有主键、创建时间等基础字段。
 * 2. 通过@Property({ unique: true })装饰器，name字段在数据库中唯一，保证角色名称不重复。
 * 3. permissions字段使用@ManyToMany装饰器，建立与Permission实体的多对多关系。
 *    - owner: true 表示Role为关系的拥有方，负责维护中间表。
 *    - new Collection<Permission>(this) 初始化集合，便于ORM管理多对多数据。
 * 4. users字段使用@OneToMany装饰器，建立与User实体的一对多关系。
 *    - 一个角色可以被多个用户引用，User实体中通过role字段反向关联。
 *    - new Collection<User>(this) 初始化集合，便于ORM管理一对多数据。
 */
@Entity()
export class Role extends CustomBaseEntity {
  /**
   * 角色名称，唯一标识一个角色
   */
  @Property({ unique: true })
  name: string;

  /**
   * 角色拥有的权限集合，多对多关系
   */
  @ManyToMany(() => Permission, 'roles', { owner: true })
  permissions = new Collection<Permission>(this);

  /**
   * 拥有该角色的用户集合，一对多关系
   */
  @OneToMany(() => User, 'role')
  users = new Collection<User>(this);
}

import { Collection, Entity, ManyToMany, Property } from '@mikro-orm/core';
import { CustomBaseEntity } from './base.entity';
import { Role } from './role.entity';

/**
 * @class Permission
 * @extends CustomBaseEntity
 * @description
 * 权限实体类，表示系统中的具体权限点。每个权限可被多个角色（Role）关联，实现灵活的权限控制。
 *
 * 代码原理与机制说明：
 * 1. 继承自CustomBaseEntity，自动拥有主键、创建时间、更新时间等通用字段，便于统一管理。
 * 2. name字段为权限的唯一标识，使用@Property({ unique: true })保证数据库中唯一，防止权限重复。
 * 3. action字段用于描述权限的具体操作（如'create'、'read'、'update'、'delete'等），nullable: true便于兼容不同粒度的权限设计。
 * 4. subject字段用于描述权限作用的对象（如'User'、'Article'等），同样支持可空，便于扩展。
 * 5. roles字段通过@ManyToMany装饰器与Role实体建立多对多关系，'permissions'为反向字段名。
 *    - 这样一个权限可以被多个角色引用，一个角色也可以拥有多个权限，满足RBAC（基于角色的访问控制）模型的需求。
 *    - new Collection<Role>(this)初始化集合，便于ORM管理多对多数据。
 */
@Entity()
export class Permission extends CustomBaseEntity {
  /**
   * @property name
   * @description
   * 权限名称，唯一标识一个权限点，防止重复。
   */
  @Property({ unique: true })
  name: string;

  /**
   * @property action
   * @description
   * 权限对应的操作类型（如'create'、'read'等），可选字段，便于细粒度权限控制。
   */
  @Property({ nullable: true })
  action: string;

  /**
   * @property subject
   * @description
   * 权限作用的对象类型（如'User'、'Article'等），可选字段，支持灵活扩展。
   */
  @Property({ nullable: true })
  subject: string;

  /**
   * @property roles
   * @description
   * 拥有该权限的角色集合，多对多关系。通过'permissions'字段与Role实体反向关联。
   */
  @ManyToMany(() => Role, 'permissions')
  roles = new Collection<Role>(this);
}

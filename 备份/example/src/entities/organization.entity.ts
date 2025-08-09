import {
  BeforeCreate,
  Entity,
  EntityRepositoryType,
  ManyToOne,
  Property,
  RequestContext,
} from '@mikro-orm/core';
import { CustomBaseEntity } from './base.entity';
import { Tenant } from './tenant.entity';
import { OrganizationRepository } from '../organizations/organizations.repository';

/**
 * @class Organization
 * @description
 * 组织（Organization）实体类，继承自自定义基础实体（CustomBaseEntity）。
 * 该类用于描述多租户系统中的组织结构，每个组织归属于一个租户（Tenant）。
 *
 * 主要原理与机制如下：
 * 1. 通过`@Entity`装饰器声明为MikroORM实体，并指定自定义仓库`OrganizationRepository`，
 *    以便实现复杂的查询与业务逻辑扩展。
 * 2. 通过`@ManyToOne`装饰器建立与`Tenant`实体的多对一关系，实现多租户隔离。
 *    每个组织必须关联一个租户，保证数据归属清晰。
 * 3. `name`属性为组织名称，使用`@Property`声明为数据库字段，必填。
 * 4. `description`属性为组织描述，允许为空（nullable: true），用于补充组织信息。
 * 5. `[EntityRepositoryType]`用于类型提示，便于在代码中通过`em.getRepository(Organization)`获取自定义仓库。
 */
@Entity({ repository: () => OrganizationRepository })
export class Organization extends CustomBaseEntity {
  /**
   * @property [EntityRepositoryType]
   * @description
   * MikroORM实体仓库类型声明，用于类型推断和自定义仓库方法的调用。
   */
  [EntityRepositoryType]?: OrganizationRepository;

  /**
   * @property tenant
   * @description
   * 组织所属的租户实体，采用多对一关系。
   * 每个组织必须归属于一个租户，实现多租户数据隔离。
   */
  @ManyToOne({ entity: () => Tenant })
  tenant: Tenant;

  /**
   * @property name
   * @description
   * 组织名称，必填字段。
   */
  @Property()
  name: string;

  /**
   * @property description
   * @description
   * 组织描述信息，允许为空，用于补充说明。
   */
  @Property({ nullable: true })
  description?: string;
}
